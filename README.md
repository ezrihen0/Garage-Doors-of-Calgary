# JDM Solution — Garage Door Website

Next.js 15 (App Router) marketing site for **JDM Solution** (Calgary garage door repair, installation, and maintenance).

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Contact form email delivery

Submissions from `/contact` are sent to a serverless API route (`POST /api/contact`), validated on the server, and delivered by email via [Resend](https://resend.com).

| Protection / behavior | Implementation |
| --- | --- |
| Server-side validation | `lib/contact/validation.ts` |
| Honeypot | Hidden `website` field; bots that fill it get a silent success |
| Rate limit | 5 POSTs per IP per 15 minutes (`lib/contact/rateLimit.ts`) |
| Reply-To | Visitor’s email address |
| UI states | Sending, field errors, success screen, generic error with phone fallback |

### Environment variables

Copy `.env.example` to `.env.local` and set values for local testing. On Vercel (or your host), set the same variables in the project settings. **Do not commit real secrets.**

| Variable | Required | Description |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes (production) | Resend API key (`re_…`) |
| `CONTACT_FROM_EMAIL` | Yes (production) | Verified sender, e.g. `JDM Solution <notifications@yourdomain.com>` |
| `CONTACT_TO_EMAIL` | No | Destination inbox. If unset, defaults to **`jdmsolutionscalgary@gmail.com`** (`siteConfig.email` in `data/siteConfig.ts`) |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public origin for SEO (`metadataBase`, sitemap, robots). Defaults to `http://localhost:3000` in dev |

In **development**, if `RESEND_API_KEY` or `CONTACT_FROM_EMAIL` is missing, the API still returns success and logs the message (and intended recipient) to the server console instead of calling Resend.

In **production**, missing email configuration returns HTTP 502 so misconfiguration is visible.

### How to test

1. **Local without Resend** — Start `npm run dev`, submit the form at `/contact`. Expect “Message Sent” and a log block in the terminal including `Would deliver to: …`.
2. **Local with Resend** — Add `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` to `.env.local` (use a verified domain or Resend’s onboarding sender for testing). Submit the form; check the inbox configured by `CONTACT_TO_EMAIL` or the default above.
3. **API directly** — `curl -X POST http://localhost:3000/api/contact -H 'Content-Type: application/json' -d '{"firstName":"Test","lastName":"User","phone":"5875551234","address":"123 Main St","email":"you@example.com","message":"Hello","website":""}'`
4. **Honeypot** — Send a non-empty `website` field; expect `{"ok":true}` with no email sent.
5. **Production** — Deploy with all required env vars set, submit once on `/contact`, confirm delivery and that “Reply” in your mail client addresses the visitor.

## Project docs

Vertical and architecture notes live under [`docs/sot/`](docs/sot/README.md).
