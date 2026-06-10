// FIP Back Office — Role & Permission · Detail drawer + archive/delete guards
import { useState } from "react"
import { Icon } from "./Icon"
import { ProductPill, SoftBadge, SourceTag, TypeBadge } from "./primitives"
import { PermSummary, PermTree } from "./PermEditor"
import { ROLE_STATUS, roleGrantStats, TENANT } from "@/lib/catalog"
import { roleHoldsManageRole } from "@/lib/grants"
import { ROLE_AUDIT } from "@/lib/seed"
import type { Persona, Role } from "@/lib/types"

export interface RoleDrawerProps {
  role: Role
  persona: Persona
  onClose: () => void
  onEdit: (r: Role) => void
  onDuplicate: (r: Role) => void
  onArchive: (r: Role) => void
}

export function RoleDrawer({ role, persona, onClose, onEdit, onDuplicate, onArchive }: RoleDrawerProps) {
  const isTenant = persona === "tenant"
  const readOnly = role.source === "SYSTEM_DEFAULT" || (isTenant && role.type === "SYSTEM")
  const [tab, setTab] = useState<"overview" | "perms" | "audit">("overview")
  const stats = roleGrantStats(role)
  const pct = stats.total ? Math.round((stats.granted / stats.total) * 100) : 0

  const updated = new Date(role.updatedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })

  return (
    <div className="dscrim" onClick={onClose}>
      <div className="drawer drawer-full" onClick={(e) => e.stopPropagation()}>
        <div className="d-head">
          <div className="rname-ic" data-type={role.type} style={{ width: 44, height: 44 }}>
            <Icon name={role.type === "SYSTEM" ? "shield" : "box"} size={20} />
          </div>
          <div className="d-head-meta">
            <div className="d-head-title">{role.name}{readOnly && <Icon name="lock" size={14} color="var(--ink-4)" />}</div>
            <div className="d-head-sub">
              {role.nameEn && <span className="rname-en">{role.nameEn}</span>}
              <TypeBadge type={role.type} />
              {role.type === "PRODUCT" && <ProductPill product={role.productId!} />}
              <SoftBadge map={ROLE_STATUS} value={role.status} />
              <SourceTag source={role.source} />
            </div>
          </div>
          <div className="d-head-actions">
            {readOnly
              ? <button className="tbtn tbtn-primary tbtn-sm" onClick={() => onDuplicate(role)}><Icon name="copy" size={14} /> ทำสำเนาเพื่อปรับแต่ง</button>
              : <button className="tbtn tbtn-sm" onClick={() => onEdit(role)}><Icon name="edit" size={14} /> แก้ไข</button>}
            <button className="d-icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
        </div>

        <div className="d-tabs">
          <button className="d-tab" data-active={tab === "overview"} onClick={() => setTab("overview")}>ภาพรวม</button>
          <button className="d-tab" data-active={tab === "perms"} onClick={() => setTab("perms")}>สิทธิ์ <span className="tab-count">{stats.granted}</span></button>
          <button className="d-tab" data-active={tab === "audit"} onClick={() => setTab("audit")}>ประวัติการแก้ไข</button>
        </div>

        <div className="d-body">
          {readOnly && (
            <div className="ro-ribbon">
              <Icon name="lock" size={15} />
              <span>{role.source === "SYSTEM_DEFAULT"
                ? <>นี่คือ <b>เทมเพลตค่าเริ่มต้นระบบ</b> (TBC เป็นเจ้าของ) — แก้ไม่ได้โดยตรง กด “ทำสำเนาเพื่อปรับแต่ง” เพื่อสร้างบทบาทกำหนดเองของ {TENANT.name}</>
                : <>มุมมอง Tenant Admin <b>ดูบทบาทระบบได้อย่างเดียว</b> — การจัดการบทบาทระบบจำกัดที่ระดับ TBC Platform</>}</span>
            </div>
          )}

          {tab === "overview" ? (
            <>
              <div className="kpis">
                <div className="kpi">
                  <div className="kpi-k">สิทธิ์ที่ครอบคลุม</div>
                  <div className="kpi-v">{stats.granted}<small> / {stats.total}</small></div>
                  <div className="cover-bar" style={{ width: "100%", marginTop: 8 }}><span style={{ width: pct + "%" }} /></div>
                </div>
                <div className="kpi">
                  <div className="kpi-k">โมดูลที่มีสิทธิ์</div>
                  <div className="kpi-v">{stats.modules}<small> / {stats.totalModules}</small></div>
                </div>
                <div className="kpi">
                  <div className="kpi-k">ผู้ถูก assign</div>
                  <div className="kpi-v">{role.assignees}<small> คน</small></div>
                </div>
              </div>

              <div className="ov-sec-title">รายละเอียด</div>
              <div className="ov-grid">
                <div className="ov-row"><span className="ov-k">ประเภท</span><span className="ov-v"><TypeBadge type={role.type} /></span></div>
                {role.type === "PRODUCT" && <div className="ov-row"><span className="ov-k">ผลิตภัณฑ์</span><span className="ov-v"><ProductPill product={role.productId!} /></span></div>}
                <div className="ov-row"><span className="ov-k">แหล่งที่มา</span><span className="ov-v"><SourceTag source={role.source} /></span></div>
                <div className="ov-row"><span className="ov-k">สถานะ</span><span className="ov-v"><SoftBadge map={ROLE_STATUS} value={role.status} /></span></div>
                <div className="ov-row"><span className="ov-k">คำอธิบาย</span><span className="ov-v">{role.desc || <span className="muted">—</span>}</span></div>
                <div className="ov-row"><span className="ov-k">แก้ไขล่าสุด</span><span className="ov-v">{updated} · โดย {role.updatedBy}</span></div>
                <div className="ov-row"><span className="ov-k">รหัสบทบาท</span><span className="ov-v ov-v-mono">{role.id}</span></div>
              </div>

              <div className="ov-sec-title">สรุปสิทธิ์</div>
              <PermSummary role={role} grants={role.grants || {}} />
            </>
          ) : tab === "perms" ? (
            <>
              <div className="vbanner vbanner-blue" style={{ marginBottom: 16 }}>
                <Icon name={readOnly ? "lock" : "info"} size={16} />
                <div>
                  <div className="vbanner-title">{readOnly ? "อ่านอย่างเดียว" : "สิทธิ์ของบทบาทนี้"}</div>
                  <div className="vbanner-body">สิทธิ์ระดับ Module → Action · โหมด “ทั้งหมด ยกเว้น” จะรับ action ใหม่ในแคตตาล็อกโดยอัตโนมัติ</div>
                </div>
              </div>
              <PermTree role={role} grants={role.grants || {}} onChange={() => {}} readOnly />
            </>
          ) : (
            <>
              <div className="ov-sec-title">ไทม์ไลน์การเปลี่ยนแปลง</div>
              <div className="act">
                {ROLE_AUDIT.map((a, i) => (
                  <div className="act-row" key={i}>
                    <span className="act-dot" data-kind={a.kind} />
                    <div className="act-meta">
                      <span className="act-who">{a.who}</span>
                      <span className={"act-src " + (a.kind === "central" ? "act-src-central" : "act-src-local")}>{a.role}</span>
                    </div>
                    <div className="act-desc">{a.action}</div>
                    <div className="act-time">{a.at}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="d-foot">
          <button className="tbtn" onClick={() => onDuplicate(role)}><Icon name="copy" size={15} /> ทำสำเนา</button>
          {!readOnly && role.status !== "archived" && (
            <button className="tbtn btn-danger-ghost" style={{ color: "var(--red)" }} onClick={() => onArchive(role)}><Icon name="archive" size={15} /> เก็บเข้าคลัง</button>
          )}
          <div className="d-foot-spacer" />
          {readOnly
            ? <button className="tbtn tbtn-primary" onClick={() => onDuplicate(role)}><Icon name="copy" size={15} /> ทำสำเนาเพื่อปรับแต่ง</button>
            : role.status === "draft"
              ? <button className="tbtn tbtn-primary" disabled={stats.granted === 0} onClick={() => onEdit(role)}><Icon name="rocket" size={15} /> ไปเผยแพร่</button>
              : <button className="tbtn tbtn-primary" onClick={() => onEdit(role)}><Icon name="edit" size={15} /> แก้ไขบทบาท</button>}
        </div>
      </div>
    </div>
  )
}

// ── Archive / delete guard (REQ-007, REQ-008) ────────────────────────────────
export interface RoleArchiveConfirmProps {
  role: Role
  roles: Role[]
  onClose: () => void
  onArchive: (r: Role) => void
}

export function RoleArchiveConfirm({ role, roles, onClose, onArchive }: RoleArchiveConfirmProps) {
  const assigned = role.assignees > 0
  // last-admin protection: any OTHER published role holding iam.manage_role?
  const isAdminRole = roleHoldsManageRole(role)
  const otherAdmins = roles.filter((r) => r.id !== role.id && r.status === "published" && roleHoldsManageRole(r)).length
  const lastAdmin = isAdminRole && otherAdmins === 0

  let mode: "archive" | "assigned" | "lastadmin" = "archive"
  if (lastAdmin) mode = "lastadmin"
  else if (assigned) mode = "assigned"

  const confirm = () => {
    onArchive(role)
    onClose()
  }

  return (
    <div className="cscrim" onClick={onClose}>
      <div className="confirm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-body">
          <div className={"confirm-ic " + (mode === "archive" ? "confirm-ic-amber" : "confirm-ic-red")}>
            <Icon name={mode === "archive" ? "archive" : "warn"} size={22} />
          </div>
          {mode === "lastadmin" ? (
            <>
              <div className="confirm-title">เก็บบทบาทนี้เข้าคลังไม่ได้</div>
              <div className="confirm-text">
                <b>{role.name}</b> เป็นบทบาทสุดท้ายที่ถือสิทธิ์ <b>จัดการบทบาท (Manage Role)</b> — หากเก็บเข้าคลังจะไม่มีใครจัดการ IAM ได้อีก ระบบจึงปฏิเสธเพื่อกันการล็อกตัวเองออก
              </div>
              <div className="vbanner vbanner-red" style={{ margin: "14px 0 0" }}>
                <Icon name="shield" size={15} />
                <div className="vbanner-body">สร้าง/เผยแพร่บทบาทระบบอื่นที่ถือ Manage Role ก่อน แล้วค่อยเก็บบทบาทนี้</div>
              </div>
            </>
          ) : mode === "assigned" ? (
            <>
              <div className="confirm-title">บทบาทนี้ถูก assign อยู่ — ลบถาวรไม่ได้</div>
              <div className="confirm-text">
                <b>{role.name}</b> ถูก assign ให้พนักงาน <b>{role.assignees} คน</b> ระบบกั้นการลบถาวรเพื่อไม่ให้สิทธิ์ของคนเหล่านั้นพัง — ใช้ <b>เก็บเข้าคลัง</b> แทน
              </div>
              <div className="confirm-blockers">
                <div className="confirm-blocker"><Icon name="users" size={15} /><span>พนักงานที่ถูก assign บทบาทนี้</span><span className="confirm-blocker-n">{role.assignees}</span></div>
              </div>
              <div className="note" style={{ marginTop: 12, fontFamily: "var(--font-thai)" }}>
                เก็บเข้าคลังแล้วจะ <b>assign ใหม่ไม่ได้</b> แต่คนที่ถูก assign อยู่เดิมยังใช้สิทธิ์ได้จนกว่าจะถูกถอดในโมดูล Assignment
              </div>
            </>
          ) : (
            <>
              <div className="confirm-title">เก็บบทบาท “{role.name}” เข้าคลัง?</div>
              <div className="confirm-text">
                บทบาทจะถูกซ่อนจากรายการปกติและ <b>assign ใหม่ไม่ได้</b> — ประวัติ/Audit ยังอ้างถึงได้ และนำกลับมาใช้ภายหลังได้
              </div>
            </>
          )}
        </div>
        <div className="confirm-foot">
          <button className="tbtn" onClick={onClose}>{mode === "lastadmin" ? "ปิด" : "ยกเลิก"}</button>
          {mode === "lastadmin" ? null
            : <button className="tbtn" style={{ background: mode === "assigned" ? "var(--amber)" : "var(--red)", color: "#fff", borderColor: "transparent" }} onClick={confirm}>
                {mode === "assigned" ? <><Icon name="archive" size={15} /> เก็บเข้าคลังแทน</> : "เก็บเข้าคลัง"}
              </button>}
        </div>
      </div>
    </div>
  )
}
