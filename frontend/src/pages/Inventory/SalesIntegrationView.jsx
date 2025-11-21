import React, { useState } from "react";
import { useInventory } from "../../context/InventoryContext";
import {
  ShoppingCart,
  Package,
  Truck,
  X,
  CheckCircle,
  Search,
  Plus,
  AlertTriangle,
  TrendingUp,
  Circle,
} from "lucide-react";

const SalesIntegrationView = () => {
  const {
    availableStockForSales,
    committedStock,
    salesOrders,
    stockReservations,
    products,
    createSalesOrder,
    allocateStockForSales,
    releaseStockReservation,
    quickStockCheck,
    SALES_ORDER_STATUS,
  } = useInventory();

  const [selectedTab, setSelectedTab] = useState(0);
  const [salesOrderDialog, setSalesOrderDialog] = useState(false);
  const [stockSearchDialog, setStockSearchDialog] = useState(false);
  const [searchProductId, setSearchProductId] = useState("");
  const [newSalesOrder, setNewSalesOrder] = useState({
    customer_name: "",
    product_id: "",
    quantity: 0,
    priority: "medium",
  });

  const getOrderStatusColor = (status) => {
    switch (status) {
      case SALES_ORDER_STATUS.DRAFT:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case SALES_ORDER_STATUS.CONFIRMED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case SALES_ORDER_STATUS.ALLOCATED:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case SALES_ORDER_STATUS.SHIPPED:
        return "bg-green-100 text-green-800 border-green-200";
      case SALES_ORDER_STATUS.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCreateSalesOrder = () => {
    if (
      !newSalesOrder.customer_name ||
      !newSalesOrder.product_id ||
      !newSalesOrder.quantity
    ) {
      alert("Please fill all required fields");
      return;
    }

    const product = products.find((p) => p.id === newSalesOrder.product_id);
    const availableStock =
      availableStockForSales[newSalesOrder.product_id]?.available_stock || 0;

    if (newSalesOrder.quantity > availableStock) {
      alert(`Insufficient stock! Available: ${availableStock}`);
      return;
    }

    createSalesOrder({
      ...newSalesOrder,
      product_name: product?.name || "Unknown",
      unit_price: product?.unit_cost || 0,
    });

    setSalesOrderDialog(false);
    setNewSalesOrder({
      customer_name: "",
      product_id: "",
      quantity: 0,
      priority: "medium",
    });
  };

  const handleAllocateStock = (orderId) => {
    try {
      allocateStockForSales(orderId);
      alert("Stock allocated successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancelOrder = (orderId) => {
    const reservation = stockReservations.find((r) => r.order_id === orderId);
    if (reservation) {
      releaseStockReservation(reservation.id);
    }
  };

  const handleQuickStockCheck = () => {
    setStockSearchDialog(true);
  };

  const getStockAvailability = (productId) => {
    return (
      availableStockForSales[productId] || {
        available_stock: 0,
        total_stock: 0,
        quarantined_stock: 0,
        reserved_stock: 0,
      }
    );
  };

  const getStockLevelColor = (available, total) => {
    if (total === 0) return "gray";
    const ratio = available / total;
    if (ratio === 0) return "red";
    if (ratio < 0.2) return "yellow";
    return "green";
  };

  const getProgressBarColor = (available, total) => {
    const color = getStockLevelColor(available, total);
    switch (color) {
      case "red":
        return "bg-red-500";
      case "yellow":
        return "bg-yellow-500";
      case "green":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Sales Dashboard Cards
  const salesStats = [
    {
      title: "Total Available Stock",
      value: Object.values(availableStockForSales).reduce(
        (sum, item) => sum + item.available_stock,
        0
      ),
      icon: <Package className="w-6 h-6 text-blue-600" />,
      color: "blue",
    },
    {
      title: "Committed Stock",
      value: Object.values(committedStock).reduce((sum, qty) => sum + qty, 0),
      icon: <ShoppingCart className="w-6 h-6 text-yellow-600" />,
      color: "yellow",
    },
    {
      title: "Active Reservations",
      value: stockReservations.length,
      icon: <Truck className="w-6 h-6 text-indigo-600" />,
      color: "indigo",
    },
    {
      title: "Total Sales Orders",
      value: salesOrders.length,
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      color: "green",
    },
  ];

  const highPriorityOrders = salesOrders.filter(
    (order) =>
      order.priority === "high" && order.status !== SALES_ORDER_STATUS.SHIPPED
  );

  const tabs = [
    { name: "Available Stock", icon: <Package className="w-4 h-4" /> },
    {
      name: "Committed Stock",
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: Object.keys(committedStock).length,
    },
    {
      name: "Stock Reservations",
      icon: <Truck className="w-4 h-4" />,
      badge: stockReservations.length,
    },
    { name: "Sales Orders", icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          Sales Integration View
        </h1>
      </div>

      {/* Sales Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {salesStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* High Priority Alerts */}
      {highPriorityOrders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                {highPriorityOrders.length} high priority orders need attention
              </p>
            </div>
            <button className="text-yellow-800 hover:text-yellow-900 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
      )}

      {/* Tabs and Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setSelectedTab(index)}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  selectedTab === index
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.name}
                {tab.badge > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Tab 1: Available Stock */}
          {selectedTab === 0 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Available Stock for Sales
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleQuickStockCheck}
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Quick Stock Check
                  </button>
                  <button
                    onClick={() => setSalesOrderDialog(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Sales Order
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Product
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Total Stock
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Available
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Quarantined
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Reserved
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Stock Level
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(availableStockForSales).map((item) => {
                      const progress =
                        item.total_stock > 0
                          ? (item.available_stock / item.total_stock) * 100
                          : 0;
                      const stockLevelColor = getStockLevelColor(
                        item.available_stock,
                        item.total_stock
                      );

                      return (
                        <tr key={item.product_id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {item.product_name}
                            </div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {item.total_stock}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <span
                              className={`font-bold ${
                                stockLevelColor === "red"
                                  ? "text-red-600"
                                  : stockLevelColor === "yellow"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {item.available_stock}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                              {item.quarantined_stock}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {item.reserved_stock}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-3 w-32">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getProgressBarColor(
                                  item.available_stock,
                                  item.total_stock
                                )}`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {item.available_stock === 0 ? (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                Out of Stock
                              </span>
                            ) : item.available_stock < 10 ? (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                Low Stock
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Committed Stock */}
          {selectedTab === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Committed Stock (Allocated to Orders)
              </h2>

              {Object.keys(committedStock).length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <p className="text-blue-800">No committed stock</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Product
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Committed Quantity
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Pending Orders
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Available Stock
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(committedStock).map(
                        ([productId, quantity]) => {
                          const product = products.find(
                            (p) => p.id === productId
                          );
                          const available =
                            availableStockForSales[productId]
                              ?.available_stock || 0;
                          const pendingOrders = salesOrders.filter(
                            (order) =>
                              order.product_id === productId &&
                              [
                                SALES_ORDER_STATUS.CONFIRMED,
                                SALES_ORDER_STATUS.ALLOCATED,
                              ].includes(order.status)
                          ).length;

                          return (
                            <tr key={productId} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-4 py-3">
                                {product?.name || "Unknown Product"}
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                <span className="text-2xl font-bold text-yellow-600">
                                  {quantity}
                                </span>
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                {pendingOrders}
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                {available}
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                {available >= quantity ? (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                    Sufficient
                                  </span>
                                ) : (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                    Insufficient
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Stock Reservations */}
          {selectedTab === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Active Stock Reservations
              </h2>

              {stockReservations.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <p className="text-blue-800">
                      No active stock reservations
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Reservation ID
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Order ID
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Product
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Quantity
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Reserved Date
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Reserved By
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockReservations.map((reservation) => {
                        const order = salesOrders.find(
                          (so) => so.id === reservation.order_id
                        );
                        return (
                          <tr key={reservation.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-3">
                              {reservation.id}
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              {reservation.order_id}
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              {order?.product_name || "Unknown"}
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              {reservation.quantity}
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              {new Date(
                                reservation.reserved_at
                              ).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              {reservation.reserved_by}
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              <button
                                onClick={() =>
                                  releaseStockReservation(reservation.id)
                                }
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                Release
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Sales Orders */}
          {selectedTab === 3 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Sales Orders
                </h2>
                <button
                  onClick={() => setSalesOrderDialog(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Order
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Order ID
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Customer
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Product
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Quantity
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Priority
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Created Date
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesOrders
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at)
                      )
                      .map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-3">
                            {order.id}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {order.customer_name}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {order.product_name}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {order.quantity}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(
                                order.status
                              )}`}
                            >
                              <Circle className="w-2 h-2" />
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                order.priority === "high"
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}
                            >
                              {order.priority}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className="flex gap-2">
                              {order.status ===
                                SALES_ORDER_STATUS.CONFIRMED && (
                                <button
                                  onClick={() => handleAllocateStock(order.id)}
                                  className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors"
                                >
                                  Allocate Stock
                                </button>
                              )}
                              {order.status ===
                                SALES_ORDER_STATUS.ALLOCATED && (
                                <button className="border border-green-300 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-50 transition-colors flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Mark Shipped
                                </button>
                              )}
                              {order.status !== SALES_ORDER_STATUS.SHIPPED && (
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Sales Order Dialog */}
      {salesOrderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Sales Order
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={newSalesOrder.customer_name}
                  onChange={(e) =>
                    setNewSalesOrder({
                      ...newSalesOrder,
                      customer_name: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product
                  </label>
                  <select
                    value={newSalesOrder.product_id}
                    onChange={(e) =>
                      setNewSalesOrder({
                        ...newSalesOrder,
                        product_id: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Available:{" "}
                        {getStockAvailability(product.id).available_stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newSalesOrder.quantity}
                    onChange={(e) =>
                      setNewSalesOrder({
                        ...newSalesOrder,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newSalesOrder.priority}
                  onChange={(e) =>
                    setNewSalesOrder({
                      ...newSalesOrder,
                      priority: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Stock Availability Info */}
              {newSalesOrder.product_id && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Stock Availability
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Available</p>
                      <p className="text-2xl font-bold text-green-600">
                        {
                          getStockAvailability(newSalesOrder.product_id)
                            .available_stock
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-lg font-medium">
                        {
                          getStockAvailability(newSalesOrder.product_id)
                            .total_stock
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quarantined</p>
                      <p className="text-lg font-medium text-yellow-600">
                        {
                          getStockAvailability(newSalesOrder.product_id)
                            .quarantined_stock
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reserved</p>
                      <p className="text-lg font-medium text-blue-600">
                        {
                          getStockAvailability(newSalesOrder.product_id)
                            .reserved_stock
                        }
                      </p>
                    </div>
                  </div>

                  {newSalesOrder.quantity >
                    getStockAvailability(newSalesOrder.product_id)
                      .available_stock && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <p className="text-yellow-800 text-sm">
                          Order quantity exceeds available stock!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSalesOrderDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSalesOrder}
                disabled={
                  newSalesOrder.quantity >
                  getStockAvailability(newSalesOrder.product_id).available_stock
                }
                className={`px-4 py-2 rounded-lg font-medium ${
                  newSalesOrder.quantity >
                  getStockAvailability(newSalesOrder.product_id).available_stock
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                }`}
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stock Check Dialog */}
      {stockSearchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Stock Check
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product
                </label>
                <select
                  value={searchProductId}
                  onChange={(e) => setSearchProductId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {searchProductId && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Stock Availability for{" "}
                    {products.find((p) => p.id === searchProductId)?.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Available Stock</p>
                      <p className="text-3xl font-bold text-green-600">
                        {getStockAvailability(searchProductId).available_stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Stock</p>
                      <p className="text-xl font-medium">
                        {getStockAvailability(searchProductId).total_stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quarantined</p>
                      <p className="text-lg font-medium text-yellow-600">
                        {
                          getStockAvailability(searchProductId)
                            .quarantined_stock
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reserved</p>
                      <p className="text-lg font-medium text-blue-600">
                        {getStockAvailability(searchProductId).reserved_stock}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(
                        getStockAvailability(searchProductId).available_stock,
                        getStockAvailability(searchProductId).total_stock
                      )}`}
                      style={{
                        width: `${
                          (getStockAvailability(searchProductId)
                            .available_stock /
                            getStockAvailability(searchProductId).total_stock) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setStockSearchDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesIntegrationView;
