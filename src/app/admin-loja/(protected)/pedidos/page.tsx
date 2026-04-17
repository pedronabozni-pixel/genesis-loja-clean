import { AdminBadge, AdminCard, AdminCardHeader, AdminEmptyState } from "@/components/admin/admin-ui";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import { formatAdminCurrency, formatAdminDate, getOrderStatusMeta } from "@/lib/admin-format";
import { getOrders } from "@/lib/order-db";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <StoreAdminShell
      currentPath="/admin-loja/pedidos"
      description="Pedidos organizados por cliente, valor, status operacional e data para facilitar acompanhamento."
      title="Orders"
    >
      {orders.length === 0 ? (
        <AdminEmptyState
          description="Quando os pedidos começarem a entrar, esta tabela mostrará os eventos de compra e o status operacional."
          title="No orders yet"
        />
      ) : (
        <AdminCard className="overflow-hidden">
          <AdminCardHeader
            description="Basic operations table for payments and fulfillment progression."
            eyebrow="Orders"
            title="Orders Table"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 text-sm">
              <thead className="bg-zinc-950/80 text-left text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Value</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.map((order) => {
                  const status = getOrderStatusMeta(order.fulfillmentStatus);
                  return (
                    <tr className="bg-zinc-900/40 transition hover:bg-zinc-900/70" key={order.id}>
                      <td className="px-6 py-4 font-medium text-zinc-100">#{order.gatewayOrderId || order.id}</td>
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
    </StoreAdminShell>
  );
}
