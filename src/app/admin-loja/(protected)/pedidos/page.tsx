import { ManualOrderForm } from "@/components/admin/manual-order-form";
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
      <div className="space-y-6">
        <AdminCard className="overflow-hidden">
          <AdminCardHeader
            description="Cadastre vendas fechadas por WhatsApp, atendimento direto ou qualquer outro canal externo sem depender do checkout."
            eyebrow="Manual sales"
            title="Add External Sale"
          />
          <ManualOrderForm />
        </AdminCard>

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
                    <th className="px-6 py-4 font-medium">Products</th>
                    <th className="px-6 py-4 font-medium">Value</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {orders.map((order) => {
                    const status = getOrderStatusMeta(order.fulfillmentStatus);
                    const customerLabel = order.customerName?.trim() || order.customerEmail?.trim() || "Guest customer";

                    return (
                      <tr className="bg-zinc-900/40 transition hover:bg-zinc-900/70" key={order.id}>
                        <td className="px-6 py-4 font-medium text-zinc-100">#{order.gatewayOrderId || order.id}</td>
                        <td className="px-6 py-4 text-zinc-300">
                          <div>
                            <p className="font-medium text-zinc-100">{customerLabel}</p>
                            {order.customerEmail && order.customerEmail !== customerLabel ? (
                              <p className="mt-1 text-xs text-zinc-500">{order.customerEmail}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-300">
                          <div className="space-y-1">
                            {order.items.length === 0 ? (
                              <span className="text-zinc-500">No items</span>
                            ) : (
                              order.items.slice(0, 2).map((item, index) => (
                                <p key={`${order.id}-${item.name}-${index}`}>
                                  {item.name} <span className="text-zinc-500">x{item.quantity}</span>
                                </p>
                              ))
                            )}
                            {order.items.length > 2 ? <p className="text-xs text-zinc-500">+{order.items.length - 2} more</p> : null}
                          </div>
                        </td>
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
      </div>
    </StoreAdminShell>
  );
}
