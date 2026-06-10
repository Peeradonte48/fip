// FIP Back Office — Role & Permission · shared presentational primitives
import { useEffect, type RefObject } from "react"
import { Icon } from "./Icon"
import { productById, ROLE_SOURCE, ROLE_TYPE } from "@/lib/catalog"
import type { BadgeMeta, Product, RoleSource, RoleType } from "@/lib/types"

const AVATAR_TONES = [
  "#3f6f55", "#5a5fb0", "#a8632e", "#8a4a76", "#2f6e86",
  "#7a5a2e", "#4a6b8a", "#86553f", "#566330", "#7b4a4a",
]
export function avatarColor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_TONES[h % AVATAR_TONES.length]
}
export function initials(name: string) {
  if (!name || name === "—") return ""
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + parts[1][0]
}
export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const empty = !name || name === "—"
  return (
    <div
      className={"avatar" + (size === "sm" ? " avatar-sm" : "") + (empty ? " avatar-empty" : "")}
      style={empty ? undefined : { background: avatarColor(name) }}
    >
      {empty ? <Icon name="user" size={size === "sm" ? 13 : 16} /> : initials(name)}
    </div>
  )
}

export const fmt = (n: number) => n.toLocaleString("en-US")

export function SoftBadge({ map, value }: { map: Record<string, BadgeMeta>; value: string }) {
  const b = map[value]
  if (!b) return null
  return (
    <span className={"tbadge " + (b.cls ?? "")}>
      {b.icon ? <Icon name={b.icon} size={11} /> : <span className="tdot" />}
      {b.label}
    </span>
  )
}

// Small product chip (square mark + name)
export function ProductMark({ product, size = 22 }: { product: Product | string; size?: number }) {
  const p = typeof product === "string" ? productById(product) : product
  if (!p) return null
  return (
    <span className="prodmark" style={{ width: size, height: size, background: p.color, fontSize: size * 0.42 }}>
      {p.mark}
    </span>
  )
}
export function ProductPill({ product }: { product: Product | string }) {
  const p = typeof product === "string" ? productById(product) : product
  if (!p) return <span className="muted" style={{ color: "var(--ink-4)" }}>—</span>
  return <span className="prodpill"><ProductMark product={p} size={17} /> {p.name}</span>
}

// Role type badge (Product / System)
export function TypeBadge({ type }: { type: RoleType }) {
  const t = ROLE_TYPE[type]
  return <span className={"tbadge " + (t.cls ?? "")}><Icon name={t.icon!} size={11} /> {t.short}</span>
}
export function SourceTag({ source }: { source: RoleSource }) {
  const s = ROLE_SOURCE[source]
  return (
    <span className={"srctag" + (source === "SYSTEM_DEFAULT" ? " srctag-default" : "")}>
      <Icon name={s.icon!} size={11} /> {s.short}
    </span>
  )
}

// Click-outside hook
export function useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, onOut: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut()
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [ref, onOut])
}
