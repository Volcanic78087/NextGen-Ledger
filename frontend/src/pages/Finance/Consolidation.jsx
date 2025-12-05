import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useFinance } from "../../context/FinanceContext";

const Consolidation = () => {
  const {
    entities = [],
    intercompanyTransactions = [],
    consolidationSettings = {},
    consolidationHistory = [],
    eliminationEntries = [],

    addEntity,
    updateEntity,
    toggleEntityActive,
    deleteEntity,
    updateExchangeRate,

    convertCurrency,

    addIntercompanyTransaction,
    reconcileIntercompanyTransaction,
    markIntercompanyAsEliminated,

    getConsolidatedBalanceSheet,
    getConsolidatedProfitAndLoss,
    getConsolidatedTrialBalance,

    createEliminationEntry,
    autoGenerateEliminationEntries,

    runConsolidation,

    getEntityPerformance,

    updateConsolidationSettings,

    formatCurrency = (amount) =>
      `₹${Number(amount || 0).toLocaleString("en-IN")}`,
  } = useFinance();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
  });
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [consolidationResult, setConsolidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [newEntity, setNewEntity] = useState({
    name: "",
    code: "",
    currency: "INR",
    type: "branch",
    exchangeRate: 1,
  });

  // Safe computed values
  const activeEntities = useMemo(
    () => entities.filter((e) => e?.isActive) || [],
    [entities]
  );

  const pendingIntercompany = useMemo(
    () =>
      intercompanyTransactions.filter(
        (t) => t?.reconciliationStatus === "pending"
      ) || [],
    [intercompanyTransactions]
  );

  const recentConsolidation = consolidationHistory[0] || null;

  const safeConsolidationSettings = useMemo(
    () => ({
      reportingCurrency: "INR",
      autoConsolidate: true,
      eliminationEntries: true,
      intercompanyReconciliation: true,
      consolidationMethod: "full",
      reportingPeriod: "monthly",
      ...consolidationSettings,
    }),
    [consolidationSettings]
  );

  // Auto-select all active entities on load
  useEffect(() => {
    if (activeEntities.length > 0 && selectedEntities.length === 0) {
      setSelectedEntities(activeEntities.map((e) => e.id));
    }
  }, [activeEntities, selectedEntities.length]);

  // Generate last 12 months dynamically
  const periodOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      options.push({ value, label });
    }
    return options;
  }, []);

  const handleRunConsolidation = useCallback(async () => {
    if (!runConsolidation || selectedEntities.length === 0) return;

    setLoading(true);
    try {
      const result = await runConsolidation(selectedPeriod, selectedEntities);
      setConsolidationResult(result);
      alert("Consolidation completed successfully!");
    } catch (error) {
      console.error("Consolidation failed:", error);
      alert("Consolidation failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [runConsolidation, selectedPeriod, selectedEntities]);

  const toggleEntitySelection = useCallback((entityId) => {
    setSelectedEntities((prev) =>
      prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId]
    );
  }, []);

  const handleAddEntity = useCallback(() => {
    if (!addEntity || !newEntity.name.trim() || !newEntity.code.trim()) {
      alert("Name and Code are required");
      return;
    }

    addEntity({
      ...newEntity,
      code: newEntity.code.toUpperCase(),
      exchangeRate: parseFloat(newEntity.exchangeRate) || 1,
    });

    setNewEntity({
      name: "",
      code: "",
      currency: "INR",
      type: "branch",
      exchangeRate: 1,
    });
    setShowAddEntity(false);
  }, [addEntity, newEntity]);

  const handleUpdateExchangeRate = useCallback(
    (entityId, value) => {
      if (!updateExchangeRate) return;
      const rate = parseFloat(value);
      if (!isNaN(rate) && rate > 0) {
        updateExchangeRate(entityId, rate);
      }
    },
    [updateExchangeRate]
  );

  // Consolidated Reports (memoized)
  const consolidatedBalanceSheet = useMemo(() => {
    if (!getConsolidatedBalanceSheet || selectedEntities.length === 0)
      return null;
    try {
      return getConsolidatedBalanceSheet(
        `${selectedPeriod}-01`,
        selectedEntities
      );
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [getConsolidatedBalanceSheet, selectedPeriod, selectedEntities]);

  const consolidatedPnl = useMemo(() => {
    if (!getConsolidatedProfitAndLoss || selectedEntities.length === 0)
      return null;
    try {
      const startDate = `${selectedPeriod}-01`;
      const endDate = new Date(selectedPeriod + "-01");
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      const end = endDate.toISOString().slice(0, 10);

      return getConsolidatedProfitAndLoss(startDate, end, selectedEntities);
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [getConsolidatedProfitAndLoss, selectedPeriod, selectedEntities]);

  const tabs = [
    { id: "overview", name: "Overview", icon: "ChartBarIcon" },
    { id: "entities", name: "Entities", icon: "BuildingOfficeIcon" },
    { id: "reports", name: "Reports", icon: "DocumentChartBarIcon" },
    { id: "intercompany", name: "Intercompany", icon: "ArrowPathIcon" },
    { id: "settings", name: "Settings", icon: "Cog6ToothIcon" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Finance Consolidation
            </h1>
            <p className="text-gray-600 mt-1">
              Multi-entity financial consolidation & reporting
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleRunConsolidation}
              disabled={
                loading || !runConsolidation || selectedEntities.length === 0
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>Run Consolidation</>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Active Entities",
              value: activeEntities.length,
              color: "blue",
            },
            {
              label: "Reporting Currency",
              value: safeConsolidationSettings.reportingCurrency,
              color: "green",
            },
            {
              label: "Pending IC Txns",
              value: pendingIntercompany.length,
              color: "yellow",
            },
            {
              label: "Last Run",
              value: recentConsolidation
                ? new Date(recentConsolidation.timestamp).toLocaleDateString()
                : "Never",
              color: "purple",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-200"
            >
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-300">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Consolidation Overview</h2>
              <span className="text-sm text-gray-600">
                {selectedEntities.length} / {activeEntities.length} entities
                selected
              </span>
            </div>

            {/* Entity Selection */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="font-medium mb-4">Select Entities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeEntities.map((entity) => (
                  <label
                    key={entity.id}
                    className="flex items-center p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEntities.includes(entity.id)}
                      onChange={() => toggleEntitySelection(entity.id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{entity.name}</p>
                      <p className="text-sm text-gray-500">
                        {entity.code} • {entity.currency}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick P&L Summary */}
            {consolidatedPnl && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    label: "Revenue",
                    value: consolidatedPnl.revenue,
                    color: "green",
                  },
                  {
                    label: "Expenses",
                    value: consolidatedPnl.expenses,
                    color: "red",
                  },
                  {
                    label: "Gross Profit",
                    value: consolidatedPnl.grossProfit,
                    color: "blue",
                    extra: `${consolidatedPnl.margin}% margin`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`p-6 rounded-xl bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 text-center`}
                  >
                    <div
                      className={`text-3xl font-bold text-${item.color}-900`}
                    >
                      {formatCurrency(item.value)}
                    </div>
                    <div className={`text-sm text-${item.color}-700 mt-1`}>
                      {item.label}
                    </div>
                    {item.extra && (
                      <div className="text-xs mt-1">{item.extra}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Entities Tab */}
        {activeTab === "entities" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Entity Management</h2>
              <button
                onClick={() => setShowAddEntity(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                Add Entity
              </button>
            </div>

            {showAddEntity && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Add New Entity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Name"
                    value={newEntity.name}
                    onChange={(e) =>
                      setNewEntity((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    placeholder="Code"
                    value={newEntity.code}
                    onChange={(e) =>
                      setNewEntity((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    className="px-4 py-2 border rounded-lg"
                  />
                  <select
                    value={newEntity.currency}
                    onChange={(e) =>
                      setNewEntity((prev) => ({
                        ...prev,
                        currency: e.target.value,
                      }))
                    }
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <select
                    value={newEntity.type}
                    onChange={(e) =>
                      setNewEntity((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="headquarters">Headquarters</option>
                    <option value="branch">Branch</option>
                    <option value="subsidiary">Subsidiary</option>
                  </select>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleAddEntity}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddEntity(false)}
                    className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {entities.map((entity) => (
                <div
                  key={entity.id}
                  className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        entity.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <div>
                      <p className="font-semibold">{entity.name}</p>
                      <p className="text-sm text-gray-600">
                        {entity.code} • {entity.currency} • {entity.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={entity.exchangeRate || 1}
                      onBlur={(e) =>
                        handleUpdateExchangeRate(entity.id, e.target.value)
                      }
                      className="w-24 px-3 py-1 border rounded text-sm"
                    />
                    <button
                      onClick={() => toggleEntityActive?.(entity.id)}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      {entity.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteEntity?.(entity.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs (Reports, Intercompany, Settings) */}
        {activeTab === "reports" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              Consolidated Reports
            </h2>
            {consolidatedPnl ? (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">
                  Profit & Loss - {selectedPeriod}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(consolidatedPnl.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expenses</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(consolidatedPnl.expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Gross Profit</span>
                    <span className="text-blue-600">
                      {formatCurrency(consolidatedPnl.grossProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margin</span>
                    <span>{consolidatedPnl.margin}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Run consolidation to view reports</p>
            )}
          </div>
        )}

        {activeTab === "intercompany" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              Intercompany Transactions
            </h2>
            <div className="space-y-4">
              {intercompanyTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No intercompany transactions
                </p>
              ) : (
                intercompanyTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-gray-600">
                        {entities.find((e) => e.id === tx.fromEntity)?.name} →{" "}
                        {entities.find((e) => e.id === tx.toEntity)?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(tx.amount)} {tx.currency}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          tx.reconciliationStatus === "reconciled"
                            ? "bg-green-100 text-green-800"
                            : tx.reconciliationStatus === "eliminated"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {tx.reconciliationStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              Consolidation Settings
            </h2>
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reporting Currency
                </label>
                <select
                  value={safeConsolidationSettings.reportingCurrency}
                  onChange={(e) =>
                    updateConsolidationSettings?.({
                      reportingCurrency: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consolidation;
