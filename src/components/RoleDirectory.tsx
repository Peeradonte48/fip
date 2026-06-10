// FIP Back Office — Role & Permission · Directory (list)
import { useMemo, useRef, useState } from "react"
import { Icon } from "./Icon"
import { ProductMark, ProductPill, SoftBadge, SourceTag, TypeBadge, useClickOutside } from "./primitives"
import { PRODUCTS, ROLE_STATUS, roleGrantStats } from "@/lib/catalog"
import type { Persona, Role } from "@/lib/types"

interface Filters {
  product: string | null
  source: string | null
  status: string | null
}

function RoleFilterMenu({
  filters, setFilters, onClose,
}: {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, onClose)
  return (
    <div className="pop" ref={ref} style={{ width: 240 }}>
      <div className="pop-head"><span>ผลิตภัณฑ์</span></div>
      <div className="pop-row" data-on={!filters.product} onClick={() => setFilters((f) => ({ ...f, product: null }))}>
        <span className="pop-check">{!filters.product && <Icon name="check" size={12} />}</span>
        <span className="pop-row-lbl">ทุกผลิตภัณฑ์</span>
      </div>
      {PRODUCTS.map((p) => (
        <div key={p.id} className="pop-row" data-on={filters.product === p.id} onClick={() => setFilters((f) => ({ ...f, product: p.id }))}>
          <span className="pop-check">{filters.product === p.id && <Icon name="check" size={12} />}</span>
          <span className="pop-row-lbl" style={{ display: "flex", alignItems: "center", gap: 8 }}><ProductMark product={p} size={17} /> {p.name}</span>
        </div>
      ))}
      <div className="pop-div" />
      <div className="pop-head"><span>แหล่งที่มา</span></div>
      {([["all", "ทั้งหมด"], ["SYSTEM_DEFAULT", "ค่าเริ่มต้นระบบ"], ["CUSTOM", "กำหนดเอง"]] as const).map(([v, l]) => (
        <div key={v} className="pop-row" data-on={(filters.source || "all") === v} onClick={() => setFilters((f) => ({ ...f, source: v === "all" ? null : v }))}>
          <span className="pop-check">{(filters.source || "all") === v && <Icon name="check" size={12} />}</span>
          <span className="pop-row-lbl">{l}</span>
        </div>
      ))}
    </div>
  )
}

function RoleRowMenu({
  role, persona, onClose, onOpen, onEdit, onDuplicate, onArchive,
}: {
  role: Role
  persona: Persona
  onClose: () => void
  onOpen: (r: Role) => void
  onEdit: (r: Role) => void
  onDuplicate: (r: Role) => void
  onArchive: (r: Role) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, onClose)
  const isDefault = role.source === "SYSTEM_DEFAULT"
  const tenantLockedSystem = persona === "tenant" && role.type === "SYSTEM"
  return (
    <div className="pop" ref={ref} style={{ width: 220 }}>
      {isDefault || tenantLockedSystem ? (
        <div className="pop-row" onClick={() => { onOpen(role); onClose() }}><Icon name="eye" size={15} color="var(--ink-3)" /><span className="pop-row-lbl">ดูสิทธิ์ (อ่านอย่างเดียว)</span></div>
      ) : (
        <div className="pop-row" onClick={() => { onEdit(role); onClose() }}><Icon name="edit" size={15} color="var(--ink-3)" /><span className="pop-row-lbl">แก้ไขบทบาท</span></div>
      )}
      <div className="pop-row" onClick={() => { onDuplicate(role); onClose() }}><Icon name="copy" size={15} color="var(--ink-3)" /><span className="pop-row-lbl">ทำสำเนาเพื่อปรับแต่ง</span></div>
      <div className="pop-row" onClick={onClose}><Icon name="history" size={15} color="var(--ink-3)" /><span className="pop-row-lbl">ดูประวัติการแก้ไข</span></div>
      {!isDefault && !tenantLockedSystem && role.status !== "archived" && (
        <>
          <div className="pop-div" />
          <div className="pop-row" style={{ color: "var(--red)" }} onClick={() => { onArchive(role); onClose() }}>
            <Icon name="archive" size={15} /><span className="pop-row-lbl">เก็บเข้าคลัง</span>
          </div>
        </>
      )}
    </div>
  )
}

function RoleCell({ col, role, persona }: { col: string; role: Role; persona: Persona }) {
  switch (col) {
    case "name": {
      const tenantLocked = persona === "tenant" && role.type === "SYSTEM"
      return (
        <div className="rname">
          <div className="rname-ic" data-type={role.type}><Icon name={role.type === "SYSTEM" ? "shield" : "box"} size={18} /></div>
          <div className="rname-txt">
            <div className="rname-title">
              {role.name}
              {(role.source === "SYSTEM_DEFAULT" || tenantLocked) && <Icon name="lock" size={12} color="var(--ink-4)" />}
            </div>
            <div className="rname-sub">
              <span className="rname-en">{role.nameEn}</span>
            </div>
          </div>
        </div>
      )
    }
    case "type":
      return <TypeBadge type={role.type} />
    case "product":
      return role.type === "SYSTEM"
        ? <span className="muted" style={{ color: "var(--ink-4)", fontFamily: "var(--font-thai)" }}>— ข้ามผลิตภัณฑ์ —</span>
        : <ProductPill product={role.productId!} />
    case "source":
      return <SourceTag source={role.source} />
    case "coverage": {
      const s = roleGrantStats(role)
      const pct = s.total ? Math.round((s.granted / s.total) * 100) : 0
      return (
        <div className="cover">
          <div className="cover-bar"><span style={{ width: pct + "%" }} /></div>
          <span className="cover-txt"><b>{s.granted}</b>/{s.total}</span>
        </div>
      )
    }
    case "status":
      return <SoftBadge map={ROLE_STATUS} value={role.status} />
    case "assignees":
      return role.assignees > 0
        ? <span className="assignees"><Icon name="users" size={14} /> <b>{role.assignees}</b></span>
        : <span className="assignees assignees-zero"><Icon name="users" size={14} /> 0</span>
    default:
      return null
  }
}

const ROLE_COLUMNS = [
  { key: "name", label: "บทบาท" },
  { key: "type", label: "ประเภท" },
  { key: "product", label: "ผลิตภัณฑ์" },
  { key: "source", label: "แหล่งที่มา" },
  { key: "coverage", label: "สิทธิ์ที่ครอบคลุม" },
  { key: "status", label: "สถานะ" },
  { key: "assignees", label: "ผู้ถูก assign", num: true },
] as const

export interface RoleDirectoryProps {
  roles: Role[]
  persona: Persona
  onOpen: (r: Role) => void
  onEdit: (r: Role) => void
  onCreate: () => void
  onDuplicate: (r: Role) => void
  onArchive: (r: Role) => void
}

export function RoleDirectory({ roles, persona, onOpen, onEdit, onCreate, onDuplicate, onArchive }: RoleDirectoryProps) {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<"all" | "PRODUCT" | "SYSTEM">("all")
  const [filters, setFilters] = useState<Filters>({ product: null, source: null, status: null })
  const [showFilter, setShowFilter] = useState(false)
  const [rowMenu, setRowMenu] = useState<string | null>(null)

  const isTenant = persona === "tenant"

  const base = useMemo(
    () => roles.filter((r) => r.status !== "archived" || filters.status === "archived"),
    [roles, filters.status]
  )

  const counts = useMemo(() => ({
    all: base.length,
    PRODUCT: base.filter((r) => r.type === "PRODUCT").length,
    SYSTEM: base.filter((r) => r.type === "SYSTEM").length,
  }), [base])

  const filtered = useMemo(() => {
    let list = base
    if (tab !== "all") list = list.filter((r) => r.type === tab)
    if (filters.product) list = list.filter((r) => r.productId === filters.product)
    if (filters.source) list = list.filter((r) => r.source === filters.source)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((r) => r.name.toLowerCase().includes(q) || (r.nameEn || "").toLowerCase().includes(q))
    }
    return list
  }, [base, tab, filters, query])

  const filterCount = (filters.product ? 1 : 0) + (filters.source ? 1 : 0) + (filters.status ? 1 : 0)

  return (
    <>
      <div className="btoolbar">
        <div className="bsearch">
          <span className="bsearch-ic"><Icon name="search" size={16} /></span>
          <input placeholder="ค้นหาชื่อบทบาท (ไทย/อังกฤษ)" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="pop-anchor">
          <button className="tbtn" onClick={() => setShowFilter((v) => !v)}>
            <Icon name="filter" size={15} /> ตัวกรอง{filterCount > 0 && <span className="tab-count">{filterCount}</span>}
          </button>
          {showFilter && <RoleFilterMenu filters={filters} setFilters={setFilters} onClose={() => setShowFilter(false)} />}
        </div>
        <div className="btoolbar-spacer" />
        <button className="tbtn" data-on={filters.status === "archived"} onClick={() => setFilters((f) => ({ ...f, status: f.status === "archived" ? null : "archived" }))}>
          <Icon name="archive" size={15} /> คลัง
        </button>
      </div>

      {/* type tabs */}
      <div className="tabs" style={{ padding: "4px 32px 0" }}>
        <button className="tab" data-active={tab === "all"} onClick={() => setTab("all")}>ทั้งหมด <span className="tab-count">{counts.all}</span></button>
        <button className="tab" data-active={tab === "PRODUCT"} onClick={() => setTab("PRODUCT")}><Icon name="box" size={15} /> บทบาทผลิตภัณฑ์ <span className="tab-count">{counts.PRODUCT}</span></button>
        <button className="tab" data-active={tab === "SYSTEM"} onClick={() => setTab("SYSTEM")}><Icon name="shield" size={15} /> บทบาทระบบ <span className="tab-count">{counts.SYSTEM}</span></button>
      </div>

      <div className="bwrap">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-ic"><Icon name="shield" size={24} /></div>
            <div className="empty-title">ยังไม่มีบทบาทที่ตรงเงื่อนไข</div>
            <div className="empty-sub">เริ่มจากเทมเพลตค่าเริ่มต้นระบบเพื่อไม่ต้องตั้งสิทธิ์ใหม่ทั้งหมด หรือสร้างบทบาทใหม่</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button className="tbtn" onClick={() => { setQuery(""); setFilters({ product: null, source: null, status: null }); setTab("all") }}>ล้างตัวกรอง</button>
              <button className="tbtn tbtn-primary" onClick={onCreate}><Icon name="plus" size={15} /> สร้างบทบาท</button>
            </div>
          </div>
        ) : (
          <div className="bscroll">
            <table className="btbl">
              <thead>
                <tr>
                  {ROLE_COLUMNS.map((c) => <th key={c.key} className={"num" in c && c.num ? "th-num" : ""}>{c.label}</th>)}
                  <th className="col-act" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((role) => (
                  <tr key={role.id} data-dim={role.status === "archived"} onClick={() => onOpen(role)}>
                    {ROLE_COLUMNS.map((c) => <td key={c.key} className={"num" in c && c.num ? "td-num" : ""}><RoleCell col={c.key} role={role} persona={persona} /></td>)}
                    <td className="col-act" onClick={(e) => e.stopPropagation()}>
                      <div className="pop-anchor">
                        <button className="rowact" onClick={() => setRowMenu(rowMenu === role.id ? null : role.id)}><Icon name="dotsV" size={16} /></button>
                        {rowMenu === role.id && <RoleRowMenu role={role} persona={persona} onClose={() => setRowMenu(null)} onOpen={onOpen} onEdit={onEdit} onDuplicate={onDuplicate} onArchive={onArchive} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bfoot">
          <span>
            {filtered.length} บทบาท
            {isTenant ? " · มุมมอง Tenant Admin (A Ramen)" : " · มุมมอง TBC Platform Admin"}
          </span>
          <div className="bfoot-spacer" />
          <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="info" size={13} /> จำนวนผู้ถูก assign เป็นข้อมูลอ่านอย่างเดียวจากโมดูล Assignment
          </span>
        </div>
      </div>
    </>
  )
}
