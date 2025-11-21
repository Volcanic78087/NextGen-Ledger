import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import { initializeMockData } from "../data/inventoryData";

const InventoryContext = createContext();

// Constants
const LOW_STOCK_THRESHOLD = 5;
const EXPIRY_ALERT_DAYS = 30;

// Quality Status Types
const QUALITY_STATUS = {
  PASS: "pass",
  HOLD: "hold",
  FAIL: "fail",
  PENDING: "pending",
};

// Sales Order Status
const SALES_ORDER_STATUS = {
  DRAFT: "draft",
  CONFIRMED: "confirmed",
  ALLOCATED: "allocated",
  SHIPPED: "shipped",
  CANCELLED: "cancelled",
};

// Initial state
const initialState = {
  warehouses: [],
  bins: [],
  stockLedger: [],
  products: [],
  suppliers: [],
  categories: [],
  loading: true,
  error: null,
  filters: {
    warehouse: "all",
    category: "all",
    stockStatus: "all",
  },
  // Quality Management
  qualityChecks: [],
  quarantineStocks: [],
  qualityHoldLocations: [],
  // Sales Integration
  salesOrders: [],
  stockReservations: [],
  customerReservations: [],
};

// Reducer
const inventoryReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "LOAD_DATA":
      return {
        ...state,
        ...action.payload,
        loading: false,
      };

    case "ADD_STOCK_TX":
      return {
        ...state,
        stockLedger: [action.payload, ...state.stockLedger],
      };

    case "UPDATE_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case "ADD_PRODUCT":
      return {
        ...state,
        products: [...state.products, action.payload],
      };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };

    case "ADD_WAREHOUSE":
      return {
        ...state,
        warehouses: [...state.warehouses, action.payload],
      };

    case "CLEAR_LEDGER":
      return {
        ...state,
        stockLedger: [],
        products: [],
        warehouses: [{ id: 1, name: "Main Warehouse" }],
        bins: [{ id: 1, name: "A1" }],
      };

    // Quality Management Actions
    case "ADD_QUALITY_CHECK":
      return {
        ...state,
        qualityChecks: [action.payload, ...state.qualityChecks],
      };

    case "UPDATE_QUALITY_STATUS":
      return {
        ...state,
        qualityChecks: state.qualityChecks.map((check) =>
          check.id === action.payload.checkId
            ? {
                ...check,
                status: action.payload.status,
                remarks: action.payload.remarks,
              }
            : check
        ),
      };

    case "ADD_QUARANTINE_STOCK":
      return {
        ...state,
        quarantineStocks: [action.payload, ...state.quarantineStocks],
      };

    case "RELEASE_QUARANTINE_STOCK":
      return {
        ...state,
        quarantineStocks: state.quarantineStocks.filter(
          (item) => item.id !== action.payload
        ),
      };

    // Sales Integration Actions
    case "ADD_SALES_ORDER":
      return {
        ...state,
        salesOrders: [action.payload, ...state.salesOrders],
      };

    case "UPDATE_SALES_ORDER_STATUS":
      return {
        ...state,
        salesOrders: state.salesOrders.map((order) =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        ),
      };

    case "ADD_STOCK_RESERVATION":
      return {
        ...state,
        stockReservations: [action.payload, ...state.stockReservations],
      };

    case "RELEASE_STOCK_RESERVATION":
      return {
        ...state,
        stockReservations: state.stockReservations.filter(
          (reservation) => reservation.id !== action.payload
        ),
      };

    case "ADD_SUPPLIER":
      return {
        ...state,
        suppliers: [...state.suppliers, action.payload],
      };

    case "UPDATE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };

    case "DELETE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.filter((s) => s.id !== action.payload),
      };

    default:
      return state;
  }
};

export const InventoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Helper function for available stock calculation
  const getAvailableStockForSales = (productId) => {
    const stockItem = stockSummary.find(
      (item) => item.product_id === productId
    );
    if (!stockItem) return 0;

    const quarantinedQty = state.quarantineStocks
      .filter((q) => q.product_id === productId)
      .reduce((sum, q) => sum + q.quantity, 0);

    const reservedQty = state.stockReservations
      .filter((r) => r.product_id === productId)
      .reduce((sum, r) => sum + r.quantity, 0);

    return Math.max(0, stockItem.stock - quarantinedQty - reservedQty);
  };

  // Load from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedLedger = localStorage.getItem("erp_inventory_ledger");
        const savedProducts = localStorage.getItem("erp_inventory_products");
        const savedWarehouses = localStorage.getItem(
          "erp_inventory_warehouses"
        );
        const savedQualityChecks = localStorage.getItem("erp_quality_checks");
        const savedQuarantineStocks = localStorage.getItem(
          "erp_quarantine_stocks"
        );
        const savedSalesOrders = localStorage.getItem("erp_sales_orders");
        const savedStockReservations = localStorage.getItem(
          "erp_stock_reservations"
        );
        const savedSuppliers = localStorage.getItem("erp_suppliers");

        const ledger = savedLedger ? JSON.parse(savedLedger) : [];
        const products = savedProducts ? JSON.parse(savedProducts) : [];
        const warehouses = savedWarehouses ? JSON.parse(savedWarehouses) : [];
        const qualityChecks = savedQualityChecks
          ? JSON.parse(savedQualityChecks)
          : [];
        const quarantineStocks = savedQuarantineStocks
          ? JSON.parse(savedQuarantineStocks)
          : [];
        const salesOrders = savedSalesOrders
          ? JSON.parse(savedSalesOrders)
          : [];
        const stockReservations = savedStockReservations
          ? JSON.parse(savedStockReservations)
          : [];
        const suppliers = savedSuppliers ? JSON.parse(savedSuppliers) : [];

        // If no data, initialize with mock data
        if (ledger.length === 0 && products.length === 0) {
          const mockData = initializeMockData();
          if (mockData) {
            dispatch({
              type: "LOAD_DATA",
              payload: {
                stockLedger: mockData.stockLedger || [],
                products: mockData.products || [],
                warehouses: mockData.warehouses || [
                  { id: 1, name: "Main Warehouse" },
                ],
                suppliers: mockData.suppliers || [],
                bins: [
                  { id: 1, name: "A1" },
                  { id: 2, name: "A2" },
                  { id: 3, name: "B1" },
                  { id: 4, name: "Q1", is_quarantine: true },
                  { id: 5, name: "Q2", is_quarantine: true },
                ],
                categories: [
                  "Electronics",
                  "Furniture",
                  "Office Supplies",
                  "Raw Materials",
                ],
                qualityChecks: mockData.qualityChecks || [],
                quarantineStocks: mockData.quarantineStocks || [],
                salesOrders: mockData.salesOrders || [],
                stockReservations: mockData.stockReservations || [],
              },
            });
          }
          return;
        }

        dispatch({
          type: "LOAD_DATA",
          payload: {
            stockLedger: ledger,
            products,
            warehouses:
              warehouses.length > 0
                ? warehouses
                : [{ id: 1, name: "Main Warehouse" }],
            suppliers,
            bins: [
              { id: 1, name: "A1" },
              { id: 2, name: "A2" },
              { id: 3, name: "B1" },
              { id: 4, name: "Q1", is_quarantine: true },
              { id: 5, name: "Q2", is_quarantine: true },
            ],
            categories: [
              "Electronics",
              "Furniture",
              "Office Supplies",
              "Raw Materials",
            ],
            qualityChecks,
            quarantineStocks,
            salesOrders,
            stockReservations,
          },
        });
      } catch (e) {
        console.error("Failed to load inventory data", e);
        // Initialize with empty data if loading fails
        dispatch({
          type: "LOAD_DATA",
          payload: {
            stockLedger: [],
            products: [],
            warehouses: [{ id: 1, name: "Main Warehouse" }],
            suppliers: [],
            bins: [
              { id: 1, name: "A1" },
              { id: 2, name: "A2" },
              { id: 3, name: "B1" },
              { id: 4, name: "Q1", is_quarantine: true },
              { id: 5, name: "Q2", is_quarantine: true },
            ],
            categories: [
              "Electronics",
              "Furniture",
              "Office Supplies",
              "Raw Materials",
            ],
            qualityChecks: [],
            quarantineStocks: [],
            salesOrders: [],
            stockReservations: [],
          },
        });
      }
    };

    loadData();
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (!state.loading) {
      localStorage.setItem(
        "erp_inventory_ledger",
        JSON.stringify(state.stockLedger)
      );
      localStorage.setItem(
        "erp_inventory_products",
        JSON.stringify(state.products)
      );
      localStorage.setItem(
        "erp_inventory_warehouses",
        JSON.stringify(state.warehouses)
      );
      localStorage.setItem(
        "erp_quality_checks",
        JSON.stringify(state.qualityChecks)
      );
      localStorage.setItem(
        "erp_quarantine_stocks",
        JSON.stringify(state.quarantineStocks)
      );
      localStorage.setItem(
        "erp_sales_orders",
        JSON.stringify(state.salesOrders)
      );
      localStorage.setItem(
        "erp_stock_reservations",
        JSON.stringify(state.stockReservations)
      );
      localStorage.setItem("erp_suppliers", JSON.stringify(state.suppliers));
    }
  }, [
    state.stockLedger,
    state.products,
    state.warehouses,
    state.loading,
    state.qualityChecks,
    state.quarantineStocks,
    state.salesOrders,
    state.stockReservations,
    state.suppliers,
  ]);

  // Add stock transaction
  const addStockTransaction = (tx) => {
    const {
      product_id,
      warehouse_id = 1,
      bin_id = 1,
      transaction_type,
      qty,
      unit_cost = 0,
    } = tx;

    if (!product_id || qty <= 0 || !transaction_type) {
      console.error("Invalid transaction", tx);
      throw new Error("Invalid transaction data");
    }

    const product = state.products.find((p) => p.id === product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    const warehouse = state.warehouses.find((w) => w.id === warehouse_id);
    const bin = state.bins.find((b) => b.id === bin_id);

    const entry = {
      ...tx,
      id: Date.now() + Math.random(),
      product_name: product.name,
      warehouse_name: warehouse?.name || "Unknown",
      bin_name: bin?.name || "Unknown",
      unit_cost: unit_cost || product.unit_cost || 0,
      balance:
        getCurrentStock(product_id, warehouse_id, bin_id) +
        (["purchase_in", "transfer_in", "return_in", "production_in"].includes(
          transaction_type
        )
          ? qty
          : -qty),
      qty_in: [
        "purchase_in",
        "transfer_in",
        "return_in",
        "production_in",
      ].includes(transaction_type)
        ? qty
        : 0,
      qty_out: [
        "sales_out",
        "transfer_out",
        "return_out",
        "production_out",
      ].includes(transaction_type)
        ? qty
        : 0,
      created_at: new Date().toISOString(),
      created_by: "user",
    };

    dispatch({ type: "ADD_STOCK_TX", payload: entry });
    return entry;
  };

  // Get current stock for a specific product/location
  const getCurrentStock = (productId, warehouseId = 1, binId = null) => {
    const relevantTxs = state.stockLedger.filter(
      (t) =>
        t.product_id === productId &&
        t.warehouse_id === warehouseId &&
        (binId === null || t.bin_id === binId)
    );

    return relevantTxs.reduce((sum, t) => {
      if (
        ["purchase_in", "transfer_in", "return_in", "production_in"].includes(
          t.transaction_type
        )
      ) {
        return sum + t.qty;
      } else if (
        ["sales_out", "transfer_out", "return_out", "production_out"].includes(
          t.transaction_type
        )
      ) {
        return sum - t.qty;
      }
      return sum;
    }, 0);
  };

  // QUALITY MANAGEMENT FUNCTIONS

  // Add quality check
  const addQualityCheck = (checkData) => {
    const qualityCheck = {
      id: `QC-${Date.now()}`,
      ...checkData,
      checked_by: "quality_user",
      checked_at: new Date().toISOString(),
      status: QUALITY_STATUS.PENDING,
    };

    dispatch({ type: "ADD_QUALITY_CHECK", payload: qualityCheck });
    return qualityCheck;
  };

  // Update quality status
  const updateQualityStatus = (checkId, status, remarks = "") => {
    dispatch({
      type: "UPDATE_QUALITY_STATUS",
      payload: { checkId, status, remarks },
    });

    // If status is HOLD, move to quarantine
    if (status === QUALITY_STATUS.HOLD) {
      const check = state.qualityChecks.find((qc) => qc.id === checkId);
      if (check) {
        addQuarantineStock({
          product_id: check.product_id,
          batch_number: check.batch_number,
          quantity: check.quantity,
          reason: remarks,
          quality_check_id: checkId,
        });
      }
    }
  };

  // Add to quarantine
  const addQuarantineStock = (quarantineData) => {
    const quarantineStock = {
      id: `QT-${Date.now()}`,
      ...quarantineData,
      quarantined_at: new Date().toISOString(),
      quarantined_by: "quality_user",
    };

    dispatch({ type: "ADD_QUARANTINE_STOCK", payload: quarantineStock });
    return quarantineStock;
  };

  // Release from quarantine
  const releaseQuarantineStock = (quarantineId, finalStatus) => {
    const quarantineItem = state.quarantineStocks.find(
      (q) => q.id === quarantineId
    );
    if (quarantineItem) {
      // Update quality check status
      if (quarantineItem.quality_check_id) {
        updateQualityStatus(
          quarantineItem.quality_check_id,
          finalStatus,
          "Released from quarantine"
        );
      }

      // Remove from quarantine
      dispatch({ type: "RELEASE_QUARANTINE_STOCK", payload: quarantineId });
    }
  };

  // SALES INTEGRATION FUNCTIONS

  // Create sales order
  const createSalesOrder = (orderData) => {
    const salesOrder = {
      id: `SO-${Date.now()}`,
      ...orderData,
      created_at: new Date().toISOString(),
      status: SALES_ORDER_STATUS.DRAFT,
    };

    dispatch({ type: "ADD_SALES_ORDER", payload: salesOrder });
    return salesOrder;
  };

  // Allocate stock for sales order
  const allocateStockForSales = (orderId) => {
    const order = state.salesOrders.find((so) => so.id === orderId);
    if (!order) throw new Error("Sales order not found");

    // Check available stock
    const availableStock = getAvailableStockForSales(order.product_id);
    if (availableStock < order.quantity) {
      throw new Error(
        `Insufficient stock. Available: ${availableStock}, Required: ${order.quantity}`
      );
    }

    // Create stock reservation
    const reservation = {
      id: `RES-${Date.now()}`,
      order_id: orderId,
      product_id: order.product_id,
      quantity: order.quantity,
      reserved_at: new Date().toISOString(),
      reserved_by: "sales_user",
    };

    dispatch({ type: "ADD_STOCK_RESERVATION", payload: reservation });

    // Update order status
    dispatch({
      type: "UPDATE_SALES_ORDER_STATUS",
      payload: { orderId, status: SALES_ORDER_STATUS.ALLOCATED },
    });

    return reservation;
  };

  // Release stock reservation (when order is shipped or cancelled)
  const releaseStockReservation = (reservationId) => {
    dispatch({ type: "RELEASE_STOCK_RESERVATION", payload: reservationId });
  };

  // COMPUTED VALUES

  // Comprehensive computed values
  const stockSummary = useMemo(() => {
    const map = {};
    state.stockLedger.forEach((tx) => {
      const key = `${tx.product_id}-${tx.warehouse_id}`;
      if (!map[key]) {
        const product = state.products.find((p) => p.id === tx.product_id);
        map[key] = {
          product_id: tx.product_id,
          product_name: tx.product_name,
          product: product,
          warehouse_id: tx.warehouse_id,
          warehouse_name: tx.warehouse_name,
          stock: 0,
          value: 0,
          reorder_point: product?.reorder_point || 0,
          min_stock: product?.min_stock || 0,
          max_stock: product?.max_stock || 0,
        };
      }

      if (
        ["purchase_in", "transfer_in", "return_in", "production_in"].includes(
          tx.transaction_type
        )
      ) {
        map[key].stock += tx.qty;
        map[key].value += tx.qty * (tx.unit_cost || 0);
      } else if (
        ["sales_out", "transfer_out", "return_out", "production_out"].includes(
          tx.transaction_type
        )
      ) {
        map[key].stock -= tx.qty;
        map[key].value -= tx.qty * (tx.unit_cost || 0);
      }
    });

    return Object.values(map).filter((s) => s.stock !== 0);
  }, [state.stockLedger, state.products]);

  // QUALITY COMPUTED VALUES

  // Quality status for stock items
  const qualityStatusSummary = useMemo(() => {
    const summary = {};

    state.qualityChecks.forEach((check) => {
      const key = `${check.product_id}-${check.batch_number}`;
      if (!summary[key]) {
        summary[key] = {
          product_id: check.product_id,
          product_name: check.product_name,
          batch_number: check.batch_number,
          latest_status: check.status,
          last_check_date: check.checked_at,
          total_checks: 0,
          pass_count: 0,
          hold_count: 0,
          fail_count: 0,
        };
      }

      summary[key].total_checks++;
      if (check.status === QUALITY_STATUS.PASS) summary[key].pass_count++;
      if (check.status === QUALITY_STATUS.HOLD) summary[key].hold_count++;
      if (check.status === QUALITY_STATUS.FAIL) summary[key].fail_count++;

      // Keep the latest status
      if (new Date(check.checked_at) > new Date(summary[key].last_check_date)) {
        summary[key].latest_status = check.status;
        summary[key].last_check_date = check.checked_at;
      }
    });

    return Object.values(summary);
  }, [state.qualityChecks]);

  // Quarantine stock summary
  const quarantineSummary = useMemo(() => {
    return state.quarantineStocks.map((quarantine) => {
      const product = state.products.find(
        (p) => p.id === quarantine.product_id
      );
      const qualityCheck = state.qualityChecks.find(
        (qc) => qc.id === quarantine.quality_check_id
      );

      return {
        ...quarantine,
        product_name: product?.name || "Unknown",
        quality_status: qualityCheck?.status || QUALITY_STATUS.HOLD,
      };
    });
  }, [state.quarantineStocks, state.products, state.qualityChecks]);

  // Quality hold locations
  const qualityHoldLocations = useMemo(() => {
    return state.bins.filter((bin) => bin.is_quarantine);
  }, [state.bins]);

  // SALES COMPUTED VALUES

  // Available stock for sales (excluding quarantined and reserved stock)
  const availableStockForSales = useMemo(() => {
    const available = {};

    stockSummary.forEach((item) => {
      // Get quarantined quantity for this product
      const quarantinedQty = state.quarantineStocks
        .filter((q) => q.product_id === item.product_id)
        .reduce((sum, q) => sum + q.quantity, 0);

      // Get reserved quantity for this product
      const reservedQty = state.stockReservations
        .filter((r) => r.product_id === item.product_id)
        .reduce((sum, r) => sum + r.quantity, 0);

      available[item.product_id] = {
        product_id: item.product_id,
        product_name: item.product_name,
        total_stock: item.stock,
        quarantined_stock: quarantinedQty,
        reserved_stock: reservedQty,
        available_stock: Math.max(0, item.stock - quarantinedQty - reservedQty),
      };
    });

    return available;
  }, [stockSummary, state.quarantineStocks, state.stockReservations]);

  // Quick stock check for sales team
  const quickStockCheck = (productId) => {
    return (
      availableStockForSales[productId] || {
        product_id: productId,
        product_name: "Unknown",
        total_stock: 0,
        quarantined_stock: 0,
        reserved_stock: 0,
        available_stock: 0,
      }
    );
  };

  // Committed stock (allocated to orders)
  const committedStock = useMemo(() => {
    const committed = {};

    state.salesOrders
      .filter((order) =>
        [SALES_ORDER_STATUS.CONFIRMED, SALES_ORDER_STATUS.ALLOCATED].includes(
          order.status
        )
      )
      .forEach((order) => {
        if (!committed[order.product_id]) {
          committed[order.product_id] = 0;
        }
        committed[order.product_id] += order.quantity;
      });

    return committed;
  }, [state.salesOrders]);

  // Low stock alerts
  const lowStockAlerts = useMemo(() => {
    return stockSummary.filter(
      (item) => item.stock > 0 && item.stock <= item.reorder_point
    );
  }, [stockSummary]);

  // Expiry alerts
  const expiryAlerts = useMemo(() => {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + EXPIRY_ALERT_DAYS);

    return state.stockLedger.filter(
      (tx) =>
        tx.expiry_date &&
        new Date(tx.expiry_date) <= thresholdDate &&
        getCurrentStock(tx.product_id, tx.warehouse_id) > 0
    );
  }, [state.stockLedger]);

  // Inventory valuation
  const inventoryValuation = useMemo(() => {
    return stockSummary.reduce((total, item) => total + item.value, 0);
  }, [stockSummary]);

  // Stock movement analytics
  const movementAnalytics = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentTxs = state.stockLedger.filter(
      (tx) => new Date(tx.created_at) >= last30Days
    );

    return {
      totalIn: recentTxs
        .filter((tx) => tx.qty_in > 0)
        .reduce((sum, tx) => sum + tx.qty_in, 0),
      totalOut: recentTxs
        .filter((tx) => tx.qty_out > 0)
        .reduce((sum, tx) => sum + tx.qty_out, 0),
      totalTransactions: recentTxs.length,
    };
  }, [state.stockLedger]);

  // Filtered stock ledger
  const filteredLedger = useMemo(() => {
    let filtered = state.stockLedger;

    if (state.filters.warehouse !== "all") {
      filtered = filtered.filter(
        (tx) => tx.warehouse_id === parseInt(state.filters.warehouse)
      );
    }

    if (state.filters.category !== "all") {
      const categoryProducts = state.products
        .filter((p) => p.category === state.filters.category)
        .map((p) => p.id);
      filtered = filtered.filter((tx) =>
        categoryProducts.includes(tx.product_id)
      );
    }

    return filtered;
  }, [state.stockLedger, state.filters, state.products]);

  // ACTIONS

  const updateFilters = (newFilters) => {
    dispatch({ type: "UPDATE_FILTERS", payload: newFilters });
  };

  const addProduct = (product) => {
    // Check for duplicate SKU or name
    const isDuplicateSKU = state.products.some(
      (p) =>
        p.sku.toLowerCase() === product.sku.toLowerCase() && p.id !== product.id
    );

    const isDuplicateName = state.products.some(
      (p) =>
        p.name.toLowerCase() === product.name.toLowerCase() &&
        p.id !== product.id
    );

    if (isDuplicateSKU) {
      throw new Error(`Product with SKU "${product.sku}" already exists`);
    }

    if (isDuplicateName) {
      throw new Error(`Product with name "${product.name}" already exists`);
    }

    const newProduct = {
      ...product,
      id:
        product.id ||
        `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    dispatch({ type: "ADD_PRODUCT", payload: newProduct });
    return newProduct;
  };

  const updateProduct = (product) => {
    // Check for duplicates (excluding current product)
    const isDuplicateSKU = state.products.some(
      (p) =>
        p.sku.toLowerCase() === product.sku.toLowerCase() && p.id !== product.id
    );

    const isDuplicateName = state.products.some(
      (p) =>
        p.name.toLowerCase() === product.name.toLowerCase() &&
        p.id !== product.id
    );

    if (isDuplicateSKU) {
      throw new Error(`Product with SKU "${product.sku}" already exists`);
    }

    if (isDuplicateName) {
      throw new Error(`Product with name "${product.name}" already exists`);
    }

    dispatch({ type: "UPDATE_PRODUCT", payload: product });
    return product;
  };

  const deleteProduct = async (productId) => {
    try {
      // Remove product from products array
      dispatch({ type: "DELETE_PRODUCT", payload: productId });

      // Remove related stock ledger entries
      const updatedLedger = state.stockLedger.filter(
        (tx) => tx.product_id !== productId
      );

      // Remove from quality checks
      const updatedQualityChecks = state.qualityChecks.filter(
        (qc) => qc.product_id !== productId
      );

      // Remove from quarantine stocks
      const updatedQuarantineStocks = state.quarantineStocks.filter(
        (qs) => qs.product_id !== productId
      );

      // Remove from stock reservations
      const updatedStockReservations = state.stockReservations.filter(
        (sr) => sr.product_id !== productId
      );

      // Remove from sales orders
      const updatedSalesOrders = state.salesOrders.filter(
        (so) => so.product_id !== productId
      );

      // Update localStorage
      localStorage.setItem(
        "erp_inventory_ledger",
        JSON.stringify(updatedLedger)
      );
      localStorage.setItem(
        "erp_inventory_products",
        JSON.stringify(state.products.filter((p) => p.id !== productId))
      );
      localStorage.setItem(
        "erp_quality_checks",
        JSON.stringify(updatedQualityChecks)
      );
      localStorage.setItem(
        "erp_quarantine_stocks",
        JSON.stringify(updatedQuarantineStocks)
      );
      localStorage.setItem(
        "erp_stock_reservations",
        JSON.stringify(updatedStockReservations)
      );
      localStorage.setItem(
        "erp_sales_orders",
        JSON.stringify(updatedSalesOrders)
      );

      console.log(`Product ${productId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  const addWarehouse = (warehouse) => {
    const newWarehouse = {
      ...warehouse,
      id: warehouse.id || state.warehouses.length + 1,
      is_active: true,
    };
    dispatch({ type: "ADD_WAREHOUSE", payload: newWarehouse });
    return newWarehouse;
  };

  const addSupplier = (supplier) => {
    const newSupplier = {
      ...supplier,
      id: supplier.id || `SUP-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    dispatch({ type: "ADD_SUPPLIER", payload: newSupplier });
    return newSupplier;
  };

  const updateSupplier = (supplier) => {
    dispatch({ type: "UPDATE_SUPPLIER", payload: supplier });
    return supplier;
  };

  const deleteSupplier = (id) => {
    dispatch({ type: "DELETE_SUPPLIER", payload: id });
  };

  const clearLedger = () => {
    dispatch({ type: "CLEAR_LEDGER" });
    localStorage.removeItem("erp_inventory_ledger");
    localStorage.removeItem("erp_inventory_products");
    localStorage.removeItem("erp_inventory_warehouses");
    localStorage.removeItem("erp_quality_checks");
    localStorage.removeItem("erp_quarantine_stocks");
    localStorage.removeItem("erp_sales_orders");
    localStorage.removeItem("erp_stock_reservations");
    localStorage.removeItem("erp_suppliers");
  };

  const value = {
    // State
    ...state,

    // Constants
    LOW_STOCK_THRESHOLD,
    EXPIRY_ALERT_DAYS,
    QUALITY_STATUS,
    SALES_ORDER_STATUS,

    // Computed values
    stockSummary,
    lowStockAlerts,
    expiryAlerts,
    inventoryValuation,
    movementAnalytics,
    filteredLedger,

    // Quality Computed Values
    qualityStatusSummary,
    quarantineSummary,
    qualityHoldLocations,

    // Sales Computed Values
    availableStockForSales,
    committedStock,
    quickStockCheck,

    // Actions
    addStockTransaction,
    getCurrentStock,
    updateFilters,
    addProduct,
    updateProduct,
    deleteProduct,
    addWarehouse,
    clearLedger,

    // Quality Actions
    addQualityCheck,
    updateQualityStatus,
    addQuarantineStock,
    releaseQuarantineStock,

    // Sales Actions
    createSalesOrder,
    allocateStockForSales,
    releaseStockReservation,

    // Suppliers Actions
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
};
