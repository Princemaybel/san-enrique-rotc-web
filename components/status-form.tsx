"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { checkApplicationStatus, type StatusState } from "@/app/status/actions";
import { StatusBadge } from "@/components/ui";

const initialState: StatusState = { ok: false, message: "" };

export function StatusForm() {
  const [state, action] = useActionState(checkApplicationStatus, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-field/10 bg-white p-6 shadow-sm">
      <label className="grid gap-2 text-sm font-black text-field">
        Email
        <input name="email" type="email" className="rounded-md border border-field/20 px-3 py-3 font-normal" required />
      </label>
      <label className="grid gap-2 text-sm font-black text-field">
        Student ID
        <input name="studentId" className="rounded-md border border-field/20 px-3 py-3 font-normal" required />
      </label>
      <SubmitButton />
      {state.message ? <p className={`rounded-md p-3 text-sm font-bold ${state.ok ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>{state.message}</p> : null}
      {state.result ? (
        <section className="rounded-md border border-field/10 bg-mist p-4">
          <p className="font-black text-field">{state.result.fullName}</p>
          <p className="mt-2 text-sm text-field/65">Submitted {new Date(state.result.submittedAt).toLocaleDateString()}</p>
          <div className="mt-3"><StatusBadge status={state.result.status} /></div>
          {state.result.notes ? <p className="mt-3 text-sm text-field/70">{state.result.notes}</p> : null}
        </section>
      ) : null}
    </form>
  );
}

function SubmitButton() {
  const status = useFormStatus();
  return <button disabled={status.pending} className="rounded-md bg-field px-5 py-3 font-black text-white disabled:opacity-60">{status.pending ? "Checking..." : "Check Status"}</button>;
}
