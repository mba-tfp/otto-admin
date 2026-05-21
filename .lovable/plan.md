# POC: Payload CMS vs Strapi for Otto Help Center

## Goal

Pick a self-hostable headless CMS to replace this custom admin app and serve a single content API to three apps (Otto Notes, Onboarding, Fertiwise). Decision criteria: editor UX for mixed-skill team, dev experience extending it, multi-app filtering, self-hosting story on your cloud infra, and how cleanly it handles Otto's existing content shapes (Article + Subtitle + Tips + Steps + Related, FAQ Q&A pairs, What's New).

**Scope of this POC**: stand up both CMSs side by side, model the existing content types, evaluate against the criteria, pick one. **No frontend** (help center consumer site) and **no migration of this admin app's UI**. This app stays running as-is during the POC and gets retired after the winner ships to production.

## Out of scope

- Building the help center frontend (deferred)
- Migrating real content (current data is mock — no users, no live articles)
- Editor training / change management
- SSO, audit logging, advanced workflows (Phase 2 after CMS pick)

## Evaluation criteria (scored 1-5)

| Criterion | Why it matters |
|---|---|
| Editor UX | Mixed technical/non-technical team must be comfortable |
| Custom field UX (FAQ pairs, related articles) | Otto's content has structured nesting; out-of-box vs custom code matters |
| Multi-app API filtering | All three apps query `?app=otto-notes&status=live` |
| Self-hosting on your cloud | Docker + Postgres deployable by your DevOps team |
| Workflow states (Draft/Review/Approved/Live) | Need this without paying for Enterprise |
| Upgrade burden | How painful is the next major version |
| Dev velocity extending it | Adding a new content type, a new field UI |
| Total cost (hosting + licensing + dev hours) | Honest 12-month projection |

## Week 1 — Payload CMS POC

**Day 1: Infra**
- Provision Postgres + a Node container on your cloud (whatever your team uses — ECS/Cloud Run/AKS)
- Deploy Payload via official Docker template
- Point a subdomain at it (e.g. `cms-poc.otto-internal.com`)

**Day 2-3: Content modeling**
Define collections matching `src/data/store.ts`:
- `Article` — title, subtitle, body (richText), apps (relationship to Apps collection), status (select), tipsCallout (group: type + body), steps (array: title + description), relatedArticles (relationship, max 4), videoEmbed, attachments (uploads)
- `FAQ` — title, category, qaPairs (array: question + answer richText), apps, status
- `WhatsNew` — title, body, apps, status, publishDate
- `App` — name (Otto Notes / Onboarding / Fertiwise)
- `User` with role field (Admin / Editor)

**Day 4: Workflow + access control**
- Status field with access rules: Editors can't move to Live, only Admins can
- Draft/published versions enabled per collection

**Day 5: API verification**
- Hit `GET /api/articles?where[apps.name][equals]=Otto Notes&where[status][equals]=live`
- Hit `GET /api/faqs?where[apps.name][equals]=Fertiwise` grouped by category
- Confirm GraphQL endpoint works for the same queries
- Test pagination, sorting, search

## Week 2 — Strapi POC

Same content model, same infra pattern, same API queries. Same person doing both POCs to keep evaluation fair.

**Specific things to stress-test in Strapi**:
- Building the FAQ Q&A pair custom field (this is where Strapi historically struggles vs Payload)
- Workflow states without Enterprise (custom code path)
- Schema-as-config UI vs how it lands in git/PR review
- v5 upgrade path documentation

## Day 11-12: Bake-off

Score both against the criteria table. Concrete artifacts to compare:
- Screen recording of an editor creating an Article with all fields populated
- Time from "new field requested" to "field live in admin" (add a fake `seoDescription` field as the test)
- Lines of code / config to add the FAQ Q&A pair UI
- Page load time of admin with 100 seed articles
- API response time for the multi-app filter query

## Day 13-14: Decision + Phase 2 plan

Pick winner, document why, write Phase 2 plan covering:
- Production hardening (backups, monitoring, SSO if needed)
- Help center frontend project kickoff
- Retirement plan for this admin app
- Editor onboarding

## What Lovable will and won't do here

**Lovable can help with**:
- The eventual help center *frontend* (TanStack Start project consuming the CMS API) — that's exactly what Lovable is built for
- Generating TypeScript types from the CMS schema for the frontend
- Scripts to seed the chosen CMS with test data matching `src/data/store.ts`

**Lovable can't really help with**:
- Operating a self-hosted Node CMS on your infra (that's DevOps work)
- Writing Payload/Strapi plugins (possible but not Lovable's strength)
- The POC evaluation itself — that's a human judgment call on UX and dev feel

## Concrete decision factors

If you're truly torn after the POC, the tiebreaker is usually:
- **Pick Payload if** the team likes TypeScript and codified schemas, you value modern DX, and "rip it out later" matters
- **Pick Strapi if** you'll hire people who already know it, you want the larger plugin ecosystem, and the team prefers UI-driven content modeling

## What this means for *this* repo

Nothing changes during the POC. This admin app keeps running as the demo / mockup. Once the CMS is picked and content is migrated (trivially — it's all seed data), this repo gets archived. The help center frontend would be a new Lovable project.
