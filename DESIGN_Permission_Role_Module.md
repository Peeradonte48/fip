# DESIGN SPEC — Permission & Role Module (FIP)
### Spec-Driven Development Document · v0.1

| | |
|---|---|
| **Module** | Permission & Role (Role Authoring / Definition) |
| **Ecosystem** | TBC × ICWeb — Food Intelligent Platform (FIP) |
| **Layer** | Foundation / Platform (IdentityOS — cross-cutting, ใต้ทุก business module) |
| **Scope V1** | POS, QSC |
| **จัดทำโดย** | แบงค์ (FIP Product/Design) |
| **สถานะ** | Draft — รอ confirm 2 Open Questions (ดูหัวข้อ 12) |
| **Convention** | Kiro/spec-kit style — Requirements (EARS) → Design → (Tasks ภายหลัง) |

---

## 1. Overview

### 1.1 Purpose
Module นี้เป็น **surface สำหรับ "นิยาม" (author/define) Role และ Permission** ของทุก product ใน FIP โดยแยกการนิยามออกจากการ **assign** ให้พนักงานอย่างเด็ดขาด — module นี้ **สร้าง/แก้/จัดการ Role ได้เท่านั้น ไม่ assign**

การแยก "นิยาม role" ออกจาก "assign role" เป็นหลัก RBAC มาตรฐาน: สิทธิ์ไม่ผูกกับ user โดยตรง แต่ผูกผ่าน Role แล้วจึง assign — โดยมอง Permission เป็นหน่วยอะตอม, Role เป็น bundle ของ permission (ดู References [1][2][3])

### 1.2 Background
- FIP เป็น multi-tenant SaaS (โครงสร้าง 3-Layer: Basic / Customize / Enterprise) จึงต้องรองรับหลาย tenant, หลาย product, และหลายสาขา
- เดิม FCM/CRM ไม่ได้ออกแบบให้ scale ข้ามบริษัท และ IAM ที่ฝังใน business module จะบังคับให้ module นั้นต้องขายพ่วงทุกดีล — จึงยก IAM เป็น **foundation layer** แยกออกมา
- A Ramen เป็น early adopter: role หน้าร้านในทางปฏิบัติหลวม (Cashier/Server ถูกรวมเพราะทุกคนต้องคีย์) → V1 ต้องเรียบง่ายแต่ขยายได้

### 1.3 Goals
1. นิยาม **Product Role** แยกต่อ product (POS, QSC) ได้
2. นิยาม **System Role** (meta-role เชิงบริหาร) ที่จัดการ role/permission ข้ามระบบได้
3. รองรับ 2 ชั้น: **System Default templates** (TBC owner) + **Tenant Custom roles**
4. Permission ละเอียดระดับ **Module → Action** พร้อม **Exception** (เลือกทั้งหมดแล้วยกเว้น)
5. Acceptance criteria แบบ EARS เพื่อ test ได้และส่งต่อ dev โดยไม่กำกวม

### 1.4 Non-Goals (อยู่นอก module นี้โดยเจตนา)
- **Assign role ให้พนักงาน** → อยู่คนละ module (User/Team Assignment)
- Authentication / Login / SSO
- **Branch-scope assignment** (สมมติเป็น assignment-time — ดู Assumption A1)
- **Role inheritance / hierarchy** (defer V2 — D5)
- ABAC / OR-logic / conditional policy (defer V2)
- การใช้งาน operational ข้าม product ผ่าน System Role (D1=B — ดูหัวข้อ 6)

---

## 2. Scope

| | In Scope (V1) | Deferred (V2+) |
|---|---|---|
| Products | POS, QSC | FCM, CRM, Inventory, FinanceOS, SupplierOS, AssetOS, TeamOS, SOP OS |
| Role types | Product Role, System Role | — |
| Source | System Default template, Tenant Custom | Marketplace/shared role templates |
| Permission model | Module → Action + Exception | resource-level CRUD ละเอียด, field-level |
| Role relation | Flat (ไม่มี inheritance) | Role hierarchy / inheritance (RBAC1) |
| Logic | AND (เลือกทั้งหมด/ยกเว้น) | OR, nested groups, dynamic policy (ABAC) |

> Architecture ต้องออกแบบให้ **เพิ่ม product ใหม่ได้โดยไม่แก้ core** (product เป็น config ไม่ใช่ hardcode)

---

## 3. Glossary

| คำ | ความหมาย |
|---|---|
| **Tenant** | บริษัทลูกค้า 1 ราย (เช่น A Ramen) — ขอบเขต isolation ของ role/ข้อมูล |
| **Product** | ระบบลูกใน FIP (POS, QSC, …) — เจ้าของ permission catalog ของตัวเอง |
| **Permission** | หน่วยสิทธิ์อะตอม = `Product > Module > Action` (เช่น `POS > Promotion > Create`) |
| **Product Role** | Role ที่ scope อยู่ใน **product เดียว** — bundle ของ permission ภายใน product นั้น |
| **System Role** | meta-role เชิง **บริหาร** มีสิทธิ์จัดการ role/permission/ตั้งค่า **ข้าม product** (governance) |
| **System Default Role** | template ที่ TBC สร้างไว้ให้ — read-only ต่อ tenant, clone ไป custom ได้ |
| **Tenant Custom Role** | Role ที่ tenant สร้างเอง ภายใต้ tenant ตัวเอง |
| **Exception** | กลไก "เลือกทั้งหมดแล้วยกเว้นบางรายการ" บน permission tree |
| **Assignment** | การผูก Role เข้ากับ user — **อยู่นอก module นี้** |

---

## 4. Domain Model

### 4.1 ลำดับชั้น (เทียบ prior art แบบ ZITADEL — ดู References [5][6])
```
Tenant (Organization)
 └── Product (POS / QSC / …)            ← เจ้าของ Permission Catalog
       └── Module (เช่น Promotion, Menu, Bill)
             └── Action (View / Create / Edit / Delete / Void …)

Role  ─ type: PRODUCT  → ผูกกับ 1 Product, ถือ Product Permissions
      └ type: SYSTEM   → ข้าม product, ถือ Platform/Governance Permissions
```
ZITADEL แยกชัดระหว่าง *application-specific roles* (admin/accountant/employee) กับ *manager roles* (IAM_OWNER/ORG_OWNER) — ตรงกับ **Product Role vs System Role** ของเรา [6]

### 4.2 Entities (ระดับ conceptual)

**Permission**
| field | ค่า |
|---|---|
| id | unique |
| productId | POS / QSC / `null` (กรณี platform permission) |
| module | เช่น Promotion |
| action | เช่น Create |
| category | `PRODUCT` หรือ `PLATFORM` |

**Role**
| field | ค่า |
|---|---|
| id | unique |
| name | ไม่ซ้ำภายใน (tenant + product + type) เดียวกัน |
| type | `PRODUCT` \| `SYSTEM` |
| productId | required ถ้า PRODUCT, `null` ถ้า SYSTEM |
| source | `SYSTEM_DEFAULT` \| `CUSTOM` |
| tenantId | `null` ถ้าเป็น System Default (TBC-owned), มีค่าถ้า Custom |
| status | `DRAFT` \| `PUBLISHED` \| `ARCHIVED` |
| grants | รายการ PermissionGrant (ดูหัวข้อ 7) |

---

## 5. Personas & สิทธิ์การใช้ module นี้

| Persona | สร้าง Product Role | สร้าง System Role | แก้ System Default |
|---|---|---|---|
| **TBC Platform Admin** | ✅ (template) | ✅ | ✅ (เจ้าของ) |
| **Tenant Admin / Owner** | ✅ (ใน tenant ตัวเอง) | ❌ (V1) | ❌ (clone ได้เท่านั้น) |

> V1: การสร้าง **System Role** จำกัดที่ระดับ platform (TBC) เพื่อกัน privilege escalation — ทบทวนใน V2 ว่า tenant ควรมี platform-admin ของตัวเองไหม

---

## 6. Design Decisions & Rationale (บันทึกแบบ ADR)

| # | Decision | เลือก | เหตุผล / ผลที่ตามมา |
|---|---|---|---|
| D1 | นิยาม "System Role" | **B — meta-role เชิงบริหาร** | System Role = governance เหนือ IAM ข้าม product (จัดการ role/permission/setting) **ไม่ใช่** สิทธิ์ใช้งานภายใน product · ผลตามมา: ผู้ใช้ที่ต้องใช้งานหลาย product จริง → assign หลาย Product Role (นอก module นี้) **[ดู OQ-2]** |
| D2 | ที่อยู่ของ role definition | **C — สองชั้น** | System Default templates (TBC) + Tenant Custom · multi-tenant RBAC ควร scope ต่อ tenant ไม่ใช่ global [4][7] · สอดคล้อง 3-Layer SaaS |
| D3 | Granularity | **B — Module → Action** | ละเอียดพอใช้จริง ไม่ระเบิดเป็น role explosion · ยึดหลัก permission = หน่วยอะตอม [3] |
| D4 | Exception อยู่ชั้นไหน | **A — definition** | Role นิยามได้ครบในตัว (เช่น "ทุก action ยกเว้น Delete") · ต้อง reconcile กับ Permission Group เดิม **[ดู OQ-1]** |
| D5 | Hierarchy V1 | **A — flat** | ลด complexity การ debug · inheritance (RBAC1 [8]) เลื่อนไป V2 หลัง validate กับ A Ramen |

---

## 7. Permission Catalog Model (Module → Action + Exception)

### 7.1 ตัวอย่าง catalog (ย่อ)
| Product | Module | Actions |
|---|---|---|
| POS | Order/Bill | View, Create, Edit, **Void**, Discount |
| POS | Promotion | View, Create, Edit, Delete |
| POS | Payment | Process, **Refund**, Split |
| POS | Back Office | View Report, Manage Menu, Manage Branch |
| QSC | Ticket/Queue | View, Create, Update Status |
| QSC | Routing/Station | View, Configure |
| *(Platform)* | IAM | **Manage Role**, **Manage Permission**, View Audit |

### 7.2 กลไก Exception (D4=A)
แต่ละ grant ต่อ "node" บน tree (Product/Module) เลือก mode ได้ 2 แบบ:
- `SELECT_SPECIFIC([actions])` — เลือกเฉพาะที่ติ๊ก
- `SELECT_ALL_EXCEPT([excluded_actions])` — เลือกทั้งหมดของ node นั้น แล้ว "ยกเว้น" รายการที่ระบุ

> นี่คือ logic แบบเดียวกับ "Permission Group + Exception" ที่ทีมคุยไว้ (กวาดทั้งหมดแล้ว except) แต่ใช้กับ **permission tree** แทนกลุ่มคน — กรณีเด่น: "ให้ทุก action ใน Promotion **ยกเว้น** Delete"

---

## 8. Functional Requirements (EARS)

> รูปแบบ: `WHEN [trigger] THE SYSTEM SHALL [behavior]` · `WHILE [state] …` · `IF [unwanted] …` · `WHERE [context] …` (ดู References [9][10])

### REQ-001 — สร้าง Product Role
**User Story:** ในฐานะ Admin ฉันต้องการสร้าง Product Role ที่ผูกกับ product เดียว เพื่อจัดกลุ่มสิทธิ์ตามหน้าที่งาน
- THE SYSTEM SHALL อนุญาตให้สร้าง Product Role ที่ผูกกับ **product เดียวเท่านั้น**
- WHEN ผู้ใช้บันทึก role โดยยังไม่เลือก permission ใดเลย THE SYSTEM SHALL เตือน ("role ว่าง") และ **กั้นการ Publish** (อนุญาตให้ Save Draft ได้)
- WHEN ชื่อ role ซ้ำภายใน (tenant + product + type) เดียวกัน THE SYSTEM SHALL ปฏิเสธการบันทึก พร้อมข้อความ duplicate-name

### REQ-002 — สร้าง System Role (D1=B)
**User Story:** ในฐานะ TBC Platform Admin ฉันต้องการสร้าง System Role เพื่อมอบสิทธิ์บริหาร IAM ข้าม product
- WHERE actor เป็น TBC Platform Admin THE SYSTEM SHALL แสดงตัวเลือกสร้าง **System Role** ที่เลือก Platform Permissions ได้ (Manage Role / Manage Permission / View Audit …)
- WHERE actor เป็น Tenant Admin THE SYSTEM SHALL **ซ่อน** การสร้าง System Role (V1)
- THE SYSTEM SHALL **ไม่** อนุญาตให้ System Role ถือ operational permission ของ product (เป็น governance role เท่านั้น)

### REQ-003 — System Default Template (read-only + clone)
**User Story:** ในฐานะ Tenant Admin ฉันต้องการ clone template มาตรฐานมาปรับ เพื่อไม่ต้องเริ่มจากศูนย์
- WHILE role เป็น `SYSTEM_DEFAULT` THE SYSTEM SHALL ตั้งเป็น read-only และ **ปิด** การแก้ permission
- THE SYSTEM SHALL มีปุ่ม "Duplicate to customize" ที่สร้าง Tenant Custom Role (`source=CUSTOM`) จาก template

### REQ-004 — Exception grant (D4=A)
- WHEN ผู้ใช้เลือก "เลือกทั้งหมด" บน module แล้วยกเว้นบาง action THE SYSTEM SHALL บันทึกเป็น `SELECT_ALL_EXCEPT([…])`
- WHEN มีการเพิ่ม action ใหม่เข้า catalog ภายหลัง THE SYSTEM SHALL ให้ role แบบ `SELECT_ALL_EXCEPT` **ได้รับ action ใหม่อัตโนมัติ** (เพราะ intent คือ "ทั้งหมด") — ต้องแจ้งเตือน admin เพื่อทบทวน

### REQ-005 — Draft / Publish gate
- THE SYSTEM SHALL เก็บ role ใน status `DRAFT` จนกว่าจะ Publish
- WHEN ผู้ใช้กด Publish ขณะ role ผ่าน validation THE SYSTEM SHALL เปลี่ยนเป็น `PUBLISHED` และทำให้พร้อม assign (ในอีก module)

### REQ-006 — Edit / Rename
- WHEN ผู้ใช้แก้ permission ของ role ที่ `PUBLISHED` THE SYSTEM SHALL บันทึกเวอร์ชันใหม่และ log การเปลี่ยนแปลง (audit)
- WHEN ผู้ใช้เปลี่ยนชื่อ role ที่ถูก assign อยู่ THE SYSTEM SHALL อนุญาต แต่ SHALL บันทึก audit

### REQ-007 — Delete vs Archive (guard ตาม dependency)
**User Story:** ในฐานะ Admin ฉันต้องการลบ role ที่ไม่ใช้ โดยไม่ทำให้สิทธิ์ของคนที่ถูก assign พัง
- IF role ถูก assign ให้ user ≥ 1 คน (ตามที่ Assignment module รายงาน) THE SYSTEM SHALL **กั้น hard delete** และเสนอ **Archive** แทน
- WHILE role เป็น `ARCHIVED` THE SYSTEM SHALL ไม่ให้ assign ใหม่ แต่ SHALL คง assignment เดิมไว้จนกว่าจะถูกถอด

### REQ-008 — Last-admin protection
- IF การลบ/archive จะทำให้ระบบ **ไม่เหลือ** role ใดที่ถือ `Manage Role` THE SYSTEM SHALL ปฏิเสธ พร้อมอธิบายเหตุผล

### REQ-009 — Tenant isolation
- WHERE actor เป็น Tenant Admin THE SYSTEM SHALL จำกัดการมองเห็น/สร้าง role เฉพาะ tenant ตัวเอง และ SHALL ไม่เปิดเผย role ของ tenant อื่น [4][7]

---

## 9. UX Flows & States

### 9.1 หน้า List (Role Directory)
- คอลัมน์: Role name · Type (Product/System) · Product · Source (Default/Custom) · Status · (จำนวน assignee = read-only จาก Assignment module ถ้ามี)
- Filter: Product, Type, Status · Action: New Role, Duplicate, Archive
- **Empty state:** เสนอ "เริ่มจาก System Default template" เป็นทางลัด

### 9.2 หน้า Create / Edit Role (Wizard สั้น — progressive disclosure)
1. **Basics** — name, description, type (Product → เลือก product) , source
2. **Permissions** — permission tree `Product > Module > Action` + toggle Exception mode ต่อ node
3. **Review** — สรุปสิทธิ์ที่เลือก/ยกเว้น → Save Draft หรือ Publish

> ใช้ pattern step-by-step (Typeform-like) ให้โฟกัสทีละเรื่อง — สอดคล้องกับแนวที่ทีมตกลงสำหรับหน้าอื่น

### 9.3 States ที่ต้องออกแบบ
`Empty` · `Draft` · `Published` · `Archived` · `Read-only (System Default)` · `Validation error (ชื่อซ้ำ / role ว่าง)` · `Delete-blocked (มี assignee)`

---

## 10. Edge Cases & Guards

| กรณี | พฤติกรรมที่คาด |
|---|---|
| ชื่อ role ซ้ำ (scoped) | block + error |
| Role ไม่มี permission | เตือน + กั้น Publish (Draft ได้) |
| ลบ role ที่ถูก assign | block hard delete → เสนอ Archive (REQ-007) |
| ลบ role admin ตัวสุดท้าย | block (REQ-008) |
| แก้ System Default | read-only → ต้อง clone (REQ-003) |
| เพิ่ม action ใหม่เข้า catalog | role `SELECT_ALL_EXCEPT` รับอัตโนมัติ + แจ้งทบทวน (REQ-004) |
| เพิ่ม product ใหม่ | catalog ขยายได้โดยไม่แก้ core (ดู Scope) |

---

## 11. Definition of Done (สรุป)
- ทุก REQ มี acceptance criteria แบบ EARS ที่ test ได้ ✓
- Tenant isolation + last-admin protection ผ่าน test ✓
- Exception (all-except) ทำงานถูกเมื่อ catalog เปลี่ยน ✓
- ไม่มี path ใดใน module นี้ที่ assign role ให้ user ได้ (Non-Goal) ✓

---

## 12. Open Questions & Assumptions

**OQ-1 (ต้อง confirm) — ความสัมพันธ์กับ "Permission Group + Exception" ของพี่โป๊บ**
สมมติฐานปัจจุบัน: module นี้เป็นเจ้าของ **การนิยาม role + permission + exception** ส่วน "Permission Group" ของพี่โป๊บคือ logic ฝั่ง **assignment** (จัดกลุ่มคนแล้ว except) → ทั้งสองไม่ทับกัน ถ้าจริงตาม requirement ที่ว่า module นี้ "สร้างเท่านั้น ไม่ assign" **ต้องยืนยันว่า exception logic ไม่ถูกทำซ้ำ 2 ที่**

**OQ-2 (ต้อง confirm) — System Role เชิงบริหารล้วน (D1=B) เพียงพอไหม**
ถ้าอนาคตมี persona "Group Operational Super-user" (ต้อง *ใช้งานจริง* POS+QSC พร้อมกัน) โมเดลปัจจุบันต้อง assign หลาย Product Role — ยอมรับได้หรือต้องมี composite role (กลับไปทาง D1=A) ใน V2

**A1 (Assumption) — Branch scope = assignment-time**
สมมติว่า "role ใช้ได้สาขาไหน" กำหนดตอน assign (นอก module นี้) ไม่ใช่ property ของ role definition — เพราะ A Ramen เน้น multi-branch/two-way sync ขอให้ยืนยัน

---

## 13. References
1. Auth0 — RBAC (assign roles, not direct-to-user): https://auth0.com/docs/manage-users/access-control/rbac
2. Timus Networks — RBAC key concepts & best practices: https://www.timusnetworks.com/mastering-role-based-access-control-rbac-key-concepts-and-best-practices/
3. Oso — RBAC best practices (atomic permissions, role = bundle): https://www.osohq.com/learn/rbac-best-practices
4. Auth0 — Authorization model for multi-tenant SaaS (per-tenant role scoping): https://auth0.com/blog/how-to-choose-the-right-authorization-model-for-your-multi-tenant-saas-application/
5. ZITADEL — Organizations & Projects (group apps, manage roles across clients): https://zitadel.com/docs/guides/manage/console/organizations-overview
6. ZITADEL — Retrieve user roles (application roles vs manager roles): https://zitadel.com/docs/guides/integrate/retrieve-user-roles
7. Permit.io — Best practices for multi-tenant authorization: https://www.permit.io/blog/best-practices-for-multi-tenant-authorization
8. Pathlock — RBAC comprehensive guide (role hierarchy/inheritance, RBAC0–3): https://pathlock.com/blog/role-based-access-control-rbac/
9. Kiro — Feature Specs & EARS notation (WHEN…THE SYSTEM SHALL): https://kiro.dev/docs/specs/feature-specs/
10. GitHub spec-kit — SDD workflow (requirements/design/tasks + EARS): https://gist.github.com/kehao-chen/22bc28f4c825b5f9af9c5c411f89ba89
