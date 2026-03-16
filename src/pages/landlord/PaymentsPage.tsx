import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, getMonthLabel } from "@/lib/business-rules";
import { getMonthRange, toDateInputValue } from "@/lib/date";
import { useDormMutations, useInvoicesForDorm } from "@/hooks/useDormflowData";
import type { PaymentMethod } from "@/types/domain";

const PaymentsPage = () => {
  const { activeMembership } = useAuth();
  const dormId = activeMembership?.dormId;
  const invoicesQuery = useInvoicesForDorm(dormId);
  const mutations = useDormMutations(dormId);

  const [filter, setFilter] = useState<"all" | "paid" | "issued" | "partial" | "overdue">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const invoices = invoicesQuery.data ?? [];
  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        if (filter !== "all" && invoice.status !== filter) return false;
        if (
          searchTerm &&
          !(invoice.tenantName || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(invoice.tenantEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [filter, invoices, searchTerm],
  );

  const totalPending = invoices
    .filter((invoice) => invoice.status !== "paid")
    .reduce((sum, invoice) => sum + invoice.totalAmount - invoice.amountPaid, 0);
  const totalCollected = invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);

  const handleGenerateInvoices = async () => {
    try {
      await mutations.generateInvoices.mutateAsync(getMonthRange().startIso);
      toast.success("Monthly invoices generated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRecordPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedInvoice) return;

    try {
      await mutations.recordPayment.mutateAsync({
        invoiceId: selectedInvoice.id,
        amount: paymentAmount,
        method: paymentMethod,
        paidAt: new Date().toISOString(),
      });
      setSelectedInvoiceId(null);
      setPaymentAmount(0);
      toast.success("Payment recorded");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (invoicesQuery.isLoading) {
    return <LoadingScreen message="Loading invoices..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="page-header">Payments & Invoices</h2>
          <p className="page-subheader">Generate invoices and record manual cash payments.</p>
        </div>
        <button onClick={handleGenerateInvoices} disabled={mutations.generateInvoices.isPending} className="auth-button max-w-fit">
          {mutations.generateInvoices.isPending ? "Generating..." : "Generate this month"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
          <h3 className="text-2xl font-bold text-foreground mt-1 tabular-nums">{formatCurrency(totalCollected)}</h3>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-muted-foreground">Pending</p>
          <h3 className="text-2xl font-bold text-foreground mt-1 tabular-nums">{formatCurrency(totalPending)}</h3>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-muted-foreground">Overdue</p>
          <h3 className="text-2xl font-bold text-destructive mt-1 tabular-nums">
            {invoices.filter((invoice) => invoice.status === "overdue").length} invoices
          </h3>
        </div>
      </div>

      {selectedInvoice ? (
        <form onSubmit={handleRecordPayment} className="stat-card grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-foreground">{selectedInvoice.tenantName}</p>
            <p className="text-sm text-muted-foreground">{getMonthLabel(selectedInvoice.billingMonth)}</p>
          </div>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={paymentAmount}
            onChange={(event) => setPaymentAmount(Number(event.target.value))}
            placeholder="Amount paid"
            className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
          />
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="other">Other</option>
          </select>
          <div className="md:col-span-4 flex gap-2 justify-end">
            <button type="button" onClick={() => setSelectedInvoiceId(null)} className="auth-button-outline px-4">
              Cancel
            </button>
            <button type="submit" disabled={mutations.recordPayment.isPending} className="auth-button px-4">
              {mutations.recordPayment.isPending ? "Saving..." : "Record payment"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by tenant..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full h-10 pl-10 pr-4 border border-input rounded-lg bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "paid", "issued", "partial", "overdue"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${
                filter === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="stat-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 table-header">Tenant</th>
                <th className="px-6 py-3 table-header">Month</th>
                <th className="px-6 py-3 table-header">Rent</th>
                <th className="px-6 py-3 table-header">Meals</th>
                <th className="px-6 py-3 table-header">Total</th>
                <th className="px-6 py-3 table-header">Paid</th>
                <th className="px-6 py-3 table-header">Due Date</th>
                <th className="px-6 py-3 table-header">Status</th>
                <th className="px-6 py-3 table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3.5 text-foreground">
                    <div>
                      <p className="font-medium">{invoice.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.tenantEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{getMonthLabel(invoice.billingMonth)}</td>
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
                  <td className="px-6 py-3.5">
                    {invoice.status !== "paid" ? (
                      <button
                        onClick={() => {
                          setSelectedInvoiceId(invoice.id);
                          setPaymentAmount(invoice.totalAmount - invoice.amountPaid);
                        }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Record payment
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Paid in full</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
