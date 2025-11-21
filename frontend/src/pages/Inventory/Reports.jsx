// src/modules/reports/Reports.jsx
import { useInventory } from "../../context/InventoryContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  FileText,
  Package,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  AlertTriangle,
  Clock,
  Box,
  ArrowUp,
  ArrowDown,
  Filter,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  differenceInDays,
} from "date-fns";

export default function Reports() {
  // === SAFE DEFAULTS ===
  const {
    products = [],
    stockLedger = [],
    stockSummary = [],
    warehouses = [],
    loading = false,
  } = useInventory();

  const [activeTab, setActiveTab] = useState("valuation");
  const [dateRange, setDateRange] = useState("last30");
  const [warehouseFilter, setWarehouseFilter] = useState("all");

  // === Date Range Filter ===
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case "today":
        return { start: now, end: now };
      case "last7":
        return { start: subDays(now, 7), end: now };
      case "last30":
        return { start: subDays(now, 30), end: now };
      case "last90":
        return { start: subDays(now, 90), end: now };
      case "thisMonth":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const { start, end } = getDateRange();

  // === 1. STOCK SUMMARY & VALUATION REPORT ===
  const stockValuationReport = useMemo(() => {
    let filteredProducts = products;

    // Apply warehouse filter if needed
    if (warehouseFilter !== "all") {
      const warehouseId = parseInt(warehouseFilter);
      const productIdsInWarehouse = new Set(
        stockSummary
          .filter((s) => s.warehouse_id === warehouseId && s.stock > 0)
          .map((s) => s.product_id)
      );
      filteredProducts = products.filter((p) =>
        productIdsInWarehouse.has(p.id)
      );
    }

    return filteredProducts
      .map((product) => {
        const stockData = stockSummary.filter(
          (s) => s.product_id === product.id
        );
        const totalStock = stockData.reduce((sum, s) => sum + s.stock, 0);
        const totalValue = stockData.reduce((sum, s) => sum + s.value, 0);
        const avgCost = totalStock > 0 ? totalValue / totalStock : 0;

        // Calculate stock across warehouses
        const warehouseStock = warehouses
          .map((wh) => {
            const whStock = stockData.find((s) => s.warehouse_id === wh.id);
            return {
              warehouse: wh.name,
              stock: whStock?.stock || 0,
              value: whStock?.value || 0,
            };
          })
          .filter((ws) => ws.stock > 0);

        return {
          id: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category,
          totalStock,
          totalValue,
          avgCost,
          warehouses: warehouseStock,
          reorderPoint: product.reorder_point,
          minStock: product.min_stock,
          maxStock: product.max_stock,
          isLowStock: totalStock <= product.reorder_point,
        };
      })
      .filter((item) => item.totalStock > 0)
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [products, stockSummary, warehouses, warehouseFilter]);

  const totalInventoryValue = stockValuationReport.reduce(
    (sum, item) => sum + item.totalValue,
    0
  );
  const totalItemsCount = stockValuationReport.reduce(
    (sum, item) => sum + item.totalStock,
    0
  );
  const lowStockCount = stockValuationReport.filter(
    (item) => item.isLowStock
  ).length;

  // === 2. STOCK AGEING ANALYSIS ===
  const stockAgeingAnalysis = useMemo(() => {
    const ageingData = [];
    const now = new Date();

    stockValuationReport.forEach((product) => {
      // Get all receipt transactions for this product
      const receiptTransactions = stockLedger
        .filter(
          (tx) =>
            tx.product_id === product.id &&
            ["purchase_in", "transfer_in", "production_in"].includes(
              tx.transaction_type
            )
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      let remainingStock = product.totalStock;
      const ageingBuckets = {
        "0-30": 0,
        "31-60": 0,
        "61-90": 0,
        "90+": 0,
      };

      for (const tx of receiptTransactions) {
        if (remainingStock <= 0) break;

        const txAge = differenceInDays(now, new Date(tx.created_at));
        const availableQty = Math.min(remainingStock, tx.qty);

        if (txAge <= 30) {
          ageingBuckets["0-30"] += availableQty;
        } else if (txAge <= 60) {
          ageingBuckets["31-60"] += availableQty;
        } else if (txAge <= 90) {
          ageingBuckets["61-90"] += availableQty;
        } else {
          ageingBuckets["90+"] += availableQty;
        }

        remainingStock -= availableQty;
      }

      // Only include products with aged stock
      if (product.totalStock > 0) {
        ageingData.push({
          product: product.name,
          sku: product.sku,
          totalStock: product.totalStock,
          ...ageingBuckets,
          oldestStock:
            receiptTransactions.length > 0
              ? differenceInDays(
                  now,
                  new Date(
                    receiptTransactions[
                      receiptTransactions.length - 1
                    ].created_at
                  )
                )
              : 0,
        });
      }
    });

    return ageingData.sort((a, b) => b.oldestStock - a.oldestStock);
  }, [stockValuationReport, stockLedger]);

  // Ageing summary for chart
  const ageingSummary = useMemo(() => {
    const summary = {
      "0-30": 0,
      "31-60": 0,
      "61-90": 0,
      "90+": 0,
    };

    stockAgeingAnalysis.forEach((item) => {
      summary["0-30"] += item["0-30"];
      summary["31-60"] += item["31-60"];
      summary["61-90"] += item["61-90"];
      summary["90+"] += item["90+"];
    });

    return Object.entries(summary).map(([range, quantity]) => ({
      range,
      quantity,
      percentage: totalItemsCount > 0 ? (quantity / totalItemsCount) * 100 : 0,
    }));
  }, [stockAgeingAnalysis, totalItemsCount]);

  // === 3. MOVEMENT ANALYSIS REPORT ===
  const movementAnalysis = useMemo(() => {
    const movementData = [];
    const dailyMovements = {};

    // Filter transactions by date range
    const periodTransactions = stockLedger.filter((tx) => {
      const txDate = new Date(tx.created_at);
      return txDate >= start && txDate <= end;
    });

    // Daily movement aggregation
    periodTransactions.forEach((tx) => {
      const date = format(new Date(tx.created_at), "MMM dd");
      if (!dailyMovements[date]) {
        dailyMovements[date] = { date, incoming: 0, outgoing: 0, net: 0 };
      }

      if (tx.transaction_type.includes("in")) {
        dailyMovements[date].incoming += tx.qty;
        dailyMovements[date].net += tx.qty;
      } else {
        dailyMovements[date].outgoing += tx.qty;
        dailyMovements[date].net -= tx.qty;
      }
    });

    // Convert to array and sort
    const dailyData = Object.values(dailyMovements).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Product-wise movement
    const productMovements = {};
    periodTransactions.forEach((tx) => {
      const product = products.find((p) => p.id === tx.product_id);
      if (!product) return;

      if (!productMovements[product.id]) {
        productMovements[product.id] = {
          product: product.name,
          sku: product.sku,
          incoming: 0,
          outgoing: 0,
          netMovement: 0,
        };
      }

      if (tx.transaction_type.includes("in")) {
        productMovements[product.id].incoming += tx.qty;
        productMovements[product.id].netMovement += tx.qty;
      } else {
        productMovements[product.id].outgoing += tx.qty;
        productMovements[product.id].netMovement -= tx.qty;
      }
    });

    return {
      dailyData,
      productData: Object.values(productMovements).sort(
        (a, b) => Math.abs(b.netMovement) - Math.abs(a.netMovement)
      ),
      totalIncoming: dailyData.reduce((sum, day) => sum + day.incoming, 0),
      totalOutgoing: dailyData.reduce((sum, day) => sum + day.outgoing, 0),
      netMovement: dailyData.reduce((sum, day) => sum + day.net, 0),
    };
  }, [stockLedger, products, start, end]);

  // === 4. DEAD STOCK IDENTIFICATION ===
  const deadStockReport = useMemo(() => {
    const deadStockThreshold = 90; // Days
    const now = new Date();

    return stockAgeingAnalysis
      .filter(
        (item) => item.oldestStock >= deadStockThreshold && item["90+"] > 0
      )
      .map((item) => {
        const product = products.find((p) => p.name === item.product);
        return {
          ...item,
          currentValue: product
            ? item.totalStock * (product.unit_cost || 0)
            : 0,
          recommendation:
            item.oldestStock > 180
              ? "Consider disposal/discount"
              : "Promote sales",
        };
      })
      .sort((a, b) => b.oldestStock - a.oldestStock);
  }, [stockAgeingAnalysis, products]);

  const totalDeadStockValue = deadStockReport.reduce(
    (sum, item) => sum + item.currentValue,
    0
  );

  // === 5. ABC ANALYSIS ===
  const abcAnalysis = useMemo(() => {
    const sortedByValue = [...stockValuationReport].sort(
      (a, b) => b.totalValue - a.totalValue
    );

    let cumulativeValue = 0;
    const totalValue = sortedByValue.reduce(
      (sum, item) => sum + item.totalValue,
      0
    );

    return sortedByValue.map((item, index) => {
      cumulativeValue += item.totalValue;
      const cumulativePercentage = (cumulativeValue / totalValue) * 100;

      let category = "C";
      if (cumulativePercentage <= 80) {
        category = "A";
      } else if (cumulativePercentage <= 95) {
        category = "B";
      }

      return {
        ...item,
        category,
        cumulativePercentage,
        rank: index + 1,
      };
    });
  }, [stockValuationReport]);

  const abcSummary = useMemo(() => {
    const summary = { A: 0, B: 0, C: 0 };
    const valueSummary = { A: 0, B: 0, C: 0 };

    abcAnalysis.forEach((item) => {
      summary[item.category]++;
      valueSummary[item.category] += item.totalValue;
    });

    return {
      count: summary,
      value: valueSummary,
      percentage: {
        A: (valueSummary.A / totalInventoryValue) * 100,
        B: (valueSummary.B / totalInventoryValue) * 100,
        C: (valueSummary.C / totalInventoryValue) * 100,
      },
    };
  }, [abcAnalysis, totalInventoryValue]);

  // === EXPORT FUNCTIONALITY ===
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((value) =>
            typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value
          )
          .join(",")
      )
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // === CHART COLORS ===
  const COLORS = {
    ageing: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
    abc: ["#EF4444", "#F59E0B", "#10B981"],
    movement: ["#10B981", "#EF4444"],
  };

  // === TABS CONFIGURATION ===
  const tabs = [
    { id: "valuation", label: "Stock Valuation", icon: DollarSign },
    { id: "ageing", label: "Ageing Analysis", icon: Clock },
    { id: "movement", label: "Movement Analysis", icon: TrendingUp },
    { id: "deadstock", label: "Dead Stock", icon: AlertTriangle },
    { id: "abc", label: "ABC Analysis", icon: PieChartIcon },
  ];

  // === Safe Loading ===
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Generating reports...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-teal-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="text-emerald-600" />
            Inventory Analytics & Reports
          </h1>
          <div className="flex gap-3 items-center">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="thisMonth">This Month</option>
            </select>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {format(start, "MMM dd")} - {format(end, "MMM dd")}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${totalInventoryValue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalItemsCount}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-amber-600">
                {lowStockCount}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dead Stock Value</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalDeadStockValue.toLocaleString()}
              </p>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
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

      {/* === STOCK VALUATION REPORT === */}
      {activeTab === "valuation" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Stock Valuation Summary</h3>
              <button
                onClick={() =>
                  exportToCSV(stockValuationReport, "stock-valuation")
                }
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Total Stock</th>
                    <th className="px-4 py-3 text-left">Avg Cost</th>
                    <th className="px-4 py-3 text-left">Total Value</th>
                    <th className="px-4 py-3 text-left">Warehouses</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockValuationReport.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 font-bold">{item.totalStock}</td>
                      <td className="px-4 py-3">${item.avgCost.toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        ${item.totalValue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.warehouses
                          .map((wh) => `${wh.warehouse} (${wh.stock})`)
                          .join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.isLowStock
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.isLowStock ? "Low Stock" : "Adequate"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Value Distribution Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">
              Inventory Value Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockValuationReport.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(2)}`, "Value"]}
                />
                <Bar
                  dataKey="totalValue"
                  fill="#10B981"
                  name="Inventory Value"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* === STOCK AGEING ANALYSIS === */}
      {activeTab === "ageing" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ageing Summary Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">
                Stock Ageing Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ageingSummary}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percentage }) =>
                      `${range} days: ${percentage.toFixed(1)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="quantity"
                  >
                    {ageingSummary.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS.ageing[index % COLORS.ageing.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Units"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Ageing Statistics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">
                Ageing Analysis Summary
              </h3>
              <div className="space-y-4">
                {ageingSummary.map((item, index) => (
                  <div
                    key={item.range}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS.ageing[index] }}
                      ></div>
                      <span className="font-medium">{item.range} days</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.quantity} units</div>
                      <div className="text-sm text-gray-600">
                        {item.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Ageing Report */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Detailed Ageing Analysis</h3>
              <button
                onClick={() => exportToCSV(stockAgeingAnalysis, "stock-ageing")}
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Total Stock</th>
                    <th className="px-4 py-3 text-left">0-30 days</th>
                    <th className="px-4 py-3 text-left">31-60 days</th>
                    <th className="px-4 py-3 text-left">61-90 days</th>
                    <th className="px-4 py-3 text-left">90+ days</th>
                    <th className="px-4 py-3 text-left">Oldest Stock (days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockAgeingAnalysis.slice(0, 20).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{item.product}</p>
                          <p className="text-xs text-gray-500">{item.sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold">{item.totalStock}</td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-600 font-medium">
                          {item["0-30"]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-blue-600 font-medium">
                          {item["31-60"]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-amber-600 font-medium">
                          {item["61-90"]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-red-600 font-medium">
                          {item["90+"]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.oldestStock > 90
                              ? "bg-red-100 text-red-800"
                              : item.oldestStock > 60
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.oldestStock} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === MOVEMENT ANALYSIS === */}
      {activeTab === "movement" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg shadow text-center">
              <p className="text-sm text-gray-600">Total Incoming</p>
              <p className="text-2xl font-bold text-emerald-600">
                {movementAnalysis.totalIncoming}
              </p>
              <div className="flex items-center justify-center gap-1 text-emerald-600 mt-1">
                <ArrowDown className="w-4 h-4" />
                <span className="text-sm">Stock In</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow text-center">
              <p className="text-sm text-gray-600">Total Outgoing</p>
              <p className="text-2xl font-bold text-red-600">
                {movementAnalysis.totalOutgoing}
              </p>
              <div className="flex items-center justify-center gap-1 text-red-600 mt-1">
                <ArrowUp className="w-4 h-4" />
                <span className="text-sm">Stock Out</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow text-center">
              <p className="text-sm text-gray-600">Net Movement</p>
              <p
                className={`text-2xl font-bold ${
                  movementAnalysis.netMovement >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {movementAnalysis.netMovement >= 0 ? "+" : ""}
                {movementAnalysis.netMovement}
              </p>
              <p className="text-sm text-gray-600 mt-1">Overall Change</p>
            </div>
          </div>

          {/* Daily Movement Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Daily Stock Movement</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={movementAnalysis.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="incoming"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="outgoing"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Product Movement Table */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Product Movement Analysis</h3>
              <button
                onClick={() =>
                  exportToCSV(movementAnalysis.productData, "stock-movement")
                }
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Incoming</th>
                    <th className="px-4 py-3 text-left">Outgoing</th>
                    <th className="px-4 py-3 text-left">Net Movement</th>
                    <th className="px-4 py-3 text-left">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movementAnalysis.productData
                    .slice(0, 15)
                    .map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{item.product}</p>
                            <p className="text-xs text-gray-500">{item.sku}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-emerald-600 font-medium">
                          {item.incoming}
                        </td>
                        <td className="px-4 py-3 text-red-600 font-medium">
                          {item.outgoing}
                        </td>
                        <td className="px-4 py-3 font-bold">
                          <span
                            className={
                              item.netMovement >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }
                          >
                            {item.netMovement >= 0 ? "+" : ""}
                            {item.netMovement}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {item.netMovement > 0 ? (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <ArrowUp className="w-4 h-4" />
                              <span className="text-sm">Accumulating</span>
                            </div>
                          ) : item.netMovement < 0 ? (
                            <div className="flex items-center gap-1 text-red-600">
                              <ArrowDown className="w-4 h-4" />
                              <span className="text-sm">Depleting</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              Stable
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === DEAD STOCK REPORT === */}
      {activeTab === "deadstock" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-red-700">
                  Dead Stock Identification
                </h3>
                <p className="text-sm text-gray-600">
                  Items with no movement for 90+ days - Total Value: $
                  {totalDeadStockValue.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => exportToCSV(deadStockReport, "dead-stock")}
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Total Stock</th>
                    <th className="px-4 py-3 text-left">90+ Days Stock</th>
                    <th className="px-4 py-3 text-left">Oldest Stock (days)</th>
                    <th className="px-4 py-3 text-left">Current Value</th>
                    <th className="px-4 py-3 text-left">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deadStockReport.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{item.product}</p>
                          <p className="text-xs text-gray-500">{item.sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold">{item.totalStock}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">
                        {item["90+"]}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          {item.oldestStock} days
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-red-600">
                        ${item.currentValue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.recommendation.includes("disposal")
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.recommendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {deadStockReport.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg">No dead stock identified</p>
                <p className="text-sm">
                  All items have been moving within the last 90 days
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === ABC ANALYSIS === */}
      {activeTab === "abc" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg shadow text-center border-l-4 border-red-500">
              <p className="text-sm text-gray-600">A Items (Top 80% Value)</p>
              <p className="text-2xl font-bold text-red-600">
                {abcSummary.count.A}
              </p>
              <p className="text-lg font-semibold text-red-600">
                {abcSummary.percentage.A.toFixed(1)}% of Total Value
              </p>
              <p className="text-sm text-gray-600 mt-1">High priority items</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow text-center border-l-4 border-amber-500">
              <p className="text-sm text-gray-600">B Items (Next 15% Value)</p>
              <p className="text-2xl font-bold text-amber-600">
                {abcSummary.count.B}
              </p>
              <p className="text-lg font-semibold text-amber-600">
                {abcSummary.percentage.B.toFixed(1)}% of Total Value
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Medium priority items
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow text-center border-l-4 border-emerald-500">
              <p className="text-sm text-gray-600">C Items (Last 5% Value)</p>
              <p className="text-2xl font-bold text-emerald-600">
                {abcSummary.count.C}
              </p>
              <p className="text-lg font-semibold text-emerald-600">
                {abcSummary.percentage.C.toFixed(1)}% of Total Value
              </p>
              <p className="text-sm text-gray-600 mt-1">Low priority items</p>
            </div>
          </div>

          {/* ABC Analysis Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">
              ABC Analysis - Value Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    category: "A Items",
                    value: abcSummary.value.A,
                    count: abcSummary.count.A,
                  },
                  {
                    category: "B Items",
                    value: abcSummary.value.B,
                    count: abcSummary.count.B,
                  },
                  {
                    category: "C Items",
                    value: abcSummary.value.C,
                    count: abcSummary.count.C,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "value" ? `$${value.toLocaleString()}` : value,
                    name === "value" ? "Total Value" : "Item Count",
                  ]}
                />
                <Bar dataKey="value" fill="#8884d8" name="value" />
                <Bar dataKey="count" fill="#82ca9d" name="count" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ABC Analysis Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">ABC Analysis Details</h3>
              <button
                onClick={() => exportToCSV(abcAnalysis, "abc-analysis")}
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Total Value</th>
                    <th className="px-4 py-3 text-left">Cumulative %</th>
                    <th className="px-4 py-3 text-left">ABC Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {abcAnalysis.slice(0, 25).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono">{item.rank}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        ${item.totalValue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {item.cumulativePercentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-bold ${
                            item.category === "A"
                              ? "bg-red-100 text-red-800"
                              : item.category === "B"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.category} Class
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
