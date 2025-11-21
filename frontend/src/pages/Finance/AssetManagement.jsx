import React, { useState, useMemo } from "react";
import {
  Plus,
  Building,
  Truck,
  Cpu,
  Calculator,
  Move3D,
  Trash2,
  FileText,
  BarChart3,
  Download,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Tag,
  DollarSign,
  TrendingDown,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Printer,
  BarChart4,
} from "lucide-react";
import { format, parseISO, differenceInMonths, addMonths } from "date-fns";
import { useFinance } from "../../context/FinanceContext";

const FixedAssets = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    assets = [],
    assetCategories = [],
    depreciationMethods = [],
    locations = [],
    departments = [],
    depreciationHistory = [],
    transferHistory = [],
    disposalHistory = [],
    addAsset,
    updateAsset,
    deleteAsset,
    disposeAsset,
    transferAsset,
    calculateDepreciation,
    postMonthlyDepreciation,
    getAssetDepreciationSchedule,
  } = useFinance();

  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDisposalModal, setShowDisposalModal] = useState(false);
  const [showDepreciationScheduleModal, setShowDepreciationScheduleModal] =
    useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [assetForm, setAssetForm] = useState({
    name: "",
    category: "equipment",
    description: "",
    cost: "",
    purchaseDate: format(new Date(), "yyyy-MM-dd"),
    location: "",
    department: "",
    usefulLife: 5,
    depreciationMethod: "straight-line",
    salvageValue: "",
    tagNumber: "",
    serialNumber: "",
    vendor: "",
    warrantyExpiry: "",
    insurancePolicy: "",
    insuranceExpiry: "",
  });

  const [transferForm, setTransferForm] = useState({
    location: "",
    department: "",
    transferDate: format(new Date(), "yyyy-MM-dd"),
    transferredBy: "",
    reason: "",
  });

  const [disposalForm, setDisposalForm] = useState({
    disposalDate: format(new Date(), "yyyy-MM-dd"),
    method: "sale",
    proceeds: "",
    reason: "",
    disposedBy: "",
  });

  // Calculate totals and summaries
  const totals = useMemo(() => {
    const activeAssets = assets.filter((asset) => asset.status === "active");
    const totalCost = activeAssets.reduce(
      (sum, asset) => sum + (asset.cost || 0),
      0
    );
    const totalDepreciation = activeAssets.reduce(
      (sum, asset) => sum + (asset.accumulatedDepreciation || 0),
      0
    );
    const totalNetBookValue = activeAssets.reduce(
      (sum, asset) => sum + (asset.netBookValue || 0),
      0
    );

    const monthlyDepreciation = activeAssets.reduce((sum, asset) => {
      return (
        sum +
        (calculateDepreciation ? calculateDepreciation(asset.id, "monthly") : 0)
      );
    }, 0);

    return {
      totalCost,
      totalDepreciation,
      totalNetBookValue,
      activeAssets: activeAssets.length,
      disposedAssets: assets.filter((asset) => asset.status === "disposed")
        .length,
      maintenanceAssets: assets.filter(
        (asset) => asset.status === "maintenance"
      ).length,
      monthlyDepreciation,
    };
  }, [assets, calculateDepreciation]);

  // Filter assets based on search and filters
  const filteredAssets = useMemo(() => {
    let filtered = assets;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(term) ||
          asset.tagNumber.toLowerCase().includes(term) ||
          asset.description.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((asset) => asset.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((asset) => asset.category === categoryFilter);
    }

    return filtered;
  }, [assets, searchTerm, statusFilter, categoryFilter]);

  const handleAssetInputChange = (e) => {
    const { name, value } = e.target;
    setAssetForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransferInputChange = (e) => {
    const { name, value } = e.target;
    setTransferForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDisposalInputChange = (e) => {
    const { name, value } = e.target;
    setDisposalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAsset = (e) => {
    e.preventDefault();

    const assetData = {
      ...assetForm,
      cost: parseFloat(assetForm.cost),
      usefulLife: parseInt(assetForm.usefulLife),
      salvageValue: assetForm.salvageValue
        ? parseFloat(assetForm.salvageValue)
        : 0,
    };

    if (addAsset) {
      addAsset(assetData);
      resetAssetForm();
      setShowAssetModal(false);
    }
  };

  const handleUpdateAsset = (e) => {
    e.preventDefault();

    if (editingAsset && updateAsset) {
      const assetData = {
        ...assetForm,
        cost: parseFloat(assetForm.cost),
        usefulLife: parseInt(assetForm.usefulLife),
        salvageValue: assetForm.salvageValue
          ? parseFloat(assetForm.salvageValue)
          : 0,
      };

      updateAsset(editingAsset.id, assetData);
      resetAssetForm();
      setShowAssetModal(false);
      setEditingAsset(null);
    }
  };

  const handleTransferAsset = (e) => {
    e.preventDefault();

    if (selectedAsset && transferAsset) {
      transferAsset(selectedAsset.id, transferForm);
      setTransferForm({
        location: "",
        department: "",
        transferDate: format(new Date(), "yyyy-MM-dd"),
        transferredBy: "",
        reason: "",
      });
      setShowTransferModal(false);
      setSelectedAsset(null);
    }
  };

  const handleDisposeAsset = (e) => {
    e.preventDefault();

    if (selectedAsset && disposeAsset) {
      disposeAsset(selectedAsset.id, {
        ...disposalForm,
        proceeds: parseFloat(disposalForm.proceeds) || 0,
      });
      setDisposalForm({
        disposalDate: format(new Date(), "yyyy-MM-dd"),
        method: "sale",
        proceeds: "",
        reason: "",
        disposedBy: "",
      });
      setShowDisposalModal(false);
      setSelectedAsset(null);
    }
  };

  const resetAssetForm = () => {
    setAssetForm({
      name: "",
      category: "equipment",
      description: "",
      cost: "",
      purchaseDate: format(new Date(), "yyyy-MM-dd"),
      location: "",
      department: "",
      usefulLife: 5,
      depreciationMethod: "straight-line",
      salvageValue: "",
      tagNumber: "",
      serialNumber: "",
      vendor: "",
      warrantyExpiry: "",
      insurancePolicy: "",
      insuranceExpiry: "",
    });
  };

  // Add these utility functions at the top of your FixedAssets component
  const generatePDFReport = () => {
    // Create a comprehensive PDF report
    const reportContent = `
    FIXED ASSETS MANAGEMENT REPORT
    Generated on: ${new Date().toLocaleDateString()}
    
    SUMMARY:
    - Total Assets: ${assets.length}
    - Active Assets: ${totals.activeAssets}
    - Disposed Assets: ${totals.disposedAssets}
    - Total Cost: ₹${totals.totalCost.toLocaleString("en-IN")}
    - Total Depreciation: ₹${totals.totalDepreciation.toLocaleString("en-IN")}
    - Net Book Value: ₹${totals.totalNetBookValue.toLocaleString("en-IN")}
    
    ASSETS BY CATEGORY:
    ${assetCategories
      .map((cat) => {
        const categoryAssets = assets.filter(
          (asset) => asset.category === cat.id
        );
        const totalCost = categoryAssets.reduce(
          (sum, asset) => sum + (asset.cost || 0),
          0
        );
        return `    - ${cat.name}: ${
          categoryAssets.length
        } assets, ₹${totalCost.toLocaleString("en-IN")}`;
      })
      .join("\n")}
    
    RECENT ACTIVITY:
    - Recent Transfers: ${transferHistory.length}
    - Recent Disposals: ${disposalHistory.length}
  `;

    // Create a blob and download
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assets-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // Prepare data for Excel export
    const excelData = assets.map((asset) => ({
      "Asset Name": asset.name,
      "Tag Number": asset.tagNumber,
      Category: asset.category,
      Description: asset.description,
      Cost: asset.cost,
      "Purchase Date": asset.purchaseDate,
      Location: asset.location,
      Department: asset.department,
      Status: asset.status,
      "Useful Life": asset.usefulLife,
      "Depreciation Method": asset.depreciationMethod,
      "Accumulated Depreciation": asset.accumulatedDepreciation,
      "Net Book Value": asset.netBookValue,
      Vendor: asset.vendor,
      "Serial Number": asset.serialNumber,
      "Warranty Expiry": asset.warrantyExpiry,
    }));

    // Convert to CSV
    const headers = Object.keys(excelData[0] || {}).join(",");
    const rows = excelData.map((row) =>
      Object.values(row)
        .map((value) =>
          typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value
        )
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");

    // Create and download CSV file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assets-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    // Create a print-friendly version
    const printWindow = window.open("", "_blank");
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fixed Assets Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .summary { margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f5f5f5; }
        .section { margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Fixed Assets Management Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Assets:</strong> ${assets.length}</p>
        <p><strong>Active Assets:</strong> ${totals.activeAssets}</p>
        <p><strong>Total Cost:</strong> ₹${totals.totalCost.toLocaleString(
          "en-IN"
        )}</p>
        <p><strong>Net Book Value:</strong> ₹${totals.totalNetBookValue.toLocaleString(
          "en-IN"
        )}</p>
      </div>
      
      <div class="section">
        <h2>Assets List</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Cost</th>
              <th>Net Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${assets
              .map(
                (asset) => `
              <tr>
                <td>${asset.name}</td>
                <td>${asset.category}</td>
                <td>₹${asset.cost?.toLocaleString("en-IN")}</td>
                <td>₹${asset.netBookValue?.toLocaleString("en-IN")}</td>
                <td>${asset.status}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const loadAssetForEdit = (asset) => {
    setEditingAsset(asset);
    setAssetForm({
      name: asset.name || "",
      category: asset.category || "equipment",
      description: asset.description || "",
      cost: asset.cost || "",
      purchaseDate: asset.purchaseDate || format(new Date(), "yyyy-MM-dd"),
      location: asset.location || "",
      department: asset.department || "",
      usefulLife: asset.usefulLife || 5,
      depreciationMethod: asset.depreciationMethod || "straight-line",
      salvageValue: asset.salvageValue || "",
      tagNumber: asset.tagNumber || "",
      serialNumber: asset.serialNumber || "",
      vendor: asset.vendor || "",
      warrantyExpiry: asset.warrantyExpiry || "",
      insurancePolicy: asset.insurancePolicy || "",
      insuranceExpiry: asset.insuranceExpiry || "",
    });
    setShowAssetModal(true);
  };

  const loadAssetForTransfer = (asset) => {
    setSelectedAsset(asset);
    setTransferForm({
      location: asset.location || "",
      department: asset.department || "",
      transferDate: format(new Date(), "yyyy-MM-dd"),
      transferredBy: "",
      reason: "",
    });
    setShowTransferModal(true);
  };

  const loadAssetForDisposal = (asset) => {
    setSelectedAsset(asset);
    setDisposalForm({
      disposalDate: format(new Date(), "yyyy-MM-dd"),
      method: "sale",
      proceeds: asset.netBookValue || "",
      reason: "",
      disposedBy: "",
    });
    setShowDisposalModal(true);
  };

  const handlePostDepreciation = () => {
    if (postMonthlyDepreciation) {
      const records = postMonthlyDepreciation();
      alert(`Posted depreciation for ${records.length} assets`);
    }
  };

  const getAssetIcon = (category) => {
    switch (category) {
      case "property":
        return Building;
      case "vehicle":
        return Truck;
      case "equipment":
        return Cpu;
      case "machinery":
        return Cpu;
      case "furniture":
        return Building;
      case "computer":
        return Cpu;
      default:
        return Building;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "disposed":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return CheckCircle;
      case "disposed":
        return XCircle;
      case "maintenance":
        return Clock;
      default:
        return Clock;
    }
  };

  // Modal Components
  const AssetModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">
          {editingAsset ? "Edit Asset" : "Add New Asset"}
        </h3>
        <form
          onSubmit={editingAsset ? handleUpdateAsset : handleAddAsset}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Asset Name *
            </label>
            <input
              type="text"
              name="name"
              value={assetForm.name}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              name="category"
              value={assetForm.category}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Category</option>
              {assetCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tag Number *
            </label>
            <input
              type="text"
              name="tagNumber"
              value={assetForm.tagNumber}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={assetForm.description}
              onChange={handleAssetInputChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cost (₹) *</label>
            <input
              type="number"
              name="cost"
              value={assetForm.cost}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Salvage Value (₹)
            </label>
            <input
              type="number"
              name="salvageValue"
              value={assetForm.salvageValue}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={assetForm.purchaseDate}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Useful Life (years)
            </label>
            <input
              type="number"
              name="usefulLife"
              value={assetForm.usefulLife}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              min="1"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <select
              name="location"
              value={assetForm.location}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              name="department"
              value={assetForm.department}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Depreciation Method
            </label>
            <select
              name="depreciationMethod"
              value={assetForm.depreciationMethod}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {depreciationMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Serial Number
            </label>
            <input
              type="text"
              name="serialNumber"
              value={assetForm.serialNumber}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <input
              type="text"
              name="vendor"
              value={assetForm.vendor}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Warranty Expiry
            </label>
            <input
              type="date"
              name="warrantyExpiry"
              value={assetForm.warrantyExpiry}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Insurance Policy
            </label>
            <input
              type="text"
              name="insurancePolicy"
              value={assetForm.insurancePolicy}
              onChange={handleAssetInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex gap-3 md:col-span-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAssetModal(false);
                setEditingAsset(null);
                resetAssetForm();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingAsset ? "Update" : "Add"} Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const TransferModal = () => {
    const [localForm, setLocalForm] = useState({
      location: "",
      department: "",
      transferDate: format(new Date(), "yyyy-MM-dd"),
      transferredBy: "",
      reason: "",
    });

    // Initialize form when asset is selected
    React.useEffect(() => {
      if (selectedAsset) {
        setLocalForm({
          location: selectedAsset.location || "",
          department: selectedAsset.department || "",
          transferDate: format(new Date(), "yyyy-MM-dd"),
          transferredBy: "",
          reason: "",
        });
      }
    }, [selectedAsset]);

    const handleLocalInputChange = (e) => {
      const { name, value, type } = e.target;

      // For text inputs, allow normal typing behavior
      if (type === "text" || type === "textarea") {
        setLocalForm((prev) => ({
          ...prev,
          [name]: value,
        }));
      } else {
        setLocalForm((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    };

    const handleLocalSelectChange = (name, value) => {
      setLocalForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleTransferSubmit = (e) => {
      e.preventDefault();

      // Validate required fields
      if (
        !localForm.location ||
        !localForm.department ||
        !localForm.transferredBy
      ) {
        alert("Please fill in all required fields (marked with *)");
        return;
      }

      if (selectedAsset && transferAsset) {
        // Prepare transfer data
        const transferData = {
          location: localForm.location,
          department: localForm.department,
          transferDate: localForm.transferDate,
          transferredBy: localForm.transferredBy.trim(),
          reason: localForm.reason.trim(),
        };

        // Call the transfer function
        transferAsset(selectedAsset.id, transferData);

        // Reset form and close modal
        setLocalForm({
          location: "",
          department: "",
          transferDate: format(new Date(), "yyyy-MM-dd"),
          transferredBy: "",
          reason: "",
        });
        setShowTransferModal(false);
        setSelectedAsset(null);

        // Show success message
        alert(
          `Asset "${selectedAsset.name}" has been transferred successfully!`
        );
      }
    };

    const handleCloseModal = () => {
      setShowTransferModal(false);
      setSelectedAsset(null);
      setLocalForm({
        location: "",
        department: "",
        transferDate: format(new Date(), "yyyy-MM-dd"),
        transferredBy: "",
        reason: "",
      });
    };

    // Get current asset details for display
    const currentAssetDetails = selectedAsset
      ? {
          name: selectedAsset.name || "Unknown Asset",
          tagNumber: selectedAsset.tagNumber || "N/A",
          location: selectedAsset.location || "Not specified",
          department: selectedAsset.department || "Not specified",
          category: selectedAsset.category
            ? selectedAsset.category.charAt(0).toUpperCase() +
              selectedAsset.category.slice(1)
            : "Unknown",
        }
      : null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Transfer Asset
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Move asset to new location or department
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Asset Information */}
            {currentAssetDetails && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 text-lg">
                      {currentAssetDetails.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Tag:</span>
                        <span className="text-blue-600 ml-1">
                          {currentAssetDetails.tagNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">
                          Category:
                        </span>
                        <span className="text-blue-600 ml-1 capitalize">
                          {currentAssetDetails.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">
                          Current Location:
                        </span>
                        <span className="text-blue-600 ml-1">
                          {currentAssetDetails.location}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">
                          Current Department:
                        </span>
                        <span className="text-blue-600 ml-1">
                          {currentAssetDetails.department}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 p-2 bg-blue-100 rounded-lg">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Form */}
            <form onSubmit={handleTransferSubmit} className="space-y-5">
              {/* Location Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  New Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  value={localForm.location}
                  onChange={handleLocalInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                  required
                >
                  <option value="">Select new location...</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Where will this asset be moved to?
                </p>
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  New Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={localForm.department}
                  onChange={handleLocalInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                  required
                >
                  <option value="">Select new department...</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Which department will now manage this asset?
                </p>
              </div>

              {/* Transfer Date */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Transfer Date
                </label>
                <input
                  type="date"
                  name="transferDate"
                  value={localForm.transferDate}
                  onChange={handleLocalInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  When is this transfer effective from?
                </p>
              </div>

              {/* Transferred By */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Transferred By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="transferredBy"
                  value={localForm.transferredBy}
                  onChange={handleLocalInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 placeholder-gray-400"
                  placeholder="Enter the name of person authorizing transfer"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Who is authorizing this transfer?
                </p>
              </div>

              {/* Reason for Transfer */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Reason for Transfer
                </label>
                <textarea
                  name="reason"
                  value={localForm.reason}
                  onChange={handleLocalInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 resize-vertical placeholder-gray-400"
                  placeholder="Please provide a detailed reason for transferring this asset. This helps maintain proper audit trails and understanding of asset movements..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Explain why this asset needs to be transferred
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200 hover:border-gray-400 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    !localForm.location ||
                    !localForm.department ||
                    !localForm.transferredBy
                  }
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>

          {/* Footer with additional info */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              This transfer will be recorded in the asset's history and audit
              trail.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DisposalModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Dispose Asset</h3>
        {selectedAsset && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg">
            <h4 className="font-semibold">{selectedAsset.name}</h4>
            <div className="text-sm space-y-1">
              <p>
                Net Book Value: ₹
                {selectedAsset.netBookValue?.toLocaleString("en-IN")}
              </p>
              <p>
                Accumulated Depreciation: ₹
                {selectedAsset.accumulatedDepreciation?.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}
        <form onSubmit={handleDisposeAsset}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Disposal Method *
              </label>
              <select
                name="method"
                value={disposalForm.method}
                onChange={handleDisposalInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="sale">Sale</option>
                <option value="scrap">Scrap</option>
                <option value="donation">Donation</option>
                <option value="trade-in">Trade-in</option>
                <option value="destroyed">Destroyed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Disposal Date
              </label>
              <input
                type="date"
                name="disposalDate"
                value={disposalForm.disposalDate}
                onChange={handleDisposalInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {disposalForm.method === "donation"
                  ? "Fair Market Value"
                  : "Proceeds (₹)"}
              </label>
              <input
                type="number"
                name="proceeds"
                value={disposalForm.proceeds}
                onChange={handleDisposalInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Disposed By *
              </label>
              <input
                type="text"
                name="disposedBy"
                value={disposalForm.disposedBy}
                onChange={handleDisposalInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Reason for Disposal *
              </label>
              <textarea
                name="reason"
                value={disposalForm.reason}
                onChange={handleDisposalInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDisposalModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Dispose Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DepreciationScheduleModal = ({ asset }) => {
    const schedule = getAssetDepreciationSchedule
      ? getAssetDepreciationSchedule(asset.id)
      : [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              Depreciation Schedule - {asset.name}
            </h3>
            <button
              onClick={() => setShowDepreciationScheduleModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Cost:</span> ₹
              {asset.cost?.toLocaleString("en-IN")}
            </div>
            <div>
              <span className="font-medium">Useful Life:</span>{" "}
              {asset.usefulLife} years
            </div>
            <div>
              <span className="font-medium">Method:</span>{" "}
              {asset.depreciationMethod}
            </div>
            <div>
              <span className="font-medium">Salvage Value:</span> ₹
              {asset.salvageValue?.toLocaleString("en-IN")}
            </div>
          </div>

          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border">Year</th>
                <th className="px-4 py-2 border">Annual Depreciation</th>
                <th className="px-4 py-2 border">Accumulated Depreciation</th>
                <th className="px-4 py-2 border">Net Book Value</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((yearData, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">
                    {yearData.year}
                  </td>
                  <td className="px-4 py-2 border text-right">
                    ₹
                    {yearData.annualDepreciation.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-2 border text-right">
                    ₹
                    {yearData.accumulatedDepreciation.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-2 border text-right">
                    ₹
                    {yearData.netBookValue.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "overview", label: "Asset Overview", icon: Eye },
    { id: "add", label: "Add New Asset", icon: Plus },
    { id: "depreciation", label: "Depreciation", icon: Calculator },
    { id: "transfer", label: "Transfer", icon: Move3D },
    { id: "disposal", label: "Disposal", icon: Trash2 },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Fixed Assets Management
              </h1>
              <p className="text-gray-600 mt-1">
                Track, depreciate, and manage company fixed assets
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ₹{totals.totalNetBookValue.toLocaleString("en-IN")}
              </div>
              <div className="text-sm text-gray-500">Total Net Book Value</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Active Assets",
              value: totals.activeAssets,
              icon: CheckCircle,
              color: "green",
            },
            {
              label: "Total Cost",
              value: `₹${totals.totalCost.toLocaleString("en-IN")}`,
              icon: DollarSign,
              color: "blue",
            },
            {
              label: "Accumulated Depreciation",
              value: `₹${totals.totalDepreciation.toLocaleString("en-IN")}`,
              icon: TrendingDown,
              color: "orange",
            },
            {
              label: "Monthly Depreciation",
              value: `₹${totals.monthlyDepreciation.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}`,
              icon: Calculator,
              color: "purple",
            },
          ].map((metric, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p
                    className={`text-2xl font-bold text-${metric.color}-600 mt-1`}
                  >
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                  <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-1">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-semibold">All Assets</h2>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disposed">Disposed</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {assetCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setEditingAsset(null);
                      resetAssetForm();
                      setShowAssetModal(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Add Asset
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Asset</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Cost</th>
                      <th className="px-4 py-3 font-medium">Accum. Dep.</th>
                      <th className="px-4 py-3 font-medium">Net Value</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAssets.map((asset) => {
                      const AssetIcon = getAssetIcon(asset.category);
                      const StatusIcon = getStatusIcon(asset.status);
                      return (
                        <tr key={asset.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <AssetIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{asset.name}</div>
                                <div className="text-xs text-gray-500">
                                  {asset.tagNumber}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize">
                            {asset.category}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            ₹{asset.cost?.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 text-orange-600">
                            ₹
                            {asset.accumulatedDepreciation?.toLocaleString(
                              "en-IN"
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-green-600">
                            ₹{asset.netBookValue?.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-3 h-3" />
                              {asset.location}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                asset.status
                              )}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {asset.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => loadAssetForEdit(asset)}
                                className="p-1 text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setShowDepreciationScheduleModal(true);
                                }}
                                className="p-1 text-green-600 hover:text-green-900"
                                title="Depreciation Schedule"
                              >
                                <Calculator className="w-4 h-4" />
                              </button>
                              {asset.status === "active" && (
                                <>
                                  <button
                                    onClick={() => loadAssetForTransfer(asset)}
                                    className="p-1 text-purple-600 hover:text-purple-900"
                                    title="Transfer"
                                  >
                                    <Move3D className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => loadAssetForDisposal(asset)}
                                    className="p-1 text-red-600 hover:text-red-900"
                                    title="Dispose"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredAssets.length === 0 && (
                <div className="text-center py-12">
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {assets.length === 0
                      ? "No assets yet"
                      : "No assets match your search"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {assets.length === 0
                      ? "Start by adding your first fixed asset."
                      : "Try adjusting your search criteria."}
                  </p>
                  {assets.length === 0 && (
                    <button
                      onClick={() => {
                        setEditingAsset(null);
                        resetAssetForm();
                        setShowAssetModal(true);
                      }}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-5 h-5" /> Add Your First Asset
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add New Asset Tab */}
          {activeTab === "add" && (
            <div className="max-w-4xl">
              <h2 className="text-xl font-semibold mb-6">Add New Asset</h2>
              <form
                onSubmit={handleAddAsset}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={assetForm.name}
                    onChange={handleAssetInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter asset name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={assetForm.category}
                    onChange={handleAssetInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {assetCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tag Number *
                  </label>
                  <input
                    type="text"
                    name="tagNumber"
                    value={assetForm.tagNumber}
                    onChange={handleAssetInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="e.g., FA-001"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={assetForm.description}
                    onChange={handleAssetInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the asset..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cost (₹) *
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={assetForm.cost}
                    onChange={handleAssetInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Salvage Value (₹)
                  </label>
                  <input
                    type="number"
                    name="salvageValue"
                    value={assetForm.salvageValue}
                    onChange={handleAssetInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={assetForm.purchaseDate}
                    onChange={handleAssetInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Useful Life (years)
                  </label>
                  <input
                    type="number"
                    name="usefulLife"
                    value={assetForm.usefulLife}
                    onChange={handleAssetInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <select
                    name="location"
                    value={assetForm.location}
                    onChange={handleAssetInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={assetForm.department}
                    onChange={handleAssetInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Add Asset
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Depreciation Tab */}
          {activeTab === "depreciation" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Depreciation Management
                </h2>
                <button
                  onClick={handlePostDepreciation}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <RefreshCw className="w-4 h-4" /> Post Monthly Depreciation
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets
                  .filter((asset) => asset.status === "active")
                  .map((asset) => {
                    const monthlyDep = calculateDepreciation
                      ? calculateDepreciation(asset.id, "monthly")
                      : 0;
                    const annualDep = monthlyDep * 12;
                    const remainingLife =
                      asset.usefulLife -
                      Math.ceil(asset.accumulatedDepreciation / annualDep);

                    return (
                      <div
                        key={asset.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-lg">
                            {asset.name}
                          </h4>
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowDepreciationScheduleModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Schedule
                          </button>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Monthly Depreciation:
                            </span>
                            <span className="font-medium">
                              ₹
                              {monthlyDep.toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Annual Depreciation:
                            </span>
                            <span className="font-medium">
                              ₹
                              {annualDep.toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Accumulated:</span>
                            <span className="font-medium text-orange-600">
                              ₹
                              {asset.accumulatedDepreciation?.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Remaining Life:
                            </span>
                            <span className="font-medium">
                              {remainingLife} years
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Method:</span>
                            <span className="capitalize">
                              {asset.depreciationMethod?.replace("-", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {assets.filter((asset) => asset.status === "active").length ===
                0 && (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No active assets
                  </h3>
                  <p className="text-gray-600">
                    Add active assets to see depreciation calculations.
                  </p>
                </div>
              )}

              {/* Depreciation History */}
              {depreciationHistory.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Depreciation History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 border">Period</th>
                          <th className="px-4 py-2 border">Asset</th>
                          <th className="px-4 py-2 border">Amount</th>
                          <th className="px-4 py-2 border">Posted At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {depreciationHistory.slice(0, 10).map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">
                              {record.period}
                            </td>
                            <td className="px-4 py-2 border">
                              {record.assetName}
                            </td>
                            <td className="px-4 py-2 border text-right">
                              ₹
                              {record.depreciationAmount.toLocaleString(
                                "en-IN",
                                { maximumFractionDigits: 2 }
                              )}
                            </td>
                            <td className="px-4 py-2 border">
                              {format(
                                parseISO(record.postedAt),
                                "MMM dd, yyyy"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transfer Tab */}
          {activeTab === "transfer" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Asset Transfer History</h2>

              {/* Transfer Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Transfer Asset</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Asset
                    </label>
                    <select
                      onChange={(e) => {
                        const asset = assets.find(
                          (a) => a.id === e.target.value
                        );
                        if (asset) {
                          setSelectedAsset(asset);
                          setTransferForm((prev) => ({
                            ...prev,
                            location: asset.location,
                            department: asset.department,
                          }));
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select an asset</option>
                      {assets
                        .filter((a) => a.status === "active")
                        .map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.name} - {asset.location}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {selectedAsset && (
                  <form
                    onSubmit={handleTransferAsset}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Current Location
                      </label>
                      <input
                        type="text"
                        value={selectedAsset.location}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        New Location *
                      </label>
                      <select
                        name="location"
                        value={transferForm.location}
                        onChange={handleTransferInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      >
                        <option value="">Select Location</option>
                        {locations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Current Department
                      </label>
                      <input
                        type="text"
                        value={selectedAsset.department}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        New Department *
                      </label>
                      <select
                        name="department"
                        value={transferForm.department}
                        onChange={handleTransferInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Reason for Transfer
                      </label>
                      <textarea
                        name="reason"
                        value={transferForm.reason}
                        onChange={handleTransferInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                      >
                        Transfer Asset
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Transfer History */}
              {transferHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Transfers
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 border">Date</th>
                          <th className="px-4 py-2 border">Asset</th>
                          <th className="px-4 py-2 border">From</th>
                          <th className="px-4 py-2 border">To</th>
                          <th className="px-4 py-2 border">Transferred By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transferHistory.slice(0, 10).map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">
                              {format(
                                parseISO(record.transferDate),
                                "MMM dd, yyyy"
                              )}
                            </td>
                            <td className="px-4 py-2 border">
                              {record.assetName}
                            </td>
                            <td className="px-4 py-2 border">
                              {record.fromLocation} - {record.fromDepartment}
                            </td>
                            <td className="px-4 py-2 border">
                              {record.toLocation} - {record.toDepartment}
                            </td>
                            <td className="px-4 py-2 border">
                              {record.transferredBy}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disposal Tab */}
          {activeTab === "disposal" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Asset Disposal</h2>

              {/* Disposal Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Dispose Asset</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Asset
                    </label>
                    <select
                      onChange={(e) => {
                        const asset = assets.find(
                          (a) =>
                            a.id === e.target.value && a.status === "active"
                        );
                        if (asset) {
                          setSelectedAsset(asset);
                          setDisposalForm((prev) => ({
                            ...prev,
                            proceeds: asset.netBookValue || "",
                          }));
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select an asset to dispose</option>
                      {assets
                        .filter((a) => a.status === "active")
                        .map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.name} - NBV: ₹
                            {asset.netBookValue?.toLocaleString("en-IN")}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {selectedAsset && (
                  <form
                    onSubmit={handleDisposeAsset}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Asset Value
                      </label>
                      <div className="space-y-1 p-2 bg-gray-100 rounded">
                        <div className="flex justify-between text-sm">
                          <span>Cost:</span>
                          <span>
                            ₹{selectedAsset.cost?.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Accum. Depreciation:</span>
                          <span>
                            ₹
                            {selectedAsset.accumulatedDepreciation?.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Net Book Value:</span>
                          <span>
                            ₹
                            {selectedAsset.netBookValue?.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Disposal Method *
                      </label>
                      <select
                        name="method"
                        value={disposalForm.method}
                        onChange={handleDisposalInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      >
                        <option value="sale">Sale</option>
                        <option value="scrap">Scrap</option>
                        <option value="donation">Donation</option>
                        <option value="trade-in">Trade-in</option>
                        <option value="destroyed">Destroyed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {disposalForm.method === "donation"
                          ? "Fair Market Value"
                          : "Proceeds (₹)"}
                      </label>
                      <input
                        type="number"
                        name="proceeds"
                        value={disposalForm.proceeds}
                        onChange={handleDisposalInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Disposed By *
                      </label>
                      <input
                        type="text"
                        name="disposedBy"
                        value={disposalForm.disposedBy}
                        onChange={handleDisposalInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Reason for Disposal *
                      </label>
                      <textarea
                        name="reason"
                        value={disposalForm.reason}
                        onChange={handleDisposalInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                      >
                        Dispose Asset
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Disposal History */}
              {disposalHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Disposal History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 border">Date</th>
                          <th className="px-4 py-2 border">Asset</th>
                          <th className="px-4 py-2 border">Method</th>
                          <th className="px-4 py-2 border">Net Book Value</th>
                          <th className="px-4 py-2 border">Proceeds</th>
                          <th className="px-4 py-2 border">Gain/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disposalHistory.slice(0, 10).map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">
                              {format(
                                parseISO(record.disposalDate),
                                "MMM dd, yyyy"
                              )}
                            </td>
                            <td className="px-4 py-2 border">
                              {record.assetName}
                            </td>
                            <td className="px-4 py-2 border capitalize">
                              {record.disposalMethod}
                            </td>
                            <td className="px-4 py-2 border text-right">
                              ₹{record.netBookValue.toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-2 border text-right">
                              ₹{record.proceeds.toLocaleString("en-IN")}
                            </td>
                            <td
                              className={`px-4 py-2 border text-right ${
                                record.gainLoss > 0
                                  ? "text-green-600"
                                  : record.gainLoss < 0
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              ₹
                              {Math.abs(record.gainLoss).toLocaleString(
                                "en-IN"
                              )}
                              {record.gainLoss > 0
                                ? " Gain"
                                : record.gainLoss < 0
                                ? " Loss"
                                : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Reports & Analytics</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print Report
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Export Excel
                  </button>
                  <button
                    onClick={generatePDFReport}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Export PDF
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {assets.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Assets</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {totals.activeAssets}
                  </div>
                  <div className="text-sm text-gray-600">Active Assets</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{totals.totalDepreciation.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Depreciation
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {disposalHistory.length}
                  </div>
                  <div className="text-sm text-gray-600">Assets Disposed</div>
                </div>
              </div>

              {/* Category-wise Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Assets by Category
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-right">Count</th>
                        <th className="px-4 py-2 text-right">Total Cost</th>
                        <th className="px-4 py-2 text-right">Net Book Value</th>
                        <th className="px-4 py-2 text-right">Depreciation %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {assetCategories.map((category) => {
                        const categoryAssets = assets.filter(
                          (asset) => asset.category === category.id
                        );
                        const totalCost = categoryAssets.reduce(
                          (sum, asset) => sum + (asset.cost || 0),
                          0
                        );
                        const totalDepreciation = categoryAssets.reduce(
                          (sum, asset) =>
                            sum + (asset.accumulatedDepreciation || 0),
                          0
                        );
                        const depreciationRate =
                          totalCost > 0
                            ? (totalDepreciation / totalCost) * 100
                            : 0;

                        return (
                          <tr key={category.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 capitalize">
                              {category.name}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {categoryAssets.length}
                            </td>
                            <td className="px-4 py-2 text-right">
                              ₹{totalCost.toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-2 text-right">
                              ₹
                              {(totalCost - totalDepreciation).toLocaleString(
                                "en-IN"
                              )}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {depreciationRate.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Department-wise Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Assets by Department
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-right">Count</th>
                        <th className="px-4 py-2 text-right">Total Cost</th>
                        <th className="px-4 py-2 text-right">
                          Avg. Age (months)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {departments.map((dept) => {
                        const deptAssets = assets.filter(
                          (asset) => asset.department === dept
                        );
                        const totalCost = deptAssets.reduce(
                          (sum, asset) => sum + (asset.cost || 0),
                          0
                        );
                        const avgAge =
                          deptAssets.length > 0
                            ? deptAssets.reduce((sum, asset) => {
                                const purchaseDate = asset.purchaseDate
                                  ? parseISO(asset.purchaseDate)
                                  : new Date();
                                return (
                                  sum +
                                  differenceInMonths(new Date(), purchaseDate)
                                );
                              }, 0) / deptAssets.length
                            : 0;

                        return (
                          <tr key={dept} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{dept}</td>
                            <td className="px-4 py-2 text-right">
                              {deptAssets.length}
                            </td>
                            <td className="px-4 py-2 text-right">
                              ₹{totalCost.toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {avgAge.toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Transfers
                  </h3>
                  {transferHistory.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <div className="font-medium">{record.assetName}</div>
                        <div className="text-sm text-gray-600">
                          {record.fromLocation} → {record.toLocation}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        {format(parseISO(record.transferDate), "MMM dd")}
                      </div>
                    </div>
                  ))}
                  {transferHistory.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No transfer history
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Disposals
                  </h3>
                  {disposalHistory.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <div className="font-medium">{record.assetName}</div>
                        <div className="text-sm text-gray-600 capitalize">
                          {record.disposalMethod}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-medium ${
                            record.gainLoss > 0
                              ? "text-green-600"
                              : record.gainLoss < 0
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          ₹{record.proceeds.toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(parseISO(record.disposalDate), "MMM dd")}
                        </div>
                      </div>
                    </div>
                  ))}
                  {disposalHistory.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No disposal history
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAssetModal && <AssetModal />}
      {showTransferModal && <TransferModal />}
      {showDisposalModal && <DisposalModal />}
      {showDepreciationScheduleModal && selectedAsset && (
        <DepreciationScheduleModal asset={selectedAsset} />
      )}
    </div>
  );
};

export default FixedAssets;
