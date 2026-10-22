import { siteConfig } from "@/data/siteConfig";
import { getContactToEmail, isContactEmailConfigured } from "@/lib/contact/env";
import type { ContactSubmission } from "@/lib/contact/validation";

function formatTrackingBlock(data: ContactSubmission): string[] {
  const lines: string[] = [];
  if (data.utmSource) lines.push(`UTM Source: ${data.utmSource}`);
  if (data.utmMedium) lines.push(`UTM Medium: ${data.utmMedium}`);
  if (data.utmCampaign) lines.push(`UTM Campaign: ${data.utmCampaign}`);
  if (data.gclid) lines.push(`GCLID: ${data.gclid}`);
  if (lines.length === 0) return [];
  return ["", "Campaign / tracking:", ...lines];
}

function formatContactEmail(data: ContactSubmission, submittedAt: string) {
  return [
    `NEW ${siteConfig.businessName.toUpperCase()} CONTACT MESSAGE`,
    "",
    "First Name:",
    data.firstName,
    "",
    "Last Name:",
    data.lastName,
    "",
    "Phone:",
    data.phone,
    "",
    "Address:",
    data.address,
    "",
    "Email:",
    data.email,
    "",
    "Message:",
    data.message,
    "",
    "Submitted:",
    submittedAt,
    "",
    "Source:",
    "Contact Page",
    ...formatTrackingBlock(data),
  ].join("\n");
}

async function sendWithResend(
  data: ContactSubmission,
  submittedAt: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Email provider is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [getContactToEmail()],
      reply_to: data.email,
      subject: `[${siteConfig.businessName} Contact] ${data.firstName} ${data.lastName}`,
      text: formatContactEmail(data, submittedAt),
    }),
  });

  if (!response.ok) {
    let providerBody = "";
    try {
      providerBody = await response.text();
    } catch {
      providerBody = "(unreadable response body)";
    }

    console.error("[contact] Resend rejected the message", {
      status: response.status,
      statusText: response.statusText,
      body: providerBody.slice(0, 2000),
      hasApiKey: Boolean(apiKey),
      hasFromEmail: Boolean(from),
    });

    throw new Error("Email provider rejected the message.");
  }
}

export async function sendContactEmail(data: ContactSubmission) {
  const submittedAt = new Date().toISOString();

  if (!isContactEmailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email provider is not configured.");
    }

    console.info("[contact] Email provider not configured. Development log:");
    console.info(`Would deliver to: ${getContactToEmail()}`);
    console.info(formatContactEmail(data, submittedAt));
    return;
  }

  await sendWithResend(data, submittedAt);
}
