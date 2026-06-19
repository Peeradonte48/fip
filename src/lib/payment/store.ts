// FIP Payment — localStorage-backed store (definitions + assignments + gateways
// + EDC + devices + audit) via useSyncExternalStore, plus persisted UI prefs.
// Mirrors src/lib/store.ts so a real backend can replace this without touching
// components. All mutators emit, persist, and notify subscribers.

import { useSyncExternalStore } from "react"
import { PM_BRANCHES } from "./catalog"
import { assignmentsForBranch, canEnable, effective, type PaymentDB } from "./effective"
import {
  SEED_ASSIGNMENTS, SEED_AUDIT, SEED_DEFINITIONS, SEED_DEVICES, SEED_EDC, SEED_GATEWAYS,
} from "./seed"
import type {
  BranchAssignment, Branch, Channel, Density, MethodPolicy, PaymentDefinition,
  PaymentPersonaId, PaymentScreen, RegistryView, TestStyle,
} from "./types"

const DB_KEY = "fip.payment.v1"
const PREFS_KEY = "fip.payment.prefs.v1"

const clone = <T>(v: T): T =>
  typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v))

function seedDB(): PaymentDB {
  return clone({
    definitions: SEED_DEFINITIONS,
    assignments: SEED_ASSIGNMENTS,
    gateways: SEED_GATEWAYS,
    edc: SEED_EDC,
    devices: SEED_DEVICES,
    audit: SEED_AUDIT,
  })
}

function loadDB(): PaymentDB {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw) as PaymentDB
  } catch {
    /* ignore */
  }
  return seedDB()
}

let db: PaymentDB = loadDB()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    /* ignore */
  }
  // Replace the reference so useSyncExternalStore sees a new snapshot.
  db = { ...db }
  listeners.forEach((l) => l())
}

/** Result of toggling enable — lets the caller surface a toast message. */
export interface ToggleResult { ok: boolean; enabled: boolean; reason?: string }

/** Branch-override patch produced by the override editor. */
export interface OverridePatch {
  enabled: boolean
  sortOrder: number
  labelOn: boolean
  label: string
  channelsOn: boolean
  channels: Channel[]
  pol: MethodPolicy
}

export const paymentStore = {
  get: () => db,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => { listeners.delete(l) }
  },

  toggleEnabled(assignmentId: string): ToggleResult {
    const a = db.assignments.find((x) => x.id === assignmentId)
    if (!a) return { ok: false, enabled: false }
    const eff = effective(db, a)
    if (!a.enabled && !canEnable(db, eff)) {
      return { ok: false, enabled: false, reason: "เปิดไม่ได้ · ต้องทดสอบเกตเวย์สาขานี้ให้ยืนยันก่อน" }
    }
    a.enabled = !a.enabled
    const enabled = a.enabled
    emit()
    return { ok: true, enabled }
  },

  toggleApplied(def: PaymentDefinition, branch: Branch, apply: boolean) {
    if (apply) {
      const exists = db.assignments.some((a) => a.definitionId === def.id && a.branchId === branch.id)
      if (!exists) {
        const binding: BranchAssignment["binding"] =
          def.rail === "local" ? { rail: "local" }
          : def.rail === "qr" ? { rail: "qr", gatewayCredentialId: db.gateways.find((g) => g.branchId === branch.id)?.id }
          : { rail: "card", edcProfileId: db.edc.find((e) => e.branchId === branch.id)?.id, installment: false, contactless: true }
        db.assignments.push({
          id: "as_" + def.id + "_" + branch.id,
          definitionId: def.id,
          branchId: branch.id,
          enabled: def.rail === "qr" ? false : def.enabledByDefault,
          sortOrder: assignmentsForBranch(db, branch.id).length + 1,
          binding,
        })
      }
    } else {
      const i = db.assignments.findIndex((a) => a.definitionId === def.id && a.branchId === branch.id)
      if (i >= 0) db.assignments.splice(i, 1)
    }
    emit()
  },

  saveDefinition(d: PaymentDefinition) {
    const i = db.definitions.findIndex((x) => x.id === d.id)
    if (i >= 0) db.definitions[i] = d
    else db.definitions.push({ ...d, id: "def_" + Date.now() })
    emit()
  },

  saveOverride(defId: string, branchId: string, ov: OverridePatch) {
    const a = db.assignments.find((x) => x.definitionId === defId && x.branchId === branchId)
    if (a) {
      a.enabled = ov.enabled
      a.sortOrder = ov.sortOrder
      a.labelOverride = ov.labelOn ? ov.label : undefined
      a.channelsOverride = ov.channelsOn ? ov.channels : undefined
      a.policyOverride = Object.keys(ov.pol).length ? { ...ov.pol } : undefined
    }
    emit()
  },

  resetOverride(defId: string, branchId: string) {
    const a = db.assignments.find((x) => x.definitionId === defId && x.branchId === branchId)
    if (a) {
      a.labelOverride = undefined
      a.channelsOverride = undefined
      a.policyOverride = undefined
    }
    emit()
  },

  reset() {
    db = seedDB()
    emit()
  },
}

export function usePaymentDB(): PaymentDB {
  return useSyncExternalStore(paymentStore.subscribe, paymentStore.get, paymentStore.get)
}

// ── persisted UI prefs ───────────────────────────────────────────────────────
export interface PaymentPrefs {
  persona: PaymentPersonaId
  branch: string
  screen: PaymentScreen
  view: RegistryView
  testStyle: TestStyle
  density: Density
}

const DEFAULT_PREFS: PaymentPrefs = {
  persona: "owner", branch: "ARM-01", screen: "methods",
  view: "by_method", testStyle: "detailed", density: "comfortable",
}

export function loadPaymentPrefs(): PaymentPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) {
      const parsed = { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<PaymentPrefs>) }
      if (!PM_BRANCHES.some((b) => b.id === parsed.branch)) parsed.branch = DEFAULT_PREFS.branch
      return parsed
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_PREFS }
}

export function savePaymentPrefs(prefs: PaymentPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}
