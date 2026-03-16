import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, getMonthLabel } from "@/lib/business-rules";
import { useInvoicesForMembership } from "@/hooks/useDormflowData";

const MyInvoicesPage = () => {
  const { activeMembership } = useAuth();
  const invoicesQuery = useInvoicesForMembership(activeMembership?.id);

  if (invoicesQuery.isLoading) {
    return <LoadingScreen message="Loading your invoices..." />;
  }

  const invoices = invoicesQuery.data ?? [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="page-header">My Invoices</h2>
        <p className="page-subheader">Rent and meal charges generated from your active assignments and meal toggles.</p>
      </div>

      <div className="stat-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 table-header">Month</th>
                <th className="px-6 py-3 table-header">Rent</th>
                <th className="px-6 py-3 table-header">Meals</th>
                <th className="px-6 py-3 table-header">Total</th>
                <th className="px-6 py-3 table-header">Paid</th>
                <th className="px-6 py-3 table-header">Due Date</th>
                <th className="px-6 py-3 table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-foreground">{getMonthLabel(invoice.billingMonth)}</td>
                  <td className="px-6 py-3.5 text-foreground tabular-nums">{formatCurrency(invoice.rentAmount)}</td>
                  <td className="px-6 py-3.5 text-foreground tabular-nums">{formatCurrency(invoice.mealAmount)}</td>
                  <td className="px-6 py-3.5 font-semibold text-foreground tabular-nums">{formatCurrency(invoice.totalAmount)}</td>
                  <td className="px-6 py-3.5 text-foreground tabular-nums">{formatCurrency(invoice.amountPaid)}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{invoice.dueDate}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={
                        invoice.status === "paid"
                          ? "badge-paid"
                          : invoice.status === "overdue"
                            ? "badge-unpaid"
                            : "badge-pending"
                      }
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          invoice.status === "paid"
                            ? "bg-success"
                            : invoice.status === "overdue"
                              ? "bg-destructive"
                              : "bg-warning"
                        }`}
                      />
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!invoices.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No invoices have been generated yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyInvoicesPage;
