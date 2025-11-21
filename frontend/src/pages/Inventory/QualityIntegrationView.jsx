import React, { useState } from "react";
import { useInventory } from "../../context/InventoryContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  Warehouse,
  History,
  Beaker,
  Plus,
  AlertTriangle,
} from "lucide-react";

const QualityIntegrationView = () => {
  const {
    qualityStatusSummary,
    quarantineSummary,
    qualityHoldLocations,
    qualityChecks,
    products,
    addQualityCheck,
    updateQualityStatus,
    releaseQuarantineStock,
    QUALITY_STATUS,
  } = useInventory();

  const [selectedTab, setSelectedTab] = useState(0);
  const [qualityCheckDialog, setQualityCheckDialog] = useState(false);
  const [newQualityCheck, setNewQualityCheck] = useState({
    product_id: "",
    batch_number: "",
    quantity: 0,
    parameters: {},
  });

  const [actionDialog, setActionDialog] = useState({
    open: false,
    check: null,
    action: "",
  });

  const getStatusColor = (status) => {
    switch (status) {
      case QUALITY_STATUS.PASS:
        return "bg-green-100 text-green-800 border-green-200";
      case QUALITY_STATUS.FAIL:
        return "bg-red-100 text-red-800 border-red-200";
      case QUALITY_STATUS.HOLD:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case QUALITY_STATUS.PASS:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case QUALITY_STATUS.FAIL:
        return <XCircle className="w-4 h-4 text-red-600" />;
      case QUALITY_STATUS.HOLD:
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleAddQualityCheck = () => {
    if (!newQualityCheck.product_id || !newQualityCheck.batch_number) {
      alert("Please fill all required fields");
      return;
    }

    const product = products.find((p) => p.id === newQualityCheck.product_id);
    addQualityCheck({
      ...newQualityCheck,
      product_name: product?.name || "Unknown",
      parameters: {
        appearance: "Good",
        functionality: "Working",
        packaging: "Intact",
        ...newQualityCheck.parameters,
      },
    });

    setQualityCheckDialog(false);
    setNewQualityCheck({
      product_id: "",
      batch_number: "",
      quantity: 0,
      parameters: {},
    });
  };

  const handleQualityAction = (checkId, status, remarks = "") => {
    updateQualityStatus(checkId, status, remarks);
    setActionDialog({ open: false, check: null, action: "" });
  };

  const handleReleaseQuarantine = (quarantineId, status) => {
    releaseQuarantineStock(quarantineId, status);
  };

  // Quality Dashboard Cards
  const qualityStats = [
    {
      title: "Total Quality Checks",
      value: qualityChecks.length,
      icon: <Beaker className="w-6 h-6 text-blue-600" />,
      color: "blue",
    },
    {
      title: "Passed Items",
      value: qualityChecks.filter((c) => c.status === QUALITY_STATUS.PASS)
        .length,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      color: "green",
    },
    {
      title: "On Hold",
      value: qualityChecks.filter((c) => c.status === QUALITY_STATUS.HOLD)
        .length,
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      color: "yellow",
    },
    {
      title: "Failed Items",
      value: qualityChecks.filter((c) => c.status === QUALITY_STATUS.FAIL)
        .length,
      icon: <XCircle className="w-6 h-6 text-red-600" />,
      color: "red",
    },
  ];

  const tabs = [
    { name: "Quality Status", icon: <Beaker className="w-4 h-4" /> },
    {
      name: "Quarantine Management",
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: quarantineSummary.length,
    },
    { name: "Quality History", icon: <History className="w-4 h-4" /> },
    { name: "Hold Locations", icon: <Warehouse className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Beaker className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          Quality Integration View
        </h1>
      </div>

      {/* Quality Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {qualityStats.map((stat, index) => (
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
          {/* Tab 1: Quality Status */}
          {selectedTab === 0 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Batch Quality Status
                </h2>
                <button
                  onClick={() => setQualityCheckDialog(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Quality Check
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Product
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Batch Number
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Latest Status
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Last Check Date
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Total Checks
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Pass/Hold/Fail
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualityStatusSummary.map((item) => (
                      <tr
                        key={`${item.product_id}-${item.batch_number}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {item.product_name}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {item.batch_number}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(
                              item.latest_status
                            )}`}
                          >
                            {getStatusIcon(item.latest_status)}
                            <span className="text-sm font-medium capitalize">
                              {item.latest_status}
                            </span>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {new Date(item.last_check_date).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {item.total_checks}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex gap-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                              {item.pass_count}P
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                              {item.hold_count}H
                            </span>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                              {item.fail_count}F
                            </span>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <button
                            onClick={() => {
                              const latestCheck = qualityChecks
                                .filter(
                                  (c) =>
                                    c.product_id === item.product_id &&
                                    c.batch_number === item.batch_number
                                )
                                .sort(
                                  (a, b) =>
                                    new Date(b.checked_at) -
                                    new Date(a.checked_at)
                                )[0];
                              if (latestCheck) {
                                setActionDialog({
                                  open: true,
                                  check: latestCheck,
                                  action: "update",
                                });
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Update Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Quarantine Management */}
          {selectedTab === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Quarantined Stock Items
              </h2>

              {quarantineSummary.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                    <p className="text-blue-800">No items in quarantine</p>
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
                          Batch Number
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Quantity
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Reason
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Quarantined Date
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Current Status
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {quarantineSummary.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-3">
                            {item.product_name}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {item.batch_number}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {item.quantity}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {item.reason}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {new Date(item.quarantined_at).toLocaleDateString()}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(
                                item.quality_status
                              )}`}
                            >
                              {getStatusIcon(item.quality_status)}
                              <span className="text-sm font-medium capitalize">
                                {item.quality_status}
                              </span>
                            </div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleReleaseQuarantine(
                                    item.id,
                                    QUALITY_STATUS.PASS
                                  )
                                }
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                Release as Pass
                              </button>
                              <button
                                onClick={() =>
                                  handleReleaseQuarantine(
                                    item.id,
                                    QUALITY_STATUS.FAIL
                                  )
                                }
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Quality History */}
          {selectedTab === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Complete Quality Check History
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Date
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Product
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Batch
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Quantity
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Checked By
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualityChecks
                      .sort(
                        (a, b) =>
                          new Date(b.checked_at) - new Date(a.checked_at)
                      )
                      .map((check) => (
                        <tr key={check.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-3">
                            {new Date(check.checked_at).toLocaleString()}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {check.product_name}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {check.batch_number}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {check.quantity}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(
                                check.status
                              )}`}
                            >
                              {getStatusIcon(check.status)}
                              <span className="text-sm font-medium capitalize">
                                {check.status}
                              </span>
                            </div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {check.checked_by}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            {check.remarks || "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Hold Locations */}
          {selectedTab === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Quality Hold Locations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {qualityHoldLocations.map((location) => (
                  <div
                    key={location.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Warehouse className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {location.name}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Location Type</p>
                        <p className="font-medium">Quarantine Bin</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Current Quarantined Items
                        </p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {
                            quarantineSummary.filter(
                              (item) => item.bin_id === location.id
                            ).length
                          }
                        </p>
                        <p className="text-sm text-gray-600">items</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Quality Check Dialog */}
      {qualityCheckDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                New Quality Check
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product
                </label>
                <select
                  value={newQualityCheck.product_id}
                  onChange={(e) =>
                    setNewQualityCheck({
                      ...newQualityCheck,
                      product_id: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={newQualityCheck.batch_number}
                  onChange={(e) =>
                    setNewQualityCheck({
                      ...newQualityCheck,
                      batch_number: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter batch number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={newQualityCheck.quantity}
                  onChange={(e) =>
                    setNewQualityCheck({
                      ...newQualityCheck,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setQualityCheckDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQualityCheck}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Quality Check
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Dialog */}
      {actionDialog.open && actionDialog.check && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Quality Status
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <p>
                  <span className="font-medium">Product:</span>{" "}
                  {actionDialog.check.product_name}
                </p>
                <p>
                  <span className="font-medium">Batch:</span>{" "}
                  {actionDialog.check.batch_number}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() =>
                    handleQualityAction(
                      actionDialog.check.id,
                      QUALITY_STATUS.PASS,
                      "Quality check passed"
                    )
                  }
                  className="flex flex-col items-center gap-2 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="font-medium text-green-800">PASS</span>
                </button>
                <button
                  onClick={() =>
                    handleQualityAction(
                      actionDialog.check.id,
                      QUALITY_STATUS.HOLD,
                      "Needs further inspection"
                    )
                  }
                  className="flex flex-col items-center gap-2 p-4 border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <span className="font-medium text-yellow-800">HOLD</span>
                </button>
                <button
                  onClick={() =>
                    handleQualityAction(
                      actionDialog.check.id,
                      QUALITY_STATUS.FAIL,
                      "Quality standards not met"
                    )
                  }
                  className="flex flex-col items-center gap-2 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="font-medium text-red-800">FAIL</span>
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() =>
                  setActionDialog({ open: false, check: null, action: "" })
                }
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityIntegrationView;
