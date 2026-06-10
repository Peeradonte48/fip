// FIP Back Office — Role & Permission · catalog + lookup helpers
// Tenant: A Ramen. Products: POS, QSC. Platform catalog for System roles.

import type {
  BadgeMeta,
  Grant,
  ModuleDef,
  Product,
  Role,
  RoleLike,
} from "./types"

export const TENANT = { id: "aramen", name: "A Ramen", code: "ARM" }

// ── Products (own their permission catalog) ──────────────────────────────────
export const PRODUCTS: Product[] = [
  { id: "pos", name: "POS", desc: "ระบบขายหน้าร้าน", color: "#1d4ed8", mark: "P" },
  { id: "qsc", name: "QSC", desc: "คิว & ครัว (Queue · Station · Kitchen)", color: "#15803d", mark: "Q" },
]
export const productById = (id: string | null): Product | null =>
  PRODUCTS.find((p) => p.id === id) || null

// ── Permission catalog: Product > Module > Action ────────────────────────────
// `sensitive` actions are visually flagged (Void / Refund / Delete / governance).
export const CATALOG: Record<string, ModuleDef[]> = {
  pos: [
    { id: "order", name: "ออเดอร์ / บิล", icon: "receipt", actions: [
      { id: "view", name: "ดูออเดอร์" },
      { id: "create", name: "เปิดบิล / สั่งอาหาร" },
      { id: "edit", name: "แก้ไขบิล" },
      { id: "void", name: "ยกเลิกบิล (Void)", sensitive: true },
      { id: "discount", name: "ให้ส่วนลด" },
    ] },
    { id: "promotion", name: "โปรโมชัน", icon: "tag", actions: [
      { id: "view", name: "ดูโปรโมชัน" },
      { id: "create", name: "สร้างโปรโมชัน" },
      { id: "edit", name: "แก้ไขโปรโมชัน" },
      { id: "delete", name: "ลบโปรโมชัน", sensitive: true },
    ] },
    { id: "payment", name: "การชำระเงิน", icon: "money", actions: [
      { id: "process", name: "รับชำระเงิน" },
      { id: "refund", name: "คืนเงิน (Refund)", sensitive: true },
      { id: "split", name: "แยกบิล / รวมบิล" },
    ] },
    { id: "backoffice", name: "Back Office", icon: "settings", actions: [
      { id: "report", name: "ดูรายงานยอดขาย" },
      { id: "menu", name: "จัดการเมนู" },
      { id: "branch", name: "จัดการสาขา", sensitive: true },
    ] },
  ],
  qsc: [
    { id: "ticket", name: "ตั๋ว / คิว", icon: "receipt", actions: [
      { id: "view", name: "ดูคิว" },
      { id: "create", name: "ออกตั๋วคิว" },
      { id: "status", name: "อัปเดตสถานะ" },
    ] },
    { id: "routing", name: "เส้นทาง / สเตชัน", icon: "salesformat", actions: [
      { id: "view", name: "ดูการจัดเส้นทาง" },
      { id: "configure", name: "ตั้งค่าสเตชัน", sensitive: true },
    ] },
  ],
}

// Platform catalog — only System roles draw from this (governance, cross-product).
export const PLATFORM_CATALOG: ModuleDef[] = [
  { id: "iam", name: "IAM — บทบาท & สิทธิ์", icon: "shield", actions: [
    { id: "manage_role", name: "จัดการบทบาท (Manage Role)", sensitive: true },
    { id: "manage_perm", name: "จัดการสิทธิ์ (Manage Permission)", sensitive: true },
    { id: "audit", name: "ดู Audit Log" },
  ] },
  { id: "directory", name: "ผู้ใช้ & ทีม", icon: "users", actions: [
    { id: "view", name: "ดูผู้ใช้" },
    { id: "invite", name: "เชิญผู้ใช้เข้าระบบ" },
    { id: "deactivate", name: "ระงับผู้ใช้", sensitive: true },
  ] },
  { id: "platform", name: "ตั้งค่าแพลตฟอร์ม", icon: "settings", actions: [
    { id: "view", name: "ดูการตั้งค่า" },
    { id: "manage", name: "แก้ไขการตั้งค่า", sensitive: true },
    { id: "billing", name: "จัดการแพ็กเกจ / บิลลิ่ง", sensitive: true },
  ] },
]

// Resolve the catalog a role draws from.
export const catalogFor = (role: RoleLike): ModuleDef[] =>
  role.type === "SYSTEM" ? PLATFORM_CATALOG : CATALOG[role.productId ?? ""] || []

// ── Grant helpers ────────────────────────────────────────────────────────────
export const moduleById = (catalog: ModuleDef[], mid: string) =>
  catalog.find((m) => m.id === mid)

export function grantedActions(mod: ModuleDef, grant?: Grant): string[] {
  if (!grant) return []
  if (grant.mode === "all_except") {
    const ex = new Set(grant.sel || [])
    return mod.actions.filter((a) => !ex.has(a.id)).map((a) => a.id)
  }
  return (grant.sel || []).filter((id) => mod.actions.some((a) => a.id === id))
}

// total granted / total available across a role's catalog
export function roleGrantStats(role: RoleLike) {
  const cat = catalogFor(role)
  let granted = 0
  let total = 0
  let modules = 0
  cat.forEach((mod) => {
    total += mod.actions.length
    const g = grantedActions(mod, (role.grants || {})[mod.id])
    granted += g.length
    if (g.length) modules += 1
  })
  return { granted, total, modules, totalModules: cat.length }
}

// ── Badge maps ───────────────────────────────────────────────────────────────
export const ROLE_STATUS: Record<string, BadgeMeta> = {
  draft: { label: "ร่าง", cls: "b-amber", icon: "edit" },
  published: { label: "เผยแพร่แล้ว", cls: "b-green", icon: "check" },
  archived: { label: "เก็บเข้าคลัง", cls: "b-neutral", icon: "archive" },
}
export const ROLE_TYPE: Record<string, BadgeMeta> = {
  PRODUCT: { label: "บทบาทผลิตภัณฑ์", short: "Product", cls: "b-blue", icon: "box" },
  SYSTEM: { label: "บทบาทระบบ", short: "System", cls: "b-violet", icon: "shield" },
}
export const ROLE_SOURCE: Record<string, BadgeMeta> = {
  SYSTEM_DEFAULT: { label: "ค่าเริ่มต้นระบบ", short: "Default", icon: "lock" },
  CUSTOM: { label: "กำหนดเอง", short: "Custom", icon: "edit" },
}

// Convenience: stats helper accepts a full Role too.
export type { Role }
