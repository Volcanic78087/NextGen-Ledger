// modules/InboundModule.jsx - Complete Inbound Module
import React, { useState } from "react";
import { useLogistics } from "../../context/logisticContext";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
} from "lucide-react";

const InboundModule = () => {
  const {
    inboundDeliveries,
    inboundStats,
    updateInboundStatus,
    updateInboundItemReceived,
    addInboundDelivery,
  } = useLogistics();

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter deliveries
  const filteredDeliveries = inboundDeliveries.filter((delivery) => {
    const matchesSearch =
      delivery.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.poNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics Cards
  const statCards = [
    {
      label: "Total Deliveries",
      value: inboundStats.total,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending",
      value: inboundStats.pending,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "In Progress",
      value: inboundStats.inProgress,
      icon: Truck,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Completed",
      value: inboundStats.completed,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Items",
      value: inboundStats.totalItems,
      icon: Package,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Total Value",
      value: `₹${inboundStats.totalValue.toLocaleString()}`,
      icon: IndianRupee,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: "bg-amber-100 text-amber-800", label: "Pending" },
      "in-progress": {
        color: "bg-blue-100 text-blue-800",
        label: "In Progress",
      },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
    };
    const { color, label } = config[status] || config.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {label}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const config = {
      high: { color: "bg-red-100 text-red-800", label: "High" },
      medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
      low: { color: "bg-gray-100 text-gray-800", label: "Low" },
    };
    const { color, label } = config[priority] || config.medium;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  // Add new delivery form
  const [newDelivery, setNewDelivery] = useState({
    supplier: "",
    supplierCode: "",
    expectedDate: "",
    arrivalTime: "",
    totalValue: 0,
    priority: "medium",
    warehouse: "Main Warehouse",
    dock: "Dock 1",
    poNumber: "",
    contactPerson: "",
    contactPhone: "",
    notes: "",
    items: [{ name: "", quantity: 0, unit: "pieces", value: 0 }],
  });

  const handleAddItem = () => {
    setNewDelivery({
      ...newDelivery,
      items: [
        ...newDelivery.items,
        { name: "", quantity: 0, unit: "pieces", value: 0 },
      ],
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newDelivery.items];
    updatedItems[index][field] = value;
    setNewDelivery({ ...newDelivery, items: updatedItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalItems = newDelivery.items.reduce(
      (sum, item) => sum + parseInt(item.quantity || 0),
      0
    );
    const totalValue = newDelivery.items.reduce(
      (sum, item) => sum + parseFloat(item.value || 0),
      0
    );

    const deliveryData = {
      ...newDelivery,
      totalItems,
      totalValue,
      receivedItems: 0,
      status: "pending",
    };

    addInboundDelivery(deliveryData);
    setShowForm(false);
    setNewDelivery({
      supplier: "",
      supplierCode: "",
      expectedDate: "",
      arrivalTime: "",
      totalValue: 0,
      priority: "medium",
      warehouse: "Main Warehouse",
      dock: "Dock 1",
      poNumber: "",
      contactPerson: "",
      contactPhone: "",
      notes: "",
      items: [{ name: "", quantity: 0, unit: "pieces", value: 0 }],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📦 Inbound Deliveries
          </h1>
          <p className="text-gray-600">
            Manage incoming shipments and inventory
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            New Delivery
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by reference, supplier, or PO number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Date
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">
                      {delivery.reference}
                    </div>
                    <div className="text-sm text-gray-500">
                      {delivery.poNumber}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium">{delivery.supplier}</div>
                    <div className="text-sm text-gray-500">
                      {delivery.supplierCode}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={delivery.status} />
                      <PriorityBadge priority={delivery.priority} />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium">{delivery.expectedDate}</div>
                    <div className="text-sm text-gray-500">
                      {delivery.arrivalTime}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (delivery.receivedItems / delivery.totalItems) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-sm">
                        {delivery.receivedItems}/{delivery.totalItems}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-green-700">
                      ₹{delivery.totalValue.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDelivery(delivery)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <select
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={delivery.status}
                        onChange={(e) =>
                          updateInboundStatus(delivery.id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Delivery Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Create New Inbound Delivery
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={newDelivery.supplier}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          supplier: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={newDelivery.supplierCode}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          supplierCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={newDelivery.expectedDate}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          expectedDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={newDelivery.arrivalTime}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          arrivalTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Items
                  </label>
                  {newDelivery.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Item name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                      />
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={item.unit}
                        onChange={(e) =>
                          handleItemChange(index, "unit", e.target.value)
                        }
                      >
                        <option value="pieces">Pieces</option>
                        <option value="kg">Kilograms</option>
                        <option value="liters">Liters</option>
                        <option value="boxes">Boxes</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Value (₹)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={item.value}
                        onChange={(e) =>
                          handleItemChange(index, "value", e.target.value)
                        }
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Delivery
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboundModule;
