// FIP Payment — click-outside dropdown wrapper (relative-positioned anchor).
import { useEffect, useRef, type ReactNode } from "react"

export function Dropdown({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open, onClose])
  return <div ref={ref} style={{ position: "relative" }}>{children}</div>
}
