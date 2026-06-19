// FIP Payment — S2 · Method definition detail (brand level).
// Tabs: General / Policy defaults / Branches (matrix) / Governance.
import { useState, type ReactNode } from "react"
import { Icon } from "../Icon"
import { LockNote, OverrideBadge, RailBadge, RailThumb, Seg, Switch } from "./primitives"
import { PM_BRAND, PM_BRANCHES, PM_CHANNELS, PM_RAILS, PM_TYPES } from "../../lib/payment/catalog"
import {
  bindingStatus, canEnable, coverage, effective, type PaymentDB,
} from "../../lib/payment/effective"
import type {
  Branch, Channel, MethodPolicy, MethodType, PaymentCan, PaymentDefinition, Rail,
} from "../../lib/payment/types"

export function FieldRow({ label, sub, children, locked }: {
  label: string; sub?: string; children: ReactNode; locked?: boolean
}) {
  return (
    <div className="pm-fg-row">
      <div className="pm-fg-info">
        <div className="pm-fg-label">{label}</div>
        {sub && <div className="pm-fg-sub">{sub}</div>}
      </div>
      <div className={"pm-fg-control" + (locked ? " pm-locked" : "")}>{children}</div>
    </div>
  )
}

type SetDef = <K extends keyof PaymentDefinition>(k: K, v: PaymentDefinition[K]) => void

// ---------- General ----------
function DefGeneralTab({ d, set, can, isNew }: { d: PaymentDefinition; set: SetDef; can: PaymentCan; isNew: boolean }) {
  const ICONS = ["cash", "qr", "card", "wallet", "ticket", "ledger", "coins"]
  const TYPE_DEFAULTS: Record<MethodType, { rail: Rail; icon: string }> = {
    cash: { rail: "local", icon: "cash" },
    qr_promptpay: { rail: "qr", icon: "qr" },
    card: { rail: "card", icon: "card" },
    ewallet: { rail: "card", icon: "wallet" },
    voucher: { rail: "local", icon: "ticket" },
    on_credit: { rail: "local", icon: "ledger" },
    custom: { rail: "local", icon: "coins" },
  }
  const pickType = (t: MethodType) => {
    const def = TYPE_DEFAULTS[t] || { rail: "local", icon: "coins" }
    set("type", t)
    set("rail", def.rail)
    set("icon", def.icon)
  }
  return (
    <div>
      <div className="section-title">ข้อมูลทั่วไป (ระดับแบรนด์)</div>
      <div className="field">
        <div className="label label-req">ชื่อเริ่มต้น (Default label)</div>
        <input className="input" value={d.label} disabled={!can.define} onChange={(e) => set("label", e.target.value)} />
        <div className="input-help">สาขาสามารถ override ชื่อนี้เฉพาะของตัวเองได้</div>
      </div>
      <div className="field-row">
        <div className="field">
          <div className="label">ประเภท</div>
          {isNew ? (
            <div className="select-wrap">
              <select className="select" value={d.type} disabled={!can.define} onChange={(e) => pickType(e.target.value as MethodType)}>
                {(Object.entries(PM_TYPES) as [MethodType, { label: string }][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          ) : (
            <div className="input pm-ro-field"><Icon name={PM_TYPES[d.type].icon} size={15} /> {PM_TYPES[d.type].label}<span className="pm-muted-mono" style={{ marginLeft: "auto" }}>ล็อกหลังสร้าง</span></div>
          )}
          <div className="input-help">{isNew ? "เลือกได้เฉพาะตอนสร้าง · ล็อกหลังบันทึก" : "ล็อกหลังสร้าง"}</div>
        </div>
        <div className="field">
          <div className="label">Rail</div>
          {isNew ? (
            <div className="select-wrap">
              <select className="select" value={d.rail} disabled={!can.define} onChange={(e) => set("rail", e.target.value as Rail)}>
                {(Object.entries(PM_RAILS) as [Rail, { label: string }][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          ) : (
            <div className="input pm-ro-field"><Icon name={PM_RAILS[d.rail].icon} size={15} /> {PM_RAILS[d.rail].label}<span className="pm-muted-mono" style={{ marginLeft: "auto" }}>ล็อกหลังสร้าง</span></div>
          )}
          <div className="input-help">{isNew ? "กำหนดค่าเริ่มต้นตามประเภท · ปรับได้" : "ล็อกหลังสร้าง"}</div>
        </div>
      </div>
      <div className="field">
        <div className="label">ไอคอน</div>
        <div className="pm-icon-grid">
          {ICONS.map((ic) => (
            <button key={ic} className="pm-icon-pick" data-active={d.icon === ic} disabled={!can.define} onClick={() => set("icon", ic)} type="button">
              <Icon name={ic} size={19} />
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <div className="label">ช่องทางเริ่มต้น</div>
        <div className="pm-chan-row">
          {(Object.entries(PM_CHANNELS) as [Channel, { icon: string; label: string }][]).map(([k, v]) => {
            const on = d.defaultChannels.includes(k)
            return (
              <button key={k} className="pm-chan" data-on={on} disabled={!can.define} type="button"
                onClick={() => set("defaultChannels", on ? d.defaultChannels.filter((c) => c !== k) : [...d.defaultChannels, k])}>
                <Icon name={v.icon} size={15} /> {v.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="pm-field-group">
        <FieldRow label="เปิดใช้งานเป็นค่าเริ่มต้น" sub="เมื่อนำไปใช้กับสาขาใหม่ จะเปิดให้อัตโนมัติ" locked={!can.define}>
          <Switch on={d.enabledByDefault} disabled={!can.define} onClick={() => set("enabledByDefault", !d.enabledByDefault)} />
        </FieldRow>
      </div>
    </div>
  )
}

// ---------- Policy defaults ----------
function DefPolicyTab({ d, set, can }: { d: PaymentDefinition; set: SetDef; can: PaymentCan }) {
  const p = d.defaultPolicy
  const setP = (k: keyof MethodPolicy, v: unknown) => set("defaultPolicy", { ...p, [k]: v } as MethodPolicy)
  const isCash = d.rail === "local" && d.type === "cash"
  const isCard = d.rail === "card"
  return (
    <div>
      <div className="section-title">นโยบายเริ่มต้น<span className="section-meta">สาขา override เฉพาะฟิลด์ที่ต่างได้</span></div>
      {isCard && (
        <div className="pm-hint-amber" style={{ marginBottom: 16 }}>
          <Icon name="info" size={15} />
          <span>ค่าธรรมเนียมบัตร (surcharge) ถูกซ่อนจนกว่าจะยืนยันข้อกำหนดเครือข่ายบัตรในไทย (§13)</span>
        </div>
      )}
      <div className="pm-field-group" style={{ marginBottom: 16 }}>
        {!isCard && (
          <FieldRow label="ค่าธรรมเนียมเพิ่ม (Surcharge)" sub="ลำดับ: ภาษี → surcharge → ปัดเศษ" locked={!can.define}>
            <div className="input-suffix-wrap" style={{ width: 96 }}>
              <input className="input mono" value={p.surchargePct ?? 0} disabled={!can.define} onChange={(e) => setP("surchargePct", +e.target.value)} />
              <span className="input-suffix">%</span>
            </div>
          </FieldRow>
        )}
        {isCash && (
          <FieldRow label="ปัดเศษเงินทอน" locked={!can.define}>
            <Seg value={p.rounding?.mode || "none"} disabled={!can.define}
              options={[{ value: "none", label: "ไม่ปัด" }, { value: "up", label: "ขึ้น" }, { value: "down", label: "ลง" }, { value: "nearest", label: "ใกล้สุด" }]}
              onChange={(v) => setP("rounding", { ...(p.rounding || { step: 1 }), mode: v as "none" | "up" | "down" | "nearest", step: p.rounding?.step || 1 })} />
          </FieldRow>
        )}
        <FieldRow label="ยอดขั้นต่ำ / สูงสุด" sub="เว้นว่างหากไม่จำกัด · ขั้นต่ำ ≤ สูงสุด" locked={!can.define}>
          <div className="pm-inline">
            <div className="input-prefix-wrap" style={{ width: 100 }}><span className="input-prefix">฿</span>
              <input className="input mono" placeholder="min" value={p.minAmount ?? ""} disabled={!can.define} onChange={(e) => setP("minAmount", e.target.value ? +e.target.value : undefined)} /></div>
            <span className="muted">–</span>
            <div className="input-prefix-wrap" style={{ width: 100 }}><span className="input-prefix">฿</span>
              <input className="input mono" placeholder="max" value={p.maxAmount ?? ""} disabled={!can.define} onChange={(e) => setP("maxAmount", e.target.value ? +e.target.value : undefined)} /></div>
          </div>
        </FieldRow>
        {isCard && (
          <FieldRow label="จำนวนสลิปใบเสร็จ" locked={!can.define}>
            <Seg value={String(p.receiptSlips ?? 1)} disabled={!can.define}
              options={[{ value: "0", label: "0" }, { value: "1", label: "1" }, { value: "2", label: "2" }]}
              onChange={(v) => setP("receiptSlips", +v)} />
          </FieldRow>
        )}
      </div>
      <div className="pm-field-group">
        <FieldRow label="อนุญาตให้ทอนเงิน" locked={!can.define}><Switch on={!!p.allowChange} disabled={!can.define} onClick={() => setP("allowChange", !p.allowChange)} /></FieldRow>
        <FieldRow label="รับทิป (Tip)" locked={!can.define}><Switch on={!!p.allowTip} disabled={!can.define} onClick={() => setP("allowTip", !p.allowTip)} /></FieldRow>
        <FieldRow label="ต้องระบุเลขอ้างอิง" locked={!can.define}><Switch on={!!p.requireReference} disabled={!can.define} onClick={() => setP("requireReference", !p.requireReference)} /></FieldRow>
        {d.rail === "local" && (
          <FieldRow label="เปิดลิ้นชักเก็บเงิน" locked={!can.define}><Switch on={!!p.openDrawer} disabled={!can.define} onClick={() => setP("openDrawer", !p.openDrawer)} /></FieldRow>
        )}
      </div>
      <div className="note" style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <Icon name="info" size={15} /> แก้ค่าเหล่านี้แล้วจะมีผลกับทุกสาขาที่ยังไม่ override ฟิลด์นั้น
      </div>
    </div>
  )
}

// ---------- Branches matrix ----------
function DefBranchesTab({ db, d, can, onEditOverride, onToggleApplied, onToggleEnabled }: {
  db: PaymentDB; d: PaymentDefinition; can: PaymentCan
  onEditOverride: (d: PaymentDefinition, b: Branch) => void
  onToggleApplied: (d: PaymentDefinition, b: Branch, apply: boolean) => void
  onToggleEnabled: (eff: import("../../lib/payment/types").EffectiveMethod) => void
}) {
  const rows = PM_BRANCHES.map((b) => {
    const a = db.assignments.find((x) => x.definitionId === d.id && x.branchId === b.id)
    const eff = a ? effective(db, a) : null
    return { branch: b, assignment: a, eff }
  })
  const appliedCount = rows.filter((r) => r.assignment).length

  return (
    <div>
      <div className="section-title">
        การใช้งานในสาขา
        <span className="section-meta">{appliedCount}/{PM_BRANCHES.length} สาขา</span>
      </div>

      {can.assign && (
        <div className="pm-bulk">
          <button className="btn btn-sm"><Icon name="check" size={13} /> นำไปใช้ทุกสาขา</button>
          <button className="btn btn-sm"><Icon name="copy" size={13} /> คัดลอก override จากสาขา…</button>
          <button className="btn btn-sm"><Icon name="rotate" size={13} /> รีเซ็ตทุกสาขาเป็นค่าแบรนด์</button>
        </div>
      )}

      <div className="pm-matrix">
        <div className="pm-matrix-head">
          <span>สาขา</span>
          <span className="center">ใช้งาน</span>
          <span className="center">เปิด POS</span>
          <span>override</span>
          <span>สถานะการผูก rail</span>
          <span></span>
        </div>
        {rows.map(({ branch, assignment, eff }) => {
          const bs = eff ? bindingStatus(db, eff) : null
          const enableBlocked = !!eff && !canEnable(db, eff)
          return (
            <div key={branch.id} className="pm-matrix-row" data-applied={!!assignment}>
              <span className="pm-matrix-branch">
                <span className="pm-scope-opt-id">{branch.id}</span>
                <span className="pm-matrix-bname">{branch.name}</span>
              </span>
              <span className="center">
                <Switch on={!!assignment} disabled={!can.assign} onClick={() => onToggleApplied(d, branch, !assignment)} />
              </span>
              <span className="center">
                {assignment && eff
                  ? <Switch on={eff.enabled} disabled={!can.enable || enableBlocked} onClick={() => onToggleEnabled(eff)} />
                  : <span className="muted">—</span>}
              </span>
              <span>{assignment && eff ? <OverrideBadge fields={eff.overridden} /> : <span className="muted">—</span>}</span>
              <span>
                {assignment && bs
                  ? <span className={"badge " + bs.badge} title={bs.sub || ""}><span className="badge-dot" />{bs.label}</span>
                  : <span className="muted" style={{ fontSize: 12 }}>ยังไม่ใช้งาน</span>}
              </span>
              <span className="right">
                {assignment
                  ? <button className="btn btn-sm" disabled={!can.override} onClick={() => onEditOverride(d, branch)}><Icon name="edit" size={13} /> แก้ override</button>
                  : can.assign && <button className="btn btn-sm" onClick={() => onToggleApplied(d, branch, true)}><Icon name="plus" size={13} /> นำไปใช้</button>}
              </span>
            </div>
          )
        })}
      </div>

      <div className="pm-hint-amber" style={{ marginTop: 16 }}>
        <Icon name="info" size={15} />
        <span>วิธี QR จะ <b>เปิดบน POS</b> ของสาขาได้ ก็ต่อเมื่อสาขานั้นผูกกับเกตเวย์ที่ <b>ยืนยันแล้ว</b> · แก้ที่ “แก้ override”</span>
      </div>
    </div>
  )
}

// ---------- Governance ----------
function DefGovernanceTab({ onAudit }: { onAudit: () => void }) {
  const roles = [
    { name: "เจ้าของ / แอดมินแบรนด์", perm: "สร้างนิยาม · นำไปใช้ทุกสาขา · จัดการคีย์", color: "#0a0a0a" },
    { name: "ผู้จัดการสาขา", perm: "เปิด/ปิด + override เฉพาะสาขาตน · เปิดเผยคีย์ดิบไม่ได้", color: "#1d4ed8" },
    { name: "ผู้ตรวจสอบ", perm: "อ่านอย่างเดียว + ดูบันทึกการแก้ไข", color: "#6d28d9" },
  ]
  return (
    <div>
      <div className="section-title">สิทธิ์การจัดการ</div>
      <div style={{ marginBottom: 18 }}>
        {roles.map((r) => (
          <div key={r.name} className="pm-gov-role">
            <span className="pm-gov-avatar" style={{ background: r.color }}><Icon name="shield" size={15} /></span>
            <div className="pm-gov-info"><div className="pm-gov-name">{r.name}</div><div className="pm-gov-perm">{r.perm}</div></div>
          </div>
        ))}
      </div>
      <div className="section-title">สิทธิ์เฉพาะวิธีนี้ (Override)</div>
      <div className="pm-field-group" style={{ marginBottom: 18 }}>
        <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="key" size={15} /> payment.void.allow</span><span className="pm-kv-v"><span className="badge b-green"><span className="badge-dot" />เปิด</span></span></div>
        <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="key" size={15} /> payment.refund.allow</span><span className="pm-kv-v"><span className="badge b-neutral">ปิด</span></span></div>
        <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="key" size={15} /> payment.settle.allow</span><span className="pm-kv-v"><span className="badge b-neutral">ปิด</span></span></div>
      </div>
      <button className="btn" style={{ width: "100%" }} onClick={onAudit}><Icon name="history" size={14} /> ดูบันทึกการแก้ไขของวิธีนี้</button>
    </div>
  )
}

const NEW_DEF: PaymentDefinition = {
  id: "def_new", brandId: "aramen", type: "cash", label: "วิธีชำระเงินใหม่", icon: "coins", rail: "local",
  enabledByDefault: true, defaultChannels: ["dine_in"],
  defaultPolicy: { allowChange: true, allowTip: false, overTenderToTip: false, requireReference: false, openDrawer: true, receiptSlips: 0 },
}

// ---------- Definition sheet wrapper ----------
export function MethodDefinitionSheet({
  db, definition, can, onClose, onSave, onEditOverride, onToggleApplied, onToggleEnabled, onGotoAudit,
}: {
  db: PaymentDB
  definition: PaymentDefinition | null
  can: PaymentCan
  onClose: () => void
  onSave: (d: PaymentDefinition) => void
  onEditOverride: (d: PaymentDefinition, b: Branch) => void
  onToggleApplied: (d: PaymentDefinition, b: Branch, apply: boolean) => void
  onToggleEnabled: (eff: import("../../lib/payment/types").EffectiveMethod) => void
  onGotoAudit: () => void
}) {
  const isNew = !definition
  const [d, setD] = useState<PaymentDefinition>(definition || NEW_DEF)
  const set: SetDef = (k, v) => setD((prev) => ({ ...prev, [k]: v }))
  const [tab, setTab] = useState("general")
  const cov = isNew ? null : coverage(db, d.id, PM_BRANCHES.length)

  const TABS = [
    { id: "general", label: "ทั่วไป", icon: "info" as const, badge: null as number | null, disabled: false },
    { id: "policy", label: "นโยบายเริ่มต้น", icon: "receipt", badge: null, disabled: false },
    { id: "branches", label: "สาขา", icon: "store", badge: cov ? cov.applied : null, disabled: isNew },
    { id: "governance", label: "สิทธิ์", icon: "shield", badge: null, disabled: false },
  ]

  const render = () => {
    switch (tab) {
      case "general": return <DefGeneralTab d={d} set={set} can={can} isNew={isNew} />
      case "policy": return <DefPolicyTab d={d} set={set} can={can} />
      case "branches": return <DefBranchesTab db={db} d={d} can={can} onEditOverride={onEditOverride} onToggleApplied={onToggleApplied} onToggleEnabled={onToggleEnabled} />
      case "governance": return <DefGovernanceTab onAudit={onGotoAudit} />
      default: return null
    }
  }

  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" style={{ gridTemplateColumns: "240px 1fr" }} onClick={(e) => e.stopPropagation()} data-screen-label="02 Method definition">
        <div className="sheet-head">
          <div className="pm-sheet-id">
            <RailThumb rail={d.rail} type={d.type} size={36} />
            <div className="sheet-title-block">
              <span className="sheet-title">{isNew ? "สร้างนิยามวิธีชำระเงิน" : d.label}</span>
              <span className="sheet-sub">{PM_TYPES[d.type].label} · {PM_RAILS[d.rail].label} · ระดับแบรนด์</span>
            </div>
          </div>
          <RailBadge rail={d.rail} />
          {!isNew && cov && <span className="pm-cov-pill"><Icon name="store" size={12} /> {cov.applied}/{cov.total} สาขา</span>}
          <div className="sheet-head-spacer" />
          <button className="icon-btn" onClick={onClose} aria-label="ปิด"><Icon name="x" size={18} /></button>
        </div>

        <div className="sheet-rail">
          <div className="stepper">
            {TABS.map((t) => (
              <button key={t.id} className="step" data-state={tab === t.id ? "current" : "idle"} disabled={t.disabled}
                onClick={() => !t.disabled && setTab(t.id)} style={{ alignItems: "center", opacity: t.disabled ? 0.45 : 1 }}>
                <span className="step-num" style={{ borderRadius: 8 }}><Icon name={t.icon} size={13} /></span>
                <span style={{ flex: 1 }}>
                  <span className="step-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {t.label}{t.badge != null && <span className="pm-step-badge">{t.badge}</span>}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="pm-divider-soft" style={{ margin: "16px 0" }} />
          <div className="note" style={{ fontSize: 12 }}>
            นิยามนี้เป็นของแบรนด์ {PM_BRAND.name} · แต่ละสาขานำไปใช้และปรับค่าต่างกันได้ในแท็บ “สาขา”
          </div>
        </div>

        <div className="sheet-body">{render()}</div>

        <div className="sheet-foot">
          <span className="sheet-foot-meta"><Icon name="check" size={13} style={{ verticalAlign: "-2px", color: "var(--green)" }} /> แก้นิยามมีผลกับสาขาที่ยังไม่ override</span>
          <div className="sheet-foot-spacer" />
          <button className="btn" onClick={onClose}>ปิด</button>
          {can.define
            ? <button className="btn btn-primary" onClick={() => onSave(d)}><Icon name="check" size={14} /> บันทึกนิยาม</button>
            : <LockNote>อ่านอย่างเดียว</LockNote>}
        </div>
      </div>
    </div>
  )
}
