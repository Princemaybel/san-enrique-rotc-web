"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { submitContact, type ContactState } from "@/app/contact/actions";

const initialState: ContactState = { ok: false, message: "" };

const inputClasses =
  "w-full rounded-md border border-field/20 bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder:text-slate/50 transition-colors focus:border-field focus:outline-none focus:ring-2 focus:ring-field/15";

export function ContactForm() {
  const [state, action] = useActionState(submitContact, initialState);

  return (
    <form action={action} className="grid gap-5 rounded-xl border border-field/10 bg-white p-6 shadow-card md:p-8" noValidate>
      <div className="border-b border-field/10 pb-4">
        <h3 className="text-lg font-bold text-charcoal">Send an Official Inquiry</h3>
        <p className="mt-1 text-xs text-slate">All messages are stored securely in Supabase and reviewed by ROTC command staff.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-charcoal">
          Full Name
          <input
            name="name"
            type="text"
            placeholder="e.g. Juan dela Cruz"
            className={inputClasses}
            required
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-charcoal">
          Email Address
          <input
            name="email"
            type="email"
            placeholder="e.g. juan@example.com"
            className={inputClasses}
            required
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium text-charcoal">
        Subject
        <input
          name="subject"
          type="text"
          placeholder="e.g. Inquiries regarding ROTC Requirements"
          className={inputClasses}
          required
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-charcoal">
        Message
        <textarea
          name="message"
          rows={5}
          placeholder="Type your message or inquiry here..."
          className={`${inputClasses} resize-y`}
          required
        />
      </label>

      <SubmitButton />

      {state.message ? (
        <div
          role="alert"
          className={`rounded-md border p-3.5 text-sm font-medium ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {state.message}
        </div>
      ) : null}
    </form>
  );
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      disabled={status.pending}
      type="submit"
      className="inline-flex items-center justify-center gap-2 rounded-md bg-field px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-forest hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {status.pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
          Sending Message...
        </>
      ) : (
        <>
          <Send className="h-4 w-4" aria-hidden="true" />
          Submit Message
        </>
      )}
    </button>
  );
}
