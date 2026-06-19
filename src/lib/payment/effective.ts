// FIP Payment — effective-merge math: resolve a brand definition + a branch's
// overrides into the config the POS actually sees, plus binding/enable rules.
// Keep all model logic here, not in components.

import type {
  BranchAssignment, BindingStatus, Coverage, EffectiveMethod, PaymentDefinition,
} from "./types"

export interface PaymentDB {
  definitions: PaymentDefinition[]
  assignments: BranchAssignment[]
  gateways: import("./types").GatewayCredential[]
  edc: import("./types").EdcProfile[]
  devices: import("./types").DevicePairing[]
  audit: import("./types").PaymentAuditEntry[]
}

export function defById(db: PaymentDB, id: string): PaymentDefinition | undefined {
  return db.definitions.find((d) => d.id === id)
}

/** Which fields a branch assignment overrides vs the brand default. */
export function overriddenFields(a: BranchAssignment): string[] {
  const fields: string[] = []
  if (a.labelOverride != null) fields.push("label")
  if (a.channelsOverride != null) fields.push("channels")
  if (a.policyOverride) Object.keys(a.policyOverride).forEach((k) => fields.push(k))
  return fields
}

/** Definition defaults deep-merged with this assignment's overrides. */
export function effective(db: PaymentDB, a: BranchAssignment): EffectiveMethod {
  const def = defById(db, a.definitionId)!
  return {
    assignmentId: a.id,
    definitionId: def.id,
    branchId: a.branchId,
    type: def.type,
    rail: def.rail,
    icon: def.icon,
    label: a.labelOverride ?? def.label,
    enabled: a.enabled,
    sortOrder: a.sortOrder,
    channels: a.channelsOverride ?? def.defaultChannels,
    policy: { ...def.defaultPolicy, ...(a.policyOverride || {}) },
    binding: a.binding,
    overridden: overriddenFields(a),
    labelOverride: a.labelOverride,
    channelsOverride: a.channelsOverride,
    policyOverride: a.policyOverride || {},
  }
}

/** Effective methods for one branch, in POS display order. */
export function assignmentsForBranch(db: PaymentDB, branchId: string): EffectiveMethod[] {
  return db.assignments
    .filter((a) => a.branchId === branchId)
    .map((a) => effective(db, a))
    .sort((x, y) => x.sortOrder - y.sortOrder)
}

export function assignmentsForDef(db: PaymentDB, defId: string): BranchAssignment[] {
  return db.assignments.filter((a) => a.definitionId === defId)
}

export function coverage(db: PaymentDB, defId: string, totalBranches: number): Coverage {
  const list = assignmentsForDef(db, defId)
  return {
    total: totalBranches,
    applied: list.length,
    enabled: list.filter((a) => a.enabled).length,
    overridden: list.filter((a) => overriddenFields(a).length > 0).length,
  }
}

/** Rail-binding status chip for an effective method. */
export function bindingStatus(db: PaymentDB, eff: EffectiveMethod): BindingStatus {
  if (eff.rail === "qr") {
    const gwId = eff.binding.rail === "qr" ? eff.binding.gatewayCredentialId : undefined
    const gw = db.gateways.find((g) => g.id === gwId)
    if (!gw) return { kind: "unbound", label: "ยังไม่ผูกเกตเวย์", badge: "b-amber" }
    return gw.status === "verified"
      ? { kind: "verified", label: "ยืนยันแล้ว", badge: "b-green", sub: gw.label }
      : { kind: "unverified", label: "ยังไม่ยืนยัน", badge: "b-amber", sub: gw.label }
  }
  if (eff.rail === "card") {
    const profId = eff.binding.rail === "card" ? eff.binding.edcProfileId : undefined
    const prof = db.edc.find((e) => e.id === profId)
    if (!prof) return { kind: "unbound", label: "ยังไม่ผูกเครื่อง", badge: "b-amber" }
    const online = db.devices.filter((d) => d.edcProfileId === prof.id && d.online).length
    return online > 0
      ? { kind: "online", label: `ออนไลน์ ${online} เครื่อง`, badge: "b-green", sub: prof.acquirerLabel }
      : { kind: "nodevice", label: "ไม่มีเครื่องผูก", badge: "b-neutral", sub: prof.acquirerLabel }
  }
  return { kind: "ok", label: "พร้อมใช้งาน", badge: "b-green" }
}

/** A QR method can only be enabled once its gateway is verified. */
export function canEnable(db: PaymentDB, eff: EffectiveMethod): boolean {
  if (eff.rail === "qr") return bindingStatus(db, eff).kind === "verified"
  return true
}
