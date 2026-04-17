import { AdminBadge, AdminCard, AdminCardHeader, AdminEmptyState, AdminStatCard } from "@/components/admin/admin-ui";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import { formatAdminCurrency, formatAdminDate, getOrderStatusMeta } from "@/lib/admin-format";
import { getDashboardMetrics } from "@/lib/order-db";

export default async function AdminStorePage() {
  const metrics = await getDashboardMetrics().catch(() => ({
    revenueToday: 0,
    ordersToday: 0,
    averageTicket: 0,
    recentOrders: [],
    topProducts: []
  }));

  return (
    <StoreAdminShell
      currentPath="/admin-loja"
      description="Acompanhamento executivo da operação da Genesis com visão rápida de receita, pedidos e produtos líderes."
      title="Dashboard"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminStatCard detail="Receita aprovada no dia atual." label="Revenue today" value={formatAdminCurrency(metrics.revenueToday)} />
          <AdminStatCard detail="Quantidade de pedidos captados hoje." label="Orders today" value={String(metrics.ordersToday)} />
          <AdminStatCard detail="Valor médio por pedido no recorte de hoje." label="Average ticket" value={formatAdminCurrency(metrics.averageTicket)} />
        </div>

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
                      return (
                        <tr className="bg-zinc-900/40" key={order.id}>
                          <td className="px-6 py-4 text-zinc-100">#{order.gatewayOrderId || order.id}</td>
                          <td className="px-6 py-4 text-zinc-300">{order.customerEmail ?? "Guest customer"}</td>
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
