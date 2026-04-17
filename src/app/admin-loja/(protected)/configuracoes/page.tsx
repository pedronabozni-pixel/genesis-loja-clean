import { AdminCard, AdminCardHeader } from "@/components/admin/admin-ui";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";

export default function AdminSettingsPage() {
  const settings = [
    {
      label: "Database",
      value: process.env.DATABASE_URL ? "Connected" : "Local JSON fallback"
    },
    {
      label: "Payments",
      value: process.env.MERCADO_PAGO_ACCESS_TOKEN ? "Mercado Pago configured" : "Pending payment setup"
    },
    {
      label: "Email",
      value: process.env.SMTP_HOST ? "SMTP configured" : "Pending email setup"
    }
  ];

  return (
    <StoreAdminShell
      currentPath="/admin-loja/configuracoes"
      description="Operational settings overview for database, payments, notifications and admin readiness."
      title="Settings"
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminCard>
          <AdminCardHeader
            description="Quick operational read of the main services behind the admin."
            eyebrow="System"
            title="Environment Status"
          />
          <div className="grid gap-4 border-t border-zinc-800 p-5 md:grid-cols-3 md:p-6">
            {settings.map((setting) => (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4" key={setting.label}>
                <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">{setting.label}</p>
                <p className="mt-3 text-lg font-medium text-zinc-100">{setting.value}</p>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader
            description="Current scope delivered in the admin architecture."
            eyebrow="Modules"
            title="Available Surfaces"
          />
          <div className="space-y-3 border-t border-zinc-800 p-5 md:p-6">
            {["Dashboard", "Products", "Orders", "Customers", "Content", "Leads", "Settings"].map((module) => (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-300" key={module}>
                {module}
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </StoreAdminShell>
  );
}
