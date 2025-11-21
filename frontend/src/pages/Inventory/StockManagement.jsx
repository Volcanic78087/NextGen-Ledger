import React, { useState, useMemo, useEffect } from "react";
import { useInventory } from "../../context/InventoryContext";
import {
  Package,
  History,
  IndianRupee,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Search,
  Calendar,
  Hash,
  Warehouse,
  Box,
  Move,
  RefreshCw,
  FileText,
  Download,
  Filter,
  Plus,
  Minus,
  Truck,
  RotateCcw,
  ShieldAlert,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function StockManagement() {
  const {
    products = [],
    warehouses = [],
    bins = [],
    stockLedger = [],
    stockSummary = [],
    addStockTransaction,
    loading,
    error,
  } = useInventory();

  const [activeTab, setActiveTab] = useState("ledger");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    warehouse: "all",
    transactionType: "all",
    dateRange: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Transaction Forms
  const [txForm, setTxForm] = useState({
    product_id: "",
    warehouse_id: "",
    bin_id: "",
    qty: "",
    unit_cost: "",
    reference_type: "GRN",
    reference_id: "",
    batch_no: "",
    expiry_date: "",
    serial_no: "",
    reason: "",
  });

  const [transferForm, setTransferForm] = useState({
    product_id: "",
    from_warehouse_id: "",
    to_warehouse_id: "",
    from_bin_id: "",
    to_bin_id: "",
    quantity: "",
    batch_no: "",
    serial_no: "",
    notes: "",
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    product_id: "",
    warehouse_id: "",
    bin_id: "",
    quantity: "",
    adjustment_type: "addition",
    reason: "",
    reference: "",
  });

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  // Reset forms
  const resetTxForm = () => {
    setTxForm({
      product_id: "",
      warehouse_id: "",
      bin_id: "",
      qty: "",
      unit_cost: "",
      reference_type: "GRN",
      reference_id: "",
      batch_no: "",
      expiry_date: "",
      serial_no: "",
      reason: "",
    });
  };

  const resetTransferForm = () => {
    setTransferForm({
      product_id: "",
      from_warehouse_id: "",
      to_warehouse_id: "",
      from_bin_id: "",
      to_bin_id: "",
      quantity: "",
      batch_no: "",
      serial_no: "",
      notes: "",
    });
  };

  const resetAdjustmentForm = () => {
    setAdjustmentForm({
      product_id: "",
      warehouse_id: "",
      bin_id: "",
      quantity: "",
      adjustment_type: "addition",
      reason: "",
      reference: "",
    });
  };

  // Get current stock for a product in warehouse
  const getCurrentStock = (productId, warehouseId) => {
    const summary = stockSummary.find(
      (s) => s.product_id === productId && s.warehouse_id === warehouseId
    );
    return summary ? summary.stock : 0;
  };

  // Get available bins for warehouse
  const getBinsForWarehouse = (warehouseId) => {
    return bins.filter((bin) => bin.warehouse_id === parseInt(warehouseId));
  };

  // === COMPUTED VALUES ===
  const filteredLedger = useMemo(() => {
    let filtered = Array.isArray(stockLedger) ? stockLedger : [];

    // Search filter
    if (search) {
      filtered = filtered.filter((t) => {
        const prod = products.find((p) => p.id === t.product_id);
        const term = search.toLowerCase();
        return (
          (prod?.name?.toLowerCase().includes(term) ?? false) ||
          (prod?.sku?.toLowerCase().includes(term) ?? false) ||
          (t.reference?.toLowerCase().includes(term) ?? false) ||
          (t.batch_number?.toLowerCase().includes(term) ?? false)
        );
      });
    }

    // Warehouse filter
    if (filters.warehouse !== "all") {
      filtered = filtered.filter(
        (t) => t.warehouse_id === parseInt(filters.warehouse)
      );
    }

    // Transaction type filter
    if (filters.transactionType !== "all") {
      filtered = filtered.filter(
        (t) => t.transaction_type === filters.transactionType
      );
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter((t) => new Date(t.created_at) >= startDate);
    }

    return filtered.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [stockLedger, products, search, filters]);

  // FIFO Valuation
  const valuation = useMemo(() => {
    const result = [];
    products.forEach((p) => {
      const layers = (Array.isArray(stockLedger) ? stockLedger : [])
        .filter(
          (t) =>
            t.product_id === p.id &&
            ["purchase_in", "transfer_in", "production_in"].includes(
              t.transaction_type
            ) &&
            t.balance > 0
        )
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      let totalQty = 0;
      let totalValue = 0;

      layers.forEach((layer) => {
        const qty = Math.min(layer.balance, layer.qty);
        totalQty += qty;
        totalValue += qty * (layer.unit_cost || 0);
      });

      if (totalQty > 0) {
        result.push({
          ...p,
          qty: totalQty,
          value: totalValue,
          avgCost: totalValue / totalQty,
        });
      }
    });
    return result;
  }, [products, stockLedger]);

  // Weighted Average Valuation
  const weightedAvgValuation = useMemo(() => {
    const result = [];
    products.forEach((p) => {
      const transactions = (
        Array.isArray(stockLedger) ? stockLedger : []
      ).filter((t) => t.product_id === p.id);

      let totalValue = 0;
      let totalQty = 0;

      transactions.forEach((t) => {
        if (
          ["purchase_in", "transfer_in", "production_in"].includes(
            t.transaction_type
          )
        ) {
          totalValue += t.qty * (t.unit_cost || 0);
          totalQty += t.qty;
        }
      });

      if (totalQty > 0) {
        result.push({
          ...p,
          qty: totalQty,
          value: totalValue,
          avgCost: totalValue / totalQty,
          method: "Weighted Average",
        });
      }
    });
    return result;
  }, [products, stockLedger]);

  const grandTotal = useMemo(() => {
    return valuation.reduce((sum, v) => sum + v.value, 0);
  }, [valuation]);

  // Low Stock Alerts
  const lowStockItems = useMemo(() => {
    return products
      .map((p) => {
        const total = (Array.isArray(stockSummary) ? stockSummary : [])
          .filter((s) => s.product_id === p.id)
          .reduce((sum, s) => sum + s.stock, 0);
        return { ...p, currentStock: total };
      })
      .filter(
        (p) => p.currentStock < (p.reorder_point || 0) && p.currentStock > 0
      );
  }, [products, stockSummary]);

  // Expiry Alerts
  const expiryAlerts = useMemo(() => {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + 30);

    return (Array.isArray(stockLedger) ? stockLedger : []).filter(
      (tx) =>
        tx.expiry_date &&
        new Date(tx.expiry_date) <= thresholdDate &&
        tx.balance > 0
    );
  }, [stockLedger]);

  // Batch/Lot Tracking
  const batchTracking = useMemo(() => {
    const batchMap = {};

    (Array.isArray(stockLedger) ? stockLedger : []).forEach((tx) => {
      if (tx.batch_number) {
        const key = `${tx.product_id}-${tx.batch_number}`;
        if (!batchMap[key]) {
          const product = products.find((p) => p.id === tx.product_id);
          batchMap[key] = {
            product_id: tx.product_id,
            product_name: product?.name,
            batch_number: tx.batch_number,
            expiry_date: tx.expiry_date,
            total_qty: 0,
            warehouses: new Set(),
            created_at: tx.created_at,
          };
        }

        if (
          ["purchase_in", "transfer_in", "production_in"].includes(
            tx.transaction_type
          )
        ) {
          batchMap[key].total_qty += tx.qty;
        } else if (
          ["sales_out", "transfer_out", "adjustment_out"].includes(
            tx.transaction_type
          )
        ) {
          batchMap[key].total_qty -= tx.qty;
        }

        if (tx.warehouse_id) {
          batchMap[key].warehouses.add(tx.warehouse_id);
        }
      }
    });

    return Object.values(batchMap).filter((b) => b.total_qty > 0);
  }, [stockLedger, products]);

  // === Safe Loading ===
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">
          Error loading inventory: {error}
        </div>
      </div>
    );
  }

  // === Tabs ===
  const tabs = [
    { id: "ledger", label: "Stock Ledger", icon: History },
    { id: "valuation", label: "Stock Valuation", icon: IndianRupee },
    { id: "transaction", label: "New Transaction", icon: Package },
    { id: "transfer", label: "Stock Transfer", icon: Move },
    { id: "adjustment", label: "Stock Adjustment", icon: RefreshCw },
    { id: "batch", label: "Batch Tracking", icon: Hash },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
  ];

  // === Handle Transaction ===
  const handleTransaction = (type) => {
    const product = products.find((p) => p.id === parseInt(txForm.product_id));
    if (!product) {
      showNotification("Please select a product", "error");
      return;
    }

    const qty = parseInt(txForm.qty);
    const cost = parseFloat(txForm.unit_cost) || 0;

    if (qty <= 0 || isNaN(qty)) {
      showNotification("Please enter a valid quantity", "error");
      return;
    }

    if (type.includes("out")) {
      const currentStock = getCurrentStock(
        product.id,
        parseInt(txForm.warehouse_id)
      );
      if (qty > currentStock) {
        showNotification(
          `Only ${currentStock} units available in selected location`,
          "error"
        );
        return;
      }
    }

    if (!txForm.warehouse_id) {
      showNotification("Please select a warehouse", "error");
      return;
    }

    const tx = {
      product_id: product.id,
      product_name: product.name,
      warehouse_id: parseInt(txForm.warehouse_id),
      bin_id: txForm.bin_id ? parseInt(txForm.bin_id) : null,
      transaction_type: type,
      qty,
      unit_cost: cost,
      reference:
        `${txForm.reference_type}-${txForm.reference_id}`.trim() || null,
      batch_number: txForm.batch_no || null,
      expiry_date: txForm.expiry_date || null,
      serial_number: txForm.serial_no || null,
      notes: txForm.reason || null,
      created_at: new Date().toISOString(),
    };

    try {
      addStockTransaction(tx);
      resetTxForm();
      showNotification(`Stock ${type.replace("_", " ")} recorded successfully`);
    } catch (err) {
      showNotification("Failed to record transaction", "error");
    }
  };

  // Handle Stock Transfer
  const handleTransfer = () => {
    const product = products.find(
      (p) => p.id === parseInt(transferForm.product_id)
    );
    if (!product) {
      showNotification("Please select a product", "error");
      return;
    }

    const qty = parseInt(transferForm.quantity);
    if (qty <= 0 || isNaN(qty)) {
      showNotification("Please enter a valid quantity", "error");
      return;
    }

    if (!transferForm.from_warehouse_id || !transferForm.to_warehouse_id) {
      showNotification(
        "Please select both source and destination warehouses",
        "error"
      );
      return;
    }

    if (transferForm.from_warehouse_id === transferForm.to_warehouse_id) {
      showNotification(
        "Source and destination warehouses cannot be the same",
        "error"
      );
      return;
    }

    // Check source stock
    const sourceStock = getCurrentStock(
      product.id,
      parseInt(transferForm.from_warehouse_id)
    );

    if (qty > sourceStock) {
      showNotification(
        `Only ${sourceStock} units available in source warehouse`,
        "error"
      );
      return;
    }

    const reference = `TRF-${Date.now()}`;

    // Create transfer transaction (out from source)
    const transferOut = {
      product_id: product.id,
      product_name: product.name,
      warehouse_id: parseInt(transferForm.from_warehouse_id),
      bin_id: transferForm.from_bin_id
        ? parseInt(transferForm.from_bin_id)
        : null,
      transaction_type: "transfer_out",
      qty,
      unit_cost: 0,
      reference,
      batch_number: transferForm.batch_no || null,
      serial_number: transferForm.serial_no || null,
      notes: `Transfer to WH-${transferForm.to_warehouse_id}: ${transferForm.notes}`,
      created_at: new Date().toISOString(),
    };

    // Create transfer transaction (in to destination)
    const transferIn = {
      product_id: product.id,
      product_name: product.name,
      warehouse_id: parseInt(transferForm.to_warehouse_id),
      bin_id: transferForm.to_bin_id ? parseInt(transferForm.to_bin_id) : null,
      transaction_type: "transfer_in",
      qty,
      unit_cost: 0,
      reference,
      batch_number: transferForm.batch_no || null,
      serial_number: transferForm.serial_no || null,
      notes: `Transfer from WH-${transferForm.from_warehouse_id}: ${transferForm.notes}`,
      created_at: new Date().toISOString(),
    };

    try {
      addStockTransaction(transferOut);
      addStockTransaction(transferIn);
      resetTransferForm();
      showNotification("Stock transfer completed successfully");
    } catch (err) {
      showNotification("Failed to process transfer", "error");
    }
  };

  // Handle Stock Adjustment
  const handleAdjustment = () => {
    const product = products.find(
      (p) => p.id === parseInt(adjustmentForm.product_id)
    );
    if (!product) {
      showNotification("Please select a product", "error");
      return;
    }

    const qty = parseInt(adjustmentForm.quantity);
    if (qty <= 0 || isNaN(qty)) {
      showNotification("Please enter a valid quantity", "error");
      return;
    }

    if (!adjustmentForm.warehouse_id) {
      showNotification("Please select a warehouse", "error");
      return;
    }

    if (!adjustmentForm.reason) {
      showNotification("Please provide a reason for adjustment", "error");
      return;
    }

    const adjustmentType =
      adjustmentForm.adjustment_type === "addition"
        ? "adjustment_in"
        : "adjustment_out";

    // Check stock availability for deduction
    if (adjustmentType === "adjustment_out") {
      const currentStock = getCurrentStock(
        product.id,
        parseInt(adjustmentForm.warehouse_id)
      );
      if (qty > currentStock) {
        showNotification(
          `Only ${currentStock} units available for deduction`,
          "error"
        );
        return;
      }
    }

    const adjustment = {
      product_id: product.id,
      product_name: product.name,
      warehouse_id: parseInt(adjustmentForm.warehouse_id),
      bin_id: adjustmentForm.bin_id ? parseInt(adjustmentForm.bin_id) : null,
      transaction_type: adjustmentType,
      qty,
      unit_cost: 0,
      reference: adjustmentForm.reference || `ADJ-${Date.now()}`,
      notes: `Stock adjustment: ${adjustmentForm.reason}`,
      created_at: new Date().toISOString(),
    };

    try {
      addStockTransaction(adjustment);
      resetAdjustmentForm();
      showNotification("Stock adjustment processed successfully");
    } catch (err) {
      showNotification("Failed to process adjustment", "error");
    }
  };

  // Export to CSV
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      showNotification("No data to export", "error");
      return;
    }

    try {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers.map((header) => `"${row[header] || ""}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification(`Data exported to ${filename}`);
    } catch (err) {
      showNotification("Failed to export data", "error");
    }
  };

  // Create Purchase Order
  const createPurchaseOrder = (product) => {
    showNotification(`Purchase order created for ${product.name}`, "success");
  };

  // Mark for Disposal
  const markForDisposal = (item) => {
    showNotification(`${item.product_name} marked for disposal`, "success");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-teal-50 to-emerald-50 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === "error"
              ? "bg-red-100 border border-red-300 text-red-800"
              : "bg-emerald-100 border border-emerald-300 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "error" ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Package className="text-emerald-600" />
          Stock Management
        </h1>
        <p className="text-gray-600 mt-1">
          Complete inventory control with FIFO, batch tracking, transfers, and
          reorder alerts
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stock Value</p>
              <p className="text-2xl flex items-center font-bold text-emerald-600">
                <IndianRupee size={18} />
                {grandTotal.toLocaleString()}
              </p>
            </div>
            <IndianRupee className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-amber-600">
                {lowStockItems.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Batches</p>
              <p className="text-2xl font-bold text-blue-600">
                {batchTracking.length}
              </p>
            </div>
            <Hash className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-red-600">
                {expiryAlerts.length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto bg-white rounded-t-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* === STOCK LEDGER TAB === */}
      {activeTab === "ledger" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex items-center gap-3 flex-wrap">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search product, SKU, reference, or batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-64"
            />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <button
              onClick={() => exportToCSV(filteredLedger, "stock_ledger.csv")}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              disabled={filteredLedger.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-4 border-b bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse
                </label>
                <select
                  value={filters.warehouse}
                  onChange={(e) =>
                    setFilters({ ...filters, warehouse: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={filters.transactionType}
                  onChange={(e) =>
                    setFilters({ ...filters, transactionType: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Types</option>
                  <option value="purchase_in">Purchase In</option>
                  <option value="sales_out">Sales Out</option>
                  <option value="transfer_in">Transfer In</option>
                  <option value="transfer_out">Transfer Out</option>
                  <option value="adjustment_in">Adjustment In</option>
                  <option value="adjustment_out">Adjustment Out</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters({ ...filters, dateRange: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Batch/Serial</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">In</th>
                  <th className="px-4 py-3 text-left">Out</th>
                  <th className="px-4 py-3 text-left">Balance</th>
                  <th className="px-4 py-3 text-left">Cost</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-12 text-gray-500"
                    >
                      {search
                        ? "No matching transactions"
                        : "No transactions yet"}
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((t) => {
                    const prod = products.find((p) => p.id === t.product_id);
                    const wh = warehouses.find((w) => w.id === t.warehouse_id);
                    const bin = bins.find((b) => b.id === t.bin_id);
                    return (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(t.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{prod?.name}</p>
                            <p className="text-xs text-gray-500">
                              SKU: {prod?.sku}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {wh?.name} {bin && `→ ${bin.code}`}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {t.batch_number && (
                            <div className="text-xs">
                              <div>Batch: {t.batch_number}</div>
                              {t.expiry_date && (
                                <div className="text-red-600">
                                  Exp:{" "}
                                  {new Date(t.expiry_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              t.transaction_type.includes("in")
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {t.transaction_type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-emerald-600">
                          {t.transaction_type.includes("in") ? t.qty : "-"}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-red-600">
                          {t.transaction_type.includes("out") ? t.qty : "-"}
                        </td>
                        <td className="px-4 py-3 font-bold text-blue-600">
                          {t.balance}
                        </td>
                        <td className="flex items-center px-4 py-3">
                          <IndianRupee size={17} />
                          {(t.unit_cost || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {t.reference}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VALUATION TAB */}
      {activeTab === "valuation" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FIFO Valuation */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-emerald-50">
                <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  FIFO Valuation
                </h3>
                <p className="text-sm text-emerald-600">
                  First-In-First-Out method
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">On Hand</th>
                      <th className="px-4 py-3 text-left">Avg Cost</th>
                      <th className="px-4 py-3 text-left">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {valuation.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-500"
                        >
                          No valuation data available
                        </td>
                      </tr>
                    ) : (
                      valuation.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{v.name}</p>
                              <p className="text-xs text-gray-500">{v.sku}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold">{v.qty}</td>
                          <td className="px-4 py-3">${v.avgCost.toFixed(2)}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">
                            ${v.value.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weighted Average Valuation */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-blue-50">
                <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Weighted Average Valuation
                </h3>
                <p className="text-sm text-blue-600">Average cost method</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">On Hand</th>
                      <th className="px-4 py-3 text-left">Avg Cost</th>
                      <th className="px-4 py-3 text-left">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {weightedAvgValuation.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-500"
                        >
                          No valuation data available
                        </td>
                      </tr>
                    ) : (
                      weightedAvgValuation.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{v.name}</p>
                              <p className="text-xs text-gray-500">{v.sku}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold">{v.qty}</td>
                          <td className="px-4 py-3">${v.avgCost.toFixed(2)}</td>
                          <td className="px-4 py-3 font-bold text-blue-600">
                            ${v.value.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Total Valuation Summary */}
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-xl font-bold text-emerald-800">
                Total Inventory Value (FIFO)
              </span>
              <p className="text-sm text-emerald-600 mt-1">
                Based on oldest stock layers
              </p>
            </div>
            <span className="text-3xl flex items-center space-between font-bold text-emerald-700">
              <IndianRupee size={22} />
              {grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* === TRANSACTION TAB === */}
      {activeTab === "transaction" && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Package className="text-emerald-600" />
            Record Stock Movement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={txForm.product_id}
              onChange={(e) =>
                setTxForm({ ...txForm, product_id: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>

            <select
              value={txForm.warehouse_id}
              onChange={(e) =>
                setTxForm({
                  ...txForm,
                  warehouse_id: e.target.value,
                  bin_id: "",
                })
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={txForm.bin_id}
              onChange={(e) => setTxForm({ ...txForm, bin_id: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={!txForm.warehouse_id}
            >
              <option value="">Select Bin (Optional)</option>
              {getBinsForWarehouse(txForm.warehouse_id).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} ({b.zone})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={txForm.qty}
              onChange={(e) => setTxForm({ ...txForm, qty: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min="1"
            />

            <input
              type="number"
              step="0.01"
              placeholder="Unit Cost"
              value={txForm.unit_cost}
              onChange={(e) =>
                setTxForm({ ...txForm, unit_cost: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min="0"
            />

            <div className="flex gap-2">
              <select
                value={txForm.reference_type}
                onChange={(e) =>
                  setTxForm({ ...txForm, reference_type: e.target.value })
                }
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="GRN">GRN</option>
                <option value="SO">SO</option>
                <option value="ADJ">ADJ</option>
                <option value="PROD">PROD</option>
              </select>
              <input
                placeholder="Reference Number"
                value={txForm.reference_id}
                onChange={(e) =>
                  setTxForm({ ...txForm, reference_id: e.target.value })
                }
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {products.find((p) => p.id === parseInt(txForm.product_id))
              ?.has_batch && (
              <>
                <div className="flex items-center gap-2">
                  <Hash className="text-gray-400" size={20} />
                  <input
                    placeholder="Batch No"
                    value={txForm.batch_no}
                    onChange={(e) =>
                      setTxForm({ ...txForm, batch_no: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-400" size={20} />
                  <input
                    type="date"
                    value={txForm.expiry_date}
                    onChange={(e) =>
                      setTxForm({ ...txForm, expiry_date: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            {products.find((p) => p.id === parseInt(txForm.product_id))
              ?.has_serial && (
              <div className="flex items-center gap-2">
                <Hash className="text-gray-400" size={20} />
                <input
                  placeholder="Serial Number"
                  value={txForm.serial_no}
                  onChange={(e) =>
                    setTxForm({ ...txForm, serial_no: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <input
              placeholder="Reason/Notes"
              value={txForm.reason}
              onChange={(e) => setTxForm({ ...txForm, reason: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2"
            />
          </div>

          <div className="flex gap-3 mt-6 flex-wrap">
            <button
              onClick={() => handleTransaction("purchase_in")}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <ArrowDown className="w-4 h-4" /> Receive (GRN)
            </button>
            <button
              onClick={() => handleTransaction("sales_out")}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <ArrowUp className="w-4 h-4" /> Issue (SO)
            </button>
            <button
              onClick={() => handleTransaction("production_in")}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Package className="w-4 h-4" /> Production In
            </button>
            <button
              onClick={() => handleTransaction("adjustment_in")}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              <Plus className="w-4 h-4" /> Positive Adjustment
            </button>
            <button
              onClick={() => handleTransaction("adjustment_out")}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Minus className="w-4 h-4" /> Negative Adjustment
            </button>
            <button
              onClick={resetTxForm}
              className="flex items-center gap-2 px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset Form
            </button>
          </div>

          {/* Current Stock Display */}
          {txForm.product_id && txForm.warehouse_id && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Current stock for selected product in warehouse:{" "}
                <strong>
                  {getCurrentStock(
                    parseInt(txForm.product_id),
                    parseInt(txForm.warehouse_id)
                  )}
                </strong>{" "}
                units
              </p>
            </div>
          )}
        </div>
      )}

      {/* === STOCK TRANSFER TAB === */}
      {activeTab === "transfer" && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Move className="text-blue-600" />
            Inter-Warehouse Stock Transfer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={transferForm.product_id}
              onChange={(e) =>
                setTransferForm({ ...transferForm, product_id: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>

            <select
              value={transferForm.from_warehouse_id}
              onChange={(e) =>
                setTransferForm({
                  ...transferForm,
                  from_warehouse_id: e.target.value,
                  from_bin_id: "",
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">From Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={transferForm.to_warehouse_id}
              onChange={(e) =>
                setTransferForm({
                  ...transferForm,
                  to_warehouse_id: e.target.value,
                  to_bin_id: "",
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">To Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Transfer Quantity"
              value={transferForm.quantity}
              onChange={(e) =>
                setTransferForm({ ...transferForm, quantity: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
            />

            <select
              value={transferForm.from_bin_id}
              onChange={(e) =>
                setTransferForm({
                  ...transferForm,
                  from_bin_id: e.target.value,
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!transferForm.from_warehouse_id}
            >
              <option value="">From Bin (Optional)</option>
              {getBinsForWarehouse(transferForm.from_warehouse_id).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} ({b.zone})
                </option>
              ))}
            </select>

            <select
              value={transferForm.to_bin_id}
              onChange={(e) =>
                setTransferForm({ ...transferForm, to_bin_id: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!transferForm.to_warehouse_id}
            >
              <option value="">To Bin (Optional)</option>
              {getBinsForWarehouse(transferForm.to_warehouse_id).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} ({b.zone})
                </option>
              ))}
            </select>

            <input
              placeholder="Batch Number (Optional)"
              value={transferForm.batch_no}
              onChange={(e) =>
                setTransferForm({ ...transferForm, batch_no: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              placeholder="Serial Number (Optional)"
              value={transferForm.serial_no}
              onChange={(e) =>
                setTransferForm({ ...transferForm, serial_no: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="Transfer Notes"
              value={transferForm.notes}
              onChange={(e) =>
                setTransferForm({ ...transferForm, notes: e.target.value })
              }
              rows={3}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 md:col-span-2"
            />
          </div>

          {/* Source Stock Info */}
          {transferForm.product_id && transferForm.from_warehouse_id && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Available stock in source warehouse:{" "}
                <strong>
                  {getCurrentStock(
                    parseInt(transferForm.product_id),
                    parseInt(transferForm.from_warehouse_id)
                  )}
                </strong>{" "}
                units
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleTransfer}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Move className="w-4 h-4" /> Execute Transfer
            </button>
            <button
              onClick={resetTransferForm}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset Form
            </button>
          </div>
        </div>
      )}

      {/* === STOCK ADJUSTMENT TAB === */}
      {activeTab === "adjustment" && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <RefreshCw className="text-purple-600" />
            Stock Adjustment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={adjustmentForm.product_id}
              onChange={(e) =>
                setAdjustmentForm({
                  ...adjustmentForm,
                  product_id: e.target.value,
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>

            <select
              value={adjustmentForm.warehouse_id}
              onChange={(e) =>
                setAdjustmentForm({
                  ...adjustmentForm,
                  warehouse_id: e.target.value,
                  bin_id: "",
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={adjustmentForm.adjustment_type}
              onChange={(e) =>
                setAdjustmentForm({
                  ...adjustmentForm,
                  adjustment_type: e.target.value,
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="addition">Stock Addition</option>
              <option value="deduction">Stock Deduction</option>
            </select>

            <input
              type="number"
              placeholder="Adjustment Quantity"
              value={adjustmentForm.quantity}
              onChange={(e) =>
                setAdjustmentForm({
                  ...adjustmentForm,
                  quantity: e.target.value,
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              min="1"
            />

            <select
              value={adjustmentForm.bin_id}
              onChange={(e) =>
                setAdjustmentForm({ ...adjustmentForm, bin_id: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              disabled={!adjustmentForm.warehouse_id}
            >
              <option value="">Select Bin (Optional)</option>
              {getBinsForWarehouse(adjustmentForm.warehouse_id).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} ({b.zone})
                </option>
              ))}
            </select>

            <input
              placeholder="Adjustment Reason"
              value={adjustmentForm.reason}
              onChange={(e) =>
                setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />

            <input
              placeholder="Reference Number"
              value={adjustmentForm.reference}
              onChange={(e) =>
                setAdjustmentForm({
                  ...adjustmentForm,
                  reference: e.target.value,
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Current Stock Info */}
          {adjustmentForm.product_id && adjustmentForm.warehouse_id && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                Current stock:{" "}
                <strong>
                  {getCurrentStock(
                    parseInt(adjustmentForm.product_id),
                    parseInt(adjustmentForm.warehouse_id)
                  )}
                </strong>{" "}
                units
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAdjustment}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <RefreshCw className="w-4 h-4" /> Process Adjustment
            </button>
            <button
              onClick={resetAdjustmentForm}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset Form
            </button>
          </div>
        </div>
      )}

      {/* === BATCH TRACKING TAB === */}
      {activeTab === "batch" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Hash className="text-blue-600" />
              Batch/Lot Tracking
            </h3>
            <button
              onClick={() => exportToCSV(batchTracking, "batch_tracking.csv")}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              disabled={batchTracking.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Batch Number</th>
                  <th className="px-4 py-3 text-left">Expiry Date</th>
                  <th className="px-4 py-3 text-left">Current Stock</th>
                  <th className="px-4 py-3 text-left">Warehouses</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {batchTracking.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      No batch tracking data available
                    </td>
                  </tr>
                ) : (
                  batchTracking.map((batch) => (
                    <tr
                      key={`${batch.product_id}-${batch.batch_number}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{batch.product_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {batch.batch_number}
                      </td>
                      <td className="px-4 py-3">
                        {batch.expiry_date ? (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              new Date(batch.expiry_date) < new Date()
                                ? "bg-red-100 text-red-800"
                                : new Date(batch.expiry_date) <
                                  new Date(
                                    Date.now() + 30 * 24 * 60 * 60 * 1000
                                  )
                                ? "bg-amber-100 text-amber-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {new Date(batch.expiry_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">No expiry</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold">{batch.total_qty}</td>
                      <td className="px-4 py-3 text-sm">
                        {Array.from(batch.warehouses).length} locations
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === ALERTS TAB === */}
      {activeTab === "alerts" && (
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-amber-700">
              <AlertTriangle className="text-amber-600" />
              Items Below Reorder Point
            </h3>
            {lowStockItems.length === 0 ? (
              <p className="text-emerald-600 text-lg">
                All items are above reorder level
              </p>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map((p) => (
                  <div
                    key={p.id}
                    className="bg-amber-50 border border-amber-300 p-5 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-lg">{p.name}</span>
                      <span className="text-sm text-gray-600 ml-3">
                        (Current: <strong>{p.currentStock}</strong> | Reorder:{" "}
                        <strong>{p.reorder_point}</strong>)
                      </span>
                      <p className="text-sm text-amber-700 mt-1">
                        SKU: {p.sku} | Category: {p.category}
                      </p>
                    </div>
                    <button
                      onClick={() => createPurchaseOrder(p)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      Create PO
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expiry Alerts */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-700">
              <Calendar className="text-red-600" />
              Expiring Soon (Next 30 Days)
            </h3>
            {expiryAlerts.length === 0 ? (
              <p className="text-emerald-600 text-lg">
                No items expiring in the next 30 days
              </p>
            ) : (
              <div className="space-y-4">
                {expiryAlerts.map((tx) => {
                  const product = products.find((p) => p.id === tx.product_id);
                  return (
                    <div
                      key={tx.id}
                      className="bg-red-50 border border-red-300 p-5 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-lg">
                          {product?.name}
                        </span>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>
                            Batch: <strong>{tx.batch_number}</strong>
                          </div>
                          <div>
                            Expires:{" "}
                            <strong>
                              {new Date(tx.expiry_date).toLocaleDateString()}
                            </strong>
                          </div>
                          <div>
                            Stock: <strong>{tx.balance}</strong> units
                          </div>
                          <div>
                            Location:{" "}
                            <strong>
                              {
                                warehouses.find((w) => w.id === tx.warehouse_id)
                                  ?.name
                              }
                            </strong>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          markForDisposal({
                            ...tx,
                            product_name: product?.name,
                          })
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Mark for Disposal
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
