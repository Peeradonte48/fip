// FIP Payment — S1 · Registry. Two views: by-method (brand) / by-branch (effective).
import { useEffect, useRef, useState } from "react"
import { Icon } from "../Icon"
import {
  ChannelPills, CoverageBar, LockNote, OverrideBadge, RailBadge, RailThumb, StatusBadge, Switch,
} from "./primitives"
import { PM_BRANCHES, PM_TYPES } from "../../lib/payment/catalog"
import {
  assignmentsForBranch, bindingStatus, canEnable, coverage, type PaymentDB,
} from "../../lib/payment/effective"
import type {
  Branch, EffectiveMethod, PaymentCan, PaymentDefinition, RegistryView,
} from "../../lib/payment/types"

interface MenuItem {
  icon?: string
  label?: string
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

function RowMenu({ open, onOpen, items }: { open: boolean; onOpen: (v: boolean) => void; items: MenuItem[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open, onOpen])
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button className="icon-btn" aria-label="เพิ่มเติม" onClick={(e) => { e.stopPropagation(); onOpen(!open) }}>
        <Icon name="dotsV" size={15} />
      </button>
      {open && (
        <div className="pm-scope-menu" style={{ right: 0, left: "auto", width: 200, top: 36 }} onClick={(e) => e.stopPropagation()}>
          {items.map((it, i) => it.divider
            ? <div key={i} className="pm-divider-soft" />
            : (
              <button key={i} className="pm-scope-opt" disabled={it.disabled} style={it.danger ? { color: it.disabled ? "var(--ink-4)" : "var(--red)" } : {}}
                onClick={() => { onOpen(false); it.onClick?.() }}>
                <Icon name={it.icon!} size={15} /> {it.label}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

// ---------- By-method (brand definitions) ----------
function ByMethodView({ db, can, query, onOpenDef, onApply }: {
  db: PaymentDB; can: PaymentCan; query: string
  onOpenDef: (d: PaymentDefinition) => void; onApply: (d: PaymentDefinition) => void
}) {
  const [menuId, setMenuId] = useState<string | null>(null)
  const filtered = db.definitions.filter((d) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return d.label.toLowerCase().includes(q) || PM_TYPES[d.type].label.includes(q) || d.id.includes(q)
  })
  return (
    <div className="table-wrap">
      <div className="table-scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th>นิยามวิธีชำระเงิน (แบรนด์)</th>
              <th>Rail</th>
              <th>ค่าเริ่มต้น</th>
              <th style={{ width: 280 }}>การใช้งานในสาขา</th>
              <th className="right">เริ่มต้น</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const cov = coverage(db, d.id, PM_BRANCHES.length)
              return (
                <tr key={d.id} onClick={() => onOpenDef(d)} style={{ cursor: "pointer" }}>
                  <td>
                    <div className="pm-method-name">
                      <RailThumb rail={d.rail} type={d.type} />
                      <div>
                        <div className="pm-method-title">{d.label}</div>
                        <div className="pm-method-sub">{PM_TYPES[d.type].label}</div>
                      </div>
                    </div>
                  </td>
                  <td><RailBadge rail={d.rail} /></td>
                  <td><ChannelPills channels={d.defaultChannels} /></td>
                  <td><CoverageBar cov={cov} /></td>
                  <td className="right">
                    {d.enabledByDefault
                      ? <span className="badge b-green"><span className="badge-dot" />เปิด</span>
                      : <span className="badge b-neutral">ปิด</span>}
                  </td>
                  <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="pm-inline">
                      {can.assign && (
                        <button className="btn btn-sm" onClick={() => onApply(d)}><Icon name="store" size={13} /> นำไปใช้</button>
                      )}
                      <RowMenu open={menuId === d.id} onOpen={(v) => setMenuId(v ? d.id : null)}
                        items={[
                          { icon: "edit", label: "แก้ไขนิยาม", onClick: () => onOpenDef(d) },
                          { icon: "store", label: "นำไปใช้กับสาขา", disabled: !can.assign, onClick: () => onApply(d) },
                          { divider: true },
                          { icon: "archive", label: "เก็บเข้าคลัง", danger: true, disabled: !can.define, onClick: () => {} },
                        ]} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="table-foot">
        <div>{db.definitions.length} นิยาม · ระดับแบรนด์ ARAMEN</div>
        <div className="table-foot-spacer" />
        <span className="muted">แก้นิยามแล้วจะมีผลกับสาขาที่ยังไม่ override ฟิลด์นั้น</span>
      </div>
    </div>
  )
}

// ---------- By-branch (effective methods for one branch) ----------
function ByBranchView({ db, branch, can, query, onOpenOverride, onToggle, onApplyHint }: {
  db: PaymentDB; branch: Branch; can: PaymentCan; query: string
  onOpenOverride: (eff: EffectiveMethod) => void; onToggle: (eff: EffectiveMethod) => void
  onApplyHint: (d: PaymentDefinition, b: Branch) => void
}) {
  const [menuId, setMenuId] = useState<string | null>(null)
  let list = assignmentsForBranch(db, branch.id)
  if (query.trim()) {
    const q = query.toLowerCase()
    list = list.filter((m) => m.label.toLowerCase().includes(q) || PM_TYPES[m.type].label.includes(q))
  }
  const notApplied = db.definitions.filter((d) => !db.assignments.some((a) => a.definitionId === d.id && a.branchId === branch.id))

  if (list.length === 0 && !query.trim()) {
    return (
      <div className="pm-empty">
        <div className="pm-empty-ic"><Icon name="store" size={22} /></div>
        <div className="pm-empty-title">สาขานี้ยังไม่มีวิธีชำระเงิน</div>
        <div className="pm-empty-sub">นำนิยามระดับแบรนด์มาใช้กับสาขา {branch.name} เพื่อเริ่มรับเงิน</div>
      </div>
    )
  }

  return (
    <>
      <div className="table-wrap">
        <div className="table-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th className="col-handle"></th>
                <th style={{ width: 56 }}>เปิด</th>
                <th>วิธีชำระเงิน (effective)</th>
                <th>Rail</th>
                <th>การผูก rail</th>
                <th>override</th>
                <th>ช่องทาง</th>
                <th className="right nowrap">ลำดับ</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => {
                const bs = bindingStatus(db, m)
                const enableBlocked = !canEnable(db, m)
                return (
                  <tr key={m.assignmentId} data-off={!m.enabled} onClick={() => onOpenOverride(m)} style={{ cursor: "pointer" }}>
                    <td className="col-handle"><span className="handle"><Icon name="grip" size={14} /></span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Switch on={m.enabled} disabled={!can.enable || enableBlocked} onClick={() => onToggle(m)} />
                    </td>
                    <td>
                      <div className="pm-method-name">
                        <RailThumb rail={m.rail} type={m.type} />
                        <div>
                          <div className="pm-method-title">
                            {m.label}
                            {m.labelOverride != null && <span className="pm-inherit-tag">label override</span>}
                          </div>
                          <div className="pm-method-sub">{PM_TYPES[m.type].label}</div>
                        </div>
                      </div>
                    </td>
                    <td><RailBadge rail={m.rail} /></td>
                    <td><StatusBadge status={bs} /></td>
                    <td><OverrideBadge fields={m.overridden} /></td>
                    <td><ChannelPills channels={m.channels} /></td>
                    <td className="right"><span className="pm-order">{m.sortOrder}</span></td>
                    <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                      <RowMenu open={menuId === m.assignmentId} onOpen={(v) => setMenuId(v ? m.assignmentId : null)}
                        items={[
                          { icon: "edit", label: "แก้ override สาขานี้", disabled: !can.override, onClick: () => onOpenOverride(m) },
                          { icon: "rotate", label: "รีเซ็ตเป็นค่าแบรนด์", disabled: !can.override || m.overridden.length === 0, onClick: () => {} },
                          { divider: true },
                          { icon: "x", label: "เลิกใช้กับสาขานี้", danger: true, disabled: !can.assign, onClick: () => {} },
                        ]} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <div>{list.filter((m) => m.enabled).length} จาก {list.length} วิธี เปิดบน POS สาขานี้</div>
          <div className="table-foot-spacer" />
          <span className="muted">ลำดับ = ลำดับการแสดงบน POS ของสาขานี้เท่านั้น</span>
        </div>
      </div>

      {notApplied.length > 0 && can.assign && (
        <div className="pm-apply-strip">
          <Icon name="plus" size={14} />
          <span>ยังไม่ได้ใช้กับสาขานี้:</span>
          {notApplied.map((d) => (
            <button key={d.id} className="pm-apply-chip" onClick={() => onApplyHint(d, branch)}>
              <Icon name={PM_TYPES[d.type].icon} size={13} /> {d.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export function PaymentRegistry({
  db, view, branch, can, scopeLocked, onSetView, onOpenDef, onApply, onOpenOverride, onToggle, onAddDef, onApplyHint,
}: {
  db: PaymentDB; view: RegistryView; branch: Branch; can: PaymentCan; scopeLocked: boolean
  onSetView: (v: RegistryView) => void
  onOpenDef: (d: PaymentDefinition) => void
  onApply: (d: PaymentDefinition) => void
  onOpenOverride: (eff: EffectiveMethod) => void
  onToggle: (eff: EffectiveMethod) => void
  onAddDef: () => void
  onApplyHint: (d: PaymentDefinition, b: Branch) => void
}) {
  const [query, setQuery] = useState("")
  const defCount = db.definitions.length
  const branchList = assignmentsForBranch(db, branch.id)

  return (
    <>
      <div className="pagehead">
        <div className="pagehead-titles">
          <div className="pagehead-eyebrow">Payment &amp; Tax Setting</div>
          <h1 className="pagehead-title">
            วิธีการชำระเงิน
            {view === "by_method"
              ? <span className="pagehead-count">{defCount} นิยาม</span>
              : <span className="pagehead-count">{branchList.filter((m) => m.enabled).length} เปิด · {branch.id}</span>}
          </h1>
          <div className="pagehead-sub">
            {view === "by_method"
              ? "นิยามวิธีชำระเงินครั้งเดียวที่ระดับแบรนด์ แล้วนำไปใช้กับสาขาที่ต้องการ · แต่ละสาขาปรับค่าต่างกันได้"
              : `วิธีชำระเงินที่มีผลจริง (effective) ของสาขา ${branch.name} · ค่าที่เห็นคือค่าแบรนด์ที่ผสานกับ override ของสาขา`}
          </div>
        </div>
        <div className="pagehead-actions">
          {can.define && (
            <div className="pm-viewswitch">
              <button data-on={view === "by_method"} onClick={() => onSetView("by_method")}><Icon name="coins" size={13} /> ตามวิธี (แบรนด์)</button>
              <button data-on={view === "by_branch"} onClick={() => onSetView("by_branch")}><Icon name="store" size={13} /> ตามสาขา</button>
            </div>
          )}
          {view === "by_method"
            ? (can.define
                ? <button className="btn btn-primary btn-lg" onClick={onAddDef}><Icon name="plus" size={14} /> สร้างนิยามวิธีชำระเงิน</button>
                : <LockNote>สร้างนิยามได้เฉพาะแอดมินแบรนด์</LockNote>)
            : <button className="btn"><Icon name="rocket" size={14} /> Publish สาขานี้</button>}
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <span className="toolbar-search-icon"><Icon name="search" size={14} /></span>
          <input placeholder={view === "by_method" ? "ค้นหานิยาม, ประเภท…" : "ค้นหาวิธีในสาขานี้…"} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="btn"><Icon name="filter" size={14} /> Filters</button>
        <div className="toolbar-spacer" />
        {view === "by_branch" && (
          <span className="pm-scope-inline">
            <Icon name="building" size={13} /> {branch.id} · {branch.name}
            {scopeLocked && <span className="pm-lock-note" style={{ marginLeft: 6 }}><Icon name="lock" size={10} /> สาขาของคุณ</span>}
          </span>
        )}
        <button className="btn"><Icon name="chevronsUpDown" size={14} /> Sort</button>
      </div>

      {view === "by_method"
        ? <ByMethodView db={db} can={can} query={query} onOpenDef={onOpenDef} onApply={onApply} />
        : <ByBranchView db={db} branch={branch} can={can} query={query} onOpenOverride={onOpenOverride} onToggle={onToggle} onApplyHint={onApplyHint} />}
    </>
  )
}
