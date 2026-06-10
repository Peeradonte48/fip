// FIP Role & Permission — localStorage-backed roles store + persisted UI prefs.
// Replaces the design prototype's static window.ROLES with a real, mutable,
// demo-persistent store (the user chose localStorage persistence).

import { useSyncExternalStore } from "react"
import { SEED_ROLES } from "./seed"
import type { Persona, Density, PermVariant, Role } from "./types"

const ROLES_KEY = "fip.roles.v1"
const PREFS_KEY = "fip.prefs.v1"

const clone = <T>(v: T): T =>
  typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v))

// ── roles store ──────────────────────────────────────────────────────────────
function loadRoles(): Role[] {
  try {
    const raw = localStorage.getItem(ROLES_KEY)
    if (raw) return JSON.parse(raw) as Role[]
  } catch {
    /* ignore */
  }
  return clone(SEED_ROLES)
}

let roles: Role[] = loadRoles()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

function nextRoleId(): string {
  let max = 0
  roles.forEach((r) => {
    const m = /^ROLE-(\d+)$/.exec(r.id)
    if (m) max = Math.max(max, Number(m[1]))
  })
  return "ROLE-" + String(max + 1).padStart(3, "0")
}

export const rolesStore = {
  getAll: () => roles,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
  /** Insert a new role; assigns a fresh id. Returns the created role. */
  create(role: Omit<Role, "id">): Role {
    const created: Role = { ...role, id: nextRoleId() }
    roles = [created, ...roles]
    emit()
    return created
  },
  update(id: string, patch: Partial<Role>) {
    roles = roles.map((r) => (r.id === id ? { ...r, ...patch } : r))
    emit()
  },
  archive(id: string) {
    this.update(id, { status: "archived" })
  },
  reset() {
    roles = clone(SEED_ROLES)
    emit()
  },
}

export function useRoles(): Role[] {
  return useSyncExternalStore(rolesStore.subscribe, rolesStore.getAll, rolesStore.getAll)
}

// ── persisted UI prefs (persona / density / permVariant) ─────────────────────
export interface Prefs {
  persona: Persona
  density: Density
  permVariant: PermVariant
}
const DEFAULT_PREFS: Prefs = { persona: "tbc", density: "comfortable", permVariant: "tree" }

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_PREFS }
}

export function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}
