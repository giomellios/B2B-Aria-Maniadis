"use client";

import { useState } from "react";
import { Button, Input, Label } from "@/design-system";
import { format } from "@/lib/i18n/dictionaries";

interface Labels {
  name: string;
  company: string;
  message: string;
  send: string;
  sendNote: string;
  subject: string;
}

/**
 * There is no form backend: the form writes the email for the visitor and opens it in their own
 * mail app (a plain mailto link, so it also works with script switched off as a link).
 */
export function MailComposer({ email, labels }: { email: string; labels: Labels }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  const subject = format(labels.subject, { company: company || name || "—" });
  const body = `${message}\n\n${name}\n${company}`.trim();
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        window.location.href = href;
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">{labels.name}</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-company">{labels.company}</Label>
          <Input
            id="contact-company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">{labels.message}</Label>
        <textarea
          id="contact-message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-md bg-field px-3 py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:bg-field-hover focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">
          {labels.send}
        </Button>
        <p className="text-sm text-muted-foreground">{labels.sendNote}</p>
      </div>
    </form>
  );
}
