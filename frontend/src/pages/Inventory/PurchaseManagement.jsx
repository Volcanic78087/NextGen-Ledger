import { useInventory } from "../../context/InventoryContext";
import {
  FileText,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Clock,
  User,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";

export default function PurchaseManagement() {
  const { products, warehouses, bins, stockLedger, addStockTransaction } =
    useInventory();

  const [activeView, setActiveView] = useState("dashboard");
  const [dateRange, setDateRange] = useState("week");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPOForm, setShowNewPOForm] = useState(false);
  const [newPOData, setNewPOData] = useState({
    supplier: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDate: "",
    items: [{ productId: "", qty: 1, unitCost: 0 }],
  });

  // === Purchase Orders State ===
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 1,
      poNo: "PO-1001",
      supplier: "TechParts Inc.",
      supplierRating: 4.5,
      orderDate: "2025-03-10",
      expectedDate: "2025-03-20",
      status: "Sent",
      items: [
        {
          productId: 1,
          name: 'Laptop Pro 16"',
          qty: 10,
          unitCost: 1150,
          total: 11500,
        },
        {
          productId: 5,
          name: "16GB RAM Stick",
          qty: 20,
          unitCost: 70,
          total: 1400,
        },
      ],
      subtotal: 12900,
      tax: 1290,
      total: 14190,
      received: false,
      delayDays: 0,
    },
    {
      id: 2,
      poNo: "PO-1002",
      supplier: "Global Components",
      supplierRating: 3.8,
      orderDate: "2025-03-12",
      expectedDate: "2025-03-18",
      status: "Delayed",
      items: [
        {
          productId: 3,
          name: "Wireless Mouse",
          qty: 50,
          unitCost: 25,
          total: 1250,
        },
      ],
      subtotal: 1250,
      tax: 125,
      total: 1375,
      received: false,
      delayDays: 2,
    },
  ]);

  const [grns, setGrns] = useState([]);
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: "TechParts Inc.",
      rating: 4.5,
      leadTime: 10,
      onTimeDelivery: 95,
      totalOrders: 24,
      contact: "john@techparts.com",
    },
    {
      id: 2,
      name: "Global Components",
      rating: 3.8,
      leadTime: 7,
      onTimeDelivery: 82,
      totalOrders: 15,
      contact: "sara@globalcomp.com",
    },
    {
      id: 3,
      name: "Electro Supplies",
      rating: 4.2,
      leadTime: 14,
      onTimeDelivery: 91,
      totalOrders: 8,
      contact: "mike@electro.com",
    },
  ]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const avgLeadTime =
      suppliers.reduce((sum, s) => sum + s.leadTime, 0) / suppliers.length;
    const avgOnTime =
      suppliers.reduce((sum, s) => sum + s.onTimeDelivery, 0) /
      suppliers.length;
    const avgRating =
      suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length;

    return {
      avgLeadTime: avgLeadTime.toFixed(1),
      avgOnTime: Math.round(avgOnTime),
      avgRating: avgRating.toFixed(1),
    };
  }, [suppliers]);

  // === Filtered Data ===
  const pendingPOs = useMemo(
    () => purchaseOrders.filter((po) => !po.received),
    [purchaseOrders]
  );

  const delayedPOs = useMemo(
    () =>
      pendingPOs.filter((po) => {
        const expected = parseISO(po.expectedDate);
        const today = new Date();
        return isBefore(expected, today) || po.delayDays > 0;
      }),
    [pendingPOs]
  );

  const upcomingPOs = useMemo(
    () =>
      pendingPOs.filter((po) => {
        const expected = parseISO(po.expectedDate);
        const today = new Date();
        const nextWeek = addDays(today, 7);
        return isAfter(expected, today) && isBefore(expected, nextWeek);
      }),
    [pendingPOs]
  );

  //  Stock Arrival Timeline
  const stockArrivalTimeline = useMemo(() => {
    const timeline = pendingPOs.flatMap((po) =>
      po.items.map((item) => ({
        id: `${po.id}-${item.productId}`,
        poNo: po.poNo,
        supplier: po.supplier,
        productName: item.name,
        quantity: item.qty,
        expectedDate: po.expectedDate,
        status: po.status,
        delayDays: po.delayDays,
        isDelayed:
          po.delayDays > 0 || isBefore(parseISO(po.expectedDate), new Date()),
      }))
    );

    return timeline.sort(
      (a, b) => new Date(a.expectedDate) - new Date(b.expectedDate)
    );
  }, [pendingPOs]);

  //  Quick Actions
  const quickReceivePO = (poId) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    const defaultWarehouse =
      warehouses && warehouses.length > 0 ? warehouses[0] : { id: 1 };
    const defaultBin =
      bins && bins.length > 0
        ? bins.find((b) => b.warehouse_id === defaultWarehouse.id)
        : { id: 1 };

    const newGRN = {
      id: Date.now(),
      grnNo: `GRN-${String(1001 + grns.length).padStart(4, "0")}`,
      poId: po.id,
      poNo: po.poNo,
      receivedDate: new Date().toISOString().split("T")[0],
      warehouse_id: defaultWarehouse.id,
      bin_id: defaultBin?.id || 1,
      items: po.items,
    };

    setGrns([...grns, newGRN]);
    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId ? { ...p, received: true, status: "Received" } : p
      )
    );

    // Update stock ledger
    po.items.forEach((item) => {
      if (addStockTransaction) {
        addStockTransaction({
          product_id: item.productId,
          warehouse_id: defaultWarehouse.id,
          bin_id: defaultBin?.id || 1,
          transaction_type: "receipt_in",
          reference_type: "GRN",
          reference_id: newGRN.grnNo,
          qty: item.qty,
          unit_cost: item.unitCost,
        });
      }
    });
  };

  // New PO Functions
  const handleCreateNewPO = () => {
    const newPO = {
      id: Date.now(),
      poNo: `PO-${String(1001 + purchaseOrders.length).padStart(4, "0")}`,
      supplier: newPOData.supplier,
      supplierRating:
        suppliers.find((s) => s.name === newPOData.supplier)?.rating || 4.0,
      orderDate: newPOData.orderDate,
      expectedDate: newPOData.expectedDate,
      status: "Draft",
      items: newPOData.items.map((item) => {
        const product = products?.find((p) => p.id == item.productId);
        return {
          productId: item.productId,
          name: product?.name || `Product ${item.productId}`,
          qty: item.qty,
          unitCost: item.unitCost,
          total: item.qty * item.unitCost,
        };
      }),
      subtotal: newPOData.items.reduce(
        (sum, item) => sum + item.qty * item.unitCost,
        0
      ),
      tax: 0,
      total: newPOData.items.reduce(
        (sum, item) => sum + item.qty * item.unitCost,
        0
      ),
      received: false,
      delayDays: 0,
    };

    setPurchaseOrders([...purchaseOrders, newPO]);
    setShowNewPOForm(false);
    setNewPOData({
      supplier: "",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDate: "",
      items: [{ productId: "", qty: 1, unitCost: 0 }],
    });
  };

  const addNewItem = () => {
    setNewPOData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", qty: 1, unitCost: 0 }],
    }));
  };

  const updateItem = (index, field, value) => {
    setNewPOData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index) => {
    if (newPOData.items.length > 1) {
      setNewPOData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  //  GRN Report Generation
  const generateGRNReport = () => {
    const reportData = grns.map((grn) => {
      const po = purchaseOrders.find((p) => p.id === grn.poId);
      return {
        GRN: grn.grnNo,
        PO: grn.poNo,
        Supplier: po?.supplier || "Unknown",
        Date: grn.receivedDate,
        Items: grn.items.map((item) => `${item.name} (${item.qty})`).join(", "),
      };
    });

    console.log("GRN Report:", reportData);
    alert(
      `GRN Report generated with ${grns.length} entries. Check console for details.`
    );
  };

  //  Views
  const views = [
    { id: "dashboard", label: "Purchase Dashboard", icon: BarChart3 },
    { id: "timeline", label: "Arrival Timeline", icon: Calendar },
    { id: "pending", label: "Pending Receipts", icon: Package },
    { id: "suppliers", label: "Supplier Performance", icon: User },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Purchase Integration
          </h1>
          <p className="text-gray-600">
            Manage orders, track arrivals, and monitor suppliers
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button
            onClick={() => setShowNewPOForm(true)}
            className="btn-primary flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New PO
          </button>
        </div>
      </div>

      {/* New PO Modal */}
      {showNewPOForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Create New Purchase Order
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <select
                    value={newPOData.supplier}
                    onChange={(e) =>
                      setNewPOData((prev) => ({
                        ...prev,
                        supplier: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={newPOData.orderDate}
                    onChange={(e) =>
                      setNewPOData((prev) => ({
                        ...prev,
                        orderDate: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Date
                </label>
                <input
                  type="date"
                  value={newPOData.expectedDate}
                  onChange={(e) =>
                    setNewPOData((prev) => ({
                      ...prev,
                      expectedDate: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Items
                  </label>
                  <button
                    type="button"
                    onClick={addNewItem}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {newPOData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-start border p-3 rounded"
                    >
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">
                          Product
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            updateItem(index, "productId", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select Product</option>
                          {products?.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          )) || <option value="">No products available</option>}
                        </select>
                      </div>
                      <div className="w-20">
                        <label className="block text-xs text-gray-600 mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "qty",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-gray-600 mb-1">
                          Unit Cost
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unitCost",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="w-20 pt-5">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewPOForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewPO}
                disabled={
                  !newPOData.supplier ||
                  !newPOData.expectedDate ||
                  newPOData.items.some((item) => !item.productId)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-800">
                {pendingPOs.length}
              </p>
            </div>
            <div
              className={`p-2 rounded-full ${
                delayedPOs.length > 0
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {delayedPOs.length} delayed • {upcomingPOs.length} upcoming
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Expected This Week</p>
              <p className="text-2xl font-bold text-gray-800">
                {upcomingPOs.length}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Next 7 days arrival</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Supplier Performance</p>
              <p className="text-2xl font-bold text-gray-800">
                {performanceMetrics.avgOnTime}%
              </p>
            </div>
            <div className="p-2 rounded-full bg-orange-100 text-orange-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">On-time delivery rate</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Total Ordered</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹
                {pendingPOs
                  .reduce((sum, po) => sum + po.total, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Value of pending orders</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeView === view.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <view.icon className="w-5 h-5" />
            {view.label}
            {view.id === "pending" && pendingPOs.length > 0 && (
              <span className="ml-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {pendingPOs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/*  DASHBOARD VIEW  */}
      {activeView === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delayed Orders Alert */}
            {delayedPOs.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Delayed Orders</h3>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {delayedPOs.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {delayedPOs.slice(0, 3).map((po) => (
                    <div
                      key={po.id}
                      className="flex justify-between items-center p-2 bg-white rounded border"
                    >
                      <div>
                        <span className="font-medium">{po.poNo}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          • {po.supplier}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-red-600">
                          {po.delayDays > 0
                            ? `${po.delayDays} days late`
                            : "Overdue"}
                        </span>
                        <button
                          onClick={() => quickReceivePO(po.id)}
                          className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          Receive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Arrivals */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Upcoming Arrivals (Next 7 Days)
                </h3>
              </div>
              <div className="divide-y">
                {upcomingPOs.slice(0, 5).map((po) => (
                  <div key={po.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{po.poNo}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {po.expectedDate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {po.supplier}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {po.items.slice(0, 2).map((item, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {item.name} x{item.qty}
                            </span>
                          ))}
                          {po.items.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{po.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => quickReceivePO(po.id)}
                        className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        Quick Receive
                      </button>
                    </div>
                  </div>
                ))}
                {upcomingPOs.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No upcoming arrivals in the next 7 days
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Supplier Performance */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow border">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Performers
                </h3>
              </div>
              <div className="divide-y">
                {suppliers
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 4)
                  .map((supplier) => (
                    <div key={supplier.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                  key={star}
                                  className={`w-3 h-3 rounded-full ${
                                    star <= Math.floor(supplier.rating)
                                      ? "bg-yellow-400"
                                      : "bg-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {supplier.rating}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {supplier.onTimeDelivery}%
                          </p>
                          <p className="text-xs text-gray-500">On-time</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Lead: {supplier.leadTime}d</span>
                        <span>{supplier.totalOrders} orders</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick GRN Creation */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setShowNewPOForm(true)}
                  className="w-full bg-blue-600 text-white flex items-center justify-center gap-2 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New PO
                </button>
                <button
                  onClick={generateGRNReport}
                  className="w-full bg-gray-600 text-white flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Generate GRN Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARRIVAL TIMELINE VIEW */}
      {activeView === "timeline" && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Stock Arrival Timeline</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <button className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className="divide-y">
            {stockArrivalTimeline
              .filter(
                (item) =>
                  item.productName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  item.poNo.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((item, index) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.isDelayed ? "bg-red-500" : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">
                            {item.productName}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            • {item.poNo} • {item.supplier}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.isDelayed
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.expectedDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">
                          Quantity: <strong>{item.quantity}</strong>
                        </span>
                        {item.isDelayed && (
                          <span className="text-sm text-red-600 font-medium">
                            {item.delayDays > 0
                              ? `${item.delayDays} days delayed`
                              : "Overdue"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {stockArrivalTimeline.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No stock arrivals scheduled
              </div>
            )}
          </div>
        </div>
      )}

      {/* PENDING RECEIPTS VIEW */}
      {activeView === "pending" && (
        <div className="space-y-4">
          {pendingPOs.map((po) => (
            <div key={po.id} className="bg-white rounded-lg shadow border">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{po.poNo}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          po.delayDays > 0
                            ? "bg-red-100 text-red-800"
                            : po.status === "Delayed"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {po.status}
                        {po.delayDays > 0 && ` • ${po.delayDays} days late`}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {po.supplier} • Ordered: {po.orderDate} • Expected:{" "}
                      {po.expectedDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg"> ₹{po.total.toFixed(2)}</p>
                    <button
                      onClick={() => quickReceivePO(po.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mt-2"
                    >
                      Receive All Items
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="grid gap-3">
                  {po.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.qty} • Unit Cost: ₹{item.unitCost}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium"> ₹{item.total.toFixed(2)}</p>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Receive Partial
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {pendingPOs.length === 0 && (
            <div className="bg-white rounded-lg shadow border p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Pending Receipts
              </h3>
              <p className="text-gray-500">
                All purchase orders have been received.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUPPLIER PERFORMANCE VIEW */}
      {activeView === "suppliers" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supplier List */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Supplier Performance</h3>
            </div>
            <div className="divide-y">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{supplier.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={`w-4 h-4 rounded-full mx-0.5 ${
                                  star <= Math.floor(supplier.rating)
                                    ? "bg-yellow-400"
                                    : "bg-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {supplier.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {supplier.contact}
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-center">
                        <div>
                          <p className="text-lg font-bold text-blue-600">
                            {supplier.leadTime}d
                          </p>
                          <p className="text-xs text-gray-500">Lead Time</p>
                        </div>
                        <div>
                          <p
                            className={`text-lg font-bold ${
                              supplier.onTimeDelivery >= 90
                                ? "text-green-600"
                                : supplier.onTimeDelivery >= 80
                                ? "text-orange-600"
                                : "text-red-600"
                            }`}
                          >
                            {supplier.onTimeDelivery}%
                          </p>
                          <p className="text-xs text-gray-500">On Time</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-600">
                            {supplier.totalOrders}
                          </p>
                          <p className="text-xs text-gray-500">Orders</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="font-semibold mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Average Lead Time</span>
                    <span className="font-medium">
                      {performanceMetrics.avgLeadTime} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (performanceMetrics.avgLeadTime / 20) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>On-time Delivery Rate</span>
                    <span className="font-medium">
                      {performanceMetrics.avgOnTime}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${performanceMetrics.avgOnTime}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quality Rating</span>
                    <span className="font-medium">
                      {performanceMetrics.avgRating}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${(performanceMetrics.avgRating / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      PO-1003 received from TechParts Inc.
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      PO-1002 delayed from Global Components
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      New PO created for Electro Supplies
                    </p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
