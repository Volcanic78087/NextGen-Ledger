import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  DollarSign,
  Users,
  Truck,
  TrendingUp,
  BarChart2,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const FinanceSupplyChain = () => {
  const { financeData, addVendor, addCustomer } = useFinance();
  const { vendors, customers, cashFlow, kpis } = financeData;
  const [activeTab, setActiveTab] = useState("vendors");
  const [newVendor, setNewVendor] = useState({ name: "", due: "", paid: "" });

  const handleAddVendor = () => {
    if (newVendor.name && newVendor.due && newVendor.paid) {
      addVendor({
        name: newVendor.name,
        due: Number(newVendor.due),
        paid: Number(newVendor.paid),
      });
      setNewVendor({ name: "", due: "", paid: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">
        Finance Supply Chain Management
      </h1>

      <div className="flex gap-3 border-b pb-2 mb-4 overflow-x-auto">
        {[
          { id: "vendors", label: "Vendors", icon: Truck },
          { id: "customers", label: "Customers", icon: Users },
          { id: "cashflow", label: "Cash Flow", icon: DollarSign },
          { id: "kpis", label: "KPIs", icon: BarChart2 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${
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

      {/* VENDORS TAB */}
      {activeTab === "vendors" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Vendors List</h2>
          <div className="mb-4 flex gap-3">
            <input
              type="text"
              placeholder="Vendor Name"
              className="border rounded p-2 w-1/3"
              value={newVendor.name}
              onChange={(e) =>
                setNewVendor({ ...newVendor, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Due (₹)"
              className="border rounded p-2 w-1/3"
              value={newVendor.due}
              onChange={(e) =>
                setNewVendor({ ...newVendor, due: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Paid (₹)"
              className="border rounded p-2 w-1/3"
              value={newVendor.paid}
              onChange={(e) =>
                setNewVendor({ ...newVendor, paid: e.target.value })
              }
            />
            <button
              onClick={handleAddVendor}
              className="bg-blue-600 text-white px-4 rounded flex items-center gap-2"
            >
              <Plus size={18} /> Add
            </button>
          </div>

          <table className="w-full border text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Vendor</th>
                <th className="p-2 border">Due (₹)</th>
                <th className="p-2 border">Paid (₹)</th>
                <th className="p-2 border">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td className="p-2 border">{v.name}</td>
                  <td className="p-2 border">₹{v.due.toLocaleString()}</td>
                  <td className="p-2 border text-green-600">
                    ₹{v.paid.toLocaleString()}
                  </td>
                  <td className="p-2 border text-red-600">
                    ₹{(v.due - v.paid).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/*  CASH FLOW TAB  */}
      {activeTab === "cashflow" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Cash Flow Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inflow"
                  stroke="#16a34a"
                  name="Inflow (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="outflow"
                  stroke="#dc2626"
                  name="Outflow (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/*  KPIs TAB  */}
      {activeTab === "kpis" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Key Performance Indicators
          </h2>
          <ul className="space-y-2">
            {kpis.map((kpi, index) => (
              <li key={index} className="flex justify-between border-b py-2">
                <span>{kpi.name}</span>
                <span className="font-semibold text-blue-700">{kpi.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FinanceSupplyChain;
