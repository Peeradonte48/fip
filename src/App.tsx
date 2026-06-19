// FIP Back Office — Role & Permission · app shell
import { useEffect, useState } from "react"
import { Icon } from "./components/Icon"
import { PersonaControls } from "./components/PersonaControls"
import { RoleDirectory } from "./components/RoleDirectory"
import { RoleForm, type RoleSaveResult } from "./components/RoleForm"
import { RoleArchiveConfirm, RoleDrawer } from "./components/RoleDrawer"
import { PaymentModule } from "./components/payment/PaymentModule"
import { TENANT } from "./lib/catalog"
import { loadPrefs, rolesStore, savePrefs, useRoles, type Prefs } from "./lib/store"
import type { Density, PermVariant, Persona, Role, RoleStatus } from "./lib/types"
import type { PaymentScreen } from "./lib/payment/types"

// Payment Method Configuration screens live in the shared settings nav.
const PAYMENT_NAV = [
  { id: "pay_methods", icon: "coins", label: "วิธีการชำระเงิน" },
  { id: "pay_gateways", icon: "qr", label: "คีย์เกตเวย์" },
  { id: "pay_terminals", icon: "terminal", label: "เครื่องรูดบัตร (EDC)" },
  { id: "pay_audit", icon: "history", label: "บันทึกการแก้ไข" },
]

const SETTINGS_NAV = [
  { id: "branches", icon: "building", label: "สาขา" },
  { id: "users", icon: "users", label: "ผู้ใช้" },
  { id: "roles", icon: "shield", label: "บทบาท & สิทธิ์" },
  { id: "security", icon: "key", label: "ความปลอดภัย" },
  { id: "units", icon: "units", label: "หน่วย" },
  { id: "positions", icon: "positions", label: "ตำแหน่ง" },
  { id: "vat", icon: "receipt", label: "ภาษีมูลค่าเพิ่ม" },
  { id: "channel", icon: "salesformat", label: "รูปแบบการขาย" },
]

const PAY_SECTION_TO_SCREEN: Record<string, PaymentScreen> = {
  pay_methods: "methods", pay_gateways: "gateways", pay_terminals: "terminals", pay_audit: "audit",
}
const SCREEN_TO_PAY_SECTION: Record<PaymentScreen, string> = {
  methods: "pay_methods", gateways: "pay_gateways", terminals: "pay_terminals", audit: "pay_audit",
}

interface FormState {
  mode: "create" | "edit" | "duplicate"
  base: Role | null
}

export default function App() {
  const roles = useRoles()
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs())
  const [section, setSection] = useState("roles")
  const [detail, setDetail] = useState<Role | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [archive, setArchive] = useState<Role | null>(null)
  const [toast, setToast] = useState<{ name: string; status: RoleStatus } | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const persona = prefs.persona
  const isTenant = persona === "tenant"

  const setPref = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setPrefs((p) => {
      const next = { ...p, [key]: value }
      savePrefs(next)
      return next
    })

  const openEdit = (role: Role) => { setDetail(null); setForm({ mode: "edit", base: role }) }
  const openDuplicate = (role: Role) => { setDetail(null); setForm({ mode: "duplicate", base: role }) }
  const isPayment = section.startsWith("pay_")
  const navItem = SETTINGS_NAV.find((s) => s.id === section)

  const handleSaved = ({ mode, baseId, status, data }: RoleSaveResult) => {
    if (mode === "edit" && baseId) rolesStore.update(baseId, data)
    else rolesStore.create(data)
    setForm(null)
    setToast({ name: data.name, status })
  }

  const handleArchive = (role: Role) => rolesStore.archive(role.id)

  return (
    <div className={"scrim" + (prefs.density === "compact" ? " app-compact" : "")}>
      <div className="modal" data-screen-label="01 Role & Permission">
        <div className="m-head">
          <div className="m-title">การตั้งค่า</div>
          <div className="m-head-spacer" />
          {section === "roles" && (
            <PersonaControls
              persona={prefs.persona}
              density={prefs.density}
              permVariant={prefs.permVariant}
              onPersona={(p: Persona) => setPref("persona", p)}
              onDensity={(d: Density) => setPref("density", d)}
              onPermVariant={(v: PermVariant) => setPref("permVariant", v)}
              onReset={() => rolesStore.reset()}
            />
          )}
          <button className="m-close" aria-label="ปิด"><Icon name="x" size={20} /></button>
        </div>

        <div className="m-body">
          <nav className="snav">
            <div className="snav-group">การชำระเงิน &amp; ภาษี</div>
            {PAYMENT_NAV.map((it) => (
              <button key={it.id} className="snav-item" data-active={section === it.id} onClick={() => { setSection(it.id); setForm(null) }}>
                <span className="snav-item-ic"><Icon name={it.icon} size={18} /></span>
                <span className="snav-item-lbl">{it.label}</span>
              </button>
            ))}
            <div className="snav-group">การจัดการ</div>
            {SETTINGS_NAV.map((it) => (
              <button key={it.id} className="snav-item" data-active={section === it.id} onClick={() => { setSection(it.id); setForm(null) }}>
                <span className="snav-item-ic"><Icon name={it.icon} size={18} /></span>
                <span className="snav-item-lbl">{it.label}</span>
              </button>
            ))}
          </nav>

          <div className="content">
            {isPayment ? (
              <PaymentModule
                screen={PAY_SECTION_TO_SCREEN[section]}
                onScreen={(s) => setSection(SCREEN_TO_PAY_SECTION[s])}
              />
            ) : section === "roles" && form ? (
              <RoleForm
                mode={form.mode} base={form.base} roles={roles}
                persona={persona} permVariant={prefs.permVariant}
                onClose={() => setForm(null)}
                onSaved={handleSaved}
              />
            ) : section === "roles" ? (
              <>
                <div className="c-head">
                  <div className="c-head-titles">
                    <div className="c-title" style={{ whiteSpace: "nowrap" }}>
                      บทบาท & สิทธิ์
                      <span className={"tbadge " + (isTenant ? "b-blue" : "b-violet")} style={{ alignSelf: "center" }}>
                        <Icon name={isTenant ? "building" : "shield"} size={11} />
                        {isTenant ? "Tenant Admin · " + TENANT.name : "TBC Platform Admin"}
                      </span>
                    </div>
                    <div className="c-sub">นิยามบทบาทและสิทธิ์ของทุกผลิตภัณฑ์ใน FIP — แยกจากการ assign ให้พนักงาน (อยู่คนละโมดูล)</div>
                  </div>
                  <div className="c-head-actions">
                    <button className="tbtn tbtn-primary" onClick={() => setForm({ mode: "create", base: null })}>
                      <Icon name="plus" size={16} /> สร้างบทบาท
                    </button>
                  </div>
                </div>

                <RoleDirectory
                  roles={roles}
                  persona={persona}
                  onOpen={setDetail}
                  onEdit={openEdit}
                  onCreate={() => setForm({ mode: "create", base: null })}
                  onDuplicate={openDuplicate}
                  onArchive={setArchive}
                />
              </>
            ) : (
              <div className="empty" style={{ margin: "auto" }}>
                <div className="empty-ic"><Icon name={navItem?.icon ?? "settings"} size={26} /></div>
                <div className="empty-title">{navItem?.label}</div>
                <div className="empty-sub">ส่วนนี้อยู่นอกขอบเขตการออกแบบรอบนี้ — โฟกัสที่ “บทบาท & สิทธิ์” (Role &amp; Permission)</div>
                <button className="tbtn" style={{ margin: "0 auto" }} onClick={() => setSection("roles")}><Icon name="chevronLeft" size={15} /> กลับไปที่บทบาท & สิทธิ์</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {detail && (
        <RoleDrawer
          role={detail} persona={persona}
          onClose={() => setDetail(null)}
          onEdit={openEdit} onDuplicate={openDuplicate}
          onArchive={(r) => { setDetail(null); setArchive(r) }}
        />
      )}
      {archive && <RoleArchiveConfirm role={archive} roles={roles} onClose={() => setArchive(null)} onArchive={handleArchive} />}

      {toast && (
        <div className="rtoast">
          <Icon name={toast.status === "published" ? "check" : "edit"} size={16} className="rtoast-ok" />
          <span>
            {toast.status === "published"
              ? <><b>{toast.name}</b> เผยแพร่แล้ว · พร้อม assign</>
              : <><b>{toast.name}</b> บันทึกเป็นร่างแล้ว</>}
          </span>
        </div>
      )}
    </div>
  )
}
