// FIP Back Office — icon set (lucide-style strokes)
import type { CSSProperties, ReactNode } from "react"

export interface IconProps {
  name: string
  size?: number
  stroke?: number
  color?: string
  className?: string
  style?: CSSProperties
}

export function Icon({
  name,
  size = 16,
  stroke = 1.6,
  color = "currentColor",
  className,
  style,
}: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
  }
  const paths: Record<string, ReactNode> = {
    // generic
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <><path d="M5 12h14" /></>,
    filter: <><path d="M3 6h18M6 12h12M10 18h4" /></>,
    columns: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></>,
    chevron: <><path d="m6 9 6 6 6-6" /></>,
    chevronUp: <><path d="m6 15 6-6 6 6" /></>,
    chevronLeft: <><path d="m15 18-6-6 6-6" /></>,
    chevronRight: <><path d="m9 18 6-6-6-6" /></>,
    chevronsLeft: <><path d="m11 17-5-5 5-5M18 17l-5-5 5-5" /></>,
    chevronsRight: <><path d="m13 17 5-5-5-5M6 17l5-5-5-5" /></>,
    chevronsUpDown: <><path d="m7 15 5 5 5-5M7 9l5-5 5 5" /></>,
    dots: <><circle cx="5" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.1" fill="currentColor" stroke="none" /></>,
    dotsV: <><circle cx="12" cy="5" r="1.1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none" /></>,
    x: <><path d="M6 6 18 18M18 6 6 18" /></>,
    check: <><path d="m5 12 5 5L20 7" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .8-1 1.7M12 17h.01" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    sort: <><path d="M8 4v16M8 4l-3 3M8 4l3 3M16 20V4M16 20l-3-3M16 20l3-3" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    rows: <><rect x="3" y="4" width="18" height="5" rx="1.5" /><rect x="3" y="13" width="18" height="5" rx="1.5" /></>,
    grip: <><circle cx="9" cy="6" r=".9" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r=".9" fill="currentColor" stroke="none" /><circle cx="9" cy="18" r=".9" fill="currentColor" stroke="none" /><circle cx="15" cy="6" r=".9" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r=".9" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r=".9" fill="currentColor" stroke="none" /></>,

    // settings nav
    building: <><rect x="4" y="3" width="11" height="18" rx="1.5" /><path d="M15 8h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-4" /><path d="M8 7h3M8 11h3M8 15h3" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-2.7-4.7" /></>,
    shield: <><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    key: <><circle cx="8" cy="14" r="4" /><path d="m11 11 8-8M16 3l3 3-2.5 2.5L14 6" /></>,
    units: <><path d="M5 3v6a4 4 0 0 0 4 4M19 3v6a4 4 0 0 1-4 4M9 13h6M12 13v8M9 21h6" /></>,
    positions: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" /></>,
    receipt: <><path d="M5 3v18l2-1.4 2 1.4 2-1.4 2 1.4 2-1.4 2 1.4V3l-2 1.4L15 3l-2 1.4L11 3 9 4.4 7 3 5 4.4Z" /><path d="M8.5 9h7M8.5 13h7" /></>,
    money: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2A2.5 2.5 0 0 1 9.5 15M12 6v1.5M12 16.5V18" /></>,
    salesformat: <><path d="M12 3 19 7v10l-7 4-7-4V7l7-4Z" /><path d="M12 8l3.5 2v4L12 16l-3.5-2v-4L12 8Z" /></>,

    // detail / contact
    phone: <><path d="M5 4h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    mapPin: <><path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>,
    link: <><path d="M9 13a4 4 0 0 0 5.7.4l2.6-2.6a4 4 0 0 0-5.7-5.7L10 6.7" /><path d="M15 11a4 4 0 0 0-5.7-.4L6.7 13.2a4 4 0 0 0 5.7 5.7L14 16.9" /></>,
    edit: <><path d="M4 20h4l10-10a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20Z" /><path d="m13.5 6.5 4 4" /></>,
    reset: <><path d="M3 12a9 9 0 1 1 3 6.7" /><path d="M3 21v-4h4" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
    expand: <><path d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M8 21H4a1 1 0 0 1-1-1v-4M16 21h4a1 1 0 0 0 1-1v-4" /></>,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    store: <><path d="M4 9V6h16v3M4 9h16l-1 10H5L4 9Z" /><path d="M9 14h6" /></>,
    moped: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 18h8M14 6h3l3 7v5h-4M4 10h6l4 8" /></>,
    bag: <><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 1 1 6 0" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 4v4h4" /><path d="M12 8v4l3 2" /></>,
    rocket: <><path d="M14 4c5 0 8 3 8 8-2 0-4 1-5 3 0 0-1 2-3 3l-3-3-3-3c1-2 3-3 3-3 2-1 3-3 3-5Z" /><path d="m6 18-2 2M9 18l-2 3M4 15l-2 2" /></>,
    refresh: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v4h-4" /></>,
    archive: <><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11h14V8M10 13h4" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></>,
    download: <><path d="M12 4v12M6 10l6 6 6-6M5 20h14" /></>,
    upload: <><path d="M12 20V8M6 14l6-6 6 6M5 20h14" /></>,
    trash: <><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13h10l1-13" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></>,
    tag: <><path d="M20.6 13.4 12 22a2 2 0 0 1-2.8 0L2 14.8a2 2 0 0 1 0-2.8L10.6 3.4A2 2 0 0 1 12 3h6a2 2 0 0 1 2 2v6a2 2 0 0 1-.4 1.4Z" /><circle cx="15.5" cy="8.5" r="1.3" /></>,
    warn: <><path d="M12 3 22 20H2L12 3Z" /><path d="M12 10v4M12 17h.01" /></>,
    sparkles: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6 8.5 8.5M15.5 15.5l2.9 2.9M5.6 18.4 8.5 15.5M15.5 8.5l2.9-2.9" /></>,
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
    sidebar: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.7 13H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 11 4.7V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,

    // role module additions
    box: <><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5M3 16l9 5 9-5" /></>,
    ban: <><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></>,
    minusCircle: <><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></>,
    gauge: <><path d="M12 21a9 9 0 1 1 9-9" /><path d="M12 12 16 9" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /></>,
    fileCheck: <><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="m9 14 2 2 4-4" /></>,
    slash: <><path d="M5 19 19 5" /></>,
    dot: <><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" /></>,
    userPlus: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M18 8v6M15 11h6" /></>,
    rocket2: <><path d="M14 4c5 0 8 3 8 8-2 0-4 1-5 3 0 0-1 2-3 3l-3-3-3-3c1-2 3-3 3-3 2-1 3-3 3-5Z" /><path d="m6 18-2 2M9 18l-2 3M4 15l-2 2" /></>,

    // ── Payment Method Configuration glyphs ──────────────────────────────
    coins: <><ellipse cx="9" cy="7" rx="6" ry="3" /><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" /><path d="M15 12.5c2.5-.3 6-1.4 6-3.5M15 17c3.3 0 6-1.3 6-3v-3" /><path d="M3 12v3c0 1.7 2.7 3 6 3" /></>,
    qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M20 14v.01M14 20h.01M20 20v.01M20 17v.01M17 20v.01" /></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
    cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9.5v.01M18 14.5v.01" /></>,
    wallet: <><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" /><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 13h.01" /><path d="M21 11h-4a2 2 0 0 0 0 4h4" /></>,
    ticket: <><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6Z" /><path d="M12 5v14" strokeDasharray="2 3" /></>,
    ledger: <><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2Z" /><path d="M5 4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2M9 9h6M9 13h6" /></>,
    terminal: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M6 7h12M9 17h6" /><rect x="9" y="10" width="6" height="3.5" rx="0.6" /></>,
    bolt: <><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></>,
    plug: <><path d="M12 22v-5M9 2v5M15 2v5M7 7h10v3a5 5 0 0 1-10 0Z" /></>,
    wifi: <><path d="M2 8.8a16 16 0 0 1 20 0M5 12.3a11 11 0 0 1 14 0M8.5 15.8a6 6 0 0 1 7 0M12 19.5h.01" /></>,
    bluetooth: <><path d="m7 7 10 10-5 4V3l5 4L7 17" /></>,
    cloud: <><path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 8.5Z" /></>,
    lan: <><rect x="9" y="3" width="6" height="5" rx="1" /><rect x="3" y="16" width="6" height="5" rx="1" /><rect x="15" y="16" width="6" height="5" rx="1" /><path d="M12 8v4M6 16v-2h12v2" /></>,
    rotate: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v4h-4" /></>,
    play: <><path d="M7 5v14l11-7Z" /></>,
    eyeOff: <><path d="M3 3l18 18M10.6 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 3.9M6.6 6.6A16 16 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3.6-.7M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
    dine: <><path d="M5 3v8a3 3 0 0 0 6 0V3M8 3v18M16 3c-1.5 1-2 3-2 5s.5 4 2 5v8" /></>,
  }
  return <svg {...common}>{paths[name] || null}</svg>
}
