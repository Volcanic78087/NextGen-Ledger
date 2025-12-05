// src/pages/inventory/MaterialLedger.jsx
import { useInventory } from "../../context/InventoryContext";
import {
  Package,
  ArrowDown,
  ArrowUp,
  Move,
  RefreshCw,
  Search,
  Filter,
  Download,
  Calendar,
  Hash,
  IndianRupee,
  AlertTriangle,
  Warehouse,
  Clock,
  FileText,
  ChevronDown,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function MaterialLedger() {
  const {
    stockLedger = [],
    products = [],
    warehouses = [],
    loading = false,
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    product: "all",
    warehouse: "all",
    transactionType: "all",
    dateRange: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced ledger with product & warehouse names
  const enrichedLedger = useMemo(() => {
    return stockLedger.map((tx) => {
      const product = products.find((p) => p.id === tx.product_id);
      const warehouse = warehouses.find((w) => w.id === tx.warehouse_id);
      const bin = warehouse?.bins?.find((b) => b.id === tx.bin_id);

      return {
        ...tx,
        product_name: product?.name || "Unknown Product",
        product_sku: product?.sku || "-",
        warehouse_name: warehouse?.name || "Unknown",
        bin_code: bin?.code || "-",
        value: (tx.qty || 0) * (tx.unit_cost || 0),
      };
    });
  }, [stockLedger, products, warehouses]);

  // Filtering logic
  const filteredLedger = useMemo(() => {
    let filtered = enrichedLedger;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.product_name.toLowerCase().includes(term) ||
          tx.product_sku.toLowerCase().includes(term) ||
          tx.reference?.toLowerCase().includes(term) ||
          tx.batch_number?.toLowerCase().includes(term)
      );
    }

    if (filters.product !== "all") {
      filtered = filtered.filter(
        (tx) => tx.product_id === parseInt(filters.product)
      );
    }
    if (filters.warehouse !== "all") {
      filtered = filtered.filter(
        (tx) => tx.warehouse_id === parseInt(filters.warehouse)
      );
    }
    if (filters.transactionType !== "all") {
      filtered = filtered.filter(
        (tx) => tx.transaction_type === filters.transactionType
      );
    }
    if (filters.dateRange !== "all") {
      const now = new Date();
      let start = new Date();
      switch (filters.dateRange) {
        case "today":
          start.setHours(0, 0, 0, 0);
          break;
        case "week":
          start.setDate(now.getDate() - 7);
          break;
        case "month":
          start.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          start.setMonth(now.getMonth() - 3);
          break;
        case "year":
          start.setFullYear(now.getFullYear() - 1);
          break;
      }
      filtered = filtered.filter((tx) => new Date(tx.created_at) >= start);
    }

    // Sort newest first
    return filtered.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [enrichedLedger, searchTerm, filters]);

  // Summary Stats
  const stats = useMemo(() => {
    const totalIn = filteredLedger
      .filter((t) => t.transaction_type.includes("in"))
      .reduce((sum, t) => sum + t.qty, 0);

    const totalOut = filteredLedger
      .filter((t) => t.transaction_type.includes("out"))
      .reduce((sum, t) => sum + t.qty, 0);

    const totalValue = filteredLedger.reduce((sum, t) => sum + t.value, 0);

    return { totalIn, totalOut, net: totalIn - totalOut, totalValue };
  }, [filteredLedger]);

  // Export to CSV
  const exportCSV = () => {
    const headers = [
      "Date",
      "Product",
      "SKU",
      "Warehouse",
      "Bin",
      "Type",
      "In",
      "Out",
      "Balance",
      "Unit Cost",
      "Value",
      "Batch",
      "Reference",
    ];

    const rows = filteredLedger.map((tx) => [
      new Date(tx.created_at).toLocaleString(),
      tx.product_name,
      tx.product_sku,
      tx.warehouse_name,
      tx.bin_code,
      tx.transaction_type.replace(/_/g, " ").toUpperCase(),
      tx.transaction_type.includes("in") ? tx.qty : "",
      tx.transaction_type.includes("out") ? tx.qty : "",
      tx.balance || "",
      tx.unit_cost || 0,
      tx.value.toFixed(2),
      tx.batch_number || "",
      tx.reference || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `material_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading material ledger...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600" />
            Material Ledger
          </h1>
          <p className="text-gray-600 mt-1">
            Complete transaction history with running balance & cost tracking
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-emerald-600">
                {stats.totalIn.toLocaleString()}
              </p>
            </div>
            <ArrowDown className="w-8 h-8 text-emerald-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Issued</p>
              <p className="text-2xl font-bold text-red-600">
                -{stats.totalOut.toLocaleString()}
              </p>
            </div>
            <ArrowUp className="w-8 h-8 text-red-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Movement</p>
              <p
                className={`text-2xl font-bold ${
                  stats.net >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {stats.net >= 0 ? "+" : ""}
                {stats.net.toLocaleString()}
              </p>
            </div>
            <Move className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value Moved</p>
              <p className="text-2xl font-bold text-indigo-600">
                ₹
                {stats.totalValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <IndianRupee className="w-8 h-8 text-indigo-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="p-4 border-b flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product, SKU, batch, reference..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-5 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product
                </label>
                <select
                  value={filters.product}
                  onChange={(e) =>
                    setFilters({ ...filters, product: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Products</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Warehouse
                </label>
                <select
                  value={filters.warehouse}
                  onChange={(e) =>
                    setFilters({ ...filters, warehouse: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Transaction Type
                </label>
                <select
                  value={filters.transactionType}
                  onChange={(e) =>
                    setFilters({ ...filters, transactionType: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Types</option>
                  <option value="purchase_in">Purchase In</option>
                  <option value="sales_out">Sales Out</option>
                  <option value="transfer_in">Transfer In</option>
                  <option value="transfer_out">Transfer Out</option>
                  <option value="adjustment_in">Adjustment In</option>
                  <option value="adjustment_out">Adjustment Out</option>
                  <option value="production_in">Production In</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters({ ...filters, dateRange: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 3 Months</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() =>
                  setFilters({
                    product: "all",
                    warehouse: "all",
                    transactionType: "all",
                    dateRange: "all",
                  })
                }
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  In
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Out
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Balance
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cost
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Batch / Ref
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-500">
                    {searchTerm ||
                    Object.values(filters).some((f) => f !== "all")
                      ? "No transactions match your filters"
                      : "No transactions recorded yet"}
                  </td>
                </tr>
              ) : (
                filteredLedger.map((tx, idx) => (
                  <tr key={tx.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(tx.created_at).toLocaleDateString()} <br />
                        <span className="text-xs text-gray-500">
                          {new Date(tx.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{tx.product_name}</div>
                        <div className="text-xs text-gray-500">
                          SKU: {tx.product_sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Warehouse className="w-3 h-3 text-gray-400" />
                        {tx.warehouse_name}
                        {tx.bin_code !== "-" && (
                          <span className="text-xs text-gray-500">
                            → {tx.bin_code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          tx.transaction_type.includes("in")
                            ? "bg-emerald-100 text-emerald-800"
                            : tx.transaction_type.includes("out")
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {tx.transaction_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">
                      {tx.transaction_type.includes("in") ? tx.qty : "-"}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-red-600">
                      {tx.transaction_type.includes("out") ? tx.qty : "-"}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-600">
                      {tx.balance || "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      ₹{tx.unit_cost?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-indigo-600">
                      ₹{tx.value.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {tx.batch_number && <div>Batch: {tx.batch_number}</div>}
                      {tx.reference && (
                        <div className="text-xs">Ref: {tx.reference}</div>
                      )}
                      {!tx.batch_number && !tx.reference && "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        {filteredLedger.length > 0 && (
          <div className="p-4 bg-gray-50 border-t text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Showing {filteredLedger.length} transactions</span>
              <span className="font-medium">
                Net Qty:{" "}
                <span
                  className={
                    stats.net >= 0 ? "text-emerald-600" : "text-red-600"
                  }
                >
                  {stats.net}
                </span>{" "}
                | Total Value:{" "}
                <span className="text-indigo-600">
                  ₹{stats.totalValue.toFixed(2)}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
