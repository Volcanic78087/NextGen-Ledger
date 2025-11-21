// src/pages/dashboard/InventoryDashboard.jsx
import { useMemo, useState } from "react";
import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  IndianRupee,
  Plus,
  Truck,
  History,
  BarChart3,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Users,
  ShoppingCart,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useInventory } from "../../context/InventoryContext";
import { format } from "date-fns";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Color constants for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function InventoryDashboard() {
  const {
    orders,
    stockLedger = [],
    products = [],
    warehouses = [],
  } = useInventory();

  const [dateRange, setDateRange] = useState("7d"); // 7d, 30d, 90d
  const [searchTerm, setSearchTerm] = useState("");

  // Enhanced KPIs
  const stats = useMemo(() => {
    const totalItems = stockLedger.reduce((sum, t) => sum + t.balance, 0);
    const totalValue = stockLedger.reduce(
      (sum, t) => sum + t.balance * t.unit_cost,
      0
    );

    const lowStockItems = products.filter((p) => {
      const stock = stockLedger
        .filter((s) => s.product_id === p.id)
        .reduce((sum, s) => sum + s.balance, 0);
      return stock < p.reorder_point;
    });

    const negativeStock = stockLedger.filter((s) => s.balance < 0).length;

    const expiringSoon = stockLedger.filter(
      (s) =>
        s.expiry_date &&
        new Date(s.expiry_date) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    // Calculate stock turnover ratio
    const totalCOGS = stockLedger
      .filter((t) => t.transaction_type.includes("out"))
      .reduce((sum, t) => sum + t.qty_out * t.unit_cost, 0);

    const avgInventoryValue = totalValue;
    const turnoverRatio =
      avgInventoryValue > 0 ? (totalCOGS / avgInventoryValue).toFixed(2) : 0;

    return {
      totalItems,
      totalValue,
      lowStock: lowStockItems.length,
      lowStockItems,
      negativeStock,
      expiringSoon,
      turnoverRatio,
    };
  }, [stockLedger, products]);

  // Filtered Stock Trend
  const stockTrend = useMemo(() => {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;

    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return format(date, "MMM dd");
    }).reverse();

    return dates.map((day) => {
      const dayTransactions = stockLedger.filter(
        (t) => format(new Date(t.created_at), "MMM dd") === day
      );
      const incoming = dayTransactions.reduce((sum, t) => sum + t.qty_in, 0);
      const outgoing = dayTransactions.reduce((sum, t) => sum + t.qty_out, 0);

      return {
        day,
        incoming,
        outgoing,
        net: incoming - outgoing,
      };
    });
  }, [stockLedger, dateRange]);

  //Enhanced Top Products
  const topProducts = useMemo(() => {
    const productMap = {};

    stockLedger.forEach((t) => {
      if (t.balance > 0) {
        const prod = products.find((p) => p.id === t.product_id);
        if (prod) {
          if (!productMap[prod.id]) {
            productMap[prod.id] = {
              name: prod.name,
              value: 0,
              quantity: 0,
              category: prod.category,
            };
          }
          productMap[prod.id].value += t.balance * t.unit_cost;
          productMap[prod.id].quantity += t.balance;
        }
      }
    });

    return Object.values(productMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [stockLedger, products]);

  //Category Distribution
  const categoryData = useMemo(() => {
    const categoryMap = {};

    stockLedger.forEach((t) => {
      if (t.balance > 0) {
        const prod = products.find((p) => p.id === t.product_id);
        if (prod && prod.category) {
          categoryMap[prod.category] =
            (categoryMap[prod.category] || 0) + t.balance * t.unit_cost;
        }
      }
    });

    return Object.entries(categoryMap).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [stockLedger, products]);

  // Filtered Recent Transactions
  const recentTx = useMemo(() => {
    let filtered = stockLedger;

    if (searchTerm) {
      filtered = filtered.filter((t) => {
        const prod = products.find((p) => p.id === t.product_id);
        return prod?.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filtered
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8)
      .map((t) => {
        const prod = products.find((p) => p.id === t.product_id);
        const wh = warehouses.find((w) => w.id === t.warehouse_id);
        return {
          ...t,
          product_name: prod?.name || "Unknown",
          warehouse_name: wh?.name || "Unknown",
          category: prod?.category || "Uncategorized",
        };
      });
  }, [stockLedger, products, warehouses, searchTerm]);

  // Quick Actions
  const quickActions = [
    {
      icon: Plus,
      label: "New Purchase",
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => console.log("Create PO"),
    },
    {
      icon: Truck,
      label: "Receive GRN",
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => console.log("Receive GRN"),
    },
    {
      icon: Package,
      label: "Stock Adjust",
      color: "bg-orange-600 hover:bg-orange-700",
      onClick: () => console.log("Stock Adjustment"),
    },
    {
      icon: BarChart3,
      label: "View Reports",
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => console.log("View Reports"),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header with Search */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Inventory Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time overview of stock, value, and alerts
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalValue)}
              </p>
              <p className="text-xs text-gray-500">
                {stats.totalItems.toLocaleString()} items
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.lowStock}
              </p>
              <p className="text-xs text-gray-500">Needs attention</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Turnover Ratio</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.turnoverRatio}x
              </p>
              <p className="text-xs text-gray-500">Efficiency</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.expiringSoon}
              </p>
              <p className="text-xs text-gray-500">Within 30 days</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <History className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Negative Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.negativeStock}
              </p>
              <p className="text-xs text-gray-500">Requires adjustment</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center justify-center gap-3 p-4 ${action.color} text-white rounded-xl transition-all transform hover:scale-105 active:scale-95`}
          >
            <action.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stock Movement Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Stock Movement
            </h3>
            <div className="flex gap-2 text-xs">
              {["7d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded-full ${
                    dateRange === range
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="incoming"
                stroke="#10b981"
                strokeWidth={2}
                name="Incoming"
                dot={{ fill: "#10b981" }}
              />
              <Line
                type="monotone"
                dataKey="outgoing"
                stroke="#ef4444"
                strokeWidth={2}
                name="Outgoing"
                dot={{ fill: "#ef4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Inventory by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row - Top Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              Top Products by Value
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <div className="p-4">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(product.value)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.quantity} units
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              Recent Stock Transactions
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTx.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t.product_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.warehouse_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          t.transaction_type.includes("in")
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {t.transaction_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`font-medium ${
                          t.qty_in > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.qty_in > 0 ? `+${t.qty_in}` : `-${t.qty_out}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(t.created_at), "MMM dd, HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
