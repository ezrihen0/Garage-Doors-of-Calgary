"use client";

import { useMemo, useState, type FormEvent, type HTMLAttributes } from "react";
import { siteConfig, getPhoneHref } from "@/data/siteConfig";
import {
  ADDRESS_MAX,
  EMAIL_MAX,
  MESSAGE_MAX,
  NAME_MAX,
  PHONE_MAX,
  PHONE_REGEX,
  EMAIL_REGEX,
  type ContactField,
  type ContactTracking,
} from "@/lib/contact/validation";
import { cn } from "@/lib/cn";

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  email: string;
  message: string;
  website: string;
};

type SubmitStatus = "idle" | "sending" | "sent" | "error";

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  email: "",
  message: "",
  website: "",
};

const fieldLabels: Record<ContactField, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  phone: "Phone",
  address: "Address",
  email: "Email",
  message: "Message",
};

const fieldPlaceholders: Record<ContactField, string> = {
  firstName: "FIRST NAME",
  lastName: "LAST NAME",
  phone: "PHONE",
  address: "ADDRESS",
  email: "EMAIL",
  message: "MESSAGE",
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-red-300">
      {message}
    </p>
  );
}

export function ContactForm({ tracking }: { tracking: ContactTracking }) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>(
    {}
  );
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const submitLabel = useMemo(() => {
    if (status === "sending") return "Sending...";
    if (status === "sent") return "Message Sent";
    return "Send Message";
  }, [status]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field !== "website") {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const validateClient = () => {
    const nextErrors: Partial<Record<ContactField, string>> = {};
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!firstName) nextErrors.firstName = "First name is required.";
    if (!lastName) nextErrors.lastName = "Last name is required.";
    if (!phone) nextErrors.phone = "Phone is required.";
    else if (!PHONE_REGEX.test(phone) || phone.length < 10) {
      nextErrors.phone = "Enter a phone number using digits only.";
    }
    if (!address) nextErrors.address = "Address is required.";
    if (!email) nextErrors.email = "Email is required.";
    else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!message) nextErrors.message = "Message is required.";

    return nextErrors;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending" || status === "sent") return;

    const nextErrors = validateClient();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setStatus("sending");
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          address: form.address,
          email: form.email,
          message: form.message,
          website: form.website,
          ...tracking,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        errors?: Partial<Record<ContactField, string>>;
      } | null;

      if (response.ok && result?.ok) {
        setStatus("sent");
        return;
      }

      if (result?.errors) {
        setErrors(result.errors);
        setStatus("idle");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-md border border-cta/40 bg-black/20 px-5 py-8 text-center">
        <p className="font-display text-lg font-bold uppercase tracking-[0.16em] text-cta">
          Message Sent
        </p>
        <p className="mt-4 text-base leading-relaxed text-neutral-light">
          Thank you. {siteConfig.businessName} received your message and will
          get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website ?? ""}
          onChange={(event) => updateField("website", event.target.value)}
        />
      </div>

      {status === "error" && (
        <p className="rounded-md border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm leading-relaxed text-red-100">
          Something went wrong. Please try again or call{" "}
          <a href={getPhoneHref()} className="font-semibold text-cta underline">
            {siteConfig.phoneDisplay}
          </a>
          .
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Field
          id="firstName"
          label={fieldLabels.firstName}
          placeholder={fieldPlaceholders.firstName}
          autoComplete="given-name"
          maxLength={NAME_MAX}
          value={form.firstName ?? ""}
          error={errors.firstName}
          onChange={(value) => updateField("firstName", value)}
        />
        <Field
          id="lastName"
          label={fieldLabels.lastName}
          placeholder={fieldPlaceholders.lastName}
          autoComplete="family-name"
          maxLength={NAME_MAX}
          value={form.lastName ?? ""}
          error={errors.lastName}
          onChange={(value) => updateField("lastName", value)}
        />
      </div>

      <Field
        id="phone"
        label={fieldLabels.phone}
        placeholder={fieldPlaceholders.phone}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        maxLength={PHONE_MAX}
        value={form.phone ?? ""}
        error={errors.phone}
        onChange={(value) =>
          updateField("phone", value.replace(/\D/g, "").slice(0, PHONE_MAX))
        }
      />

      <Field
        id="address"
        label={fieldLabels.address}
        placeholder={fieldPlaceholders.address}
        autoComplete="street-address"
        maxLength={ADDRESS_MAX}
        value={form.address ?? ""}
        error={errors.address}
        onChange={(value) => updateField("address", value)}
      />

      <Field
        id="email"
        label={fieldLabels.email}
        placeholder={fieldPlaceholders.email}
        type="email"
        autoComplete="email"
        maxLength={EMAIL_MAX}
        value={form.email ?? ""}
        error={errors.email}
        onChange={(value) => updateField("email", value)}
      />

      <div>
        <label htmlFor="message" className="sr-only">
          {fieldLabels.message}
        </label>
        <textarea
          id="message"
          name="message"
          placeholder={fieldPlaceholders.message}
          required
          maxLength={MESSAGE_MAX}
          rows={8}
          value={form.message ?? ""}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={cn(
            "contact-input contact-input-message resize-y",
            errors.message && "border-red-400/70"
          )}
          onChange={(event) => updateField("message", event.target.value)}
        />
        <FieldError id="message-error" message={errors.message} />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-md bg-cta px-6 py-3.5 font-display text-sm font-bold uppercase tracking-[0.14em] text-primary shadow-sm transition-all hover:brightness-105 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-8"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  placeholder,
  value,
  error,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
}: {
  id: ContactField;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        maxLength={maxLength}
        value={value ?? ""}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn("contact-input", error && "border-red-400/70")}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
