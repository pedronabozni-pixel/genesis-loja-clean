import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { AdminBadge, AdminCard, AdminCardHeader, AdminEmptyState, AdminStatCard } from "@/components/admin/admin-ui";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import { formatAdminCurrency, formatAdminDate, formatAdminDayLabel, getOrderStatusMeta } from "@/lib/admin-format";
import { getDashboardMetricsForPeriod } from "@/lib/order-db";
import type { DashboardMetrics, DashboardPeriod } from "@/types/store";

export const dynamic = "force-dynamic";

const periodOptions: Array<{ value: DashboardPeriod; label: string }> = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "all", label: "All" }
];

function DashboardPeriodSelector({ currentPeriod }: { currentPeriod: DashboardPeriod }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-1">
      {periodOptions.map((option) => {
        const active = option.value === currentPeriod;

        return (
          <Link
            className={
              active
                ? "rounded-xl bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950"
                : "rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            }
            href={option.value === "30d" ? "/admin-loja" : `/admin-loja?period=${option.value}`}
            key={option.value}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

function SalesChart({ metrics }: { metrics: DashboardMetrics }) {
  const width = 640;
  const height = 240;
  const padding = 24;

  if (metrics.salesSeries.length === 0) {
    return <div className="border-t border-zinc-800 p-6 text-sm text-zinc-400">No sales data for the selected period.</div>;
  }

  const maxRevenue = Math.max(...metrics.salesSeries.map((point) => point.revenue), 1);
  const stepX = metrics.salesSeries.length > 1 ? (width - padding * 2) / (metrics.salesSeries.length - 1) : 0;
  const points = metrics.salesSeries.map((point, index) => {
    const x = padding + stepX * index;
    const y = height - padding - ((height - padding * 2) * point.revenue) / maxRevenue;
    return { ...point, x, y };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padding},${height - padding} ${polyline} ${width - padding},${height - padding}`;

  return (
    <div className="border-t border-zinc-800 p-5 md:p-6">
      <svg className="h-auto w-full" viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          <linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(252 211 77 / 0.35)" />
            <stop offset="100%" stopColor="rgb(252 211 77 / 0)" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((step) => {
          const y = padding + ((height - padding * 2) / 3) * step;
          return <line key={step} stroke="rgba(63,63,70,0.7)" strokeDasharray="4 6" strokeWidth="1" x1={padding} x2={width - padding} y1={y} y2={y} />;
        })}
        <polygon fill="url(#sales-fill)" points={area} />
        <polyline fill="none" points={polyline} stroke="rgb(252 211 77)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} fill="rgb(252 211 77)" r="4" />
            <text fill="rgb(161 161 170)" fontSize="11" textAnchor="middle" x={point.x} y={height - 6}>
              {formatAdminDayLabel(point.label)}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {metrics.salesSeries.slice(-3).map((point) => (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4" key={point.label}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{formatAdminDayLabel(point.label)}</p>
            <p className="mt-2 text-lg font-semibold text-zinc-100">{formatAdminCurrency(point.revenue)}</p>
            <p className="mt-1 text-sm text-zinc-400">{point.orders} order{point.orders === 1 ? "" : "s"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminStorePage({
  searchParams
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  noStore();

  const params = searchParams ? await searchParams : undefined;
  const period = params?.period;
  const selectedPeriod: DashboardPeriod =
    period === "7d" || period === "30d" || period === "90d" || period === "all" ? period : "30d";

  const metrics = await getDashboardMetricsForPeriod(selectedPeriod).catch(() => ({
    period: selectedPeriod,
    revenueToday: 0,
    totalSales: 0,
    ordersToday: 0,
    ordersInPeriod: 0,
    averageTicket: 0,
    recentOrders: [],
    topProducts: [],
    salesSeries: []
  }));

  return (
    <StoreAdminShell
      currentPath="/admin-loja"
      description="Acompanhamento executivo da operação da Genesis com visão rápida de receita, pedidos e produtos líderes."
      title="Dashboard"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-400">Use o período para analisar a evolução das vendas e a performance da operação.</p>
          </div>
          <DashboardPeriodSelector currentPeriod={selectedPeriod} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <AdminStatCard detail="Valor total vendido no período selecionado." label="Total sales" value={formatAdminCurrency(metrics.totalSales)} />
          <AdminStatCard detail="Receita aprovada no dia atual." label="Revenue today" value={formatAdminCurrency(metrics.revenueToday)} />
          <AdminStatCard detail="Pedidos registrados no período selecionado." label="Orders in period" value={String(metrics.ordersInPeriod)} />
          <AdminStatCard detail="Valor médio por pedido no recorte de hoje." label="Average ticket" value={formatAdminCurrency(metrics.averageTicket)} />
        </div>

        <AdminCard className="overflow-hidden">
          <AdminCardHeader
            description="Receita distribuída ao longo do período selecionado."
            eyebrow="Sales analytics"
            title="Sales trend"
          />
          <SalesChart metrics={metrics} />
        </AdminCard>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          {metrics.recentOrders.length === 0 ? (
            <AdminEmptyState
              description="Assim que os pedidos entrarem no banco, você verá aqui a fila recente com status e valores."
              title="No recent orders yet"
            />
          ) : (
            <AdminCard className="overflow-hidden">
              <AdminCardHeader
                description="Últimos pedidos registrados pela operação."
                eyebrow="Operations"
                title="Recent Orders"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-800 text-sm">
                  <thead className="bg-zinc-950/80 text-left text-zinc-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Order</th>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {metrics.recentOrders.map((order) => {
                      const status = getOrderStatusMeta(order.fulfillmentStatus);
                      const customerLabel = order.customerName?.trim() || order.customerEmail?.trim() || "Guest customer";
                      return (
                        <tr className="bg-zinc-900/40" key={order.id}>
                          <td className="px-6 py-4 text-zinc-100">#{order.gatewayOrderId || order.id}</td>
                          <td className="px-6 py-4 text-zinc-300">{customerLabel}</td>
                          <td className="px-6 py-4 text-zinc-100">{formatAdminCurrency(order.amountTotal)}</td>
                          <td className="px-6 py-4">
                            <AdminBadge label={status.label} tone={status.tone} />
                          </td>
                          <td className="px-6 py-4 text-zinc-400">{formatAdminDate(order.paidAt ?? order.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          )}

          <AdminCard className="overflow-hidden">
            <AdminCardHeader
              description="Produtos com maior volume agregado no histórico recente."
              eyebrow="Performance"
              title="Top Selling Products"
            />
            {metrics.topProducts.length === 0 ? (
              <div className="border-t border-zinc-800 p-6 text-sm text-zinc-400">Sem vendas registradas ainda.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {metrics.topProducts.map((product, index) => (
                  <div className="flex items-center justify-between gap-4 p-5" key={`${product.productId}-${index}`}>
                    <div>
                      <p className="font-medium text-zinc-100">{product.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">{product.quantitySold} units sold</p>
                    </div>
                    <p className="text-sm font-medium text-zinc-100">{formatAdminCurrency(product.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </StoreAdminShell>
  );
}
