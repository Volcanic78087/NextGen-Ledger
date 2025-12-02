import React, { useState } from "react";
import {
  BarChart2,
  DollarSign,
  PieChart,
  ClipboardList,
  TrendingUp,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useFinance } from "../../context/FinanceContext";

const CostAccounting = () => {
  const [activeTab, setActiveTab] = useState("costCenters");
  const { costCenters, setCostCenters, formatCurrency } = useFinance();

  const tabs = [
    { id: "costCenters", label: "Cost Centers", icon: ClipboardList },
    { id: "allocation", label: "Cost Allocation", icon: DollarSign },
    { id: "abc", label: "Activity-Based Costing", icon: PieChart },
    { id: "profitability", label: "Profitability Analysis", icon: TrendingUp },
    { id: "reports", label: "Reports & KPIs", icon: BarChart2 },
  ];

  // Profitability data — could be fetched from context or API
  const profitData = [
    { product: "Product A", revenue: 200000, cost: 150000 },
    { product: "Product B", revenue: 180000, cost: 120000 },
    { product: "Product C", revenue: 150000, cost: 100000 },
    { product: "Product D", revenue: 220000, cost: 160000 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      // 📊 Cost Centers Tab
      case "costCenters":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Manage Cost Centers</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between mb-4">
                <input
                  type="text"
                  placeholder="Search cost centers..."
                  className="border rounded-md p-2 w-1/3"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                  <Plus size={18} /> Add Cost Center
                </button>
              </div>

              <table className="w-full text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Code</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Department</th>
                    <th className="p-2 border">Manager</th>
                    <th className="p-2 border">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {costCenters.map((cc) => (
                    <tr key={cc.id}>
                      <td className="p-2 border">{`CC${cc.id
                        .toString()
                        .padStart(3, "0")}`}</td>
                      <td className="p-2 border">{cc.name}</td>
                      <td className="p-2 border">{cc.department || "—"}</td>
                      <td className="p-2 border">{cc.manager || "—"}</td>
                      <td className="p-2 border text-blue-600">
                        {formatCurrency(cc.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // ⚙️ Cost Allocation Tab
      case "allocation":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cost Allocation</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="mb-2 text-gray-700">
                Allocate shared or overhead costs between departments.
              </p>
              <div className="flex gap-3 mb-4">
                <select className="border p-2 rounded-md w-1/3">
                  <option>Select Source Center</option>
                  {costCenters.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
                <select className="border p-2 rounded-md w-1/3">
                  <option>Select Target Center</option>
                  {costCenters.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  className="border p-2 rounded-md w-1/4"
                />
                <button className="bg-green-600 text-white px-4 rounded-md">
                  Allocate
                </button>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recent Allocations</h3>
                <ul className="list-disc ml-6 text-gray-700">
                  <li>IT Services → Production ({formatCurrency(5000)})</li>
                  <li>Admin → Marketing ({formatCurrency(2000)})</li>
                </ul>
              </div>
            </div>
          </div>
        );

      // 🧾 Activity-Based Costing
      case "abc":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Activity-Based Costing
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-700 mb-4">
                Assign indirect costs to products based on key activities.
              </p>
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Activity</th>
                    <th className="p-2 border">Driver</th>
                    <th className="p-2 border">Rate</th>
                    <th className="p-2 border">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">Machine Setup</td>
                    <td className="p-2 border"># of Setups</td>
                    <td className="p-2 border">
                      {formatCurrency(100)} / setup
                    </td>
                    <td className="p-2 border">{formatCurrency(8000)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">Quality Inspection</td>
                    <td className="p-2 border"># of Inspections</td>
                    <td className="p-2 border">
                      {formatCurrency(50)} / inspection
                    </td>
                    <td className="p-2 border">{formatCurrency(5000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      // 📈 Profitability Analysis
      case "profitability":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Profitability Analysis
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="mb-4 text-gray-700">
                Analyze profitability by department or product line.
              </p>

              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#2563eb" name="Revenue" />
                    <Bar dataKey="cost" fill="#dc2626" name="Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <table className="w-full border text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Product</th>
                    <th className="p-2 border">Revenue</th>
                    <th className="p-2 border">Cost</th>
                    <th className="p-2 border">Profit</th>
                    <th className="p-2 border">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {profitData.map((d) => {
                    const profit = d.revenue - d.cost;
                    const margin = ((profit / d.revenue) * 100).toFixed(1);
                    return (
                      <tr key={d.product}>
                        <td className="p-2 border">{d.product}</td>
                        <td className="p-2 border">
                          {formatCurrency(d.revenue)}
                        </td>
                        <td className="p-2 border">{formatCurrency(d.cost)}</td>
                        <td className="p-2 border text-green-600">
                          {formatCurrency(profit)}
                        </td>
                        <td className="p-2 border">{margin}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      // 📊 Reports & KPIs
      case "reports":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Reports & KPIs</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-3">
                View summary reports and performance indicators:
              </p>
              <ul className="list-disc ml-6 text-gray-700">
                <li>Department Cost Efficiency</li>
                <li>Budget vs Actual Cost Comparison</li>
                <li>Profitability by Product Line</li>
                <li>Activity Cost Ratios</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Cost Accounting / Controlling</h1>

      {/* Tabs */}
      <div className="flex gap-3 border-b pb-2 mb-4 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${
              activeTab === id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
};

export default CostAccounting;
