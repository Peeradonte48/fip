// FIP Payment Method Configuration — module orchestrator.
// Owns persona/scope/view prefs, the definition + override sheets, mutations,
// and toast. Rendered inside the FIP settings-modal content area. Screen is
// driven by the host App's settings nav (so the 4 payment screens live in the
// shared left sidebar, matching the design handoff).
import { useEffect, useState } from "react"
import { Icon } from "../Icon"
import { Dropdown } from "./Dropdown"
import { PaymentRegistry } from "./PaymentRegistry"
import { MethodDefinitionSheet } from "./MethodDefinitionSheet"
import { BranchOverrideSheet } from "./BranchOverrideSheet"
import { AuditScreen, GatewaysScreen, TerminalsScreen } from "./PaymentScreens"
import { PM_BRAND, PM_BRANCHES, PM_PERSONAS } from "../../lib/payment/catalog"
import {
  loadPaymentPrefs, paymentStore, savePaymentPrefs, usePaymentDB, type PaymentPrefs,
} from "../../lib/payment/store"
import type {
  Branch, EffectiveMethod, PaymentDefinition, PaymentScreen, RegistryView,
} from "../../lib/payment/types"

type Detail =
  | { kind: "def"; def: PaymentDefinition }
  | { kind: "newdef" }
  | { kind: "override"; def: PaymentDefinition; branch: Branch; from?: Detail }
  | null

export function PaymentModule({ screen, onScreen }: {
  screen: PaymentScreen; onScreen: (s: PaymentScreen) => void
}) {
  const db = usePaymentDB()
  const [prefs, setPrefs] = useState<PaymentPrefs>(() => loadPaymentPrefs())
  const [detail, setDetail] = useState<Detail>(null)
  const [scopeMenu, setScopeMenu] = useState(false)
  const [personaMenu, setPersonaMenu] = useState(false)
  const [optsMenu, setOptsMenu] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [auditFocus, setAuditFocus] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const setPref = <K extends keyof PaymentPrefs>(key: K, value: PaymentPrefs[K]) =>
    setPrefs((p) => {
      const next = { ...p, [key]: value }
      savePaymentPrefs(next)
      return next
    })

  const persona = PM_PERSONAS[prefs.persona] || PM_PERSONAS.owner
  const can = persona.can
  const scopeLocked = !!persona.scopeBranch
  const branchId = scopeLocked ? persona.scopeBranch! : prefs.branch
  const branch = PM_BRANCHES.find((b) => b.id === branchId) || PM_BRANCHES[0]
  // managers can't use by_method (brand-level); force by_branch
  const view: RegistryView = (!can.define && prefs.view === "by_method") ? "by_branch" : prefs.view
  const setView = (v: RegistryView) => setPref("view", v)

  const showToast = (msg: string) => setToast(msg)

  // ── mutations ──────────────────────────────────────────────────────────────
  const toggleEnabled = (eff: EffectiveMethod) => {
    const res = paymentStore.toggleEnabled(eff.assignmentId)
    if (!res.ok) { showToast(res.reason || "เปิดไม่ได้"); return }
    showToast(res.enabled ? `เปิด “${eff.label}” ที่ ${eff.branchId}` : `ปิด “${eff.label}” ที่ ${eff.branchId}`)
  }

  const toggleApplied = (def: PaymentDefinition, b: Branch, apply: boolean) => {
    paymentStore.toggleApplied(def, b, apply)
    showToast(apply ? `นำ “${def.label}” ไปใช้ที่ ${b.id} แล้ว` : `เลิกใช้ “${def.label}” ที่ ${b.id}`)
  }

  const saveDefinition = (d: PaymentDefinition) => {
    paymentStore.saveDefinition(d)
    setDetail(null)
    showToast(`บันทึกนิยาม “${d.label}” แล้ว`)
  }

  const saveOverride = (defId: string, brId: string, ov: import("../../lib/payment/store").OverridePatch) => {
    paymentStore.saveOverride(defId, brId, ov)
    setDetail(null)
    showToast(`บันทึก override ของ ${brId} แล้ว · publish`)
  }

  const resetOverride = (defId: string, brId: string) => {
    paymentStore.resetOverride(defId, brId)
    setDetail(null)
    showToast(`รีเซ็ต ${brId} เป็นค่าแบรนด์แล้ว`)
  }

  const openOverrideFromEff = (eff: EffectiveMethod) => {
    const def = db.definitions.find((d) => d.id === eff.definitionId)
    const b = PM_BRANCHES.find((x) => x.id === eff.branchId)
    if (def && b) setDetail({ kind: "override", def, branch: b })
  }

  const gotoAudit = (label: string | null) => {
    setDetail(null)
    setAuditFocus(label)
    onScreen("audit")
  }

  const branchScoped = screen !== "methods" || view === "by_branch"

  const renderScreen = () => {
    switch (screen) {
      case "methods":
        return (
          <PaymentRegistry
            db={db} view={view} branch={branch} can={can} scopeLocked={scopeLocked}
            onSetView={setView}
            onOpenDef={(d) => setDetail({ kind: "def", def: d })}
            onApply={(d) => setDetail({ kind: "def", def: d })}
            onOpenOverride={openOverrideFromEff}
            onToggle={toggleEnabled}
            onAddDef={() => setDetail({ kind: "newdef" })}
            onApplyHint={(d, b) => toggleApplied(d, b, true)}
          />
        )
      case "gateways": return <GatewaysScreen db={db} branch={branch} can={can} onToast={showToast} />
      case "terminals": return <TerminalsScreen db={db} branch={branch} can={can} />
      case "audit": return <AuditScreen db={db} branch={branch} focusTarget={auditFocus} onClearFocus={() => setAuditFocus(null)} />
      default: return null
    }
  }

  return (
    <div className="pm-module" data-density={prefs.density} style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
      {/* Topbar: brand ▸ branch scope + persona + options */}
      <div className="pm-topbar">
        <span className="pm-feature"><span className="dot" /> โมดูลเปิดใช้งาน</span>
        <div className="pm-topbar-spacer" />

        {/* Brand ▸ branch scope */}
        <Dropdown open={scopeMenu} onClose={() => setScopeMenu(false)}>
          <button className="pm-scope"
            onClick={() => { if (scopeLocked && branchScoped) return; setScopeMenu(!scopeMenu); setPersonaMenu(false) }}
            style={scopeLocked ? { cursor: "default" } : {}}>
            <span className="pm-scope-mark" style={{ background: PM_BRAND.color }}>{PM_BRAND.mark}</span>
            <span className="pm-scope-text">
              <span className="pm-scope-brand">{PM_BRAND.name}{!branchScoped && " · ทุกสาขา"}</span>
              <span className="pm-scope-branch">{branchScoped ? `${branch.id} · ${branch.name}` : "ระดับแบรนด์"}</span>
            </span>
            {scopeLocked ? <Icon name="lock" size={13} className="pm-scope-chev" /> : <Icon name="chevronsUpDown" size={14} className="pm-scope-chev" />}
          </button>
          {scopeMenu && !scopeLocked && (
            <div className="pm-scope-menu">
              <div className="pm-scope-menu-head">เลือกสาขา (scope)</div>
              {PM_BRANCHES.map((b) => (
                <button key={b.id} className="pm-scope-opt" data-active={b.id === branch.id}
                  onClick={() => { setPref("branch", b.id); setScopeMenu(false); if (screen === "methods") setView("by_branch"); showToast(`สลับไปสาขา ${b.name}`) }}>
                  <span className="pm-scope-opt-id">{b.id}</span>
                  <span className="pm-scope-opt-meta"><span className="pm-scope-opt-name">{b.name}</span><span className="pm-scope-opt-sub">{b.nameEn} · {b.area}</span></span>
                  {b.id === branch.id && <span className="pm-scope-opt-check"><Icon name="check" size={16} /></span>}
                </button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Persona */}
        <Dropdown open={personaMenu} onClose={() => setPersonaMenu(false)}>
          <button className="pm-persona" onClick={() => { setPersonaMenu(!personaMenu); setScopeMenu(false) }}>
            <span className="pm-persona-avatar">{persona.initials}</span>
            <span className="pm-persona-text"><span className="pm-persona-role">{persona.label}</span><span className="pm-persona-sub">สลับมุมมองสิทธิ์</span></span>
            <Icon name="chevronsUpDown" size={13} className="pm-scope-chev" />
          </button>
          {personaMenu && (
            <div className="pm-scope-menu pm-persona-menu">
              <div className="pm-scope-menu-head">มุมมองสิทธิ์ (RBAC)</div>
              {Object.values(PM_PERSONAS).map((p) => (
                <button key={p.id} className="pm-scope-opt" data-active={p.id === persona.id} onClick={() => { setPref("persona", p.id); setPersonaMenu(false) }}>
                  <span className="pm-persona-avatar" style={{ width: 28, height: 28 }}>{p.initials}</span>
                  <span className="pm-scope-opt-meta"><span className="pm-persona-opt-name">{p.label}</span><span className="pm-persona-opt-sub">{p.labelEn}</span></span>
                  {p.id === persona.id && <span className="pm-scope-opt-check"><Icon name="check" size={16} /></span>}
                </button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Options */}
        <Dropdown open={optsMenu} onClose={() => setOptsMenu(false)}>
          <button className="icon-btn" aria-label="ตัวเลือก" onClick={() => { setOptsMenu(!optsMenu); setScopeMenu(false); setPersonaMenu(false) }}>
            <Icon name="settings" size={16} />
          </button>
          {optsMenu && (
            <div className="pm-scope-menu" style={{ width: 240 }}>
              <div className="pm-scope-menu-head">ความหนาแน่นตาราง</div>
              <button className="pm-scope-opt" data-active={prefs.density === "comfortable"} onClick={() => setPref("density", "comfortable")}>สบายตา{prefs.density === "comfortable" && <span className="pm-scope-opt-check"><Icon name="check" size={15} /></span>}</button>
              <button className="pm-scope-opt" data-active={prefs.density === "compact"} onClick={() => setPref("density", "compact")}>กระชับ{prefs.density === "compact" && <span className="pm-scope-opt-check"><Icon name="check" size={15} /></span>}</button>
              <div className="pm-divider-soft" />
              <div className="pm-scope-menu-head">สไตล์ทดสอบการเชื่อมต่อ</div>
              <button className="pm-scope-opt" data-active={prefs.testStyle === "detailed"} onClick={() => setPref("testStyle", "detailed")}>ละเอียด{prefs.testStyle === "detailed" && <span className="pm-scope-opt-check"><Icon name="check" size={15} /></span>}</button>
              <button className="pm-scope-opt" data-active={prefs.testStyle === "compact"} onClick={() => setPref("testStyle", "compact")}>กระชับ{prefs.testStyle === "compact" && <span className="pm-scope-opt-check"><Icon name="check" size={15} /></span>}</button>
              <div className="pm-divider-soft" />
              <button className="pm-scope-opt" style={{ color: "var(--red)" }} onClick={() => { paymentStore.reset(); setOptsMenu(false); showToast("รีเซ็ตข้อมูลตัวอย่างแล้ว") }}>
                <Icon name="rotate" size={15} /> รีเซ็ตข้อมูลตัวอย่าง
              </button>
            </div>
          )}
        </Dropdown>
      </div>

      <div className="pm-scroll">
        {renderScreen()}
      </div>

      {/* S2 · definition detail */}
      {detail && (detail.kind === "def" || detail.kind === "newdef") && (
        <MethodDefinitionSheet
          db={db}
          definition={detail.kind === "newdef" ? null : detail.def}
          can={can}
          onClose={() => setDetail(null)}
          onSave={saveDefinition}
          onEditOverride={(d, b) => setDetail({ kind: "override", def: d, branch: b, from: detail })}
          onToggleApplied={toggleApplied}
          onToggleEnabled={toggleEnabled}
          onGotoAudit={() => gotoAudit(detail.kind === "def" ? detail.def.label : null)}
        />
      )}

      {/* S2b · per-branch override editor (can stack over S2) */}
      {detail && detail.kind === "override" && (
        <BranchOverrideSheet
          db={db}
          definition={detail.def}
          branch={detail.branch}
          can={can}
          scopeLocked={scopeLocked}
          testStyle={prefs.testStyle}
          onClose={() => setDetail(detail.from || null)}
          onSave={saveOverride}
          onResetAll={() => resetOverride(detail.def.id, detail.branch.id)}
        />
      )}

      {toast && <div className="pm-toast"><span className="pm-toast-ic"><Icon name="check" size={16} /></span>{toast}</div>}
    </div>
  )
}
