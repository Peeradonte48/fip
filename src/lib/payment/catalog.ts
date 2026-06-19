// FIP Payment Method Configuration — static meta & lookups.
// Adding a rail / channel / type / acquirer is a config change here.

import type {
  Acquirer, Brand, Branch, Channel, ChannelMeta, MethodType, PaymentPersona,
  PaymentPersonaId, Rail, RailMeta, TypeMeta,
} from "./types"

export const PM_BRAND: Brand = {
  id: "aramen", name: "ARAMEN", nameTh: "อาราเมน", mark: "AR", color: "#b3422f",
}

export const PM_BRANCHES: Branch[] = [
  { id: "ARM-01", name: "เซ็นทรัลเวิลด์", nameEn: "CentralWorld", area: "ชั้น 6 โซน A", live: true },
  { id: "ARM-04", name: "สยามพารากอน", nameEn: "Siam Paragon", area: "ชั้น G ฟู้ดฮอลล์", live: true },
  { id: "ARM-09", name: "เอ็มควอเทียร์", nameEn: "EmQuartier", area: "ชั้น 7", live: true },
  { id: "ARM-12", name: "เดอะมอลล์ บางกะปิ", nameEn: "The Mall Bangkapi", area: "ชั้น 4", live: false },
]

export const PM_PERSONAS: Record<PaymentPersonaId, PaymentPersona> = {
  owner: {
    id: "owner", label: "เจ้าของ / แอดมินแบรนด์", labelEn: "Owner / Brand admin",
    name: "ธนกร ว.", initials: "TW", role: "Brand admin", scopeBranch: null,
    can: {
      view: true, define: true, assign: true, enable: true, override: true,
      keyManage: true, edcManage: true, voidAllow: true, refundAllow: true,
      settleAllow: true, auditView: true,
    },
  },
  manager: {
    id: "manager", label: "ผู้จัดการสาขา", labelEn: "Branch manager",
    name: "มาลี ส.", initials: "MS", role: "Branch manager · ARM-01", scopeBranch: "ARM-01",
    can: {
      view: true, define: false, assign: false, enable: true, override: true,
      keyManage: false, edcManage: true, voidAllow: true, refundAllow: false,
      settleAllow: false, auditView: true,
    },
  },
  auditor: {
    id: "auditor", label: "ผู้ตรวจสอบ", labelEn: "Auditor",
    name: "ปกรณ์ จ.", initials: "PJ", role: "Auditor (read-only)", scopeBranch: null,
    can: {
      view: true, define: false, assign: false, enable: false, override: false,
      keyManage: false, edcManage: false, voidAllow: false, refundAllow: false,
      settleAllow: false, auditView: true,
    },
  },
}

export const PM_RAILS: Record<Rail, RailMeta> = {
  local: { label: "ในเครื่อง", labelEn: "Local", badge: "b-neutral", icon: "cash", desc: "ไม่ผูกเกตเวย์ภายนอก" },
  qr:    { label: "QR / เกตเวย์", labelEn: "QR", badge: "b-blue", icon: "qr", desc: "ออนไลน์ผ่าน GB Prime Pay" },
  card:  { label: "บัตร (EDC)", labelEn: "Card", badge: "b-violet", icon: "card", desc: "เครื่องรูดบัตร semi-integrated" },
}

export const PM_CHANNELS: Record<Channel, ChannelMeta> = {
  dine_in:  { label: "ทานที่ร้าน", icon: "dine" },
  takeaway: { label: "กลับบ้าน", icon: "bag" },
  delivery: { label: "เดลิเวอรี", icon: "moped" },
}

export const PM_TYPES: Record<MethodType, TypeMeta> = {
  cash:         { label: "เงินสด", icon: "cash" },
  qr_promptpay: { label: "พร้อมเพย์ QR", icon: "qr" },
  card:         { label: "บัตรเครดิต / เดบิต", icon: "card" },
  ewallet:      { label: "e-Wallet", icon: "wallet" },
  voucher:      { label: "บัตรกำนัล / Voucher", icon: "ticket" },
  on_credit:    { label: "ลงบัญชีเชื่อ", icon: "ledger" },
  custom:       { label: "กำหนดเอง", icon: "coins" },
}

export const PM_ACQUIRER_COLOR: Record<Acquirer, string> = {
  kbank: "#138f2d", scb: "#4e2a84", bbl: "#1e4598", krungsri: "#6b4226",
  ttb: "#0a4ee6", ktc: "#0b6db5", ghl: "#e2581f", digio: "#111827",
}

export const CHANNEL_KEYS = Object.keys(PM_CHANNELS) as Channel[]
