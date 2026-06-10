// FIP Role & Permission — domain types

export type Persona = "tbc" | "tenant"
export type Density = "comfortable" | "compact"
export type PermVariant = "tree" | "twopane" | "matrix"

export type RoleType = "PRODUCT" | "SYSTEM"
export type RoleSource = "SYSTEM_DEFAULT" | "CUSTOM"
export type RoleStatus = "draft" | "published" | "archived"

export interface ActionDef {
  id: string
  name: string
  sensitive?: boolean
}

export interface ModuleDef {
  id: string
  name: string
  icon: string
  actions: ActionDef[]
}

export interface Product {
  id: string
  name: string
  desc: string
  color: string
  mark: string
}

/** A grant value attached to a module node.
 *  - specific   → granted actions = sel
 *  - all_except → granted actions = (all actions) − sel  (sel is the excluded set) */
export type GrantMode = "specific" | "all_except"
export interface Grant {
  mode: GrantMode
  sel: string[]
}
export type Grants = Record<string, Grant>

export interface Role {
  id: string
  name: string
  nameEn?: string
  type: RoleType
  productId: string | null
  source: RoleSource
  status: RoleStatus
  desc?: string
  assignees: number
  updatedBy: string
  updatedAt: string
  grants: Grants
}

/** Minimal role-shaped object the permission editor / stats helpers operate on. */
export interface RoleLike {
  type: RoleType
  productId: string | null
  grants?: Grants
}

export interface BadgeMeta {
  label: string
  short?: string
  cls?: string
  icon?: string
}

export interface AuditEntry {
  who: string
  role: string
  action: string
  at: string
  kind: "local" | "central"
}
