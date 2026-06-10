// FIP Role & Permission — in-app chrome replacing the design tool's Tweaks panel.
// Persona switcher (drives governance visibility / read-only / tenant isolation),
// view options (permission UX variant + row density), and a reset-demo-data action.

import { useRef, useState } from "react"
import { Icon } from "./Icon"
import { useClickOutside } from "./primitives"
import { TENANT } from "@/lib/catalog"
import type { Density, Persona, PermVariant } from "@/lib/types"

export interface PersonaControlsProps {
  persona: Persona
  density: Density
  permVariant: PermVariant
  onPersona: (p: Persona) => void
  onDensity: (d: Density) => void
  onPermVariant: (v: PermVariant) => void
  onReset: () => void
}

export function PersonaControls({
  persona, density, permVariant, onPersona, onDensity, onPermVariant, onReset,
}: PersonaControlsProps) {
  const [viewOpen, setViewOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const viewRef = useRef<HTMLDivElement>(null)
  useClickOutside(viewRef, () => setViewOpen(false))

  return (
    <div className="m-toolbelt">
      <span className="m-tool-label">มุมมอง</span>
      <div className="pseg persona-seg">
        <button data-on={persona === "tbc"} onClick={() => onPersona("tbc")}>
          <Icon name="shield" size={14} /> TBC Admin
        </button>
        <button data-on={persona === "tenant"} onClick={() => onPersona("tenant")}>
          <Icon name="building" size={14} /> Tenant · {TENANT.name}
        </button>
      </div>

      <div className="pop-anchor" ref={viewRef}>
        <button className="m-close" aria-label="ตัวเลือกการแสดงผล" title="ตัวเลือกการแสดงผล" onClick={() => setViewOpen((v) => !v)}>
          <Icon name="settings" size={18} />
        </button>
        {viewOpen && (
          <div className="pop" style={{ width: 240 }}>
            <div className="vopt-group">รูปแบบตัวเลือกสิทธิ์ (Permission UX)</div>
            <div className="vopt-seg">
              <div className="pseg" style={{ width: "100%" }}>
                <button style={{ flex: 1 }} data-on={permVariant === "tree"} onClick={() => onPermVariant("tree")}>Tree</button>
                <button style={{ flex: 1 }} data-on={permVariant === "twopane"} onClick={() => onPermVariant("twopane")}>2-pane</button>
                <button style={{ flex: 1 }} data-on={permVariant === "matrix"} onClick={() => onPermVariant("matrix")}>Compact</button>
              </div>
            </div>
            <div className="pop-div" />
            <div className="vopt-group">ความหนาแน่นแถว</div>
            <div className="vopt-seg">
              <div className="pseg" style={{ width: "100%" }}>
                <button style={{ flex: 1 }} data-on={density === "comfortable"} onClick={() => onDensity("comfortable")}>สบายตา</button>
                <button style={{ flex: 1 }} data-on={density === "compact"} onClick={() => onDensity("compact")}>กระชับ</button>
              </div>
            </div>
            <div className="pop-div" />
            <div className="pop-row" style={{ color: "var(--red)" }} onClick={() => { setResetOpen(true); setViewOpen(false) }}>
              <Icon name="reset" size={15} /><span className="pop-row-lbl">รีเซ็ตข้อมูลเดโม</span>
            </div>
          </div>
        )}
      </div>

      {resetOpen && (
        <div className="cscrim" onClick={() => setResetOpen(false)}>
          <div className="confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-body">
              <div className="confirm-ic confirm-ic-amber"><Icon name="reset" size={22} /></div>
              <div className="confirm-title">รีเซ็ตข้อมูลเดโม?</div>
              <div className="confirm-text">
                บทบาทที่สร้าง/แก้ไข/เก็บเข้าคลังทั้งหมดจะถูกล้างและกลับไปใช้ชุดข้อมูลตัวอย่างเริ่มต้น — ใช้สำหรับเริ่มการสาธิตใหม่
              </div>
            </div>
            <div className="confirm-foot">
              <button className="tbtn" onClick={() => setResetOpen(false)}>ยกเลิก</button>
              <button className="tbtn" style={{ background: "var(--ink-1)", color: "#fff", borderColor: "transparent" }} onClick={() => { onReset(); setResetOpen(false) }}>
                <Icon name="reset" size={15} /> รีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
