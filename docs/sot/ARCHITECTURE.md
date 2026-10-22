# JDM Architecture

Owner: technical architecture and layer boundaries.

This repository is the **JDM Reference Implementation — Garage Door Vertical**. Future trade sites clone this foundation. They do not share a runtime, database, or monorepo with it.

---

## 1. Three layers

### A. JDM Core

Shared across every JDM website. Clone the implementation; do not redesign it per trade.

| Responsibility | Where it lives today |
| --- | --- |
| Brand lockup | `/public/images/jdm-header-logo.png`, `Header`, `FooterBottom` |
| Design tokens | `app/globals.css` `@theme` |
| Typography | `app/layout.tsx` (`DM_Sans`, `Barlow_Condensed`) |
| Header / sticky call | `components/layout/Header.tsx`, `MobileStickyCall.tsx` |
| Footer chrome | `components/layout/Footer.tsx`, `footer/*` |
| Navigation architecture | `data/navigation.ts` + Header (Home / Services / Contact) |
| Layout primitives | `components/ui/Section.tsx`, `Button.tsx` |
| CTA pattern | `components/home/FinalCTA.tsx` (structure); copy is vertical |
| Contact form + API | `components/contact/ContactForm.tsx`, `app/api/contact/route.ts`, `lib/contact/*` |
| Accessibility | skip link, focus rings, `sr-only` labels, tap targets |
| Stack | Next.js 15 App Router, React 19, Tailwind v4, TypeScript |
| Deploy unit | One independent Next app per vertical |

Core must stay trade-agnostic. If a file in Core names a trade, that is a leak (see coupling audit).

### B. Vertical Configuration

Facts that change per trade but are structured, not prose.

| Responsibility | Where it lives today |
| --- | --- |
| Business + contact | `data/siteConfig.ts` |
| Service areas | `data/siteConfig.ts` + `data/serviceAreas.ts` |
| Nav labels/hrefs | `data/navigation.ts` (labels are generic today) |
| Homepage service cards | `data/services.ts` |
| `/services` categories | `data/serviceOverview.ts` |
| Footer service list | `data/footerServices.ts` |
| Metrics | `data/metrics.ts` (experience, hours, and radius derived from `siteConfig`) |
| Domain / canonical host | `getSiteUrl()` → `NEXT_PUBLIC_SITE_URL` with localhost fallback; `metadataBase` + page `alternates.canonical` |
| Sitemap / robots | `app/sitemap.ts`, `app/robots.ts` (indexable paths from `data/navigation.ts`) |
| Email delivery | `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, optional `CONTACT_TO_EMAIL` (defaults to `siteConfig.email`) |

There is **no** `vertical.json` or config engine yet. These TypeScript modules are the current stand-in. The desired contract is in [VERTICAL_SCHEMA.md](./VERTICAL_SCHEMA.md).

### C. Vertical Content & Assets

Trade-specific prose and media.

| Responsibility | Where it lives today |
| --- | --- |
| Hero copy + image paths | `data/home.ts` (`homeHero`) |
| Final CTA copy | `data/home.ts` (`homeFinalCta`) |
| Homepage services intro | `data/home.ts` (`homeServices`) |
| `/services` banner heading + image paths | `data/serviceOverview.ts` (`servicesBanner`) |
| Why Choose Us copy + photo | `data/whyChooseUs.ts` |
| Before/after pairs + section copy | `data/beforeAfter.ts` |
| Page metadata | `siteConfig.seo` via trade-agnostic helpers; page files read `seo.pages.*` |
| Structured data | `components/seo/LocalBusinessSchema.tsx` (reads config; no trade `@type`) |
| Images | `public/images/**` |

---

## 2. What this is not

Do not evolve this SoT into:

- multi-tenant SaaS
- a CMS or theme engine
- a plugin / site-builder
- a shared production monorepo
- a database-backed content platform

Each launched site remains a **separate, understandable Next.js app**. Shared improvements are evaluated and copied deliberately (see Template versioning).

---

## 3. Shared vs replaceable matrix

Based on this repository, not a hypothetical platform.

| Area | Shared (Core) | Vertical-specific | On clone |
| --- | --- | --- | --- |
| Next.js App Router, TS, Tailwind v4 | Yes | Package name | Keep stack; rename package |
| Design tokens / fonts | Yes | No | Keep |
| Header architecture (fixed bar, logo slot, `|` nav, sticky call) | Yes | Phone label via config | Keep architecture |
| Header logo file | Yes (JDM lockup) | No | Keep unless brand changes |
| Footer chrome (gradient, 3 panels) | Yes | Lists + contact | Replace list content |
| Navigation architecture | Yes | Labels/hrefs if a trade needs extra items | Usually keep Home / Services / Contact |
| `Section`, `Button`, icons | Yes | No | Keep |
| Hero **component** | Yes (layout, responsive image pair) | Headline, body, image paths | Replace content/assets; keep shell |
| Homepage services **grid** | Yes | Card count, titles, images | Replace `data/services.ts` + images |
| `/services` **overview** | Yes (scroll sections, not tabs) | Category count, copy, images, panel tones | Replace `data/serviceOverview.ts` + images |
| Before/after | Optional Core module | Pairs and photos | Replace or omit if the trade has no visual before/after |
| Why Choose Us | Yes (layout) | Reasons + photo | Replace data + image |
| Final CTA **shell** | Yes | Headline / supporting line | Replace copy |
| Contact form + `/api/contact` | Yes | `to` email, error phone, subject prefix | Keep code; verify env + `siteConfig` |
| LocalBusiness JSON-LD | Framework | Name, geo, phone, (later) `@type` / services | Rewrite values |
| Metadata helpers | Framework (`getMetadataTitle` / `getMetadataDescription` return `siteConfig.seo`) | Title/description/OG strings | Replace `siteConfig.seo` values |
| Domain / `metadataBase` | `getSiteUrl()` | `NEXT_PUBLIC_SITE_URL` | Must set per domain |
| `public/images` trade photos | No | Yes | Must replace |
| `app/robots.ts` / `sitemap.ts` | Yes | Host from `getSiteUrl()`; paths from nav | Keep files; replace origin via env |
| Analytics IDs | None today | Per property | Add per site if used |
| Phone / email | Shared JDM unless a trade has its own line | Values in `siteConfig` | Verify, do not assume identical |

---

## 4. How close the codebase is to the contract

**Supported today (duplicate the files, change the values):**

- Contact, hours, areas, CTAs, SEO strings — `data/siteConfig.ts`
- Homepage hero / services intro / final CTA — `data/home.ts`
- Homepage cards, overview categories + banner, footer list — three intentional catalogs
- Generic nav + sitemap paths — `data/navigation.ts`
- Form fields, rate limit, and API error phone — Core + `siteConfig`
- `sitemap.ts` / `robots.ts` / page canonicals

**Still vertical identity of this instance (expected, not a Core leak):**

- Package/folder name `garage-door-website`
- Overview panel tones and fade were designed around this vertical’s three panels; the UI still accepts 2–n categories
- `LocalBusiness` has no trade-specific `@type` or offer catalog (optional later)

Do **not** build a configuration engine. Clone the app and replace `data/*` + assets.

---

## 5. Garage Door coupling audit

### Correct vertical content

Expected to change on clone. Evidence:

| Finding | File |
| --- | --- |
| Homepage hero headline/body/image paths | `data/home.ts` (`homeHero`) |
| Services grid copy, alts, `futureRoute` slugs (`/garage-door-*-calgary`) | `data/services.ts` |
| Overview categories, items, alts | `data/serviceOverview.ts` |
| Footer service names | `data/footerServices.ts` |
| Why Choose Us garage copy | `data/whyChooseUs.ts` |
| Before/after alts and paths | `data/beforeAfter.ts` |
| Final CTA headline/body | `data/home.ts` (`homeFinalCta`) |
| Homepage services intro | `data/home.ts` (`homeServices`) |
| `/services` banner heading + paths | `data/serviceOverview.ts` (`servicesBanner`) |
| Tagline / service label / metadata strings | `data/siteConfig.ts` (`seo`, `tagline`, `serviceLabel`) |
| OG image | `siteConfig.seo.ogImage` (currently the hero desktop file) |
| Package name | `package.json` → `garage-door-website` |

### Should become configuration

Resolved for Template v1. Remaining optional (not required to clone):

| Finding | File | Notes |
| --- | --- | --- |
| Email subject prefix | `lib/contact/sendContactEmail.ts` | Brand-level `[JDM Contact]` is OK; add vertical name later |
| Schema `@type` / `hasOfferCatalog` | `LocalBusinessSchema.tsx` | Still generic `LocalBusiness` |
| `NEXT_PUBLIC_SITE_URL` | `getSiteUrl()` | Required per deployed domain; localhost fallback is local-only |

Authoritative facts:

- Experience: `siteConfig.experience` → metrics value + why-us title
- Radius: `siteConfig.serviceAreas.radius` → metrics value
- Hours badge: `siteConfig.hoursLabel`
- Phone: `phoneDisplay` / `phoneTel` → `getPhoneHref()`; API errors use `phoneDisplay`

### Core architecture leak

None remaining in reusable Core logic. Historical leaks (metadata helpers, API phone, inlined hero/CTA/banner copy) now live in `data/*`.

Still note (content, not Core):

| Finding | File | Classification |
| --- | --- | --- |
| `futureRoute` slugs encode `garage-door` + `calgary` | `data/services.ts` | Vertical content; must not be linked until pages exist |
| Repo/package identity | `package.json` | This instance’s name; rename on clone |

Not leaks (correctly generic):

- `Header` / `Footer` structure
- `ContactForm` field set
- `primaryNavigation` labels
- `Button`, `Section`, tokens
- `getPhoneHref()` / `getMailtoHref()`

Phone `(587) 215-1911`, email `jdmsolutionscalgary@gmail.com`, and Calgary-area names are **vertical/config values**, not Core leaks, unless a future trade uses different contact — then they are configuration, not architecture.

No analytics property IDs exist in the repo today.

---

## 6. Replication blockers (current)

None for Template v1. Remaining clone work is content, not architecture:

1. Three service catalogs are **intentionally separate** (homepage cards vs overview categories vs footer labels). Clones must fill all three; do not auto-merge.
2. `LocalBusiness` schema is generic — optional specialty `@type` later.
3. Package/folder name is this vertical’s identity — rename on clone.

---

## 7. Template versioning

**Current stamp:** `JDM Web Template v1`

Every future site’s SoT or README must record:

```text
origin: JDM Web Template v1
origin_commit: <git sha of the approved reference>
vertical: <slug>
```

Shared improvements (header, form, tokens) are **evaluated**, then copied into other sites only if:

1. The change is Core (not vertical content).
2. It does not require a content rewrite.
3. Lint, typecheck, and build pass on the receiving site.
4. A human approves the port.

Do not build automatic sync. Traceability first.

When Core changes land here, bump the template only after the Garage Door reference is approved (e.g. `v1.1`). Downstream sites note the version they last absorbed.

---

## 8. Readiness verdict

This repository is the sealed **JDM Web Template v1**, instantiated as the Garage Door vertical. Clone it by following [REPLICATION_RUNBOOK.md](./REPLICATION_RUNBOOK.md). Replace `data/*` and assets; do not edit Core components for trade copy.
