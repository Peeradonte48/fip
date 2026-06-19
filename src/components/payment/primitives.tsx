// FIP Payment — shared presentational primitives.
import type { ReactNode } from "react"
import { Icon } from "../Icon"
import { PM_BRANCHES, PM_CHANNELS, PM_RAILS, PM_TYPES } from "../../lib/payment/catalog"
import type {
  BindingStatus, Channel, Coverage, MethodType, Rail,
} from "../../lib/payment/types"

export function Switch({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      className={"switch" + (disabled ? " pm-locked" : "")}
      data-on={!!on}
      onClick={disabled ? undefined : onClick}
      aria-pressed={!!on}
      type="button"
    />
  )
}

export interface SegOption { value: string; label: string }
export function Seg({ value, options, onChange, disabled }: {
  value: string; options: SegOption[]; onChange: (v: string) => void; disabled?: boolean
}) {
  return (
    <div className={"seg" + (disabled ? " pm-locked" : "")}>
      {options.map((o) => (
        <button key={o.value} data-on={value === o.value} onClick={() => !disabled && onChange(o.value)} type="button">
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function RailBadge({ rail }: { rail: Rail }) {
  const r = PM_RAILS[rail]
  return (
    <span className={"badge pm-rail-badge " + r.badge}>
      <Icon name={r.icon} size={12} /> {r.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: BindingStatus }) {
  return (
    <span className="pm-status">
      <span className={"badge " + status.badge}>
        <span className="badge-dot" />{status.label}
      </span>
      {status.sub && <span className="pm-status-sub">{status.sub}</span>}
    </span>
  )
}

export function ChannelPills({ channels }: { channels: Channel[] }) {
  return (
    <span className="channels">
      {channels.map((c) => (
        <span key={c} className="channel-pill" title={PM_CHANNELS[c].label}>
          {PM_CHANNELS[c].label}
        </span>
      ))}
    </span>
  )
}

export function RailThumb({ rail, type, size = 34 }: { rail: Rail; type: MethodType; size?: number }) {
  const icon = PM_TYPES[type] ? PM_TYPES[type].icon : PM_RAILS[rail].icon
  return (
    <span className="pm-rail-thumb" data-rail={rail} style={{ width: size, height: size }}>
      <Icon name={icon} size={size * 0.5} />
    </span>
  )
}

export function LockNote({ children }: { children?: ReactNode }) {
  return <span className="pm-lock-note"><Icon name="lock" size={11} /> {children || "ต้องมีสิทธิ์เพิ่มเติม"}</span>
}

/** Coverage chip: "applied N/M · K overridden" */
export function CoverageBar({ cov }: { cov: Coverage }) {
  return (
    <span className="pm-cov">
      <span className="pm-cov-bar" title={`ใช้กับ ${cov.applied} จาก ${cov.total} สาขา`}>
        {PM_BRANCHES.map((b, i) => (
          <span key={b.id} className="pm-cov-seg" data-on={i < cov.applied} />
        ))}
      </span>
      <span className="pm-cov-text">{cov.applied}/{cov.total} สาขา</span>
      {cov.overridden > 0 && <span className="pm-cov-ovr">{cov.overridden} override</span>}
    </span>
  )
}

/** "differs from brand default" badge */
export function OverrideBadge({ fields }: { fields: string[] }) {
  if (!fields || fields.length === 0) return <span className="muted" style={{ fontSize: 12 }}>—</span>
  return (
    <span className="pm-ovr-badge" title={"ต่างจากค่าเริ่มต้นแบรนด์: " + fields.join(", ")}>
      <Icon name="edit" size={11} /> override · {fields.length}
    </span>
  )
}

/** Click-outside dropdown wrapper. */
export { Dropdown } from "./Dropdown"
