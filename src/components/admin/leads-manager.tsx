"use client";

import { useState } from "react";
import { AdminBadge, AdminCard, AdminCardHeader, AdminEmptyState } from "@/components/admin/admin-ui";
import { formatAdminDate, getLeadStatusMeta } from "@/lib/admin-format";
import type { NewsletterLead } from "@/types/store";

export function LeadsManager({ initialLeads }: { initialLeads: NewsletterLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  async function toggleStatus(email: string, nextStatus: "new" | "contacted") {
    setBusyEmail(email);
    const response = await fetch(`/api/loja-admin/leads/${encodeURIComponent(email)}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    const data = (await response.json()) as { lead?: NewsletterLead };
    setBusyEmail(null);

    if (!response.ok || !data.lead) {
      return;
    }

    setLeads((current) => current.map((lead) => (lead.email === email ? data.lead! : lead)));
  }

  return leads.length === 0 ? (
    <AdminEmptyState
      description="Os próximos contatos captados pela newsletter aparecerão aqui, com status para acompanhamento comercial."
      title="No leads yet"
    />
  ) : (
    <AdminCard className="overflow-hidden">
      <AdminCardHeader
        action={
          <a
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-zinc-600"
            href="/api/loja-admin/leads/export"
          >
            Export CSV
          </a>
        }
        description="Track newsletter signups, update outreach status and export the current pipeline."
        eyebrow="Growth"
        title="Lead Pipeline"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-950/80 text-left text-zinc-500">
            <tr>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {leads.map((lead) => {
              const statusMeta = getLeadStatusMeta(lead.status);
              const busy = busyEmail === lead.email;

              return (
                <tr className="bg-zinc-900/40 transition hover:bg-zinc-900/70" key={`${lead.email}-${lead.createdAt}`}>
                  <td className="px-6 py-4 font-medium text-zinc-100">{lead.email}</td>
                  <td className="px-6 py-4 text-zinc-300">{formatAdminDate(lead.createdAt)}</td>
                  <td className="px-6 py-4">
                    <AdminBadge label={statusMeta.label} tone={statusMeta.tone} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 disabled:opacity-50"
                      disabled={busy}
                      onClick={() => toggleStatus(lead.email, lead.status === "contacted" ? "new" : "contacted")}
                      type="button"
                    >
                      {lead.status === "contacted" ? "Mark as new" : "Mark as contacted"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}
