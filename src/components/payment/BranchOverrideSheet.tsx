// FIP Payment — S2b · Per-branch override editor (drawer).
// Shows inherited brand defaults with per-field override switches; rail binding
// per branch (incl. QR test-connection); reset to brand default.
import { useState, type ReactNode } from "react"
import { Icon } from "../Icon"
import { LockNote, RailBadge, RailThumb, Seg, Switch } from "./primitives"
import { FieldRow } from "./MethodDefinitionSheet"
import { PM_ACQUIRER_COLOR, PM_CHANNELS, PM_RAILS } from "../../lib/payment/catalog"
import { bindingStatus, effective, type PaymentDB } from "../../lib/payment/effective"
import type {
  Branch, Channel, EffectiveMethod, MethodPolicy, PaymentCan, PaymentDefinition, TestStyle,
} from "../../lib/payment/types"
import type { OverridePatch } from "../../lib/payment/store"

function OverrideField({ label, sub, inherited, isOverridden, onToggleOverride, canEdit, children }: {
  label: string; sub?: string; inherited: string; isOverridden: boolean
  onToggleOverride: (v: boolean) => void; canEdit: boolean; children: ReactNode
}) {
  return (
    <div className="pm-ovf" data-on={isOverridden}>
      <div className="pm-ovf-head">
        <div className="pm-ovf-info">
          <div className="pm-fg-label">{label}</div>
          {sub && <div className="pm-fg-sub">{sub}</div>}
        </div>
        <button className={"pm-ovf-toggle" + (canEdit ? "" : " pm-locked")} data-on={isOverridden}
          onClick={() => canEdit && onToggleOverride(!isOverridden)} type="button">
          {isOverridden ? <><Icon name="edit" size={12} /> override</> : <>ตามค่าแบรนด์</>}
        </button>
      </div>
      <div className="pm-ovf-body">
        {isOverridden
          ? <div className="pm-ovf-control">{children}</div>
          : <div className="pm-ovf-inherited"><Icon name="link" size={13} /> ค่าแบรนด์: <b>{inherited}</b></div>}
      </div>
    </div>
  )
}

// ---- QR rail binding (per branch) ----
function BranchQrBinding({ db, eff, branch, can, testState, setTestState, testStyle }: {
  db: PaymentDB; eff: EffectiveMethod; branch: Branch; can: PaymentCan
  testState: string; setTestState: (s: string) => void; testStyle: TestStyle
}) {
  const allGws = db.gateways.filter((g) => g.branchId === branch.id)
  const selId = eff.binding.rail === "qr" ? eff.binding.gatewayCredentialId : undefined
  const gw = db.gateways.find((g) => g.id === selId) || allGws[0]
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const runTest = () => {
    if (testState === "testing") return
    setTestState("testing")
    setTimeout(() => setTestState("verified"), 1500)
  }
  const stateMap: Record<string, { ic: string; title: string; sub: string }> = {
    unverified: { ic: "bolt", title: "ยังไม่ได้ทดสอบการเชื่อมต่อ", sub: "กดทดสอบเพื่อยิง simulate-payment ไป sandbox ของสาขานี้" },
    testing: { ic: "refresh", title: "กำลังทดสอบการเชื่อมต่อ…", sub: `เรียก GB Prime Pay · ${gw?.label ?? ""}` },
    verified: { ic: "check", title: "เชื่อมต่อสำเร็จ · ยืนยันแล้ว", sub: `ทดสอบล่าสุด ${gw?.lastTestedAt || "เมื่อสักครู่"}` },
    failed: { ic: "warn", title: "เชื่อมต่อล้มเหลว", sub: "ตรวจสอบคีย์และ callback URL แล้วลองใหม่" },
  }
  const st = stateMap[testState] || stateMap.unverified
  if (!gw) return <div className="pm-diff-empty">สาขานี้ยังไม่มีคีย์เกตเวย์ · เพิ่มที่หน้า “คีย์เกตเวย์”</div>

  return (
    <div>
      <div className="field">
        <div className="label">เกตเวย์ของสาขานี้</div>
        <div className="select-wrap">
          <select className="select" value={gw.id} disabled={!can.override} onChange={() => {}}>
            {allGws.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </div>
        <div className="input-help">คีย์เป็นของสาขา {branch.id} เท่านั้น · สาขาอื่นใช้คีย์ของตัวเอง</div>
      </div>
      <div className="field">
        <div className="label">Public key</div>
        <div className="pm-key-field">
          <input value={revealed && can.keyManage ? gw.publicKey.replace(/•+/, "a91f0c33b27d") : gw.publicKey} readOnly />
          <button className="pm-key-reveal" disabled={!can.keyManage} title={can.keyManage ? "แสดง/ซ่อน" : "ต้องมีสิทธิ์จัดการคีย์"} onClick={() => setRevealed(!revealed)}>
            <Icon name={revealed ? "eyeOff" : "eye"} size={15} />
          </button>
        </div>
      </div>
      <div className="field">
        <div className="label">Secret key</div>
        <div className="pm-secret-stored">
          <span className="pm-ss-ic"><Icon name="lock" size={16} /></span>
          <div className="pm-secret-stored-text">
            <div className="pm-secret-stored-title">เก็บไว้แล้ว · ไม่แสดงค่าจริง (staff-blind)</div>
            <div className="pm-secret-stored-sub">คีย์ลับไม่เคยส่งกลับมาที่ client</div>
          </div>
          {can.keyManage ? <button className="btn btn-sm"><Icon name="rotate" size={13} /> หมุนคีย์</button> : <LockNote>staff-blind</LockNote>}
        </div>
      </div>
      <div className="field">
        <div className="label">Callback URL <span className="label-hint">(สร้างอัตโนมัติ)</span></div>
        <div className="pm-key-field">
          <input value={gw.callbackUrl} readOnly />
          <button className="pm-key-reveal" onClick={() => { navigator.clipboard?.writeText(gw.callbackUrl); setCopied(true); setTimeout(() => setCopied(false), 1200) }} title="คัดลอก">
            <Icon name={copied ? "check" : "copy"} size={15} />
          </button>
        </div>
      </div>

      <div className="section-title">ทดสอบการเชื่อมต่อ (สาขานี้)</div>
      <div className="pm-test" data-state={testState || "unverified"}>
        <span className="pm-test-ic"><Icon name={st.ic} size={19} className={testState === "testing" ? "pm-spin" : ""} /></span>
        <div className="pm-test-body">
          <div className="pm-test-title">{st.title}</div>
          <div className="pm-test-sub">{st.sub}</div>
          {testState === "testing" && <div className="pm-test-bar"><i /></div>}
        </div>
        {testStyle === "detailed" && testState === "verified" && <span className="badge b-green" style={{ marginRight: 8 }}><Icon name="check" size={12} /> 200 OK · 412ms</span>}
        {can.keyManage
          ? <button className={"btn " + (testState === "verified" ? "" : "btn-primary")} onClick={runTest} disabled={testState === "testing"}>
              {testState === "testing" ? "กำลังทดสอบ…" : testState === "verified" ? "ทดสอบอีกครั้ง" : <><Icon name="play" size={13} /> ทดสอบ</>}
            </button>
          : <LockNote>ต้องมีสิทธิ์จัดการคีย์</LockNote>}
      </div>
      {testState !== "verified" && (
        <div className="pm-hint-amber" style={{ marginTop: 12 }}>
          <Icon name="warn" size={15} /><span>เปิดวิธี QR บน POS ของสาขานี้ไม่ได้ จนกว่าจะทดสอบผ่าน</span>
        </div>
      )}
    </div>
  )
}

// ---- Card rail binding (per branch) ----
function BranchCardBinding({ db, eff, branch, can }: {
  db: PaymentDB; eff: EffectiveMethod; branch: Branch; can: PaymentCan
}) {
  const profiles = db.edc.filter((p) => p.branchId === branch.id)
  const sel = eff.binding.rail === "card" ? eff.binding.edcProfileId : undefined
  const profile = profiles.find((p) => p.id === sel) || profiles[0]
  const devices = db.devices.filter((d) => d.edcProfileId === sel)
  const connIcon: Record<string, string> = { lan: "lan", bluetooth: "bluetooth", cloud: "cloud" }
  const installment = eff.binding.rail === "card" ? eff.binding.installment : false
  const contactless = eff.binding.rail === "card" ? eff.binding.contactless : false
  return (
    <div>
      <div className="label">โปรไฟล์เครื่องรูดบัตรของสาขานี้</div>
      <div className="pm-stack-sm" style={{ marginBottom: 18 }}>
        {profiles.map((p) => (
          <button key={p.id} className="pm-edc-pick" data-selected={p.id === sel} disabled={!can.override} type="button">
            <span className="pm-edc-logo" style={{ background: PM_ACQUIRER_COLOR[p.acquirer] }}>{p.acquirer.toUpperCase().slice(0, 4)}</span>
            <div className="pm-edc-info">
              <div className="pm-edc-name">{p.acquirerLabel}</div>
              <div className="pm-edc-meta">{p.mode === "semi_integrated" ? "Semi-integrated" : "Standalone"} · ตัดยอด {p.settleAuto ? `อัตโนมัติ ${p.settleTime}` : "แมนนวล"}</div>
            </div>
          </button>
        ))}
        {profiles.length === 0 && <div className="pm-diff-empty">สาขานี้ยังไม่มีโปรไฟล์ EDC · เพิ่มที่หน้า “เครื่องรูดบัตร”</div>}
      </div>
      {profile && (
        <>
          <div className="pm-field-group" style={{ marginBottom: 18 }}>
            <FieldRow label="ผ่อนชำระ (Installment)" locked={!can.override}><Switch on={installment} disabled={!can.override} onClick={() => {}} /></FieldRow>
            <FieldRow label="แตะเพื่อจ่าย (Contactless)" locked={!can.override}><Switch on={contactless} disabled={!can.override} onClick={() => {}} /></FieldRow>
          </div>
          <div className="pm-pairing">
            <div className="pm-pairing-head">
              <Icon name="terminal" size={15} /> {devices.length} เครื่องผูกที่สาขานี้
              <span className="pm-pairing-lock"><Icon name="lock" size={12} /> อ่านอย่างเดียว · จับคู่ที่ iPad</span>
            </div>
            {devices.length === 0
              ? <div className="pm-diff-empty">ยังไม่มีเครื่องจับคู่ · เปิดได้ แต่ POS จะแสดง “ไม่มีเครื่องผูก”</div>
              : devices.map((dv) => (
                <div key={dv.deviceId} className="pm-device-row">
                  <span className="pm-device-ic"><Icon name="terminal" size={16} /></span>
                  <div><div className="pm-device-id">{dv.deviceId}</div><div className="pm-device-model">{dv.model}</div></div>
                  <span className="pm-conn"><Icon name={connIcon[dv.connection]} size={14} /> {dv.connection.toUpperCase()}</span>
                  <span className="pm-conn"><span className="pm-dot-status" data-on={dv.online} /> {dv.online ? "ออนไลน์" : dv.lastSeenAt}</span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

function BranchLocalBinding({ eff }: { eff: EffectiveMethod }) {
  const p = eff.policy
  const rl: Record<string, string> = { none: "ไม่ปัด", up: "ปัดขึ้น", down: "ปัดลง", nearest: "ปัดใกล้สุด" }
  return (
    <div className="pm-field-group">
      <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="coins" size={15} /> การปัดเศษ</span><span className="pm-kv-v">{p.rounding ? `${rl[p.rounding.mode]} · ขั้น ฿${p.rounding.step}` : "ไม่ปัด"}</span></div>
      <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="cash" size={15} /> ทอนเงิน</span><span className="pm-kv-v">{p.allowChange ? "อนุญาต" : "ไม่อนุญาต"}</span></div>
      <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="store" size={15} /> ลิ้นชัก</span><span className="pm-kv-v">{p.openDrawer ? "เปิดเมื่อปิดการชำระ" : "ไม่เปิด"}</span></div>
    </div>
  )
}

// ---- Override sheet wrapper ----
export function BranchOverrideSheet({
  db, definition, branch, can, scopeLocked, testStyle, onClose, onSave, onResetAll,
}: {
  db: PaymentDB
  definition: PaymentDefinition
  branch: Branch
  can: PaymentCan
  scopeLocked: boolean
  testStyle: TestStyle
  onClose: () => void
  onSave: (defId: string, branchId: string, ov: OverridePatch) => void
  onResetAll: () => void
}) {
  const def = definition
  const assignment = db.assignments.find((a) => a.definitionId === def.id && a.branchId === branch.id)
  const eff = assignment ? effective(db, assignment) : null

  const [ov, setOv] = useState<OverridePatch>(() => ({
    enabled: eff?.enabled ?? false,
    sortOrder: eff?.sortOrder ?? 1,
    labelOn: eff?.labelOverride != null,
    label: eff?.label ?? def.label,
    channelsOn: eff?.channelsOverride != null,
    channels: [...(eff?.channels ?? def.defaultChannels)],
    pol: { ...(eff?.policyOverride || {}) },
  }))
  const set = (patch: Partial<OverridePatch>) => setOv((p) => ({ ...p, ...patch }))
  const setPol = (k: keyof MethodPolicy, v: unknown) => setOv((p) => ({ ...p, pol: { ...p.pol, [k]: v } as MethodPolicy }))
  const clearPol = (k: keyof MethodPolicy) => setOv((p) => { const n = { ...p.pol }; delete n[k]; return { ...p, pol: n } })

  const [tab, setTab] = useState("policy")
  const isQr = def.rail === "qr"
  const [testState, setTestState] = useState<string>(isQr && eff ? bindingStatus(db, eff).kind : "")
  const enableBlocked = isQr && testState !== "verified"

  const dp = def.defaultPolicy
  const fmtBool = (b?: boolean) => (b ? "เปิด" : "ปิด")
  const overrideCount = Object.keys(ov.pol).length + (ov.labelOn ? 1 : 0) + (ov.channelsOn ? 1 : 0)

  const TABS = [
    { id: "policy", label: "นโยบาย / override", icon: "receipt", badge: overrideCount || null, dot: null as string | null },
    { id: "rail", label: "การผูก rail", icon: PM_RAILS[def.rail].icon, badge: null as number | null, dot: enableBlocked ? "amber" : null },
  ]

  if (!eff) {
    return (
      <div className="sheet-scrim" style={{ zIndex: 55 }} onClick={onClose}>
        <div className="sheet" style={{ gridTemplateColumns: "240px 1fr", maxWidth: 920 }} onClick={(e) => e.stopPropagation()}>
          <div className="sheet-body" style={{ gridColumn: "1 / -1" }}>
            <div className="pm-diff-empty">วิธีนี้ยังไม่ถูกนำไปใช้ที่ {branch.id}</div>
          </div>
        </div>
      </div>
    )
  }

  const policyTab = (
    <div>
      <div className="section-title">override ระดับสาขา<span className="section-meta">เปิดเฉพาะฟิลด์ที่ต่างจากแบรนด์</span></div>

      <div className="pm-field-group" style={{ marginBottom: 16 }}>
        <FieldRow label="เปิดใช้งานที่สาขานี้" sub={enableBlocked ? "ต้องทดสอบเกตเวย์ให้ยืนยันก่อน" : "แสดงบน POS ของสาขานี้"} locked={!can.enable || enableBlocked}>
          <Switch on={ov.enabled} disabled={!can.enable || enableBlocked} onClick={() => set({ enabled: !ov.enabled })} />
        </FieldRow>
        <FieldRow label="ลำดับบน POS" sub="เฉพาะลำดับการแสดงของสาขานี้" locked={!can.override}>
          <input className="input mono" style={{ width: 72 }} type="number" value={ov.sortOrder} disabled={!can.override} onChange={(e) => set({ sortOrder: +e.target.value })} />
        </FieldRow>
      </div>

      <div className="pm-ovf-stack">
        <OverrideField label="ชื่อที่แสดง (Label)" inherited={def.label} isOverridden={ov.labelOn} canEdit={can.override}
          onToggleOverride={(v) => set({ labelOn: v, label: v ? ov.label : def.label })}>
          <input className="input" value={ov.label} onChange={(e) => set({ label: e.target.value })} />
        </OverrideField>

        <OverrideField label="ช่องทางที่เปิดรับ" inherited={def.defaultChannels.map((c) => PM_CHANNELS[c].label).join(", ")} isOverridden={ov.channelsOn} canEdit={can.override}
          onToggleOverride={(v) => set({ channelsOn: v, channels: v ? [...ov.channels] : [...def.defaultChannels] })}>
          <div className="pm-chan-row">
            {(Object.entries(PM_CHANNELS) as [Channel, { icon: string; label: string }][]).map(([k, v]) => {
              const on = ov.channels.includes(k)
              return <button key={k} className="pm-chan" data-on={on} type="button"
                onClick={() => set({ channels: on ? ov.channels.filter((c) => c !== k) : [...ov.channels, k] })}>
                <Icon name={v.icon} size={15} /> {v.label}</button>
            })}
          </div>
        </OverrideField>

        {def.rail === "card" && (
          <OverrideField label="จำนวนสลิปใบเสร็จ" inherited={String(dp.receiptSlips ?? 1)} isOverridden={"receiptSlips" in ov.pol} canEdit={can.override}
            onToggleOverride={(v) => v ? setPol("receiptSlips", dp.receiptSlips ?? 1) : clearPol("receiptSlips")}>
            <Seg value={String(ov.pol.receiptSlips ?? dp.receiptSlips ?? 1)} options={[{ value: "0", label: "0" }, { value: "1", label: "1" }, { value: "2", label: "2" }]} onChange={(v) => setPol("receiptSlips", +v)} />
          </OverrideField>
        )}

        {def.rail !== "card" && (
          <OverrideField label="ค่าธรรมเนียมเพิ่ม (Surcharge)" inherited={`${dp.surchargePct ?? 0}%`} isOverridden={"surchargePct" in ov.pol} canEdit={can.override}
            onToggleOverride={(v) => v ? setPol("surchargePct", dp.surchargePct ?? 0) : clearPol("surchargePct")}>
            <div className="input-suffix-wrap" style={{ width: 96 }}><input className="input mono" value={ov.pol.surchargePct ?? 0} onChange={(e) => setPol("surchargePct", +e.target.value)} /><span className="input-suffix">%</span></div>
          </OverrideField>
        )}

        <OverrideField label="ยอดสูงสุด" inherited={dp.maxAmount ? `฿${dp.maxAmount.toLocaleString()}` : "ไม่จำกัด"} isOverridden={"maxAmount" in ov.pol} canEdit={can.override}
          onToggleOverride={(v) => v ? setPol("maxAmount", dp.maxAmount ?? 1000) : clearPol("maxAmount")}>
          <div className="input-prefix-wrap" style={{ width: 130 }}><span className="input-prefix">฿</span><input className="input mono" value={ov.pol.maxAmount ?? ""} onChange={(e) => setPol("maxAmount", e.target.value ? +e.target.value : undefined)} /></div>
        </OverrideField>

        <OverrideField label="รับทิป (Tip)" inherited={fmtBool(dp.allowTip)} isOverridden={"allowTip" in ov.pol} canEdit={can.override}
          onToggleOverride={(v) => v ? setPol("allowTip", !dp.allowTip) : clearPol("allowTip")}>
          <Switch on={ov.pol.allowTip ?? !!dp.allowTip} onClick={() => setPol("allowTip", !(ov.pol.allowTip ?? dp.allowTip))} />
        </OverrideField>
      </div>
    </div>
  )

  return (
    <div className="sheet-scrim" style={{ zIndex: 55 }} onClick={onClose}>
      <div className="sheet" style={{ gridTemplateColumns: "240px 1fr", maxWidth: 920 }} onClick={(e) => e.stopPropagation()} data-screen-label="02b Branch override">
        <div className="sheet-head">
          <div className="pm-sheet-id">
            <RailThumb rail={def.rail} type={def.type} size={36} />
            <div className="sheet-title-block">
              <span className="sheet-title">{ov.labelOn ? ov.label : def.label}</span>
              <span className="sheet-sub">override สำหรับ <b>{branch.id} · {branch.name}</b></span>
            </div>
          </div>
          <RailBadge rail={def.rail} />
          <div className="sheet-head-spacer" />
          {scopeLocked && <span className="pm-lock-note"><Icon name="lock" size={11} /> สาขาของคุณ</span>}
          <button className="icon-btn" onClick={onClose} aria-label="ปิด"><Icon name="x" size={18} /></button>
        </div>

        <div className="sheet-rail">
          <div className="pm-inherit-card">
            <Icon name="link" size={14} />
            <div>
              <div className="pm-inherit-title">สืบทอดจากค่าแบรนด์</div>
              <div className="pm-inherit-sub">ฟิลด์ที่ไม่ override จะตามนิยาม “{def.label}” ของแบรนด์โดยอัตโนมัติ</div>
            </div>
          </div>
          <div className="stepper" style={{ marginTop: 14 }}>
            {TABS.map((t) => (
              <button key={t.id} className="step" data-state={tab === t.id ? "current" : "idle"} onClick={() => setTab(t.id)} style={{ alignItems: "center" }}>
                <span className="step-num" style={{ borderRadius: 8 }}><Icon name={t.icon} size={13} /></span>
                <span style={{ flex: 1 }}><span className="step-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {t.label}{t.badge != null && <span className="pm-step-badge">{t.badge}</span>}{t.dot && <span className="pm-tab-dot" data-tone={t.dot} />}
                </span></span>
              </button>
            ))}
          </div>
        </div>

        <div className="sheet-body">
          {tab === "policy" ? policyTab : (
            <div>
              <div className="section-title">การผูก rail · {PM_RAILS[def.rail].label}<span className="section-meta">เฉพาะสาขา {branch.id}</span></div>
              {def.rail === "local" && <BranchLocalBinding eff={eff} />}
              {def.rail === "qr" && <BranchQrBinding db={db} eff={eff} branch={branch} can={can} testState={testState} setTestState={setTestState} testStyle={testStyle} />}
              {def.rail === "card" && <BranchCardBinding db={db} eff={eff} branch={branch} can={can} />}
            </div>
          )}
        </div>

        <div className="sheet-foot">
          {overrideCount > 0
            ? <button className="btn btn-sm" disabled={!can.override} onClick={() => onResetAll()}><Icon name="rotate" size={13} /> รีเซ็ตเป็นค่าแบรนด์ทั้งหมด</button>
            : <span className="sheet-foot-meta"><Icon name="link" size={13} style={{ verticalAlign: "-2px" }} /> ไม่มี override · ตามค่าแบรนด์ทั้งหมด</span>}
          <div className="sheet-foot-spacer" />
          <button className="btn" onClick={onClose}>ยกเลิก</button>
          {can.override
            ? <button className="btn btn-primary" onClick={() => onSave(def.id, branch.id, ov)}><Icon name="check" size={14} /> บันทึก &amp; publish สาขานี้</button>
            : <LockNote>อ่านอย่างเดียว</LockNote>}
        </div>
      </div>
    </div>
  )
}
