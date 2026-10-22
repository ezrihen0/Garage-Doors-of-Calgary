# Replication Runbook

Owner: the deterministic process for producing another JDM trade website.

A future agent given “Create the JDM Windows website from the canonical JDM template” follows this file. It does not invent architecture. It does not build a platform.

**Prerequisite:** start from an approved `JDM Web Template v1` commit of this repository. Replace `data/*` and assets. Do not put trade copy back into Core components.

---

## 0. Template stamp

Every cloned repo records:

```text
origin: JDM Web Template v1
origin_commit: <sha>
vertical: <slug>
```

Put this in the clone’s `docs/sot/README.md` (or project README). Do not claim a newer template version than the source commit.

---

## Process

### 1. Start from the approved reference

| | |
| --- | --- |
| **Input** | Approved git SHA of the Garage Door reference (or sealed Template v1). Vertical slug. |
| **Files** | New independent repo/folder. `package.json` `name`. |
| **Validation** | Clone builds: `npm run lint`, `npx tsc --noEmit`, `npm run build`. |
| **Failure** | Source is not the approved SHA; build is already red; work proceeds inside the live Garage Door repo. |

Do not convert this into a monorepo. One Next app per trade.

---

### 2. Create / define the vertical

| | |
| --- | --- |
| **Input** | Completed [VERTICAL_SCHEMA.md](./VERTICAL_SCHEMA.md) checklist (identity, services, area, contact, SEO, CTA, assets). |
| **Files** | Working notes only. No `vertical.json` engine yet. |
| **Validation** | Instantiation gate in VERTICAL_SCHEMA §4 is fully filled. Windows / Locks / Decks-style service lists are honest (2–n overview categories). |
| **Failure** | Missing domain, services, or assets. Inventing a third fake category to match Garage Door. |

---

### 3. Configure domain and identity

| | |
| --- | --- |
| **Input** | `identity.name`, `slug`, `domain`, `businessName`. |
| **Files** | `.env` / host env: `NEXT_PUBLIC_SITE_URL`. `app/layout.tsx` `metadataBase`. `package.json` name. `data/siteConfig.ts` business/tagline fields. |
| **Validation** | `metadataBase` origin equals the new domain. Package name is not `garage-door-website`. |
| **Failure** | Old host remains in env, layout, or comments used for deploy. |

---

### 4. Define the service catalog

| | |
| --- | --- |
| **Input** | `homepageCards[]`, `overviewCategories[]`, `footerList[]`. |
| **Files** | `data/services.ts`, `data/serviceOverview.ts`, `data/footerServices.ts`. Optional: drop unused `futureRoute` values. |
| **Validation** | Three lists agree on what the company actually sells. No previous-trade nouns. Overview count is 2–n. `futureRoute` is not linked in UI. |
| **Failure** | Garage card titles left in place. Footer lists springs/cables on a non-door trade. Categories invented only to keep three panels. |

---

### 5. Replace trade-specific content

| | |
| --- | --- |
| **Input** | Hero, services intro, why-us, final CTA, metrics honesty, contact heading. |
| **Files** | `data/home.ts`, `data/siteConfig.ts`, `data/whyChooseUs.ts`, `data/metrics.ts` (derived facts), `data/beforeAfter.ts` (or remove the homepage section). Do not edit Core component TSX for copy. |
| **Validation** | Contamination scan (step 9) finds no previous trade in user-facing strings. Why-us/metrics claims are true for this trade. |
| **Failure** | “Garage Door Problems?” or equivalent leftover. False “same-day” / radius claims. |

---

### 6. Replace responsive assets

| | |
| --- | --- |
| **Input** | Files satisfying [ASSETS.md](./ASSETS.md) required slots. |
| **Files** | `public/images/**` except Core logo. Data `image` / `imageAlt` / dimensions. `siteConfig.seo.ogImage`. |
| **Validation** | Every referenced path exists. Hero 2-up and banner 3-up are real files. Unused previous photos deleted. |
| **Failure** | Broken `next/image` paths. Garage photography still referenced. Banner/hero subject clipped at 360 or 1280. |

---

### 7. Configure contact / conversion

| | |
| --- | --- |
| **Input** | Phone, email, hours, CTAs, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, optional `CONTACT_TO_EMAIL`. |
| **Files** | `data/siteConfig.ts`, `data/navigation.ts` if labels change, env. API already reads `siteConfig.phoneDisplay`. |
| **Validation** | `tel:` href matches `phoneTel`. Form POST succeeds in a test send. Sticky header call and Final CTA use the same number. Email arrives at the intended inbox. |
| **Failure** | Previous phone/email remain in `siteConfig`. Form 500 because env is missing. |

---

### 8. Configure SEO and structured data

| | |
| --- | --- |
| **Input** | `seo.title`, `seo.description`, OG image, `areaServed`, optional specialty `@type`. |
| **Files** | `data/siteConfig.ts` `seo.*`. Sitemap/robots pick up the new origin via `getSiteUrl()`. Schema values come from `siteConfig`. |
| **Validation** | View-source titles/descriptions contain the new trade + city + brand only. JSON-LD `url`, `telephone`, `address`, `areaServed` match config. Sitemap/robots use the new origin. |
| **Failure** | “Garage Door” in title/description/OG/JSON-LD. Sitemap still lists the old host. |

---

### 9. Previous-trade contamination scan

Mandatory. Search the clone (source + `public/`) for the **previous** vertical’s terms.

Minimum query set when leaving this Garage Door reference:

```text
garage
garage-door
garage door
Garage Door
jdmsolutionscalgary          # only if email changes
(587) 215-1911               # only if phone changes
calgary                      # only if city changes — review, do not blind-delete
hero-background              # confirm file is new photography
door-before / spring.jpg / cable.jpg / opener.jpg / rollers.jpg
/garage-door-
garage-door-website
```

Classify hits:

- **Correct Core brand** (JDM lockup, company legal name) — keep.
- **Correct shared contact** (same phone/email/city) — keep only if the new vertical truly shares them; still **recorded** in the vertical contract.
- **Previous trade content** — must be gone.

| | |
| --- | --- |
| **Input** | Previous vertical name, domain, phone, email, distinctive service nouns, image filenames. |
| **Files** | Entire clone except `node_modules`, `.next`. |
| **Validation** | Zero unintended hits. Intended shared JDM facts are listed in the review notes. |
| **Failure** | Any previous trade noun in metadata, schema, UI, alts, email templates, or image paths still in use. |

Later this scan should be a script (see § Launch validation).

---

### 10. Lint / type / build

| | |
| --- | --- |
| **Input** | Clean working tree after content/asset edits. |
| **Files** | Whole app. |
| **Validation** | `npm run lint` · `npx tsc --noEmit` · `npm run build` all exit 0. |
| **Failure** | Any red check. Do not deploy. |

---

### 11. Responsive QA

| | |
| --- | --- |
| **Input** | Production build or equivalent preview. |
| **Files** | None (manual). Viewports in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md): 360, 390, ~768, ~1024, 1440, 1920. |
| **Validation** | Header does not overflow at 360 (`scrollWidth === clientWidth`). Nav + Call remain on one row. Hero/banner subjects readable. `/`, `/services`, `/contact` exercised. Phone and form CTAs work. No horizontal scroll. |
| **Failure** | Overflow, clipped logo, unreadable hero type, broken `tel:` or form, `/services` order not heading → image → copy → list on small screens. |

---

### 12. Review

| | |
| --- | --- |
| **Input** | Diff against the origin SHA + contamination notes + QA notes. |
| **Files** | Human review of copy, photography, contact, SEO. |
| **Validation** | Reviewer confirms Core chrome unchanged except intentional ports; vertical contract matches the live pages. |
| **Failure** | Unapproved Core redesign, leftover trade, or dishonest claims. |

---

### 13. Deploy only after approval

| | |
| --- | --- |
| **Input** | Written approval. Env vars on the host. DNS for `identity.domain`. |
| **Files** | Host config only (`NEXT_PUBLIC_SITE_URL`, Resend). |
| **Validation** | Production URLs match sitemap/canonical. Form test on production. robots/sitemap reachable. |
| **Failure** | Deploy without step 9–12. Wrong `SITE_URL`. Form still pointing at a personal or previous inbox. |

---

## Launch validation (mandatory)

A new trade must not launch until all of the following are true.

| Check | How | Automatable later |
| --- | --- | --- |
| No previous trade name remains (unintended) | ripgrep over source + public | Yes — deny-list scan |
| No previous domain remains | ripgrep + env review | Yes — deny-list + `metadataBase` assert |
| No previous phone/email remains **unintentionally** | ripgrep; allowlist if shared | Yes — with allowlist file |
| No previous service names remain | Compare data files to contract | Partial (string list) |
| No previous SEO metadata remains | Read layout + page `metadata` + helpers | Yes — fixture strings |
| No previous structured data remains | Render JSON-LD / read schema component | Yes |
| No previous image references remain | ripgrep `/images/` + delete unused files | Yes — unused-file + deny-list |
| Contact form routes correctly | POST `/api/contact` test | Yes — integration test |
| CTA links work | Click `/#final-cta`, `/contact` | Partial (href unit test) |
| Phone links work | `getPhoneHref()` === `tel:+1…` | Yes |
| Responsive images exist | Every `src` on disk | Yes |
| Sitemap / robots / canonical correct | Fetch `/sitemap.xml`, `/robots.txt`, check origin | Yes (after files exist) |
| Lint passes | `npm run lint` | Yes |
| Type check passes | `npx tsc --noEmit` | Yes |
| Production build passes | `npm run build` | Yes |
| Responsive QA passes | Manual viewport pass | Partial (Playwright later) |

Until those scripts exist, the human runbook **is** the gate.

---

## What not to do

- Do not add a CMS, theme engine, or shared runtime.
- Do not keep both trades in one app.
- Do not auto-sync Core from this repo into live sites.
- Do not launch with `futureRoute` 404s linked in the UI.
- Do not copy Garage Door overview tones/copy because “the template has three panels.”
