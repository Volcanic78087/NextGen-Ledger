// src/pages/inventory/Products.jsx
import { useInventory } from "../../context/InventoryContext";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Package,
  Search,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

export default function Products() {
  const {
    products = [],
    stockSummary = [],
    lowStockAlerts = [],
    addProduct,
    updateProduct,
    deleteProduct,
    loading = false,
  } = useInventory();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    sku: "",
    category: "",
    unit_cost: "",
    selling_price: "",
    reorder_point: "",
    min_stock: "",
    max_stock: "",
    uom: "Piece",
    hsn_code: "",
    supplier_id: "",
    is_active: true,
  });

  // Get current stock from stockSummary
  const getCurrentStock = (productId) => {
    const summary = stockSummary.find((s) => s.product_id === productId);
    return summary ? summary.stock : 0;
  };

  // Get product value
  const getProductValue = (productId) => {
    const summary = stockSummary.find((s) => s.product_id === productId);
    return summary ? summary.value : 0;
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  // Categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.category))];
    return uniqueCategories.filter(Boolean);
  }, [products]);

  // Products with unique keys to handle duplicate IDs
  const productsWithUniqueKeys = useMemo(() => {
    const seen = new Set();
    const uniqueProducts = [];

    filteredProducts.forEach((product, index) => {
      let uniqueKey = product.id;

      // If duplicate ID found or no ID, create a unique one
      if (!uniqueKey || seen.has(uniqueKey)) {
        uniqueKey = `product-${product.id || "no-id"}-${index}`;
      }

      seen.add(uniqueKey);
      uniqueProducts.push({
        ...product,
        _uniqueKey: uniqueKey,
      });
    });

    return uniqueProducts;
  }, [filteredProducts]);

  // Debug duplicate keys
  useEffect(() => {
    const productIds = products.map((p) => p.id);
    const duplicateIds = productIds.filter(
      (id, index) => productIds.indexOf(id) !== index
    );

    if (duplicateIds.length > 0) {
      console.warn("Duplicate product IDs found:", duplicateIds);
    }
  }, [products]);

  // Delete product handler
  const handleDelete = async (product) => {
    if (
      !confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(product.id);

    try {
      if (deleteProduct) {
        await deleteProduct(product.id);
        console.log(`Product "${product.name}" deleted successfully`);
      } else {
        // Fallback if deleteProduct is not available in context
        console.warn("deleteProduct function not available in context");
        alert("Delete functionality is not available at the moment.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(`Error deleting product: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.name.trim() || !form.sku.trim()) {
      alert("Product name and SKU are required");
      return;
    }

    const productData = {
      ...form,
      unit_cost: parseFloat(form.unit_cost) || 0,
      selling_price: parseFloat(form.selling_price) || 0,
      reorder_point: parseInt(form.reorder_point) || 0,
      min_stock: parseInt(form.min_stock) || 0,
      max_stock: parseInt(form.max_stock) || 0,
    };

    try {
      if (editing) {
        // Update existing product
        updateProduct(productData);
      } else {
        // Add new product
        addProduct(productData);
      }

      setShowForm(false);
      setEditing(null);
      resetForm();
    } catch (error) {
      alert(`Error saving product: ${error.message}`);
    }
  };

  // Reset form properly
  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      sku: "",
      category: "",
      unit_cost: "",
      selling_price: "",
      reorder_point: "",
      min_stock: "",
      max_stock: "",
      uom: "Piece",
      hsn_code: "",
      supplier_id: "",
      is_active: true,
    });
  };

  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit_cost: product.unit_cost,
      selling_price: product.selling_price,
      reorder_point: product.reorder_point,
      min_stock: product.min_stock,
      max_stock: product.max_stock,
      uom: product.uom,
      hsn_code: product.hsn_code,
      supplier_id: product.supplier_id,
      is_active: product.is_active,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    resetForm();
  };

  // ✅ MOVED: Loading check after all hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Products Master
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your product catalog and inventory settings
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Low Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockAlerts.map((item, index) => (
              <div
                key={`alert-${item.product_id}-${index}`}
                className="bg-white p-3 rounded border"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Current: {item.stock} | Reorder: {item.reorder_point}
                    </p>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    Low Stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>

          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productsWithUniqueKeys.map((product) => {
                const stock = getCurrentStock(product.id);
                const value = getProductValue(product.id);
                const isLowStock = stock <= product.reorder_point;
                const isDeleting = deletingId === product.id;

                return (
                  <tr
                    key={product._uniqueKey}
                    className={`hover:bg-gray-50 ${
                      isLowStock ? "bg-orange-50" : ""
                    } ${isDeleting ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ${product.unit_cost}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ${product.selling_price}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isLowStock ? "text-orange-600" : "text-gray-900"
                          }`}
                        >
                          {stock}
                        </span>
                        {isLowStock && (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ${value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          disabled={isDeleting}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete product"
                        >
                          {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          disabled={isDeleting}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {productsWithUniqueKeys.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products found. {searchTerm && "Try changing your search terms."}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {editing ? "Edit Product" : "Add New Product"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Unique SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Product category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={form.hsn_code}
                    onChange={(e) =>
                      setForm({ ...form, hsn_code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="HSN code for GST"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Cost *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.unit_cost}
                    onChange={(e) =>
                      setForm({ ...form, unit_cost: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.selling_price}
                    onChange={(e) =>
                      setForm({ ...form, selling_price: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Point
                  </label>
                  <input
                    type="number"
                    value={form.reorder_point}
                    onChange={(e) =>
                      setForm({ ...form, reorder_point: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Minimum stock level"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    value={form.min_stock}
                    onChange={(e) =>
                      setForm({ ...form, min_stock: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Safety stock"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Stock
                  </label>
                  <input
                    type="number"
                    value={form.max_stock}
                    onChange={(e) =>
                      setForm({ ...form, max_stock: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Maximum stock capacity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={form.uom}
                    onChange={(e) => setForm({ ...form, uom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Piece">Piece</option>
                    <option value="Kg">Kilogram</option>
                    <option value="Meter">Meter</option>
                    <option value="Box">Box</option>
                    <option value="Packet">Packet</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">
                  Product is active
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editing ? "Update Product" : "Create Product"}
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
