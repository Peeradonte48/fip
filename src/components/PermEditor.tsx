// FIP Back Office — Role & Permission · permission editor
// Variants: PermTree (primary), PermTwoPane, PermMatrix · plus PermSummary (review/read-only).

import { useState } from "react"
import { Icon } from "./Icon"
import { ProductMark } from "./primitives"
import { catalogFor } from "@/lib/catalog"
import {
  catalogGroups,
  effectiveSet,
  modState,
  switchMode,
  toggleAction,
  toggleModuleAll,
} from "@/lib/grants"
import type { Grant, Grants, PermVariant, RoleLike } from "@/lib/types"

interface EditorProps {
  role: RoleLike
  grants: Grants
  onChange: (next: Grants) => void
  readOnly?: boolean
}

// ============================================================
// PRIMARY — expandable tree
// ============================================================
export function PermTree({ role, grants, onChange, readOnly }: EditorProps) {
  const groups = catalogGroups(role)
  const [openProd, setOpenProd] = useState<string[]>(() => groups.map((g) => g.key))
  const [openMod, setOpenMod] = useState<string[]>([])
  const tProd = (k: string) =>
    setOpenProd((o) => (o.includes(k) ? o.filter((x) => x !== k) : [...o, k]))
  const tMod = (k: string) =>
    setOpenMod((o) => (o.includes(k) ? o.filter((x) => x !== k) : [...o, k]))

  return (
    <div className="ptree">
      {groups.map((grp) => {
        const isOpen = openProd.includes(grp.key)
        let g = 0
        let t = 0
        grp.modules.forEach((m) => {
          t += m.actions.length
          g += effectiveSet(m, grants[m.id]).size
        })
        return (
          <div key={grp.key}>
            <div className="ptree-prod" onClick={() => tProd(grp.key)}>
              <span className="ptree-twist" data-open={isOpen}><Icon name="chevronRight" size={15} /></span>
              <ProductMark product={grp.product as never} size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ptree-prod-name">{grp.product.name}</div>
                <div className="ptree-prod-sub">{grp.product.desc}</div>
              </div>
              <span className="ptree-prod-count" data-empty={g === 0}>{g}/{t} สิทธิ์</span>
            </div>

            {isOpen && grp.modules.map((mod) => {
              const grant = grants[mod.id]
              const st = modState(mod, grant)
              const eff = effectiveSet(mod, grant)
              const mOpen = openMod.includes(mod.id)
              const isExcept = !!grant && grant.mode === "all_except"
              const exCount = isExcept ? (grant.sel || []).length : 0
              return (
                <div className="pmod" key={mod.id}>
                  <div className="pmod-head" onClick={() => tMod(mod.id)}>
                    <span className="pmod-twist" data-open={mOpen}><Icon name="chevronRight" size={14} /></span>
                    <span
                      className="pcheck" data-state={st} data-disabled={readOnly}
                      onClick={(e) => { e.stopPropagation(); if (!readOnly) onChange(toggleModuleAll(grants, mod)) }}
                    >
                      {st === "all" && <Icon name="check" size={12} />}
                      {st === "partial" && <span className="pcheck-dash" />}
                    </span>
                    <span className="pmod-ic"><Icon name={mod.icon} size={16} /></span>
                    <div className="pmod-meta">
                      <div className="pmod-name">{mod.name}</div>
                    </div>
                    {isExcept
                      ? <span className="pmod-mode pmod-mode-except"><Icon name="ban" size={11} /> {exCount === 0 ? "ทั้งหมด" : `ยกเว้น ${exCount}`}</span>
                      : st === "all" ? <span className="pmod-mode pmod-mode-all"><Icon name="check" size={11} /> ทั้งหมด</span> : null}
                    <span className="pmod-count">{eff.size}/{mod.actions.length}</span>
                  </div>

                  {mOpen && (
                    <div className="pmod-body">
                      {!readOnly && (
                        <div className="pmod-modebar">
                          <span className="pmod-modebar-lbl">โหมดการเลือก</span>
                          <div className="pseg">
                            <button data-on={!isExcept} onClick={() => onChange(switchMode(grants, mod, "specific"))}>
                              <Icon name="check" size={13} /> เลือกเฉพาะ
                            </button>
                            <button data-on={isExcept} onClick={() => onChange(switchMode(grants, mod, "all_except"))}>
                              <Icon name="ban" size={13} /> ทั้งหมด ยกเว้น
                            </button>
                          </div>
                        </div>
                      )}
                      {isExcept && (
                        <div className="pexcept-hint">
                          <Icon name="info" size={14} />
                          <span>โหมด <b>ทั้งหมด ยกเว้น</b> — ทุก action ในโมดูลนี้ถูกเลือก รวมถึง action ใหม่ที่เพิ่มในอนาคต ติ๊ก action ที่ต้องการ <b>ยกเว้น</b></span>
                        </div>
                      )}
                      <div className="pacts">
                        {mod.actions.map((a) => {
                          const on = eff.has(a.id)
                          const excluded = isExcept && !on
                          return (
                            <div
                              key={a.id} className="pact" data-on={on} data-excluded={excluded}
                              onClick={() => !readOnly && onChange(toggleAction(grants, mod, a.id))}
                              style={readOnly ? { cursor: "default" } : undefined}
                            >
                              <span className="pact-box">
                                {on && <Icon name="check" size={11} />}
                                {excluded && <Icon name="ban" size={11} />}
                              </span>
                              <span className="pact-name">{a.name}</span>
                              {a.sensitive && !excluded && <span className="pact-sens">sensitive</span>}
                              {excluded && <span className="pact-extag"><Icon name="ban" size={10} /> ยกเว้น</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// TWO-PANE
// ============================================================
export function PermTwoPane({ role, grants, onChange, readOnly }: EditorProps) {
  const groups = catalogGroups(role)
  const flat = groups.flatMap((g) => g.modules)
  const [active, setActive] = useState<string | null>(flat[0] ? flat[0].id : null)
  const mod = flat.find((m) => m.id === active)
  const grant = mod ? grants[mod.id] : undefined
  const eff = mod ? effectiveSet(mod, grant) : new Set<string>()
  const isExcept = !!grant && grant.mode === "all_except"

  return (
    <div className="ptp">
      <div className="ptp-list">
        {groups.map((grp) => (
          <div key={grp.key}>
            <div className="ptp-group"><ProductMark product={grp.product as never} size={16} /> {grp.product.name}</div>
            {grp.modules.map((m) => {
              const n = effectiveSet(m, grants[m.id]).size
              return (
                <div key={m.id} className="ptp-mod" data-active={active === m.id} onClick={() => setActive(m.id)}>
                  <Icon name={m.icon} size={15} color="var(--ink-3)" />
                  <span className="ptp-mod-name">{m.name}</span>
                  <span className="ptp-mod-count">{n}/{m.actions.length}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="ptp-detail">
        {!mod ? <div className="ptp-empty"><span className="muted">เลือกโมดูล</span></div> : (
          <>
            <div className="ptp-detail-head">
              <span className="ptp-detail-ic"><Icon name={mod.icon} size={18} /></span>
              <div style={{ flex: 1 }}>
                <div className="ptp-detail-title">{mod.name}</div>
                <div className="ptp-detail-sub">{eff.size} จาก {mod.actions.length} action ถูกเลือก</div>
              </div>
              {!readOnly && (
                <div className="pseg">
                  <button data-on={!isExcept} onClick={() => onChange(switchMode(grants, mod, "specific"))}><Icon name="check" size={13} /> เลือกเฉพาะ</button>
                  <button data-on={isExcept} onClick={() => onChange(switchMode(grants, mod, "all_except"))}><Icon name="ban" size={13} /> ยกเว้น</button>
                </div>
              )}
            </div>
            {isExcept && (
              <div className="pexcept-hint">
                <Icon name="info" size={14} />
                <span>ทุก action ถูกเลือกไว้ (รวม action ใหม่ในอนาคต) — ติ๊กรายการที่ต้องการ <b>ยกเว้น</b></span>
              </div>
            )}
            <div className="pacts">
              {mod.actions.map((a) => {
                const on = eff.has(a.id)
                const excluded = isExcept && !on
                return (
                  <div key={a.id} className="pact" data-on={on} data-excluded={excluded}
                    onClick={() => !readOnly && onChange(toggleAction(grants, mod, a.id))}
                    style={readOnly ? { cursor: "default" } : undefined}>
                    <span className="pact-box">{on && <Icon name="check" size={11} />}{excluded && <Icon name="ban" size={11} />}</span>
                    <span className="pact-name">{a.name}</span>
                    {a.sensitive && !excluded && <span className="pact-sens">sensitive</span>}
                    {excluded && <span className="pact-extag"><Icon name="ban" size={10} /> ยกเว้น</span>}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================
// COMPACT (chips matrix)
// ============================================================
export function PermMatrix({ role, grants, onChange, readOnly }: EditorProps) {
  const groups = catalogGroups(role)
  return (
    <div className="pmx">
      {groups.map((grp) => (
        <div key={grp.key}>
          <div className="pmx-prod-h"><ProductMark product={grp.product as never} size={16} /> {grp.product.name}</div>
          {grp.modules.map((mod) => {
            const grant = grants[mod.id]
            const st = modState(mod, grant)
            const eff = effectiveSet(mod, grant)
            const isExcept = !!grant && grant.mode === "all_except"
            return (
              <div className="pmx-card" key={mod.id}>
                <div className="pmx-top">
                  <span className="pcheck" data-state={st} data-disabled={readOnly}
                    onClick={() => !readOnly && onChange(toggleModuleAll(grants, mod))}>
                    {st === "all" && <Icon name="check" size={12} />}
                    {st === "partial" && <span className="pcheck-dash" />}
                  </span>
                  <span className="pmx-name">{mod.name}</span>
                  <span className="pmod-count" style={{ marginRight: 4 }}>{eff.size}/{mod.actions.length}</span>
                  {!readOnly && (
                    <div className="seg-mini">
                      <button data-on={!isExcept} onClick={() => onChange(switchMode(grants, mod, "specific"))}>เฉพาะ</button>
                      <button data-on={isExcept} onClick={() => onChange(switchMode(grants, mod, "all_except"))}>ยกเว้น</button>
                    </div>
                  )}
                </div>
                <div className="pmx-chips">
                  {mod.actions.map((a) => {
                    const on = eff.has(a.id)
                    const excluded = isExcept && !on
                    return (
                      <button key={a.id} className="pmx-chip" data-on={on && !excluded} data-excluded={excluded}
                        onClick={() => !readOnly && onChange(toggleAction(grants, mod, a.id))}
                        style={readOnly ? { cursor: "default" } : undefined}>
                        <span className="pmx-chip-tick">
                          {on && !excluded && <Icon name="check" size={12} />}
                          {excluded && <Icon name="ban" size={12} />}
                          {!on && !excluded && <Icon name="plus" size={12} />}
                        </span>
                        {a.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// dispatch by variant
export function PermEditor({ variant = "tree", ...props }: EditorProps & { variant?: PermVariant }) {
  if (variant === "twopane") return <PermTwoPane {...props} />
  if (variant === "matrix") return <PermMatrix {...props} />
  return <PermTree {...props} />
}

// ============================================================
// SUMMARY (review step + read-only detail)
// ============================================================
export function PermSummary({ role, grants }: { role: RoleLike; grants: Grants }) {
  const groups = catalogGroups(role)
  const cat = catalogFor(role)
  const anyGrant = Object.keys(grants).some((mid) =>
    effectiveSet(cat.find((m) => m.id === mid) || { id: "", name: "", icon: "", actions: [] }, grants[mid]).size > 0
  )
  if (!anyGrant) {
    return (
      <div className="pempty">
        <div className="pempty-ic"><Icon name="shield" size={22} /></div>
        <div className="pempty-title">ยังไม่ได้เลือกสิทธิ์</div>
        <div className="pempty-sub">บทบาทว่างยัง <b>เผยแพร่ไม่ได้</b> — บันทึกเป็นร่างได้ แต่ต้องเลือกอย่างน้อย 1 สิทธิ์ก่อน Publish</div>
      </div>
    )
  }
  return (
    <div className="psum">
      {groups.map((grp) => {
        let g = 0
        let t = 0
        grp.modules.forEach((m) => {
          t += m.actions.length
          g += effectiveSet(m, grants[m.id]).size
        })
        const active = grp.modules.filter((m) => effectiveSet(m, grants[m.id]).size > 0)
        return (
          <div key={grp.key}>
            <div className="psum-prod">
              <ProductMark product={grp.product as never} size={20} />
              <span className="psum-prod-name">{grp.product.name}</span>
              <span className="psum-prod-meta">{g}/{t} สิทธิ์ · {active.length} โมดูล</span>
            </div>
            {active.length === 0 ? (
              <div className="psum-row"><span className="psum-none">— ไม่มีสิทธิ์ในผลิตภัณฑ์นี้ —</span></div>
            ) : active.map((mod) => {
              const grant = grants[mod.id] as Grant
              const isExcept = grant.mode === "all_except"
              const ex = isExcept ? (grant.sel || []) : []
              const eff = effectiveSet(mod, grant)
              return (
                <div className="psum-row" key={mod.id}>
                  <span className="psum-mod"><Icon name={mod.icon} size={14} /> {mod.name}</span>
                  <span className="psum-acts">
                    {isExcept ? (
                      ex.length === 0
                        ? <span className="psum-allexcept">ทุก action</span>
                        : <>
                            <span className="psum-allexcept">ทุก action</span>
                            {ex.map((id) => {
                              const a = mod.actions.find((x) => x.id === id)
                              return <span key={id} className="psum-exc"><Icon name="ban" size={10} /> ยกเว้น {a ? a.name : id}</span>
                            })}
                          </>
                    ) : (
                      mod.actions.filter((a) => eff.has(a.id)).map((a) => <span key={a.id} className="psum-act">{a.name}</span>)
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
