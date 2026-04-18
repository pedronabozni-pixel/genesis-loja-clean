import { AdminCard, AdminCardHeader, AdminEmptyState } from "@/components/admin/admin-ui";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import { formatAdminCurrency, formatRelativeCompactDate } from "@/lib/admin-format";
import { getCustomerSummaries } from "@/lib/order-db";

export default async function AdminCustomersPage() {
  const customers = await getCustomerSummaries();

  return (
    <StoreAdminShell
      currentPath="/admin-loja/clientes"
      description="Customer view generated from order history, with spending, order frequency and recency."
      title="Customers"
    >
      {customers.length === 0 ? (
        <AdminEmptyState
          description="When paid orders are recorded with customer emails, this customer base will populate automatically."
          title="No customers yet"
        />
      ) : (
        <AdminCard className="overflow-hidden">
          <AdminCardHeader
            description="Customer rollup built from historic orders."
            eyebrow="Customers"
            title="Customer Summary"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 text-sm">
              <thead className="bg-zinc-950/80 text-left text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Products purchased</th>
                  <th className="px-6 py-4 font-medium">Total spent</th>
                  <th className="px-6 py-4 font-medium">Orders count</th>
                  <th className="px-6 py-4 font-medium">Last activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {customers.map((customer) => (
                  <tr className="bg-zinc-900/40 transition hover:bg-zinc-900/70" key={customer.id}>
                    <td className="px-6 py-4 font-medium text-zinc-100">{customer.name}</td>
                    <td className="px-6 py-4 text-zinc-300">{customer.email}</td>
                    <td className="px-6 py-4 text-zinc-300">
                      <div className="space-y-1">
                        {customer.purchasedProducts.length === 0 ? (
                          <span className="text-zinc-500">No products recorded</span>
                        ) : (
                          customer.purchasedProducts.slice(0, 3).map((product) => (
                            <p key={`${customer.id}-${product.name}`}>
                              {product.name} <span className="text-zinc-500">x{product.quantity}</span>
                            </p>
                          ))
                        )}
                        {customer.purchasedProducts.length > 3 ? (
                          <p className="text-xs text-zinc-500">+{customer.purchasedProducts.length - 3} more</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-100">{formatAdminCurrency(customer.totalSpent)}</td>
                    <td className="px-6 py-4 text-zinc-300">{customer.ordersCount}</td>
                    <td className="px-6 py-4 text-zinc-400">{formatRelativeCompactDate(customer.lastOrderAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </StoreAdminShell>
  );
}
