export const planningMenu = [
  {
    title: "Master Data",
    items: [
      { label: "Items", icon: "Package", path: "/items" },
      { label: "BOM", icon: "FolderTree", path: "/bom" },
      { label: "Routing", icon: "Workflow", path: "/routing" },
    ],
  },
  {
    title: "Planning",
    items: [
      { label: "MPS", icon: "Calendar", path: "/mps" },
      { label: "MRP", icon: "Package", path: "/mrp" },
      { label: "Capacity", icon: "Settings", path: "/capacity" },
    ],
  },
  {
    title: "Execution",
    items: [
      { label: "Work Orders", icon: "ClipboardList", path: "/work-orders" },
      { label: "Shop Floor", icon: "Factory", path: "/shop-floor" },
    ],
  },
];

/**
 * Planning Tabs (MPS, MRP, Capacity, etc.)
 */
export const planningTabs = [
  {
    id: "mps",
    label: "MPS",
    icon: "Calendar",
    actions: ["New MPS", "Export", "Print"],
  },
  {
    id: "mrp",
    label: "MRP",
    icon: "Package",
    actions: ["Run MRP", "View Exceptions"],
  },
  {
    id: "capacity",
    label: "Capacity",
    icon: "Settings",
    actions: ["Load Analysis"],
  },
  {
    id: "forecast",
    label: "Forecast",
    icon: "TrendingUp",
    actions: ["Generate Forecast", "Edit Models"],
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: "CalendarDays",
    actions: ["Add Shift", "Holidays"],
  },
];

/**
 * BOM Templates – Multi-level, Real Manufacturing Structure
 * Used in: BOM Management + Work Orders + Shop Floor
 */
export const bomTemplates = [
  // Root: Car Assembly
  {
    id: "car",
    name: "Car Assembly",
    components: [
      { id: "engine", name: "Engine", qty: 1, cost: 5000 },
      { id: "chassis", name: "Chassis", qty: 1, cost: 3000 },
      { id: "wheels", name: "Wheel Assembly", qty: 4, cost: 800 },
    ],
  },
  // Sub-assembly: Engine
  {
    id: "engine",
    name: "Engine Sub-Assembly",
    components: [
      { id: "piston", name: "Piston", qty: 4, cost: 200 },
      { id: "blok", name: "Cylinder Block", qty: 1, cost: 1000 },
      { id: "head", name: "Cylinder Head", qty: 1, cost: 800 },
    ],
  },
  // Sub-assembly: Wheels
  {
    id: "wheels",
    name: "Wheel Assembly",
    components: [
      { id: "tire", name: "Tire", qty: 1, cost: 150 },
      { id: "rim", name: "Rim", qty: 1, cost: 100 },
      { id: "valve", name: "Valve Stem", qty: 1, cost: 10 },
    ],
  },
  // Leaf Items (no children)
  { id: "chassis", name: "Chassis", components: [] },
  { id: "piston", name: "Piston", components: [] },
  { id: "blok", name: "Cylinder Block", components: [] },
  { id: "head", name: "Cylinder Head", components: [] },
  { id: "tire", name: "Tire", components: [] },
  { id: "rim", name: "Rim", components: [] },
  { id: "valve", name: "Valve Stem", components: [] },
];

/**
 * Work Orders – Linked to BOM items
 * Status: Planned → Released → Running → Completed
 */
export const initialWorkOrders = [
  {
    id: "WO-001",
    item: "Car Assembly",
    bomId: "car",
    qty: 10,
    status: "Released",
    start: "2025-11-10",
    end: "2025-11-15",
    progress: 60,
  },
  {
    id: "WO-002",
    item: "Engine Sub-Assembly",
    bomId: "engine",
    qty: 20,
    status: "In Progress",
    start: "2025-11-08",
    end: "2025-11-12",
    progress: 85,
  },
  {
    id: "WO-003",
    item: "Wheel Assembly",
    bomId: "wheels",
    qty: 50,
    status: "Planned",
    start: "2025-11-20",
    end: "2025-11-25",
    progress: 0,
  },
];

/**
 * Shop Floor Live Data – Real-time execution
 * Syncs with Work Orders via context
 */
export const initialShopFloorData = [
  {
    id: "WO-001",
    item: "Car Assembly",
    qty: 10,
    done: 6,
    status: "Running",
    operator: "Rajesh Kumar",
    start: "07:00",
    machine: "Assembly Line A",
  },
  {
    id: "WO-002",
    item: "Engine Sub-Assembly",
    qty: 20,
    done: 18,
    status: "Running",
    operator: "Sunil Mehta",
    start: "06:30",
    machine: "CNC-01",
  },
  {
    id: "WO-003",
    item: "Wheel Assembly",
    qty: 50,
    done: 0,
    status: "Queued",
    operator: null,
    start: null,
    machine: "Assembly Line B",
  },
];
export const initialQcRecords = [
  { inspected: 100, pass: 98 },
  { inspected: 50, pass: 49 },
];

export const initialInventory = [
  // Raw Materials
  {
    id: "RM001",
    name: "Aluminum Sheet 2mm",
    type: "RM",
    qty: 450,
    unit: "kg",
    minStock: 200,
    status: "Normal", // Normal / Low / Critical
  },
  {
    id: "RM002",
    name: "Steel Rod 12mm",
    type: "RM",
    qty: 80,
    unit: "kg",
    minStock: 150,
    status: "Critical",
  },
  {
    id: "RM003",
    name: "Copper Wire 1.5mm",
    type: "RM",
    qty: 120,
    unit: "meters",
    minStock: 100,
    status: "Low",
  },
  {
    id: "RM004",
    name: "Plastic Granules HDPE",
    type: "RM",
    qty: 800,
    unit: "kg",
    minStock: 500,
    status: "Normal",
  },

  // Work-in-Progress (WIP)
  {
    id: "WIP001",
    name: "Bracket Assembly - Stage 2",
    type: "WIP",
    qty: 32,
    unit: "pcs",
    status: "Normal",
  },
  {
    id: "WIP002",
    name: "Housing Sub-assembly",
    type: "WIP",
    qty: 18,
    unit: "pcs",
    status: "Normal",
  },

  // Finished Goods (FG)
  {
    id: "FG001",
    name: "Industrial Pump Model-X",
    type: "FG",
    qty: 45,
    unit: "pcs",
    status: "Normal",
  },
  {
    id: "FG002",
    name: "Control Panel CP-200",
    type: "FG",
    qty: 12,
    unit: "pcs",
    status: "Normal",
  },
  {
    id: "FG003",
    name: "Valve Assembly V9",
    type: "FG",
    qty: 78,
    unit: "pcs",
    status: "Normal",
  },
  {
    id: "FG004",
    name: "Motor Drive Unit",
    type: "FG",
    qty: 3,
    unit: "pcs",
    status: "Low", // Just to show variety
  },

  // Spare Parts / Consumables
  {
    id: "SP001",
    name: "Filter Cartridge F-10",
    type: "SP",
    qty: 8,
    unit: "pcs",
    minStock: 20,
    status: "Critical",
  },
  {
    id: "SP002",
    name: "O-Ring Set 50mm",
    type: "SP",
    qty: 150,
    unit: "pcs",
    minStock: 100,
    status: "Normal",
  },
];
// src/data/initialWasteData.js
export const initialWasteData = [
  {
    id: "W001",
    date: "2025-11-04",
    wo: "WO-1245",
    item: "Bracket X",
    category: "Scrap",
    qty: 12,
    unit: "pcs",
    cost: 2400,
    reason: "Machining defect",
    reportedBy: "Ramesh",
    status: "Disposed",
  },
  {
    id: "W002",
    date: "2025-11-05",
    wo: "WO-1248",
    item: "Paint Batch #45",
    category: "Spill",
    qty: 45,
    unit: "liters",
    cost: 13500,
    reason: "Leak during transfer",
    reportedBy: "Suresh",
    status: "Pending",
  },
  {
    id: "W003",
    date: "2025-11-06",
    wo: "WO-1250",
    item: "Housing Y",
    category: "Rework",
    qty: 8,
    unit: "pcs",
    cost: 1600,
    reason: "Welding issue - sent to rework",
    reportedBy: "Mahesh",
    status: "In Rework",
  },
];
// src/data/initialConsumptionData.js
export const initialConsumptionData = [
  {
    id: "C001",
    date: "2025-11-06",
    wo: "WO-1245",
    item: "Bracket X",
    material: "Aluminum Sheet 2mm",
    planned: 25.0,
    actual: 28.5,
    unit: "kg",
    variance: 3.5,
    variancePercent: 14.0,
    issuedBy: "Rakesh",
    status: "Over Consumed",
  },
  {
    id: "C002",
    date: "2025-11-06",
    wo: "WO-1248",
    item: "Housing Z",
    material: "Steel Plate 5mm",
    planned: 40.0,
    actual: 39.2,
    unit: "kg",
    variance: -0.8,
    variancePercent: -2.0,
    issuedBy: "Mahesh",
    status: "Under Consumed",
  },
  {
    id: "C003",
    date: "2025-11-05",
    wo: "WO-1250",
    item: "Paint Job #45",
    material: "Red Primer Paint",
    planned: 15.0,
    actual: 18.7,
    unit: "liters",
    variance: 3.7,
    variancePercent: 24.67,
    issuedBy: "Suresh",
    status: "Over Consumed",
  },
];

/**
 * Export All Data (for debugging / seeding)
 */
export const sampleData = {
  planningMenu,
  planningTabs,
  bomTemplates,
  initialWorkOrders,
  initialShopFloorData,
  initialQcRecords,
};
