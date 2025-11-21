// src/pages/inventory/WarehouseManagement.jsx
import { useInventory } from "../../context/InventoryContext";
import {
  Plus,
  Edit2,
  Trash2,
  Warehouse,
  MapPin,
  Package,
  Search,
  Filter,
  BarChart3,
  Users,
  Phone,
  Mail,
  Move,
  Truck,
  LayoutGrid,
  Settings,
  Download,
  Upload,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function WarehouseManagement() {
  const {
    warehouses = [],
    bins = [],
    stockSummary = [],
    stockLedger = [],
    addWarehouse,
    loading = false,
  } = useInventory();

  // All useState hooks at the top
  const [showWhForm, setShowWhForm] = useState(false);
  const [showBinForm, setShowBinForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [editingWh, setEditingWh] = useState(null);
  const [editingBin, setEditingBin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("warehouses");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [filters, setFilters] = useState({
    warehouseType: "all",
    status: "all",
    capacity: "all",
  });

  const [whForm, setWhForm] = useState({
    name: "",
    code: "",
    location: "",
    address: "",
    contact_person: "",
    phone: "",
    email: "",
    capacity: "",
    warehouse_type: "main",
    is_active: true,
  });

  const [binForm, setBinForm] = useState({
    warehouse_id: "",
    name: "",
    code: "",
    zone: "",
    rack: "",
    shelf: "",
    level: "",
    capacity: "",
    bin_type: "storage",
    is_active: true,
  });

  const [transferForm, setTransferForm] = useState({
    product_id: "",
    from_warehouse_id: "",
    to_warehouse_id: "",
    from_bin_id: "",
    to_bin_id: "",
    quantity: "",
    notes: "",
  });

  // All useMemo hooks after useState
  const warehouseStats = useMemo(() => {
    if (!warehouses.length) return [];

    return warehouses.map((warehouse) => {
      const warehouseBins = bins.filter(
        (bin) => bin.warehouse_id === warehouse.id
      );
      const warehouseStock = stockSummary.filter(
        (item) => item.warehouse_id === warehouse.id
      );
      const warehouseTransactions = stockLedger.filter(
        (tx) => tx.warehouse_id === warehouse.id
      );

      const totalStockValue = warehouseStock.reduce(
        (sum, item) => sum + (item.value || 0),
        0
      );
      const totalItems = warehouseStock.reduce(
        (sum, item) => sum + (item.stock || 0),
        0
      );
      const capacityUsed = warehouse.capacity
        ? (totalItems / warehouse.capacity) * 100
        : 0;

      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const recentActivity = warehouseTransactions.filter(
        (tx) => new Date(tx.created_at) >= last7Days
      ).length;

      return {
        ...warehouse,
        binCount: warehouseBins.length,
        totalStockValue,
        totalItems,
        capacityUsed,
        recentActivity,
        activeBins: warehouseBins.filter((bin) => bin.is_active).length,
      };
    });
  }, [warehouses, bins, stockSummary, stockLedger]);

  // Filtered warehouses with search and filters
  const filteredWarehouses = useMemo(() => {
    if (!warehouseStats.length) return [];

    let filtered = warehouseStats;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (warehouse) =>
          (warehouse.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (warehouse.code || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (warehouse.location || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.warehouseType !== "all") {
      filtered = filtered.filter(
        (warehouse) => warehouse.warehouse_type === filters.warehouseType
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((warehouse) =>
        filters.status === "active" ? warehouse.is_active : !warehouse.is_active
      );
    }

    // Capacity filter
    if (filters.capacity !== "all") {
      filtered = filtered.filter((warehouse) => {
        if (!warehouse.capacityUsed) return false;

        switch (filters.capacity) {
          case "low":
            return warehouse.capacityUsed < 50;
          case "medium":
            return warehouse.capacityUsed >= 50 && warehouse.capacityUsed < 80;
          case "high":
            return warehouse.capacityUsed >= 80;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [warehouseStats, searchTerm, filters]);

  // Bins with details - SAFE VERSION
  const binsWithDetails = useMemo(() => {
    if (!bins.length) return [];

    return bins.map((bin) => {
      const warehouse = warehouses.find((w) => w.id === bin.warehouse_id);
      const binStock = stockSummary.filter(
        (item) =>
          item.warehouse_id === bin.warehouse_id && item.bin_id === bin.id
      );

      const totalItems = binStock.reduce(
        (sum, item) => sum + (item.stock || 0),
        0
      );
      const capacityUsed = bin.capacity ? (totalItems / bin.capacity) * 100 : 0;

      return {
        ...bin,
        warehouse_name: warehouse?.name || "Unknown",
        totalItems,
        capacityUsed,
        stockValue: binStock.reduce((sum, item) => sum + (item.value || 0), 0),
        // Ensure all properties have safe defaults
        name: bin.name || "",
        code: bin.code || "",
        zone: bin.zone || "",
        rack: bin.rack || "",
        shelf: bin.shelf || "",
        level: bin.level || "",
        bin_type: bin.bin_type || "storage",
        is_active: bin.is_active !== undefined ? bin.is_active : true,
      };
    });
  }, [bins, warehouses, stockSummary]);

  // Filtered bins - SAFE VERSION
  const filteredBins = useMemo(() => {
    if (!binsWithDetails.length) return [];

    let filtered = binsWithDetails;

    // Search filter with safe property access
    if (searchTerm) {
      filtered = filtered.filter(
        (bin) =>
          (bin.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (bin.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (bin.warehouse_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (bin.zone || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Warehouse filter
    if (selectedWarehouse) {
      filtered = filtered.filter(
        (bin) => bin.warehouse_id === selectedWarehouse.id
      );
    }

    return filtered;
  }, [binsWithDetails, searchTerm, selectedWarehouse]);

  // Static data
  const putawayStrategies = useMemo(
    () => [
      {
        id: "fifo",
        name: "First In First Out",
        description: "Oldest stock gets used first",
      },
      {
        id: "fefo",
        name: "First Expiry First Out",
        description: "Soonest expiry gets used first",
      },
      {
        id: "lifo",
        name: "Last In First Out",
        description: "Newest stock gets used first",
      },
      {
        id: "nearest",
        name: "Nearest to Door",
        description: "Closest location to shipping area",
      },
    ],
    []
  );

  const pickingStrategies = useMemo(
    () => [
      {
        id: "piece",
        name: "Piece Picking",
        description: "Pick individual items per order",
      },
      {
        id: "batch",
        name: "Batch Picking",
        description: "Pick multiple orders simultaneously",
      },
      {
        id: "zone",
        name: "Zone Picking",
        description: "Assign zones to pickers",
      },
      {
        id: "wave",
        name: "Wave Picking",
        description: "Schedule picks in waves",
      },
    ],
    []
  );

  // Helper functions
  const getWarehouseBins = (warehouseId) => {
    return bins.filter((bin) => bin.warehouse_id === warehouseId);
  };

  const resetWhForm = () => {
    setWhForm({
      name: "",
      code: "",
      location: "",
      address: "",
      contact_person: "",
      phone: "",
      email: "",
      capacity: "",
      warehouse_type: "main",
      is_active: true,
    });
  };

  const resetBinForm = () => {
    setBinForm({
      warehouse_id: "",
      name: "",
      code: "",
      zone: "",
      rack: "",
      shelf: "",
      level: "",
      capacity: "",
      bin_type: "storage",
      is_active: true,
    });
  };

  const resetFilters = () => {
    setFilters({
      warehouseType: "all",
      status: "all",
      capacity: "all",
    });
  };

  // Active filters count
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "all"
  ).length;

  // Export functionality
  const exportToCSV = () => {
    let data = [];
    let filename = "";
    let headers = [];

    switch (activeTab) {
      case "warehouses":
        data = filteredWarehouses;
        filename = "warehouses.csv";
        headers = [
          "Name",
          "Code",
          "Type",
          "Location",
          "Bins",
          "Stock Value",
          "Capacity Used %",
          "Status",
        ];
        break;
      case "bins":
        data = filteredBins;
        filename = "bins.csv";
        headers = [
          "Code",
          "Name",
          "Warehouse",
          "Zone",
          "Rack",
          "Shelf",
          "Level",
          "Items",
          "Capacity Used %",
          "Status",
        ];
        break;
      default:
        return;
    }

    const csvContent = [
      headers.join(","),
      ...data.map((item) => {
        if (activeTab === "warehouses") {
          return [
            `"${item.name || ""}"`,
            `"${item.code || ""}"`,
            `"${item.warehouse_type || ""}"`,
            `"${item.location || ""}"`,
            item.binCount || 0,
            `$${(item.totalStockValue || 0).toLocaleString()}`,
            `${(item.capacityUsed || 0).toFixed(1)}%`,
            item.is_active ? "Active" : "Inactive",
          ].join(",");
        } else {
          return [
            `"${item.code || ""}"`,
            `"${item.name || ""}"`,
            `"${item.warehouse_name || ""}"`,
            `"${item.zone || ""}"`,
            `"${item.rack || ""}"`,
            `"${item.shelf || ""}"`,
            `"${item.level || ""}"`,
            item.totalItems || 0,
            `${(item.capacityUsed || 0).toFixed(1)}%`,
            item.is_active ? "Active" : "Inactive",
          ].join(",");
        }
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const content = `
Warehouse Management Report
Generated on: ${new Date().toLocaleDateString()}

${
  activeTab === "warehouses"
    ? `Total Warehouses: ${filteredWarehouses.length}\n\n` +
      filteredWarehouses
        .map(
          (wh) =>
            `${wh.name || "Unknown"} (${wh.code || "No Code"}) - ${
              wh.location || "No Location"
            } - ${wh.binCount || 0} bins - $${(
              wh.totalStockValue || 0
            ).toLocaleString()} - ${(wh.capacityUsed || 0).toFixed(
              1
            )}% capacity`
        )
        .join("\n")
    : `Total Bins: ${filteredBins.length}\n\n` +
      filteredBins
        .map(
          (bin) =>
            `${bin.code || "No Code"} - ${bin.warehouse_name || "Unknown"} - ${
              bin.zone || "No Zone"
            } - ${bin.totalItems || 0} items - ${(
              bin.capacityUsed || 0
            ).toFixed(1)}% capacity`
        )
        .join("\n")
}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${activeTab}_report_${new Date().getTime()}.txt`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Event handlers
  const handleEditWh = (warehouse) => {
    setEditingWh(warehouse);
    setWhForm({
      name: warehouse.name || "",
      code: warehouse.code || "",
      location: warehouse.location || "",
      address: warehouse.address || "",
      contact_person: warehouse.contact_person || "",
      phone: warehouse.phone || "",
      email: warehouse.email || "",
      capacity: warehouse.capacity || "",
      warehouse_type: warehouse.warehouse_type || "main",
      is_active: warehouse.is_active !== undefined ? warehouse.is_active : true,
    });
    setShowWhForm(true);
  };

  const handleEditBin = (bin) => {
    setEditingBin(bin);
    setBinForm({
      warehouse_id: bin.warehouse_id || "",
      name: bin.name || "",
      code: bin.code || "",
      zone: bin.zone || "",
      rack: bin.rack || "",
      shelf: bin.shelf || "",
      level: bin.level || "",
      capacity: bin.capacity || "",
      bin_type: bin.bin_type || "storage",
      is_active: bin.is_active !== undefined ? bin.is_active : true,
    });
    setShowBinForm(true);
  };

  const handleCancel = () => {
    setShowWhForm(false);
    setShowBinForm(false);
    setShowTransferForm(false);
    setShowFilters(false);
    setShowExportOptions(false);
    setEditingWh(null);
    setEditingBin(null);
    resetWhForm();
    resetBinForm();
  };

  const handleSaveWh = (e) => {
    e.preventDefault();

    const warehouseData = {
      ...whForm,
      capacity: whForm.capacity ? parseInt(whForm.capacity) : null,
    };

    try {
      addWarehouse(warehouseData);
      setShowWhForm(false);
      setEditingWh(null);
      resetWhForm();
    } catch (error) {
      alert(`Error saving warehouse: ${error.message}`);
    }
  };

  const handleSaveBin = (e) => {
    e.preventDefault();

    const binData = {
      ...binForm,
      warehouse_id: parseInt(binForm.warehouse_id),
      capacity: binForm.capacity ? parseInt(binForm.capacity) : null,
    };

    console.log("Save bin:", binData);
    setShowBinForm(false);
    setEditingBin(null);
    resetBinForm();
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    console.log("Process transfer:", transferForm);
    setShowTransferForm(false);
    setTransferForm({
      product_id: "",
      from_warehouse_id: "",
      to_warehouse_id: "",
      from_bin_id: "",
      to_bin_id: "",
      quantity: "",
      notes: "",
    });
  };

  // Safe Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading warehouse data...</div>
      </div>
    );
  }

  // Rest of the JSX remains the same, just using the safe filtered data...
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-blue-600" />
            Warehouse Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage warehouses, bins, transfers, and storage strategies
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowTransferForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Move className="w-4 h-4" />
            Transfer Stock
          </button>
          <button
            onClick={() => setShowWhForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </button>
          <button
            onClick={() => setShowBinForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Bin
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Warehouses</p>
              <p className="text-2xl font-bold text-gray-900">
                {warehouses.length}
              </p>
            </div>
            <Warehouse className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bins</p>
              <p className="text-2xl font-bold text-gray-900">{bins.length}</p>
            </div>
            <LayoutGrid className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Main Warehouses</p>
              <p className="text-2xl font-bold text-gray-900">
                {warehouses.filter((w) => w.warehouse_type === "main").length}
              </p>
            </div>
            <Package className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Branch Warehouses</p>
              <p className="text-2xl font-bold text-gray-900">
                {warehouses.filter((w) => w.warehouse_type === "branch").length}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="flex border-b overflow-x-auto">
          {["warehouses", "bins", "strategies", "transfers"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedWarehouse(null);
                resetFilters();
              }}
              className={`flex items-center gap-2 py-3 px-4 text-center font-medium whitespace-nowrap ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "warehouses" && <Warehouse className="w-4 h-4" />}
              {tab === "bins" && <LayoutGrid className="w-4 h-4" />}
              {tab === "strategies" && <Settings className="w-4 h-4" />}
              {tab === "transfers" && <Move className="w-4 h-4" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {(tab === "warehouses" || tab === "bins") && (
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {tab === "warehouses"
                    ? filteredWarehouses.length
                    : filteredBins.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Actions Bar */}
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              {(activeTab === "warehouses" || activeTab === "bins") && (
                <>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 relative"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowExportOptions(!showExportOptions)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Export Dropdown */}
                    {showExportOptions && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            exportToCSV();
                            setShowExportOptions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export as CSV
                        </button>
                        <button
                          onClick={() => {
                            exportToPDF();
                            setShowExportOptions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export as Text
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && activeTab === "warehouses" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Filters</h4>
                <div className="flex gap-2">
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse Type
                  </label>
                  <select
                    value={filters.warehouseType}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        warehouseType: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="main">Main Warehouse</option>
                    <option value="branch">Branch Warehouse</option>
                    <option value="store">Retail Store</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity Usage
                  </label>
                  <select
                    value={filters.capacity}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        capacity: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Capacity</option>
                    <option value="low">Low (&lt;50%)</option>
                    <option value="medium">Medium (50-80%)</option>
                    <option value="high">High (&gt;80%)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warehouses Tab */}
      {activeTab === "warehouses" && (
        <div className="space-y-4">
          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-800">
                    {filteredWarehouses.length} warehouses match your filters
                  </span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWarehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        {warehouse.name || "Unnamed Warehouse"}
                        <span className="text-sm font-normal text-gray-500">
                          ({warehouse.code || "No Code"})
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            warehouse.warehouse_type === "main"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {warehouse.warehouse_type === "main"
                            ? "Main"
                            : "Branch"}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            warehouse.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {warehouse.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        {warehouse.location || "No Location"}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(warehouse.contact_person || warehouse.phone) && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      {warehouse.contact_person && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                          <Users className="w-4 h-4" />
                          {warehouse.contact_person}
                        </div>
                      )}
                      {warehouse.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="w-4 h-4" />
                          {warehouse.phone}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center bg-gray-50 rounded p-2">
                      <div className="text-lg font-bold text-blue-600">
                        {warehouse.binCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Bins</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-2">
                      <div className="text-lg font-bold text-green-600">
                        $
                        {warehouse.totalStockValue > 1000
                          ? `${(warehouse.totalStockValue / 1000).toFixed(1)}k`
                          : Math.round(warehouse.totalStockValue || 0)}
                      </div>
                      <div className="text-xs text-gray-500">Value</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-2">
                      <div className="text-lg font-bold text-purple-600">
                        {warehouse.recentActivity || 0}
                      </div>
                      <div className="text-xs text-gray-500">Activity</div>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  {warehouse.capacity && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Capacity Usage</span>
                        <span>
                          {warehouse.totalItems || 0} / {warehouse.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (warehouse.capacityUsed || 0) > 80
                              ? "bg-red-500"
                              : (warehouse.capacityUsed || 0) > 60
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              warehouse.capacityUsed || 0,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {(warehouse.capacityUsed || 0).toFixed(1)}% utilized
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => {
                        setSelectedWarehouse(warehouse);
                        setActiveTab("bins");
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 transition-colors"
                    >
                      View Bins
                    </button>
                    <button
                      onClick={() => handleEditWh(warehouse)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWarehouses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No warehouses found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || activeFiltersCount > 0
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first warehouse"}
              </p>
              <button
                onClick={() => setShowWhForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Warehouse
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bins Tab */}
      {activeTab === "bins" && (
        <div className="space-y-6">
          {/* Warehouse Filter */}
          {selectedWarehouse && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Viewing bins for: {selectedWarehouse.name}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {getWarehouseBins(selectedWarehouse.id).length} bins in this
                    warehouse
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWarehouse(null)}
                  className="text-blue-700 hover:text-blue-900 text-sm"
                >
                  Show All Bins
                </button>
              </div>
            </div>
          )}

          {/* Bins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(selectedWarehouse
              ? filteredBins.filter(
                  (bin) => bin.warehouse_id === selectedWarehouse.id
                )
              : filteredBins
            ).map((bin) => (
              <div
                key={bin.id}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {bin.code || "No Code"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {bin.name || "Unnamed Bin"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      bin.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {bin.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Warehouse:</span>
                    <span className="font-medium">
                      {bin.warehouse_name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zone:</span>
                    <span className="font-medium">{bin.zone || "-"}</span>
                  </div>
                  {bin.rack && (
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">
                        {[bin.rack, bin.shelf, bin.level]
                          .filter(Boolean)
                          .join("-")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span className="font-medium">
                      {bin.totalItems || 0} items
                    </span>
                  </div>
                </div>

                {/* Capacity Bar */}
                {bin.capacity && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Capacity</span>
                      <span>
                        {bin.totalItems || 0} / {bin.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          (bin.capacityUsed || 0) > 80
                            ? "bg-red-500"
                            : (bin.capacityUsed || 0) > 60
                            ? "bg-orange-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(bin.capacityUsed || 0, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {(bin.capacityUsed || 0).toFixed(1)}% utilized
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleEditBin(bin)}
                    className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete bin ${bin.code || "this bin"}?`)) {
                        console.log("Delete bin:", bin.id);
                      }
                    }}
                    className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredBins.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <LayoutGrid className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No bins found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedWarehouse
                  ? "Try adjusting your search"
                  : "Get started by creating your first bin"}
              </p>
              <button
                onClick={() => setShowBinForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Bin
              </button>
            </div>
          )}
        </div>
      )}

      {/* Strategies Tab */}
      {activeTab === "strategies" && (
        <div className="space-y-6">
          {/* Putaway Strategies */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Putaway Strategies
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure how incoming stock is stored in your warehouses
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {putawayStrategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {strategy.name}
                      </h4>
                      <input
                        type="radio"
                        name="putaway_strategy"
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {strategy.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Picking Strategies */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />
                Picking Strategies
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure how orders are picked from your warehouses
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pickingStrategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className="border rounded-lg p-4 hover:border-green-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {strategy.name}
                      </h4>
                      <input
                        type="radio"
                        name="picking_strategy"
                        className="text-green-600 focus:ring-green-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {strategy.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfers Tab */}
      {activeTab === "transfers" && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Move className="w-5 h-5 text-purple-600" />
              Recent Transfers
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Track inter-warehouse stock transfers
            </p>
          </div>
          <div className="p-4">
            <div className="text-center py-8 text-gray-500">
              <Move className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No recent transfers found</p>
              <button
                onClick={() => setShowTransferForm(true)}
                className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                Create your first transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Form Modal */}
      {showWhForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {editingWh ? "Edit Warehouse" : "Add New Warehouse"}
              </h3>
            </div>

            <form onSubmit={handleSaveWh} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    value={whForm.name}
                    onChange={(e) =>
                      setWhForm({ ...whForm, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter warehouse name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse Code *
                  </label>
                  <input
                    type="text"
                    value={whForm.code}
                    onChange={(e) =>
                      setWhForm({ ...whForm, code: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Unique code (e.g., WH-MAIN)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse Type *
                  </label>
                  <select
                    value={whForm.warehouse_type}
                    onChange={(e) =>
                      setWhForm({ ...whForm, warehouse_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="main">Main Warehouse</option>
                    <option value="branch">Branch Warehouse</option>
                    <option value="store">Retail Store</option>
                    <option value="quality">Quality Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={whForm.location}
                    onChange={(e) =>
                      setWhForm({ ...whForm, location: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City, State"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    value={whForm.address}
                    onChange={(e) =>
                      setWhForm({ ...whForm, address: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Complete warehouse address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={whForm.contact_person}
                    onChange={(e) =>
                      setWhForm({ ...whForm, contact_person: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Warehouse manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={whForm.phone}
                    onChange={(e) =>
                      setWhForm({ ...whForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={whForm.capacity}
                    onChange={(e) =>
                      setWhForm({ ...whForm, capacity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Total capacity in units"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={whForm.email}
                    onChange={(e) =>
                      setWhForm({ ...whForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  checked={whForm.is_active}
                  onChange={(e) =>
                    setWhForm({ ...whForm, is_active: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">
                  Warehouse is active
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingWh ? "Update Warehouse" : "Create Warehouse"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bin Form Modal */}
      {showBinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBin ? "Edit Bin" : "Add New Bin"}
              </h3>
            </div>

            <form onSubmit={handleSaveBin} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse *
                  </label>
                  <select
                    value={binForm.warehouse_id}
                    onChange={(e) =>
                      setBinForm({ ...binForm, warehouse_id: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bin Code *
                  </label>
                  <input
                    type="text"
                    value={binForm.code}
                    onChange={(e) =>
                      setBinForm({ ...binForm, code: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., A1-01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bin Name
                  </label>
                  <input
                    type="text"
                    value={binForm.name}
                    onChange={(e) =>
                      setBinForm({ ...binForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descriptive name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone
                  </label>
                  <input
                    type="text"
                    value={binForm.zone}
                    onChange={(e) =>
                      setBinForm({ ...binForm, zone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., A, B, C"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rack
                  </label>
                  <input
                    type="text"
                    value={binForm.rack}
                    onChange={(e) =>
                      setBinForm({ ...binForm, rack: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rack number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shelf
                  </label>
                  <input
                    type="text"
                    value={binForm.shelf}
                    onChange={(e) =>
                      setBinForm({ ...binForm, shelf: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Shelf number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <input
                    type="text"
                    value={binForm.level}
                    onChange={(e) =>
                      setBinForm({ ...binForm, level: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Level number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={binForm.capacity}
                    onChange={(e) =>
                      setBinForm({ ...binForm, capacity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Maximum capacity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bin Type
                  </label>
                  <select
                    value={binForm.bin_type}
                    onChange={(e) =>
                      setBinForm({ ...binForm, bin_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="storage">Storage</option>
                    <option value="picking">Picking</option>
                    <option value="receiving">Receiving</option>
                    <option value="shipping">Shipping</option>
                    <option value="quality">Quality Hold</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  checked={binForm.is_active}
                  onChange={(e) =>
                    setBinForm({ ...binForm, is_active: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">Bin is active</label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingBin ? "Update Bin" : "Create Bin"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                Create Stock Transfer
              </h3>
            </div>

            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Warehouse *
                  </label>
                  <select
                    value={transferForm.from_warehouse_id}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        from_warehouse_id: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Source Warehouse</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Warehouse *
                  </label>
                  <select
                    value={transferForm.to_warehouse_id}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        to_warehouse_id: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Destination Warehouse</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product *
                  </label>
                  <select
                    value={transferForm.product_id}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        product_id: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Product</option>
                    {/* Products would be populated based on selected warehouse */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={transferForm.quantity}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        quantity: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Transfer quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Bin
                  </label>
                  <select
                    value={transferForm.from_bin_id}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        from_bin_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Source Bin</option>
                    {/* Bins would be populated based on selected warehouse */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Bin
                  </label>
                  <select
                    value={transferForm.to_bin_id}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        to_bin_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Destination Bin</option>
                    {/* Bins would be populated based on selected warehouse */}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Notes
                </label>
                <textarea
                  value={transferForm.notes}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Reason for transfer or special instructions"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Transfer
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
