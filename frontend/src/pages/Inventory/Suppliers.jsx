// src/pages/purchase/Suppliers.jsx
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Star,
  Calendar,
  TrendingUp,
  BarChart3,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  User,
  DollarSign,
  Package,
  FileText,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useInventory } from "../../context/InventoryContext";
import {
  initialSuppliers,
  supplierCategories,
  paymentTerms,
} from "../../data/inventoryData";

// ✅ Export utilities
const exportToExcel = (suppliers, filename = "suppliers") => {
  try {
    // Create CSV content
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Contact Person",
      "Category",
      "Status",
      "Lead Time",
      "Rating",
      "Payment Terms",
      "Total Orders",
      "Total Spent",
      "On-time Delivery",
    ];
    const csvContent = [
      headers.join(","),
      ...suppliers.map((sup) =>
        [
          `"${sup.name}"`,
          `"${sup.email}"`,
          `"${sup.phone}"`,
          `"${sup.contactPerson || ""}"`,
          `"${sup.category}"`,
          `"${sup.status}"`,
          sup.leadTime,
          sup.rating,
          `"${sup.paymentTerms}"`,
          sup.totalOrders,
          sup.totalSpent,
          `${sup.onTimeDelivery}%`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Excel export error:", error);
    return false;
  }
};

const exportToPDF = (suppliers, filename = "suppliers") => {
  try {
    // Simple PDF generation using window.print() for now
    // In production, you can use libraries like jsPDF or pdfmake
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups for PDF export");
      return false;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Suppliers Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; font-weight: bold; }
          .summary { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
          .timestamp { color: #666; font-size: 12px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Suppliers Report</h1>
          <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
        </div>
        
        <div class="summary">
          <strong>Summary:</strong> ${suppliers.length} suppliers total, 
          ${suppliers.filter((s) => s.status === "Active").length} active,
          ${suppliers.filter((s) => s.status === "Inactive").length} inactive
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Category</th>
              <th>Status</th>
              <th>Lead Time</th>
              <th>Rating</th>
              <th>Total Orders</th>
            </tr>
          </thead>
          <tbody>
            ${suppliers
              .map(
                (sup) => `
              <tr>
                <td>${sup.name}</td>
                <td>${sup.contactPerson || "N/A"}</td>
                <td>${sup.email}</td>
                <td>${sup.category}</td>
                <td>${sup.status}</td>
                <td>${sup.leadTime} days</td>
                <td>${sup.rating}/5</td>
                <td>${sup.totalOrders}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          Report generated from Inventory Management System
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      // printWindow.close(); // Optional: close after printing
    }, 500);

    return true;
  } catch (error) {
    console.error("PDF export error:", error);
    return false;
  }
};

export default function Suppliers() {
  const {
    suppliers: contextSuppliers,
    stockLedger,
    products,
    addSupplier: contextAddSupplier,
    updateSupplier: contextUpdateSupplier,
    deleteSupplier: contextDeleteSupplier,
  } = useInventory();

  // Use context suppliers or fallback to initial data
  const [suppliers, setSuppliers] = useState(
    contextSuppliers.length > 0 ? contextSuppliers : initialSuppliers
  );

  const [activeView, setActiveView] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    leadTime: 7,
    rating: 5,
    category: "Electronics",
    paymentTerms: "Net 30",
    taxId: "",
    website: "",
    notes: "",
    status: "Active",
  });

  // ✅ Export handler functions
  const handleExportExcel = () => {
    const success = exportToExcel(filteredSuppliers, "suppliers_report");
    if (success) {
      alert("Excel file downloaded successfully!");
    } else {
      alert("Error exporting to Excel. Please try again.");
    }
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    const success = exportToPDF(filteredSuppliers, "suppliers_report");
    if (!success) {
      alert("Error generating PDF. Please try again.");
    }
    setShowExportMenu(false);
  };

  const handleExportAllExcel = () => {
    const success = exportToExcel(suppliers, "all_suppliers");
    if (success) {
      alert("All suppliers exported to Excel successfully!");
    } else {
      alert("Error exporting to Excel. Please try again.");
    }
    setShowExportMenu(false);
  };

  // === Supplier Performance Analytics ===
  const performanceMetrics = useMemo(() => {
    const activeSuppliers = suppliers.filter((s) => s.status === "Active");

    return {
      totalSuppliers: suppliers.length,
      activeSuppliers: activeSuppliers.length,
      avgLeadTime:
        activeSuppliers.length > 0
          ? (
              activeSuppliers.reduce((sum, s) => sum + s.leadTime, 0) /
              activeSuppliers.length
            ).toFixed(1)
          : 0,
      avgOnTimeDelivery:
        activeSuppliers.length > 0
          ? (
              activeSuppliers.reduce((sum, s) => sum + s.onTimeDelivery, 0) /
              activeSuppliers.length
            ).toFixed(1)
          : 0,
      avgRating:
        activeSuppliers.length > 0
          ? (
              activeSuppliers.reduce((sum, s) => sum + s.rating, 0) /
              activeSuppliers.length
            ).toFixed(1)
          : 0,
      totalSpent: suppliers.reduce((sum, s) => sum + s.totalSpent, 0),
      topPerformer: activeSuppliers.sort((a, b) => b.rating - a.rating)[0],
    };
  }, [suppliers]);

  // === FIXED Purchase History - Safe Implementation ===
  const purchaseHistory = useMemo(() => {
    try {
      return stockLedger
        .filter(
          (tx) =>
            tx.reference_type === "GRN" || tx.transaction_type === "receipt_in"
        )
        .map((tx) => {
          const referenceId = tx.reference_id ? tx.reference_id.toString() : "";

          let supplierName = "Unknown Supplier";
          if (suppliers.length > 0) {
            supplierName = suppliers[0].name;
          }

          return {
            id: tx.id,
            date: tx.created_at,
            product:
              products.find((p) => p.id === tx.product_id)?.name ||
              "Unknown Product",
            quantity: tx.qty,
            amount: tx.qty * (tx.unit_cost || 0),
            supplier: supplierName,
          };
        });
    } catch (error) {
      console.error("Error processing purchase history:", error);
      return [];
    }
  }, [stockLedger, products, suppliers]);

  // === Search + Filter ===
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contactPerson &&
          s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === "all" || s.status === filterStatus;
      const matchesCategory =
        filterCategory === "all" || s.category === filterCategory;
      const matchesView =
        activeView === "all" ||
        (activeView === "active" && s.status === "Active") ||
        (activeView === "inactive" && s.status === "Inactive");

      return matchesSearch && matchesStatus && matchesCategory && matchesView;
    });
  }, [suppliers, searchTerm, filterStatus, filterCategory, activeView]);

  // === Save Supplier ===
  const saveSupplier = () => {
    if (!form.name || !form.email) {
      alert("Company Name and Email are required!");
      return;
    }

    const newSupplier = {
      ...form,
      id: editing?.id || Date.now(),
      status: form.status || "Active",
      lastPurchase:
        editing?.lastPurchase || new Date().toISOString().split("T")[0],
      totalOrders: editing?.totalOrders || 0,
      completedOrders: editing?.completedOrders || 0,
      totalSpent: editing?.totalSpent || 0,
      onTimeDelivery: editing?.onTimeDelivery || 100,
      qualityRating: editing?.qualityRating || 5,
      performance: editing?.performance || "Good",
    };

    try {
      if (editing) {
        if (contextUpdateSupplier) {
          contextUpdateSupplier(newSupplier);
        }
        setSuppliers((prev) =>
          prev.map((s) => (s.id === editing.id ? newSupplier : s))
        );
      } else {
        if (contextAddSupplier) {
          contextAddSupplier(newSupplier);
        }
        setSuppliers((prev) => [...prev, newSupplier]);
      }

      setShowForm(false);
      setEditing(null);
      resetForm();
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert("Error saving supplier. Please try again.");
    }
  };

  // === Delete Supplier ===
  const deleteSupplier = (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        if (contextDeleteSupplier) {
          contextDeleteSupplier(id);
        }
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error("Error deleting supplier:", error);
        alert("Error deleting supplier. Please try again.");
      }
    }
  };

  // === Edit Supplier ===
  const startEdit = (supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone || "",
      address: supplier.address || "",
      contactPerson: supplier.contactPerson || "",
      leadTime: supplier.leadTime || 7,
      rating: supplier.rating || 5,
      category: supplier.category || "Electronics",
      paymentTerms: supplier.paymentTerms || "Net 30",
      taxId: supplier.taxId || "",
      website: supplier.website || "",
      notes: supplier.notes || "",
      status: supplier.status || "Active",
    });
    setShowForm(true);
  };

  // === View Supplier Details ===
  const viewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetail(true);
  };

  // === Reset Form ===
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
      leadTime: 7,
      rating: 5,
      category: "Electronics",
      paymentTerms: "Net 30",
      taxId: "",
      website: "",
      notes: "",
      status: "Active",
    });
  };

  // === Performance Badge ===
  const getPerformanceBadge = (performance) => {
    const styles = {
      Excellent: "bg-green-100 text-green-800",
      Good: "bg-blue-100 text-blue-800",
      Fair: "bg-yellow-100 text-yellow-800",
      Poor: "bg-red-100 text-red-800",
    };
    return styles[performance] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
          <p className="text-gray-600">
            Manage your supplier relationships and performance
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Supplier
        </button>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-800">
                {performanceMetrics.totalSuppliers}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {performanceMetrics.activeSuppliers} active
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Avg Lead Time</p>
              <p className="text-2xl font-bold text-gray-800">
                {performanceMetrics.avgLeadTime}d
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Average delivery time</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">On-time Delivery</p>
              <p className="text-2xl font-bold text-gray-800">
                {performanceMetrics.avgOnTimeDelivery}%
              </p>
            </div>
            <div className="p-2 rounded-full bg-orange-100 text-orange-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Average performance</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800">
                ${(performanceMetrics.totalSpent / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All-time purchases</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["all", "active", "inactive"].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-6 py-3 font-medium capitalize transition-colors ${
              activeView === view
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {view} (
            {view === "all"
              ? suppliers.length
              : suppliers.filter(
                  (s) =>
                    s.status === view.charAt(0).toUpperCase() + view.slice(1)
                ).length}
            )
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input"
        >
          <option value="all">All Categories</option>
          {supplierCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* ✅ FIXED Export Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 text-green-600" />
                  Export to Excel (Current)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  Export to PDF (Current)
                </button>
                <button
                  onClick={handleExportAllExcel}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  Export All to Excel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{sup.name}</h3>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      sup.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {sup.status}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getPerformanceBadge(
                      sup.performance
                    )}`}
                  >
                    {sup.performance}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(sup.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{sup.contactPerson || "No contact"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${sup.email}`} className="hover:text-blue-600">
                  {sup.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{sup.phone}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 border-t pt-3">
              <div className="text-center">
                <p className="font-bold text-gray-700">{sup.leadTime}d</p>
                <p>Lead Time</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-700">{sup.onTimeDelivery}%</p>
                <p>On Time</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-700">{sup.totalOrders}</p>
                <p>Orders</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => viewDetails(sup)}
                className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button
                onClick={() => startEdit(sup)}
                className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => deleteSupplier(sup.id)}
                className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 text-xs py-1.5 rounded flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Building2 className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p>No suppliers found.</p>
        </div>
      )}

      {/* === SUPPLIER DETAIL MODAL === */}
      {showDetail && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedSupplier.name}
                </h3>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${getPerformanceBadge(
                      selectedSupplier.performance
                    )}`}
                  >
                    {selectedSupplier.performance}
                  </span>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      selectedSupplier.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedSupplier.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="lg:col-span-2">
                <h4 className="font-semibold mb-3 text-lg">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Contact Person</p>
                        <p className="font-medium">
                          {selectedSupplier.contactPerson || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a
                          href={`mailto:${selectedSupplier.email}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {selectedSupplier.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedSupplier.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">
                          {selectedSupplier.address}
                        </p>
                      </div>
                    </div>
                    {selectedSupplier.website && (
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Website</p>
                          <a
                            href={`https://${selectedSupplier.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {selectedSupplier.website}
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedSupplier.taxId && (
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Tax ID</p>
                          <p className="font-medium">
                            {selectedSupplier.taxId}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-semibold mb-3 text-lg">
                  Performance Metrics
                </h4>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-lg">
                        {selectedSupplier.rating}
                      </span>
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">On-time Delivery</span>
                    <span
                      className={`font-semibold text-lg ${
                        selectedSupplier.onTimeDelivery >= 95
                          ? "text-green-600"
                          : selectedSupplier.onTimeDelivery >= 85
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedSupplier.onTimeDelivery}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quality Rating</span>
                    <span className="font-semibold text-lg">
                      {selectedSupplier.qualityRating}/5
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lead Time</span>
                    <span className="font-semibold text-lg">
                      {selectedSupplier.leadTime} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h4 className="font-semibold mb-3 text-lg">Business Details</h4>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm">Category</span>
                    <span className="font-medium">
                      {selectedSupplier.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Terms</span>
                    <span className="font-medium">
                      {selectedSupplier.paymentTerms}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Orders</span>
                    <span className="font-medium">
                      {selectedSupplier.totalOrders}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completed Orders</span>
                    <span className="font-medium">
                      {selectedSupplier.completedOrders}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h4 className="font-semibold mb-3 text-lg">
                  Financial Summary
                </h4>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Spent</span>
                    <span className="font-medium">
                      ${selectedSupplier.totalSpent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Purchase</span>
                    <span className="font-medium">
                      {selectedSupplier.lastPurchase || "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium text-green-600">
                      {selectedSupplier.totalOrders > 0
                        ? Math.round(
                            (selectedSupplier.completedOrders /
                              selectedSupplier.totalOrders) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Purchase History */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-lg">Recent Purchases</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center text-gray-500 py-4">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>
                    Purchase history will appear here as you create POs and GRNs
                  </p>
                  <p className="text-sm mt-1">
                    Recent transactions will be linked to suppliers
                    automatically
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedSupplier.notes && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2 text-lg">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {selectedSupplier.notes}
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  startEdit(selectedSupplier);
                  setShowDetail(false);
                }}
                className="btn-primary flex-1"
              >
                Edit Supplier
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === ADD / EDIT FORM MODAL === */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-5">
              {editing ? "Edit Supplier" : "Add New Supplier"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Company Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input md:col-span-2"
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                required
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
              />
              <input
                placeholder="Contact Person"
                value={form.contactPerson}
                onChange={(e) =>
                  setForm({ ...form, contactPerson: e.target.value })
                }
                className="input"
              />
              <textarea
                placeholder="Address"
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input md:col-span-2"
              />

              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="input"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Time (days)
                  </label>
                  <input
                    type="number"
                    value={form.leadTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        leadTime: parseInt(e.target.value) || 7,
                      })
                    }
                    className="input"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          rating: parseFloat(e.target.value) || 5,
                        })
                      }
                      className="input w-20"
                    />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="input"
                  >
                    {supplierCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={form.paymentTerms}
                    onChange={(e) =>
                      setForm({ ...form, paymentTerms: e.target.value })
                    }
                    className="input"
                  >
                    {paymentTerms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                placeholder="Tax ID"
                value={form.taxId}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                className="input"
              />
              <input
                placeholder="Website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="input"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  placeholder="Additional notes..."
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={saveSupplier} className="btn-primary flex-1">
                {editing ? "Update" : "Create"} Supplier
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  resetForm();
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
