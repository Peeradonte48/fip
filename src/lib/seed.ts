// FIP Back Office — Role & Permission · seed data
// Mix: Product(POS/QSC) + System · System Default(read-only) + Custom · Draft/Published/Archived.

import type { AuditEntry, Role } from "./types"

let _rid = 0
const RID = () => "ROLE-" + String(++_rid).padStart(3, "0")

export const SEED_ROLES: Role[] = [
  // ----- POS · System Default templates (TBC-owned, read-only to tenant) -----
  {
    id: RID(), name: "แคชเชียร์", nameEn: "Cashier",
    type: "PRODUCT", productId: "pos", source: "SYSTEM_DEFAULT", status: "published",
    desc: "พนักงานคิดเงินหน้าร้าน — เปิดบิล รับชำระ แต่ยกเลิกบิล/คืนเงินไม่ได้",
    assignees: 24, updatedBy: "TBC Platform", updatedAt: "2025-11-02",
    grants: {
      order: { mode: "specific", sel: ["view", "create", "edit", "discount"] },
      payment: { mode: "specific", sel: ["process", "split"] },
    },
  },
  {
    id: RID(), name: "ผู้จัดการร้าน", nameEn: "Store Manager",
    type: "PRODUCT", productId: "pos", source: "SYSTEM_DEFAULT", status: "published",
    desc: "ดูแลหน้าร้านเต็มสิทธิ์ — ยกเลิกบิล คืนเงิน จัดการเมนูและโปรโมชันได้",
    assignees: 9, updatedBy: "TBC Platform", updatedAt: "2025-11-02",
    grants: {
      order: { mode: "all_except", sel: [] },
      promotion: { mode: "all_except", sel: ["delete"] },
      payment: { mode: "all_except", sel: [] },
      backoffice: { mode: "specific", sel: ["report", "menu"] },
    },
  },
  {
    id: RID(), name: "พนักงานเสิร์ฟ", nameEn: "Server",
    type: "PRODUCT", productId: "pos", source: "SYSTEM_DEFAULT", status: "published",
    desc: "รับออเดอร์ที่โต๊ะ — เปิดบิลและแก้ไขได้ ไม่รับเงิน",
    assignees: 31, updatedBy: "TBC Platform", updatedAt: "2025-11-02",
    grants: {
      order: { mode: "specific", sel: ["view", "create", "edit"] },
    },
  },
  // ----- POS · Tenant Custom (A Ramen) -----
  {
    id: RID(), name: "แคชเชียร์ + เสิร์ฟ (รวม)", nameEn: "Cashier + Server",
    type: "PRODUCT", productId: "pos", source: "CUSTOM", status: "published",
    desc: "บทบาทหน้าร้านแบบรวมของ A Ramen — ทุกคนคีย์ออเดอร์และรับเงินได้ ยกเว้น Void",
    assignees: 18, updatedBy: "แบงค์ (A Ramen)", updatedAt: "2026-05-28",
    grants: {
      order: { mode: "all_except", sel: ["void"] },
      payment: { mode: "specific", sel: ["process", "split"] },
    },
  },
  {
    id: RID(), name: "ผู้ดูแลโปรโมชัน", nameEn: "Promotion Admin",
    type: "PRODUCT", productId: "pos", source: "CUSTOM", status: "draft",
    desc: "ดูแลโปรโมชันทั้งหมด — ทุก action ยกเว้นลบ (ตัวอย่าง All-except)",
    assignees: 0, updatedBy: "แบงค์ (A Ramen)", updatedAt: "2026-06-08",
    grants: {
      promotion: { mode: "all_except", sel: ["delete"] },
      order: { mode: "specific", sel: ["view"] },
    },
  },
  {
    id: RID(), name: "ผู้ช่วยผู้จัดการ", nameEn: "Assistant Manager",
    type: "PRODUCT", productId: "pos", source: "CUSTOM", status: "published",
    desc: "เกือบเท่าผู้จัดการ แต่คืนเงินและจัดการสาขาไม่ได้",
    assignees: 6, updatedBy: "แบงค์ (A Ramen)", updatedAt: "2026-04-12",
    grants: {
      order: { mode: "all_except", sel: [] },
      promotion: { mode: "specific", sel: ["view", "create", "edit"] },
      payment: { mode: "specific", sel: ["process", "split"] },
      backoffice: { mode: "specific", sel: ["report"] },
    },
  },
  {
    id: RID(), name: "แคชเชียร์ (ชั่วคราว · เทศกาล)", nameEn: "Seasonal Cashier",
    type: "PRODUCT", productId: "pos", source: "CUSTOM", status: "archived",
    desc: "บทบาทช่วงเทศกาลปีใหม่ 2025 — เก็บเข้าคลังแล้ว",
    assignees: 0, updatedBy: "แบงค์ (A Ramen)", updatedAt: "2025-12-30",
    grants: {
      order: { mode: "specific", sel: ["view", "create"] },
      payment: { mode: "specific", sel: ["process"] },
    },
  },
  // ----- QSC -----
  {
    id: RID(), name: "พนักงานครัว", nameEn: "Kitchen Staff",
    type: "PRODUCT", productId: "qsc", source: "SYSTEM_DEFAULT", status: "published",
    desc: "รับคิวและอัปเดตสถานะการปรุงที่สเตชัน",
    assignees: 22, updatedBy: "TBC Platform", updatedAt: "2025-11-02",
    grants: {
      ticket: { mode: "specific", sel: ["view", "status"] },
    },
  },
  {
    id: RID(), name: "หัวหน้าครัว", nameEn: "Kitchen Lead",
    type: "PRODUCT", productId: "qsc", source: "CUSTOM", status: "draft",
    desc: "คุมคิวและตั้งค่าการจัดเส้นทางสเตชัน",
    assignees: 0, updatedBy: "แบงค์ (A Ramen)", updatedAt: "2026-06-09",
    grants: {
      ticket: { mode: "all_except", sel: [] },
      routing: { mode: "all_except", sel: [] },
    },
  },
  // ----- System (Platform / governance — TBC) -----
  {
    id: RID(), name: "IAM Owner", nameEn: "IAM Owner",
    type: "SYSTEM", productId: null, source: "SYSTEM_DEFAULT", status: "published",
    desc: "สิทธิ์บริหารสูงสุดของ IAM — จัดการบทบาท สิทธิ์ และผู้ใช้ทั้งแพลตฟอร์ม",
    assignees: 3, updatedBy: "TBC Platform", updatedAt: "2025-10-15",
    grants: {
      iam: { mode: "all_except", sel: [] },
      directory: { mode: "all_except", sel: [] },
      platform: { mode: "all_except", sel: [] },
    },
  },
  {
    id: RID(), name: "ผู้ตรวจสอบสิทธิ์", nameEn: "Role Auditor",
    type: "SYSTEM", productId: null, source: "SYSTEM_DEFAULT", status: "published",
    desc: "ดูบทบาท สิทธิ์ และ Audit Log ได้อย่างเดียว — แก้ไขไม่ได้",
    assignees: 2, updatedBy: "TBC Platform", updatedAt: "2025-10-15",
    grants: {
      iam: { mode: "specific", sel: ["audit"] },
      directory: { mode: "specific", sel: ["view"] },
    },
  },
  {
    id: RID(), name: "ผู้ดูแล IAM (เฉพาะบทบาท)", nameEn: "Role Manager",
    type: "SYSTEM", productId: null, source: "CUSTOM", status: "draft",
    desc: "มอบสิทธิ์จัดการบทบาท/สิทธิ์ แต่ไม่แตะบิลลิ่งหรือระงับผู้ใช้",
    assignees: 0, updatedBy: "TBC Platform", updatedAt: "2026-06-07",
    grants: {
      iam: { mode: "specific", sel: ["manage_role", "manage_perm", "audit"] },
      directory: { mode: "specific", sel: ["view"] },
    },
  },
]

// audit trail sample (per-role lookups fall back to this generic set)
export const ROLE_AUDIT: AuditEntry[] = [
  { who: "แบงค์", role: "Product Owner", action: "แก้สิทธิ์ Promotion — เพิ่ม “All except Delete”", at: "8 มิ.ย. 2026 · 14:22", kind: "local" },
  { who: "นภัส", role: "Tenant Admin", action: "เปลี่ยนชื่อบทบาทจาก “แคชเชียร์รวม” → “แคชเชียร์ + เสิร์ฟ”", at: "28 พ.ค. 2026 · 09:10", kind: "local" },
  { who: "TBC Platform", role: "System", action: "เผยแพร่เทมเพลตเวอร์ชัน 2025.11", at: "2 พ.ย. 2025 · 02:00", kind: "central" },
]
