// FIP Payment Method Configuration — domain types
// Model: a method is DEFINED once at brand level (PaymentDefinition) and APPLIED
// per branch (BranchAssignment) with per-branch overrides. The effective config
// is the definition's defaults deep-merged with that branch's overrides.

export type Rail = "local" | "qr" | "card"
export type MethodType =
  | "cash" | "qr_promptpay" | "card" | "ewallet" | "voucher" | "on_credit" | "custom"
export type Channel = "dine_in" | "takeaway" | "delivery"

export type PaymentPersonaId = "owner" | "manager" | "auditor"
export type PaymentScreen = "methods" | "gateways" | "terminals" | "audit"
export type RegistryView = "by_method" | "by_branch"
export type TestStyle = "detailed" | "compact"
export type Density = "comfortable" | "compact"

/** RBAC capability flags resolved from the active persona. */
export interface PaymentCan {
  view: boolean
  define: boolean
  assign: boolean
  enable: boolean
  override: boolean
  keyManage: boolean
  edcManage: boolean
  voidAllow: boolean
  refundAllow: boolean
  settleAllow: boolean
  auditView: boolean
}

export interface PaymentPersona {
  id: PaymentPersonaId
  label: string
  labelEn: string
  name: string
  initials: string
  role: string
  /** Branch managers are locked to one branch; null = brand-wide scope. */
  scopeBranch: string | null
  can: PaymentCan
}

export interface Brand {
  id: string
  name: string
  nameTh: string
  mark: string
  color: string
}

export interface Branch {
  id: string
  name: string
  nameEn: string
  area: string
  live: boolean
}

export interface MethodPolicy {
  surchargePct?: number
  surchargeFlat?: number
  rounding?: { mode: "none" | "up" | "down" | "nearest"; step: number }
  allowChange?: boolean
  allowTip?: boolean
  overTenderToTip?: boolean
  minAmount?: number
  maxAmount?: number
  requireReference?: boolean
  openDrawer?: boolean
  receiptSlips?: number
}

export type RailBinding =
  | { rail: "local" }
  | { rail: "qr"; gatewayCredentialId?: string }
  | { rail: "card"; edcProfileId?: string; installment: boolean; contactless: boolean }

/** Brand-level reusable method. */
export interface PaymentDefinition {
  id: string
  brandId: string
  type: MethodType
  label: string
  icon: string
  rail: Rail
  enabledByDefault: boolean
  defaultChannels: Channel[]
  defaultPolicy: MethodPolicy
}

/** Per-branch application of a definition. Overrides hold ONLY changed fields. */
export interface BranchAssignment {
  id: string
  definitionId: string
  branchId: string
  enabled: boolean
  sortOrder: number
  binding: RailBinding
  labelOverride?: string
  channelsOverride?: Channel[]
  policyOverride?: MethodPolicy
}

/** Definition defaults merged with a branch's overrides — what the POS sees. */
export interface EffectiveMethod {
  assignmentId: string
  definitionId: string
  branchId: string
  type: MethodType
  rail: Rail
  icon: string
  label: string
  enabled: boolean
  sortOrder: number
  channels: Channel[]
  policy: MethodPolicy
  binding: RailBinding
  overridden: string[]
  labelOverride?: string
  channelsOverride?: Channel[]
  policyOverride: MethodPolicy
}

export interface GatewayCredential {
  id: string
  branchId: string
  provider: "gbprimepay"
  env: "sandbox" | "production"
  label: string
  publicKey: string
  secretStored: boolean
  callbackUrl: string
  lastTestedAt: string | null
  status: "unverified" | "verified" | "failed"
}

export type Acquirer =
  | "kbank" | "scb" | "bbl" | "krungsri" | "ttb" | "ktc" | "ghl" | "digio"

export interface EdcProfile {
  id: string
  branchId: string
  acquirer: Acquirer
  acquirerLabel: string
  mode: "standalone" | "semi_integrated"
  settleAuto: boolean
  settleTime: string | null
  allowVoid: boolean
  allowRefund: boolean
}

export interface DevicePairing {
  deviceId: string
  branchId: string
  edcProfileId: string
  model: string
  connection: "lan" | "bluetooth" | "cloud"
  online: boolean
  lastSeenAt: string
}

export interface PaymentAuditEntry {
  id: string
  at: string
  actor: string
  role: string
  branchId: string | null
  action: string
  actionLabel: string
  target: string
  icon: string
  tone: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
}

export interface RailMeta { label: string; labelEn: string; badge: string; icon: string; desc: string }
export interface ChannelMeta { label: string; icon: string }
export interface TypeMeta { label: string; icon: string }

/** Binding status chip resolved for an effective method. */
export interface BindingStatus {
  kind: "verified" | "unverified" | "unbound" | "online" | "nodevice" | "ok"
  label: string
  badge: string
  sub?: string
}

export interface Coverage {
  total: number
  applied: number
  enabled: number
  overridden: number
}
