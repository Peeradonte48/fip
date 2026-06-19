// FIP Payment — S3 Gateways · S4 Card terminals · S5 Audit log (branch-scoped).
import { useState } from "react"
import { Icon } from "../Icon"
import { LockNote } from "./primitives"
import { PM_ACQUIRER_COLOR } from "../../lib/payment/catalog"
import type { PaymentDB } from "../../lib/payment/effective"
import type { Branch, PaymentCan } from "../../lib/payment/types"

const CONN_ICON: Record<string, string> = { lan: "lan", bluetooth: "bluetooth", cloud: "cloud" }

// ============ S3 · Gateway credentials (per branch) ============
export function GatewaysScreen({ db, branch, can, onToast }: {
  db: PaymentDB; branch: Branch; can: PaymentCan; onToast: (m: string) => void
}) {
  const gws = db.gateways.filter((g) => g.branchId === branch.id)
  const sMap: Record<string, { b: string; t: string }> = {
    verified: { b: "b-green", t: "ยืนยันแล้ว" },
    unverified: { b: "b-amber", t: "ยังไม่ยืนยัน" },
    failed: { b: "b-red", t: "ล้มเหลว" },
  }
  return (
    <>
      <div className="pagehead">
        <div className="pagehead-titles">
          <div className="pagehead-eyebrow">Payment &amp; Tax Setting</div>
          <h1 className="pagehead-title">คีย์เกตเวย์<span className="pagehead-count">{branch.id} · GB Prime Pay</span></h1>
          <div className="pagehead-sub">คีย์การชำระเงินออนไลน์ของสาขา {branch.name} · คีย์ลับเป็น staff-blind ไม่แสดงค่าจริงหลังบันทึก</div>
        </div>
        <div className="pagehead-actions">
          {can.keyManage ? <button className="btn btn-primary btn-lg"><Icon name="plus" size={14} /> เพิ่มคีย์เกตเวย์</button> : <LockNote>ต้องมีสิทธิ์จัดการคีย์</LockNote>}
        </div>
      </div>

      {gws.length === 0 ? (
        <div className="pm-empty">
          <div className="pm-empty-ic"><Icon name="qr" size={22} /></div>
          <div className="pm-empty-title">สาขานี้ยังไม่มีคีย์เกตเวย์</div>
          <div className="pm-empty-sub">เพิ่มคีย์ GB Prime Pay เพื่อเปิดรับ QR ที่สาขา {branch.name}</div>
        </div>
      ) : (
        <div className="pm-list pm-list-2">
          {gws.map((g) => {
            const s = sMap[g.status]
            return (
              <div key={g.id} className="pm-bigcard">
                <div className="pm-bigcard-head">
                  <span className="pm-bigcard-logo" style={{ background: g.env === "production" ? "#0a0a0a" : "#1d4ed8" }}>GBPP</span>
                  <div className="pm-bigcard-titles">
                    <div className="pm-bigcard-title">{g.label}<span className={"badge " + s.b}><span className="badge-dot" />{s.t}</span></div>
                    <div className="pm-bigcard-sub">{g.env === "production" ? "ใช้งานจริง · รับเงินจริง" : "ทดสอบ · ไม่มีการตัดเงินจริง"}</div>
                  </div>
                </div>
                <div className="pm-bigcard-body">
                  <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="key" size={14} /> Public key</span><span className="pm-kv-v mono">{g.publicKey}</span></div>
                  <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="lock" size={14} /> Secret key</span><span className="pm-kv-v"><span className="pm-inline" style={{ color: "var(--green)" }}><Icon name="lock" size={13} /> เก็บไว้แล้ว</span></span></div>
                  <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="link" size={14} /> Callback URL</span><span className="pm-kv-v mono" style={{ fontSize: 11.5 }}>{g.callbackUrl}</span></div>
                  <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="clock" size={14} /> ทดสอบล่าสุด</span><span className="pm-kv-v">{g.lastTestedAt || "— ยังไม่เคยทดสอบ"}</span></div>
                </div>
                <div className="pm-bigcard-foot">
                  <button className="btn btn-sm" disabled={!can.keyManage}><Icon name="play" size={13} /> ทดสอบการเชื่อมต่อ</button>
                  <button className="btn btn-sm" disabled={!can.keyManage} onClick={() => can.keyManage && onToast("หมุนคีย์ลับแล้ว · บันทึกใน audit log")}><Icon name="rotate" size={13} /> หมุนคีย์</button>
                  <div className="pm-bigcard-foot-spacer" />
                  {!can.keyManage && <LockNote>staff-blind</LockNote>}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="pm-hint-amber" style={{ margin: "0 28px 24px" }}>
        <Icon name="shield" size={15} />
        <span>คีย์เป็นของสาขานี้เท่านั้น · คีย์ลับ (secret key) write-only ระบบไม่ส่งค่ากลับมาที่หน้าจอ การหมุนคีย์ถาม PIN และถูกบันทึก</span>
      </div>
    </>
  )
}

// ============ S4 · Card terminals (per branch) ============
export function TerminalsScreen({ db, branch, can }: { db: PaymentDB; branch: Branch; can: PaymentCan }) {
  const profiles = db.edc.filter((p) => p.branchId === branch.id)
  return (
    <>
      <div className="pagehead">
        <div className="pagehead-titles">
          <div className="pagehead-eyebrow">Payment &amp; Tax Setting</div>
          <h1 className="pagehead-title">เครื่องรูดบัตร (EDC)<span className="pagehead-count">{branch.id} · {profiles.length} โปรไฟล์</span></h1>
          <div className="pagehead-sub">ตั้งนโยบายเครื่องรูดบัตรของสาขา {branch.name} และแสดงสถานะ · เครื่องจริงจับคู่ที่ iPad</div>
        </div>
        <div className="pagehead-actions">
          {can.edcManage ? <button className="btn btn-primary btn-lg"><Icon name="plus" size={14} /> เพิ่มโปรไฟล์ EDC</button> : <LockNote>ต้องมีสิทธิ์จัดการ EDC</LockNote>}
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="pm-empty">
          <div className="pm-empty-ic"><Icon name="terminal" size={22} /></div>
          <div className="pm-empty-title">สาขานี้ยังไม่มีโปรไฟล์ EDC</div>
          <div className="pm-empty-sub">เพิ่มโปรไฟล์เพื่อรับบัตรที่สาขา {branch.name}</div>
        </div>
      ) : (
        <div className="pm-list">
          {profiles.map((p) => {
            const devices = db.devices.filter((d) => d.edcProfileId === p.id)
            const online = devices.filter((d) => d.online).length
            return (
              <div key={p.id} className="pm-bigcard">
                <div className="pm-bigcard-head">
                  <span className="pm-bigcard-logo" style={{ background: PM_ACQUIRER_COLOR[p.acquirer] }}>{p.acquirer.toUpperCase().slice(0, 4)}</span>
                  <div className="pm-bigcard-titles">
                    <div className="pm-bigcard-title">{p.acquirerLabel}<span className={"badge " + (p.mode === "semi_integrated" ? "b-violet" : "b-neutral")}>{p.mode === "semi_integrated" ? "Semi-integrated" : "Standalone"}</span></div>
                    <div className="pm-bigcard-sub">{devices.length} เครื่องผูก · ออนไลน์ {online}/{devices.length}</div>
                  </div>
                  {can.edcManage && <button className="btn btn-sm"><Icon name="edit" size={13} /> แก้นโยบาย</button>}
                </div>
                <div className="pm-bigcard-body">
                  <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="clock" size={14} /> ตัดยอดประจำวัน</span><span className="pm-kv-v">{p.settleAuto ? `อัตโนมัติ · ${p.settleTime}` : "แมนนวล"}</span></div>
                  <div className="pm-kv-row"><span className="pm-kv-k"><Icon name="rotate" size={14} /> Void / Refund</span><span className="pm-kv-v">{p.allowVoid ? "Void ได้" : "Void ไม่ได้"} · {p.allowRefund ? "Refund ได้" : "Refund ต้องสิทธิ์แยก"}</span></div>
                </div>
                <div style={{ padding: "0 16px 14px" }}>
                  <div className="pm-pairing">
                    <div className="pm-pairing-head"><Icon name="terminal" size={15} /> เครื่องที่จับคู่<span className="pm-pairing-lock"><Icon name="lock" size={12} /> อ่านอย่างเดียว · จับคู่ที่ iPad</span></div>
                    {devices.map((d) => (
                      <div key={d.deviceId} className="pm-device-row">
                        <span className="pm-device-ic"><Icon name="terminal" size={16} /></span>
                        <div><div className="pm-device-id">{d.deviceId}</div><div className="pm-device-model">{d.model}</div></div>
                        <span className="pm-conn"><Icon name={CONN_ICON[d.connection]} size={14} /> {d.connection.toUpperCase()}</span>
                        <span className="pm-conn"><span className="pm-dot-status" data-on={d.online} /> {d.online ? "ออนไลน์" : d.lastSeenAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="note" style={{ margin: "0 28px 24px", display: "flex", gap: 10, alignItems: "center" }}>
        <Icon name="info" size={15} /> เครื่องรูดบัตรจับคู่บน iPad · หน้านี้ตั้งนโยบายและแสดงสถานะของสาขานี้เท่านั้น
      </div>
    </>
  )
}

// ============ S5 · Audit log ============
export function AuditScreen({ db, branch, focusTarget, onClearFocus }: {
  db: PaymentDB; branch: Branch; focusTarget: string | null; onClearFocus: () => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [scope, setScope] = useState<"all" | "branch">("all")
  let entries = db.audit
  if (focusTarget) entries = entries.filter((e) => e.target.includes(focusTarget))
  if (scope === "branch") entries = entries.filter((e) => e.branchId === branch.id || e.branchId == null)

  return (
    <>
      <div className="pagehead">
        <div className="pagehead-titles">
          <div className="pagehead-eyebrow">Payment &amp; Tax Setting</div>
          <h1 className="pagehead-title">บันทึกการแก้ไข<span className="pagehead-count">{entries.length} รายการ</span></h1>
          <div className="pagehead-sub">ทุกการ define / assign / enable / override / หมุนคีย์ ถูกบันทึกพร้อมผู้ทำ, แบรนด์/สาขา และค่า before/after</div>
        </div>
        <div className="pagehead-actions">
          <button className="btn"><Icon name="download" size={14} /> Export <span className="pm-muted-mono" style={{ marginLeft: 4 }}>(v1: view-only)</span></button>
        </div>
      </div>

      <div className="chips">
        <button className="chip" data-active={scope === "all"} onClick={() => setScope("all")}>ทุกแบรนด์/สาขา</button>
        <button className="chip" data-active={scope === "branch"} onClick={() => setScope("branch")}>{branch.id} + แบรนด์</button>
        <div className="toolbar-spacer" />
        {focusTarget && <button className="chip" data-active="true" onClick={onClearFocus}>กรอง: {focusTarget} <Icon name="x" size={12} /></button>}
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 160 }}>เวลา</th>
                <th>ผู้ทำรายการ</th>
                <th>ขอบเขต</th>
                <th>การกระทำ</th>
                <th>เป้าหมาย</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <AuditRowGroup key={e.id} entry={e} open={openId === e.id} onToggle={() => setOpenId(openId === e.id ? null : e.id)} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <div>แสดง {entries.length} รายการล่าสุด</div>
          <div className="table-foot-spacer" />
          <span className="muted">บันทึกไม่ถูกลบแม้ปิด/ลบวิธีชำระเงินหรือ assignment</span>
        </div>
      </div>
    </>
  )
}

function AuditRowGroup({ entry: e, open, onToggle }: {
  entry: import("../../lib/payment/types").PaymentAuditEntry; open: boolean; onToggle: () => void
}) {
  return (
    <>
      <tr className="pm-audit-row" onClick={onToggle}>
        <td className="muted nowrap mono" style={{ fontSize: 12 }}>{e.at}</td>
        <td>
          <div className="pm-audit-actor">
            <span className="avatar-xs">{e.actor.slice(0, 1)}</span>
            <div><div style={{ fontWeight: 500 }}>{e.actor}</div><div className="muted" style={{ fontSize: 11.5 }}>{e.role}</div></div>
          </div>
        </td>
        <td>{e.branchId ? <span className="pm-scope-opt-id">{e.branchId}</span> : <span className="badge b-neutral">แบรนด์</span>}</td>
        <td>
          <div className="pm-inline">
            <span className={"pm-audit-ic badge " + e.tone} style={{ width: 30, height: 30 }}><Icon name={e.icon} size={15} /></span>
            <div><div style={{ fontWeight: 500 }}>{e.actionLabel}</div><div className="pm-muted-mono">{e.action}</div></div>
          </div>
        </td>
        <td>{e.target}</td>
        <td className="col-actions"><Icon name={open ? "chevronUp" : "chevron"} size={15} /></td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} style={{ padding: 0 }}>
            <div className="pm-diff">
              <div className="pm-diff-grid">
                <DiffCol side="before" title="ก่อน (Before)" obj={e.before} />
                <span className="pm-diff-arrow"><Icon name="chevronRight" size={18} /></span>
                <DiffCol side="after" title="หลัง (After)" obj={e.after} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function DiffCol({ side, title, obj }: { side: "before" | "after"; title: string; obj: Record<string, unknown> | null }) {
  return (
    <div className="pm-diff-col" data-side={side}>
      <div className="pm-diff-col-head">{title}</div>
      {obj === null || obj === undefined
        ? <div className="pm-diff-empty">— ไม่มี (รายการใหม่)</div>
        : Object.entries(obj).map(([k, v]) => (
            <div key={k} className="pm-diff-kv"><span className="pm-diff-k">{k}</span><span className="pm-diff-v">{String(v)}</span></div>
          ))}
    </div>
  )
}
