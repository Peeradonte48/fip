// FIP Back Office — Role & Permission · grant math + mutators
// Grant value: { mode: "specific"|"all_except", sel: [actionId...] }

import { CATALOG, PLATFORM_CATALOG, productById } from "./catalog"
import type { Grant, Grants, ModuleDef, Product, RoleLike } from "./types"

// ── grant math ───────────────────────────────────────────────────────────────
export function effectiveSet(mod: ModuleDef, grant?: Grant): Set<string> {
  const s = new Set<string>()
  if (!grant) return s
  if (grant.mode === "all_except") {
    const ex = new Set(grant.sel || [])
    mod.actions.forEach((a) => {
      if (!ex.has(a.id)) s.add(a.id)
    })
  } else {
    ;(grant.sel || []).forEach((id) => {
      if (mod.actions.some((a) => a.id === id)) s.add(id)
    })
  }
  return s
}

export type ModState = "none" | "partial" | "all"
export function modState(mod: ModuleDef, grant?: Grant): ModState {
  const n = effectiveSet(mod, grant).size
  if (n === 0) return "none"
  if (n === mod.actions.length) return "all"
  return "partial"
}

export function setGrant(grants: Grants, mid: string, g: Grant | null): Grants {
  const next = { ...grants }
  const empty = !g || (g.mode === "specific" && (!g.sel || g.sel.length === 0))
  if (empty) delete next[mid]
  else next[mid] = g as Grant
  return next
}

// Mutators (pure; return next grants object)
export function toggleModuleAll(grants: Grants, mod: ModuleDef): Grants {
  const g = grants[mod.id]
  const all = effectiveSet(mod, g).size === mod.actions.length
  if (all) return setGrant(grants, mod.id, null)
  // select all, preserving mode
  if (g && g.mode === "all_except") return setGrant(grants, mod.id, { mode: "all_except", sel: [] })
  return setGrant(grants, mod.id, { mode: "specific", sel: mod.actions.map((a) => a.id) })
}

export function toggleAction(grants: Grants, mod: ModuleDef, actionId: string): Grants {
  const g = grants[mod.id] || { mode: "specific", sel: [] }
  if (g.mode === "all_except") {
    // sel is the excluded set
    const ex = new Set(g.sel || [])
    ex.has(actionId) ? ex.delete(actionId) : ex.add(actionId)
    return setGrant(grants, mod.id, { mode: "all_except", sel: [...ex] })
  }
  const sel = new Set(g.sel || [])
  sel.has(actionId) ? sel.delete(actionId) : sel.add(actionId)
  return setGrant(grants, mod.id, { mode: "specific", sel: [...sel] })
}

export function switchMode(grants: Grants, mod: ModuleDef, mode: Grant["mode"]): Grants {
  const g = grants[mod.id]
  const eff = effectiveSet(mod, g)
  if (mode === "all_except") {
    // "All except" means: grant everything, then exclude. Entering the mode
    // grants all (no exclusions) to match the intent — even from an empty module.
    return setGrant(grants, mod.id, { mode: "all_except", sel: [] })
  }
  // back to specific: preserve whatever is currently effective
  return setGrant(grants, mod.id, { mode: "specific", sel: [...eff] })
}

// ── product grouping for a role's catalog ────────────────────────────────────
export interface CatalogGroup {
  key: string
  product: Product | { name: string; desc: string; mark: string; color: string }
  modules: ModuleDef[]
}

export function catalogGroups(role: RoleLike): CatalogGroup[] {
  if (role.type === "SYSTEM") {
    return [{
      key: "platform",
      product: { name: "แพลตฟอร์ม / Governance", desc: "สิทธิ์บริหารข้ามผลิตภัณฑ์", mark: "S", color: "#6d28d9" },
      modules: PLATFORM_CATALOG,
    }]
  }
  const p = productById(role.productId)
  return [{
    key: role.productId ?? "",
    product: p ?? { name: "—", desc: "", mark: "?", color: "#737376" },
    modules: CATALOG[role.productId ?? ""] || [],
  }]
}

// last-admin protection helper (REQ-008)
export function roleHoldsManageRole(role: RoleLike): boolean {
  if (role.type !== "SYSTEM") return false
  const g = (role.grants || {}).iam
  if (!g) return false
  const iam = PLATFORM_CATALOG.find((m) => m.id === "iam")
  if (!iam) return false
  return effectiveSet(iam, g).has("manage_role")
}
