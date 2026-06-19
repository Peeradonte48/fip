// FIP Payment Method Configuration — seed data (brand definitions + per-branch
// assignments, gateway credentials, EDC profiles, device pairings, audit trail).

import type {
  BranchAssignment, DevicePairing, EdcProfile, GatewayCredential,
  PaymentAuditEntry, PaymentDefinition,
} from "./types"

// ── Brand-level definitions — the reusable methods ──────────────────────────
export const SEED_DEFINITIONS: PaymentDefinition[] = [
  {
    id: "def_cash", brandId: "aramen", type: "cash", label: "เงินสด", icon: "cash", rail: "local",
    enabledByDefault: true, defaultChannels: ["dine_in", "takeaway", "delivery"],
    defaultPolicy: { rounding: { mode: "nearest", step: 1 }, allowChange: true, allowTip: false, overTenderToTip: false, requireReference: false, openDrawer: true, receiptSlips: 0 },
  },
  {
    id: "def_qr", brandId: "aramen", type: "qr_promptpay", label: "พร้อมเพย์ QR", icon: "qr", rail: "qr",
    enabledByDefault: true, defaultChannels: ["dine_in", "takeaway", "delivery"],
    defaultPolicy: { surchargePct: 0, allowChange: false, allowTip: false, overTenderToTip: false, requireReference: true, openDrawer: false, receiptSlips: 0, minAmount: 1 },
  },
  {
    id: "def_card", brandId: "aramen", type: "card", label: "บัตรเครดิต / เดบิต", icon: "card", rail: "card",
    enabledByDefault: true, defaultChannels: ["dine_in", "takeaway"],
    defaultPolicy: { allowChange: false, allowTip: true, overTenderToTip: false, requireReference: false, openDrawer: false, receiptSlips: 2, minAmount: 20 },
  },
  {
    id: "def_ewallet", brandId: "aramen", type: "ewallet", label: "TrueMoney / e-Wallet", icon: "wallet", rail: "card",
    enabledByDefault: false, defaultChannels: ["dine_in", "takeaway"],
    defaultPolicy: { allowChange: false, allowTip: false, overTenderToTip: false, requireReference: false, openDrawer: false, receiptSlips: 1 },
  },
  {
    id: "def_voucher", brandId: "aramen", type: "voucher", label: "บัตรกำนัล / Voucher", icon: "ticket", rail: "local",
    enabledByDefault: false, defaultChannels: ["dine_in"],
    defaultPolicy: { allowChange: false, allowTip: false, overTenderToTip: false, requireReference: true, openDrawer: true, receiptSlips: 0 },
  },
  {
    id: "def_credit", brandId: "aramen", type: "on_credit", label: "ลงบัญชีเชื่อ (ลูกค้าประจำ)", icon: "ledger", rail: "local",
    enabledByDefault: false, defaultChannels: ["dine_in", "delivery"],
    defaultPolicy: { allowChange: false, allowTip: false, overTenderToTip: false, requireReference: true, openDrawer: false, receiptSlips: 1, maxAmount: 5000 },
  },
]

// ── Per-branch assignments ──────────────────────────────────────────────────
export const SEED_ASSIGNMENTS: BranchAssignment[] = [
  { id: "as_cash_01", definitionId: "def_cash", branchId: "ARM-01", enabled: true, sortOrder: 1, binding: { rail: "local" } },
  { id: "as_cash_04", definitionId: "def_cash", branchId: "ARM-04", enabled: true, sortOrder: 1, binding: { rail: "local" } },
  { id: "as_cash_09", definitionId: "def_cash", branchId: "ARM-09", enabled: true, sortOrder: 1, binding: { rail: "local" } },
  { id: "as_cash_12", definitionId: "def_cash", branchId: "ARM-12", enabled: true, sortOrder: 1, binding: { rail: "local" } },

  { id: "as_qr_01", definitionId: "def_qr", branchId: "ARM-01", enabled: true, sortOrder: 2, binding: { rail: "qr", gatewayCredentialId: "gw_arm01_sb" } },
  { id: "as_qr_04", definitionId: "def_qr", branchId: "ARM-04", enabled: true, sortOrder: 2, binding: { rail: "qr", gatewayCredentialId: "gw_arm04_sb" } },
  // ARM-09: applied but gateway unverified, so cannot enable yet
  { id: "as_qr_09", definitionId: "def_qr", branchId: "ARM-09", enabled: false, sortOrder: 2, binding: { rail: "qr", gatewayCredentialId: "gw_arm09_sb" } },

  { id: "as_card_01", definitionId: "def_card", branchId: "ARM-01", enabled: true, sortOrder: 3, binding: { rail: "card", edcProfileId: "edc_arm01_kbank", installment: true, contactless: true } },
  {
    id: "as_card_04", definitionId: "def_card", branchId: "ARM-04", enabled: true, sortOrder: 3,
    labelOverride: "บัตร (พารากอน)", policyOverride: { receiptSlips: 1, allowTip: false },
    binding: { rail: "card", edcProfileId: "edc_arm04_kbank", installment: false, contactless: true },
  },

  { id: "as_ew_01", definitionId: "def_ewallet", branchId: "ARM-01", enabled: true, sortOrder: 4, binding: { rail: "card", edcProfileId: "edc_arm01_kbank", installment: false, contactless: true } },

  { id: "as_vc_01", definitionId: "def_voucher", branchId: "ARM-01", enabled: false, sortOrder: 5, channelsOverride: ["dine_in", "takeaway"], binding: { rail: "local" } },

  { id: "as_cr_01", definitionId: "def_credit", branchId: "ARM-01", enabled: false, sortOrder: 6, binding: { rail: "local" } },
  { id: "as_cr_09", definitionId: "def_credit", branchId: "ARM-09", enabled: false, sortOrder: 5, policyOverride: { maxAmount: 3000 }, binding: { rail: "local" } },
]

// ── Gateway credentials (GB Prime Pay), per branch ──────────────────────────
export const SEED_GATEWAYS: GatewayCredential[] = [
  { id: "gw_arm01_sb", branchId: "ARM-01", provider: "gbprimepay", env: "sandbox", label: "GB Prime Pay · Sandbox", publicKey: "pk_test_a91f••••••••••••4c2e", secretStored: true, callbackUrl: "https://pay.fip.app/cb/ARM-01/gbpp", lastTestedAt: "19 มิ.ย. 2026 · 10:24", status: "verified" },
  { id: "gw_arm01_pr", branchId: "ARM-01", provider: "gbprimepay", env: "production", label: "GB Prime Pay · Production", publicKey: "pk_live_77d3••••••••••••8a10", secretStored: true, callbackUrl: "https://pay.fip.app/cb/ARM-01/gbpp", lastTestedAt: null, status: "unverified" },
  { id: "gw_arm04_sb", branchId: "ARM-04", provider: "gbprimepay", env: "sandbox", label: "GB Prime Pay · Sandbox", publicKey: "pk_test_55ab••••••••••••9d71", secretStored: true, callbackUrl: "https://pay.fip.app/cb/ARM-04/gbpp", lastTestedAt: "18 มิ.ย. 2026 · 16:02", status: "verified" },
  { id: "gw_arm09_sb", branchId: "ARM-09", provider: "gbprimepay", env: "sandbox", label: "GB Prime Pay · Sandbox", publicKey: "pk_test_31fc••••••••••••0b48", secretStored: true, callbackUrl: "https://pay.fip.app/cb/ARM-09/gbpp", lastTestedAt: null, status: "unverified" },
]

// ── EDC terminal profiles, per branch ───────────────────────────────────────
export const SEED_EDC: EdcProfile[] = [
  { id: "edc_arm01_kbank", branchId: "ARM-01", acquirer: "kbank", acquirerLabel: "KBank (กสิกรไทย)", mode: "semi_integrated", settleAuto: true, settleTime: "23:30", allowVoid: true, allowRefund: false },
  { id: "edc_arm01_scb", branchId: "ARM-01", acquirer: "scb", acquirerLabel: "SCB (ไทยพาณิชย์)", mode: "standalone", settleAuto: false, settleTime: null, allowVoid: true, allowRefund: false },
  { id: "edc_arm04_kbank", branchId: "ARM-04", acquirer: "kbank", acquirerLabel: "KBank (กสิกรไทย)", mode: "semi_integrated", settleAuto: true, settleTime: "22:00", allowVoid: true, allowRefund: false },
]

// ── Device pairings (read-only mirror of iPad state), per branch ────────────
export const SEED_DEVICES: DevicePairing[] = [
  { deviceId: "iPad-REG-01", branchId: "ARM-01", edcProfileId: "edc_arm01_kbank", model: "EDC P2 · KBank", connection: "lan", online: true, lastSeenAt: "เมื่อสักครู่" },
  { deviceId: "iPad-REG-02", branchId: "ARM-01", edcProfileId: "edc_arm01_kbank", model: "EDC P2 · KBank", connection: "bluetooth", online: true, lastSeenAt: "2 นาทีที่แล้ว" },
  { deviceId: "iPad-REG-03", branchId: "ARM-01", edcProfileId: "edc_arm01_scb", model: "EDC A920 · SCB", connection: "cloud", online: false, lastSeenAt: "เมื่อวาน · 21:48" },
  { deviceId: "iPad-PRG-01", branchId: "ARM-04", edcProfileId: "edc_arm04_kbank", model: "EDC P2 · KBank", connection: "lan", online: true, lastSeenAt: "เมื่อสักครู่" },
]

// ── Audit log ───────────────────────────────────────────────────────────────
export const SEED_AUDIT: PaymentAuditEntry[] = [
  { id: "a1", at: "19 มิ.ย. 2026 · 10:24", actor: "ธนกร ว.", role: "Brand admin", branchId: "ARM-01", action: "gateway.key.test", actionLabel: "ทดสอบการเชื่อมต่อเกตเวย์", target: "GB Prime Pay · Sandbox", icon: "bolt", tone: "b-green", before: { status: "unverified", lastTestedAt: "—" }, after: { status: "verified", lastTestedAt: "19 มิ.ย. 2026 · 10:24" } },
  { id: "a2", at: "19 มิ.ย. 2026 · 10:18", actor: "ธนกร ว.", role: "Brand admin", branchId: "ARM-01", action: "method.enable", actionLabel: "เปิดใช้งานวิธีชำระเงิน (สาขา)", target: "พร้อมเพย์ QR · ARM-01", icon: "qr", tone: "b-blue", before: { enabled: false }, after: { enabled: true } },
  { id: "a3", at: "19 มิ.ย. 2026 · 09:55", actor: "มาลี ส.", role: "Branch manager", branchId: "ARM-04", action: "method.override", actionLabel: "แก้ override ระดับสาขา", target: "บัตรเครดิต / เดบิต · ARM-04", icon: "card", tone: "b-violet", before: { receiptSlips: 2, label: "(brand default)" }, after: { receiptSlips: 1, label: "บัตร (พารากอน)" } },
  { id: "a4", at: "18 มิ.ย. 2026 · 17:40", actor: "ธนกร ว.", role: "Brand admin", branchId: "ARM-01", action: "gateway.key.rotate", actionLabel: "หมุนคีย์ลับเกตเวย์", target: "GB Prime Pay · Production · ARM-01", icon: "rotate", tone: "b-amber", before: { secretKeyRef: "ref_••••3a", status: "verified" }, after: { secretKeyRef: "ref_••••9f", status: "unverified" } },
  { id: "a5", at: "18 มิ.ย. 2026 · 15:20", actor: "ธนกร ว.", role: "Brand admin", branchId: null, action: "method.assign", actionLabel: "นำวิธีไปใช้กับสาขา", target: "บัตรเครดิต / เดบิต → ARM-04", icon: "store", tone: "b-neutral", before: null, after: { branchId: "ARM-04", enabled: true, edcProfileId: "edc_arm04_kbank" } },
  { id: "a6", at: "18 มิ.ย. 2026 · 14:12", actor: "ธนกร ว.", role: "Brand admin", branchId: null, action: "method.define", actionLabel: "สร้างนิยามวิธีชำระเงิน (แบรนด์)", target: "บัตรเครดิต / เดบิต", icon: "card", tone: "b-neutral", before: null, after: { type: "card", rail: "card", receiptSlips: 2 } },
]
