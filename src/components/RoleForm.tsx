// FIP Back Office — Role & Permission · inline Create / Edit / Duplicate form
// Renders in-place inside the settings content area. On save it returns a full
// role payload so the store can persist it (create or update).

import { useRef, useState } from "react"
import { Icon } from "./Icon"
import { ProductMark } from "./primitives"
import { PermEditor } from "./PermEditor"
import { PRODUCTS, productById, roleGrantStats, TENANT } from "@/lib/catalog"
import type {
  Grants,
  Persona,
  PermVariant,
  Role,
  RoleSource,
  RoleStatus,
  RoleType,
} from "@/lib/types"

export type FormMode = "create" | "edit" | "duplicate"

export interface RoleSaveResult {
  mode: FormMode
  baseId: string | null
  status: RoleStatus
  data: Omit<Role, "id">
}

function roleNameTaken(
  roles: Role[],
  name: string,
  type: RoleType,
  productId: string | null,
  selfId: string | null
) {
  const n = name.trim().toLowerCase()
  if (!n) return false
  return roles.some(
    (r) =>
      r.id !== selfId &&
      r.type === type &&
      (r.productId || null) === (productId || null) &&
      r.name.trim().toLowerCase() === n
  )
}

const today = () => new Date().toISOString().slice(0, 10)

export interface RoleFormProps {
  mode?: FormMode
  base: Role | null
  roles: Role[]
  persona: Persona
  permVariant: PermVariant
  onClose: () => void
  onSaved: (result: RoleSaveResult) => void
}

export function RoleForm({ mode = "create", base, roles, persona, permVariant, onClose, onSaved }: RoleFormProps) {
  const isTenant = persona === "tenant"
  const editing = mode === "edit"
  const src = (base || {}) as Partial<Role>

  const [type, setType] = useState<RoleType>(src.type || "PRODUCT")
  const [productId, setProductId] = useState<string>(src.productId || "pos")
  const [name, setName] = useState(mode === "duplicate" ? (src.name || "") + " (สำเนา)" : src.name || "")
  const [nameEn, setNameEn] = useState(src.nameEn || "")
  const [desc, setDesc] = useState(src.desc || "")
  const [grants, setGrants] = useState<Grants>(src.grants ? JSON.parse(JSON.stringify(src.grants)) : {})
  const [touchedName, setTouchedName] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const roleShape = { type, productId: type === "PRODUCT" ? productId : null, grants }
  const stats = roleGrantStats(roleShape)
  const hasPerms = stats.granted > 0
  const dup = roleNameTaken(roles, name, type, type === "PRODUCT" ? productId : null, editing ? src.id ?? null : null)
  const nameOk = name.trim().length > 0 && !dup

  const title = mode === "duplicate" ? "ทำสำเนาบทบาท" : editing ? "แก้ไขบทบาท" : "สร้างบทบาทใหม่"
  const sub =
    mode === "duplicate"
      ? `จากเทมเพลต “${src.name}” → บทบาทกำหนดเองของ ${TENANT.name}`
      : editing
        ? src.name ?? ""
        : "นิยามบทบาทและสิทธิ์ในหน้าเดียว"

  const focusName = () => {
    setTouchedName(true)
    const el = document.querySelector<HTMLInputElement>(".rform .f-input")
    if (el) {
      el.focus()
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const save = (status: RoleStatus) => {
    if (!nameOk) {
      focusName()
      return
    }
    if (status === "published" && !hasPerms) return

    const finalType = type
    const finalProductId = finalType === "PRODUCT" ? productId : null
    const source: RoleSource = editing ? src.source ?? "CUSTOM" : "CUSTOM"
    const updatedBy = isTenant ? `แบงค์ (${TENANT.name})` : "TBC Platform"

    const data: Omit<Role, "id"> = {
      name: name.trim(),
      nameEn: nameEn.trim() || undefined,
      type: finalType,
      productId: finalProductId,
      source,
      status,
      desc: desc.trim() || undefined,
      assignees: editing ? src.assignees ?? 0 : 0,
      updatedBy,
      updatedAt: today(),
      grants,
    }
    onSaved({ mode, baseId: editing ? src.id ?? null : null, status, data })
  }

  const publishLabel = editing && src.status === "published" ? "บันทึกการเปลี่ยนแปลง" : "เผยแพร่"

  return (
    <div className="rform">
      <div className="rform-scroll" ref={scrollRef}>
        <div className="rform-inner">
          {/* action bar */}
          <div className="rform-bar">
            <button className="rform-back" onClick={onClose} aria-label="ย้อนกลับ"><Icon name="chevronLeft" size={18} /></button>
            <div className="rform-bar-meta">
              <div className="rform-bar-title">{title}</div>
              <div className="rform-bar-sub">{sub}</div>
            </div>
            <div className="rform-bar-spacer" />
            <button className="tbtn" onClick={onClose}>ยกเลิก</button>
            <button className="tbtn" onClick={() => save("draft")}><Icon name="edit" size={15} /> บันทึกร่าง</button>
            <button className="tbtn tbtn-primary" disabled={!hasPerms || !nameOk} onClick={() => save("published")}>
              <Icon name="save" size={15} /> {publishLabel}
            </button>
          </div>

          {/* Card 1 — basics */}
          <div className="fcard">
            <div className="fcard-head">
              <div className="fcard-title"><Icon name="info" size={17} /> ข้อมูลพื้นฐาน</div>
              <div className="fcard-sub">ประเภท ผลิตภัณฑ์ และชื่อบทบาท</div>
            </div>

            <div className="f-field" style={{ maxWidth: "100%" }}>
              <label className="f-label f-label-req">ประเภทบทบาท</label>
              <div className="optcards" style={{ maxWidth: 620 }}>
                <button className="optcard" data-on={type === "PRODUCT"} onClick={() => !editing && setType("PRODUCT")} style={editing ? { opacity: type === "PRODUCT" ? 1 : 0.5, pointerEvents: "none" } : undefined}>
                  <span className="optcard-tick">{type === "PRODUCT" && <Icon name="check" size={12} />}</span>
                  <span className="optcard-title"><Icon name="box" size={16} /> บทบาทผลิตภัณฑ์ <span className="typecard-en">Product</span></span>
                  <span className="optcard-sub">ผูกกับ 1 ผลิตภัณฑ์ (POS หรือ QSC) — สิทธิ์ใช้งานภายในผลิตภัณฑ์</span>
                </button>
                <button
                  className="optcard" data-on={type === "SYSTEM"}
                  onClick={() => !editing && !isTenant && setType("SYSTEM")}
                  style={(editing || isTenant) ? { opacity: type === "SYSTEM" ? 1 : 0.5, pointerEvents: editing ? "none" : isTenant ? "none" : "auto" } : undefined}
                >
                  <span className="optcard-tick">{type === "SYSTEM" && <Icon name="check" size={12} />}</span>
                  <span className="optcard-title"><Icon name="shield" size={16} /> บทบาทระบบ <span className="typecard-en">System</span></span>
                  <span className="optcard-sub">{isTenant ? "เฉพาะ TBC Platform Admin (ซ่อนใน V1)" : "บริหาร IAM ข้ามผลิตภัณฑ์ (governance)"}</span>
                  {isTenant && <span style={{ position: "absolute", top: 12, right: 12 }}><Icon name="lock" size={14} color="var(--ink-4)" /></span>}
                </button>
              </div>
              {isTenant && type === "PRODUCT" && (
                <div className="f-help" style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="info" size={13} /> มุมมอง Tenant Admin สร้างได้เฉพาะบทบาทผลิตภัณฑ์ภายใน {TENANT.name}</div>
              )}
            </div>

            {type === "PRODUCT" && (
              <div className="f-field" style={{ maxWidth: "100%" }}>
                <label className="f-label f-label-req">ผลิตภัณฑ์</label>
                <div className="optcards" style={{ maxWidth: 620 }}>
                  {PRODUCTS.map((p) => (
                    <button key={p.id} className="optcard" data-on={productId === p.id} onClick={() => !editing && setProductId(p.id)} style={editing ? { pointerEvents: "none", opacity: productId === p.id ? 1 : 0.5 } : undefined}>
                      <span className="optcard-tick">{productId === p.id && <Icon name="check" size={12} />}</span>
                      <span className="optcard-title"><ProductMark product={p} size={22} /> {p.name}</span>
                      <span className="optcard-sub">{p.desc}</span>
                    </button>
                  ))}
                </div>
                {editing && <div className="f-help">ประเภทและผลิตภัณฑ์ของบทบาทที่มีอยู่แล้วเปลี่ยนไม่ได้</div>}
              </div>
            )}

            <div className="fcard-divider" />

            <div className="f-row" style={{ maxWidth: 620 }}>
              <div className="f-field" style={{ marginBottom: 0 }}>
                <label className="f-label f-label-req">ชื่อบทบาท</label>
                <input className="f-input" data-invalid={touchedName && dup} placeholder="เช่น แคชเชียร์อาวุโส"
                  value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setTouchedName(true)} autoFocus />
                {touchedName && dup
                  ? <div className="f-err"><Icon name="warn" size={13} /> ชื่อนี้มีอยู่แล้วในขอบเขตเดียวกัน</div>
                  : <div className="f-help">ห้ามซ้ำใน tenant + ผลิตภัณฑ์ + ประเภท เดียวกัน</div>}
              </div>
              <div className="f-field" style={{ marginBottom: 0 }}>
                <label className="f-label">ชื่อภาษาอังกฤษ <span className="muted" style={{ fontWeight: 400 }}>· ไม่บังคับ</span></label>
                <input className="f-input" style={{ fontFamily: "var(--font-sans)" }} placeholder="e.g. Senior Cashier" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
              </div>
            </div>

            <div className="f-field" style={{ maxWidth: 620, marginTop: 20, marginBottom: 0 }}>
              <label className="f-label">คำอธิบาย</label>
              <textarea className="f-textarea" placeholder="อธิบายหน้าที่งานของบทบาทนี้โดยย่อ" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
          </div>

          {/* Card 2 — permissions */}
          <div className="fcard">
            <div className="fcard-head">
              <div className="fcard-title">
                <Icon name="shield" size={17} /> สิทธิ์การใช้งาน
                <span className="fcard-title-count">{stats.granted}/{stats.total} สิทธิ์</span>
              </div>
              <div className="fcard-sub">
                เลือกสิทธิ์ระดับ <b>Module → Action</b>{type === "SYSTEM" ? " จากแคตตาล็อกแพลตฟอร์ม (governance)" : ` ของ ${productById(productId)?.name}`} ·
                ใช้โหมด “ทั้งหมด ยกเว้น” เพื่อครอบคลุมทุก action รวมถึงที่เพิ่มในอนาคต
              </div>
            </div>

            {type === "SYSTEM" && (
              <div className="vbanner vbanner-blue">
                <Icon name="shield" size={16} />
                <div>
                  <div className="vbanner-title">บทบาทระบบถือเฉพาะสิทธิ์ governance</div>
                  <div className="vbanner-body">จัดการบทบาท/สิทธิ์/ผู้ใช้ข้ามผลิตภัณฑ์ — ไม่รวมสิทธิ์ใช้งานภายในผลิตภัณฑ์</div>
                </div>
              </div>
            )}

            <div className="fcard-permbar">
              <span className="fcard-permbar-stat">เลือกแล้ว <b>{stats.granted}</b> จาก {stats.total} สิทธิ์ · {stats.modules} โมดูล</span>
              <div className="fcard-permbar-spacer" />
              {hasPerms && <button className="tbtn tbtn-sm" onClick={() => setGrants({})}><Icon name="reset" size={13} /> ล้างทั้งหมด</button>}
            </div>

            <PermEditor variant={permVariant} role={roleShape} grants={grants} onChange={setGrants} />

            {!hasPerms && (
              <div className="vbanner vbanner-amber" style={{ marginTop: 16, marginBottom: 0 }}>
                <Icon name="warn" size={16} />
                <div><div className="vbanner-title">บทบาทว่าง — เผยแพร่ยังไม่ได้</div><div className="vbanner-body">บันทึกเป็นร่างได้ เลือกอย่างน้อย 1 สิทธิ์เพื่อเผยแพร่</div></div>
              </div>
            )}
          </div>

          {/* bottom action mirror */}
          <div className="fcard" style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px" }}>
            <Icon name={hasPerms && nameOk ? "check" : "info"} size={16} color={hasPerms && nameOk ? "var(--green)" : "var(--ink-3)"} />
            <span className="fcard-permbar-stat">
              {hasPerms && nameOk ? "พร้อมเผยแพร่ — ชื่อไม่ซ้ำและมีสิทธิ์อย่างน้อย 1 รายการ" : "กรอกชื่อและเลือกสิทธิ์เพื่อเผยแพร่ หรือบันทึกเป็นร่างได้เลย"}
            </span>
            <div className="fcard-permbar-spacer" />
            <button className="tbtn" onClick={() => save("draft")}>บันทึกร่าง</button>
            <button className="tbtn tbtn-primary" disabled={!hasPerms || !nameOk} onClick={() => save("published")}>
              <Icon name="save" size={15} /> {publishLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
