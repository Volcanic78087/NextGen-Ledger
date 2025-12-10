import React, { useState } from "react";
import { useLogistics } from "../../context/logisticContext";
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  MapPin,
  IndianRupee,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Warehouse,
} from "lucide-react";

const OutboundModule = () => {
  const {
    outboundDeliveries,
    outboundStats,
    updateOutboundStatus,
    updateOutboundItemDispatched,
    addOutboundDelivery,
    warehouses,
  } = useLogistics();

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");

  // Filter deliveries
  const filteredDeliveries = outboundDeliveries.filter((delivery) => {
    const matchesSearch =
      delivery.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.salesOrder.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || delivery.status === statusFilter;
    const matchesWarehouse =
      warehouseFilter === "all" || delivery.warehouse === warehouseFilter;
    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  // Statistics Cards
  const statCards = [
    {
      label: "Total Deliveries",
      value: outboundStats.total,
      icon: Truck,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Pending Dispatch",
      value: outboundStats.pending,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "In Transit",
      value: outboundStats.inProgress,
      icon: Package,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Delivered",
      value: outboundStats.completed,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Items",
      value: outboundStats.totalItems,
      icon: Package,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Total Value",
      value: `₹${outboundStats.totalValue.toLocaleString()}`,
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
        label: "In Transit",
      },
      completed: { color: "bg-green-100 text-green-800", label: "Delivered" },
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
    customer: "",
    customerCode: "",
    warehouse: "",
    deliveryDate: "",
    dispatchTime: "",
    totalValue: 0,
    priority: "medium",
    destination: "",
    shippingMethod: "Road",
    salesOrder: "",
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

    // Get warehouse name from selected ID
    const selectedWarehouse = warehouses.find(
      (w) => w.id === newDelivery.warehouse
    );

    const deliveryData = {
      ...newDelivery,
      warehouseName: selectedWarehouse?.name || "N/A",
      warehouseCode: selectedWarehouse?.code || "N/A",
      totalItems,
      totalValue,
      dispatchedItems: 0,
      status: "pending",
    };

    addOutboundDelivery(deliveryData);
    setShowForm(false);
    setNewDelivery({
      customer: "",
      customerCode: "",
      warehouse: "",
      deliveryDate: "",
      dispatchTime: "",
      totalValue: 0,
      priority: "medium",
      destination: "",
      shippingMethod: "Road",
      salesOrder: "",
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
            🚚 Outbound Deliveries
          </h1>
          <p className="text-gray-600">
            Manage customer shipments and dispatches
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={16} />
            New Dispatch
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
              placeholder="Search by reference, customer, or sales order..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Transit</option>
              <option value="completed">Delivered</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
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
                  Customer
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warehouse
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date
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
                      {delivery.salesOrder}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium">{delivery.customer}</div>
                    <div className="text-sm text-gray-500">
                      {delivery.customerCode}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Warehouse size={16} className="text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {delivery.warehouseName ||
                            warehouses.find((w) => w.id === delivery.warehouse)
                              ?.name ||
                            "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.warehouseCode ||
                            warehouses.find((w) => w.id === delivery.warehouse)
                              ?.code ||
                            ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={delivery.status} />
                      <PriorityBadge priority={delivery.priority} />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium">{delivery.deliveryDate}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {delivery.destination}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (delivery.dispatchedItems / delivery.totalItems) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-sm">
                        {delivery.dispatchedItems}/{delivery.totalItems}
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
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <select
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        value={delivery.status}
                        onChange={(e) =>
                          updateOutboundStatus(delivery.id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Transit</option>
                        <option value="completed">Delivered</option>
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
                  Create New Outbound Delivery
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
                      Customer *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newDelivery.customer}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          customer: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newDelivery.customerCode}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          customerCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sales Order *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newDelivery.salesOrder}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          salesOrder: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warehouse *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newDelivery.warehouse}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          warehouse: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newDelivery.deliveryDate}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          deliveryDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dispatch Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newDelivery.dispatchTime}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          dispatchTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mumbai, Delhi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newDelivery.destination}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          destination: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Method
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newDelivery.shippingMethod}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          shippingMethod: e.target.value,
                        })
                      }
                    >
                      <option value="Road">Road</option>
                      <option value="Rail">Rail</option>
                      <option value="Air">Air</option>
                      <option value="Sea">Sea</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newDelivery.priority}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          priority: e.target.value,
                        })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newDelivery.contactPerson}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          contactPerson: e.target.value,
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                      />
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                    className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    value={newDelivery.notes}
                    onChange={(e) =>
                      setNewDelivery({
                        ...newDelivery,
                        notes: e.target.value,
                      })
                    }
                  />
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create Dispatch
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

export default OutboundModule;
