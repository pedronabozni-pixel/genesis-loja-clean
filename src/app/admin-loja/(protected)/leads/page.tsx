import { AdminCard, AdminStatCard } from "@/components/admin/admin-ui";
import { LeadsManager } from "@/components/admin/leads-manager";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import { getNewsletterLeadsFromDb } from "@/lib/newsletter-db";

export default async function AdminStoreLeadsPage() {
  const leads = await getNewsletterLeadsFromDb();
  const contacted = leads.filter((lead) => lead.status === "contacted").length;
  const fresh = leads.length - contacted;

  return (
    <StoreAdminShell
      currentPath="/admin-loja/leads"
      description="Lead capture module with pipeline status and CSV export for outreach operations."
      title="Leads"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminStatCard detail="Total contacts captured by the newsletter." label="Total leads" value={String(leads.length)} />
          <AdminStatCard detail="Contacts waiting for first touch." label="New leads" value={String(fresh)} />
          <AdminStatCard detail="Contacts already reviewed or actioned." label="Contacted" value={String(contacted)} />
        </div>

        <LeadsManager initialLeads={leads} />
      </div>
    </StoreAdminShell>
  );
}
