import React, { useState, useEffect, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";

const Consolidation = () => {
  const {
    // Consolidation data
    entities = [],
    intercompanyTransactions = [],
    consolidationSettings = {},
    consolidationHistory = [],
    eliminationEntries = [],

    // Entity Management
    addEntity,
    updateEntity,
    toggleEntityActive,
    deleteEntity,
    updateExchangeRate,

    // Currency Management
    convertCurrency,

    // Intercompany Transactions
    addIntercompanyTransaction,
    reconcileIntercompanyTransaction,
    markIntercompanyAsEliminated,

    // Consolidated Reports
    getConsolidatedBalanceSheet,
    getConsolidatedProfitAndLoss,
    getConsolidatedTrialBalance,

    // Elimination Entries
    createEliminationEntry,
    autoGenerateEliminationEntries,

    // Consolidation Process
    runConsolidation,

    // Analysis & Performance
    getEntityPerformance,

    // Settings
    updateConsolidationSettings,

    // Utilities
    formatCurrency,
  } = useFinance();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toISOString().slice(0, 7)
  );
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

  // Safe defaults with proper error handling
  const activeEntities = useMemo(
    () => entities?.filter((e) => e?.isActive) || [],
    [entities]
  );
  const pendingIntercompany = useMemo(
    () =>
      intercompanyTransactions?.filter(
        (t) => t?.reconciliationStatus === "pending"
      ) || [],
    [intercompanyTransactions]
  );

  const recentConsolidation = consolidationHistory?.[0] || null;

  // Safe consolidation settings with defaults
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

  // Initialize selected entities
  useEffect(() => {
    if (activeEntities.length > 0 && selectedEntities.length === 0) {
      setSelectedEntities(activeEntities.map((e) => e.id));
    }
  }, [activeEntities, selectedEntities.length]);

  // Safe consolidation run function
  const handleRunConsolidation = async () => {
    if (!runConsolidation) {
      console.error("runConsolidation function not available");
      return;
    }

    setLoading(true);
    try {
      const result = runConsolidation(selectedPeriod, selectedEntities);
      setConsolidationResult(result);
    } catch (error) {
      console.error("Consolidation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle entity selection
  const toggleEntitySelection = (entityId) => {
    setSelectedEntities((prev) =>
      prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId]
    );
  };

  // Safe add entity function
  const handleAddEntity = () => {
    if (!addEntity) {
      console.error("addEntity function not available");
      return;
    }

    if (newEntity.name && newEntity.code) {
      addEntity(newEntity);
      setNewEntity({
        name: "",
        code: "",
        currency: "INR",
        type: "branch",
        exchangeRate: 1,
      });
      setShowAddEntity(false);
    }
  };

  // Safe exchange rate update
  const handleUpdateExchangeRate = (entityId, newRate) => {
    if (!updateExchangeRate) {
      console.error("updateExchangeRate function not available");
      return;
    }

    if (newRate && !isNaN(newRate) && newRate > 0) {
      updateExchangeRate(entityId, parseFloat(newRate));
    }
  };

  // Safe consolidated reports with error handling
  const consolidatedBalanceSheet = useMemo(() => {
    if (!getConsolidatedBalanceSheet) return null;
    try {
      return getConsolidatedBalanceSheet(
        `${selectedPeriod}-01`,
        selectedEntities
      );
    } catch (error) {
      console.error("Error getting consolidated balance sheet:", error);
      return null;
    }
  }, [getConsolidatedBalanceSheet, selectedPeriod, selectedEntities]);

  const consolidatedPnl = useMemo(() => {
    if (!getConsolidatedProfitAndLoss) return null;
    try {
      const periodEnd = new Date(
        new Date(`${selectedPeriod}-01`).getFullYear(),
        new Date(`${selectedPeriod}-01`).getMonth() + 1,
        0
      );
      return getConsolidatedProfitAndLoss(
        `${selectedPeriod}-01`,
        periodEnd.toISOString().slice(0, 10),
        selectedEntities
      );
    } catch (error) {
      console.error("Error getting consolidated P&L:", error);
      return null;
    }
  }, [getConsolidatedProfitAndLoss, selectedPeriod, selectedEntities]);

  // Safe entity performance
  const getSafeEntityPerformance = (entityId) => {
    if (!getEntityPerformance) return null;
    try {
      const periodEnd = new Date(
        new Date(`${selectedPeriod}-01`).getFullYear(),
        new Date(`${selectedPeriod}-01`).getMonth() + 1,
        0
      );
      return getEntityPerformance(
        entityId,
        `${selectedPeriod}-01`,
        periodEnd.toISOString().slice(0, 10)
      );
    } catch (error) {
      console.error("Error getting entity performance:", error);
      return null;
    }
  };

  // Tab navigation
  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "entities", name: "Entities", icon: "🏢" },
    { id: "reports", name: "Reports", icon: "📈" },
    { id: "intercompany", name: "Intercompany", icon: "🔄" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ];

  // Check if functions are available
  const hasConsolidationFunctions =
    !!runConsolidation && !!getConsolidatedBalanceSheet;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Finance Consolidation
            </h1>
            <p className="text-gray-600 mt-2">
              Multi-entity financial reporting and analysis
            </p>

            {!hasConsolidationFunctions && (
              <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Consolidation features are not fully available. Please
                  check if FinanceContext is properly configured.
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="2024-01">January 2024</option>
              <option value="2024-02">February 2024</option>
              <option value="2024-03">March 2024</option>
              <option value="2024-04">April 2024</option>
              <option value="2024-05">May 2024</option>
              <option value="2024-06">June 2024</option>
            </select>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleRunConsolidation}
              disabled={loading || !runConsolidation}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Running...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Run Consolidation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Entities
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {activeEntities.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Reporting Currency
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {safeConsolidationSettings.reportingCurrency}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">💱</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Transactions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pendingIntercompany.length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Run</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {recentConsolidation
                    ? new Date(
                        recentConsolidation.timestamp
                      ).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Consolidation Overview
              </h2>
              <div className="flex gap-2">
                <span className="text-sm text-gray-500">
                  Selected Entities:
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {selectedEntities.length} of {activeEntities.length}
                </span>
              </div>
            </div>

            {/* Entity Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">
                Select Entities for Consolidation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeEntities.map((entity) => (
                  <label
                    key={entity.id}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEntities.includes(entity.id)}
                      onChange={() => toggleEntitySelection(entity.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {entity.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {entity.code} • {entity.currency}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        entity.type === "headquarters"
                          ? "bg-purple-100 text-purple-800"
                          : entity.type === "branch"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {entity.type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            {consolidatedPnl && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency
                      ? formatCurrency(consolidatedPnl.revenue)
                      : `₹${consolidatedPnl.revenue}`}
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Total Revenue
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
                  <div className="text-2xl font-bold text-red-900">
                    {formatCurrency
                      ? formatCurrency(consolidatedPnl.expenses)
                      : `₹${consolidatedPnl.expenses}`}
                  </div>
                  <div className="text-sm text-red-700 mt-1">
                    Total Expenses
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency
                      ? formatCurrency(consolidatedPnl.grossProfit)
                      : `₹${consolidatedPnl.grossProfit}`}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">Gross Profit</div>
                  <div className="text-xs text-blue-600 mt-1">
                    ({consolidatedPnl.margin}% margin)
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">
                Recent Consolidation Runs
              </h3>
              <div className="space-y-3">
                {consolidationHistory.slice(0, 5).map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{run.period}</p>
                      <p className="text-sm text-gray-500">
                        {run.entities?.length || 0} entities •{" "}
                        {new Date(run.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        run.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : run.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                ))}
                {consolidationHistory.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No consolidation runs yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Entities Tab */}
        {activeTab === "entities" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Entity Management
              </h2>
              <button
                onClick={() => setShowAddEntity(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                disabled={!addEntity}
              >
                <span>+</span>
                Add Entity
              </button>
            </div>

            {/* Add Entity Form */}
            {showAddEntity && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  Add New Entity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Entity Name"
                    value={newEntity.name}
                    onChange={(e) =>
                      setNewEntity({ ...newEntity, name: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Entity Code"
                    value={newEntity.code}
                    onChange={(e) =>
                      setNewEntity({
                        ...newEntity,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={newEntity.currency}
                    onChange={(e) =>
                      setNewEntity({ ...newEntity, currency: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                  <select
                    value={newEntity.type}
                    onChange={(e) =>
                      setNewEntity({ ...newEntity, type: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="headquarters">Headquarters</option>
                    <option value="branch">Branch</option>
                    <option value="subsidiary">Subsidiary</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleAddEntity}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Entity
                  </button>
                  <button
                    onClick={() => setShowAddEntity(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Entities List */}
            <div className="space-y-4">
              {entities.map((entity) => (
                <div
                  key={entity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        entity.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{entity.name}</p>
                      <p className="text-sm text-gray-500">
                        {entity.code} • {entity.currency} • {entity.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Exchange Rate:
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={entity.exchangeRate || 1}
                        onBlur={(e) =>
                          handleUpdateExchangeRate(entity.id, e.target.value)
                        }
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() =>
                        toggleEntityActive && toggleEntityActive(entity.id)
                      }
                      className={`px-3 py-1 text-sm rounded ${
                        entity.isActive
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                      disabled={!toggleEntityActive}
                    >
                      {entity.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteEntity && deleteEntity(entity.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                      disabled={!deleteEntity}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {entities.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No entities found
                </p>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Consolidated Reports
            </h2>

            {/* Consolidated P&L */}
            {consolidatedPnl && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Consolidated Profit & Loss
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      Income Statement
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Total Revenue</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(consolidatedPnl.revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Total Expenses</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(consolidatedPnl.expenses)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 font-medium">
                        <span className="text-gray-700">Gross Profit</span>
                        <span className="text-blue-600">
                          {formatCurrency(consolidatedPnl.grossProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Profit Margin</span>
                        <span className="font-medium text-gray-700">
                          {consolidatedPnl.margin}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      Entity Breakdown
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(consolidatedPnl.entityBreakdown).map(
                        ([code, data]) => (
                          <div
                            key={code}
                            className="flex justify-between py-2 border-b border-gray-200"
                          >
                            <span className="text-gray-600">{code}</span>
                            <span className="font-medium text-gray-700">
                              {formatCurrency(data.profit)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Entity Performance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Entity Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedEntities.map((entityId) => {
                  const entity = entities.find((e) => e.id === entityId);
                  const performance = getEntityPerformance(
                    entityId,
                    `${selectedPeriod}-01`,
                    new Date(
                      new Date(`${selectedPeriod}-01`).getFullYear(),
                      new Date(`${selectedPeriod}-01`).getMonth() + 1,
                      0
                    )
                      .toISOString()
                      .slice(0, 10)
                  );

                  return entity && performance ? (
                    <div key={entity.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">
                        {entity.name}
                      </h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(performance.revenue)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profit:</span>
                          <span
                            className={`font-medium ${
                              performance.profit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(performance.profit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Intercompany Tab */}
        {activeTab === "intercompany" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Intercompany Transactions
              </h2>
              <span className="text-sm text-gray-500">
                {pendingIntercompany.length} pending transactions
              </span>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
              {intercompanyTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          transaction.reconciliationStatus === "reconciled"
                            ? "bg-green-100 text-green-800"
                            : transaction.reconciliationStatus === "eliminated"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.reconciliationStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      From:{" "}
                      {
                        entities.find((e) => e.id === transaction.fromEntity)
                          ?.name
                      }{" "}
                      → To:{" "}
                      {
                        entities.find((e) => e.id === transaction.toEntity)
                          ?.name
                      }{" "}
                      • Amount: {formatCurrency(transaction.amount)}{" "}
                      {transaction.currency} • Date:{" "}
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {transaction.reconciliationStatus === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            reconcileIntercompanyTransaction(transaction.id)
                          }
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Reconcile
                        </button>
                        <button
                          onClick={() =>
                            markIntercompanyAsEliminated(transaction.id)
                          }
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Eliminate
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {intercompanyTransactions.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No intercompany transactions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Consolidation Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reporting Settings */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  Reporting Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reporting Currency
                    </label>
                    <select
                      value={consolidationSettings.reportingCurrency}
                      onChange={(e) =>
                        updateConsolidationSettings({
                          reportingCurrency: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consolidation Method
                    </label>
                    <select
                      value={consolidationSettings.consolidationMethod}
                      onChange={(e) =>
                        updateConsolidationSettings({
                          consolidationMethod: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="full">Full Consolidation</option>
                      <option value="equity">Equity Method</option>
                      <option value="proportional">
                        Proportional Consolidation
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Process Settings */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  Process Settings
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={consolidationSettings.autoConsolidate}
                      onChange={(e) =>
                        updateConsolidationSettings({
                          autoConsolidate: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Auto-consolidate monthly
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={consolidationSettings.eliminationEntries}
                      onChange={(e) =>
                        updateConsolidationSettings({
                          eliminationEntries: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Generate elimination entries
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={consolidationSettings.intercompanyReconciliation}
                      onChange={(e) =>
                        updateConsolidationSettings({
                          intercompanyReconciliation: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Auto-reconcile intercompany
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consolidation;
