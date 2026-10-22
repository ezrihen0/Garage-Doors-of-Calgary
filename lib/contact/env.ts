import { siteConfig } from "@/data/siteConfig";

/** Inbox for contact form submissions (override via env in production). */
export function getContactToEmail(): string {
  const configured = process.env.CONTACT_TO_EMAIL?.trim();
  if (configured) {
    return configured;
  }
  return siteConfig.email;
}

/** Documented fallback when `CONTACT_TO_EMAIL` is unset (matches on-site contact email). */
export function getDefaultContactToEmail(): string {
  return siteConfig.email;
}

export function isContactEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.CONTACT_FROM_EMAIL?.trim()
  );
}
