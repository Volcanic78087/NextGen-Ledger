import React, { useState, useMemo, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { MODULE_ACCESS } from "../config/moduleAccessConfig";
import {
  ChevronDown,
  Users,
  FileText,
  Clock,
  TrendingUp,
  Briefcase,
  BarChart3,
  Warehouse,
  ShoppingCart,
  Truck,
  ClipboardList,
  ClipboardCheck,
  Package,
  Building2,
  Settings,
  Factory,
  Layers,
  Calculator,
  FileSpreadsheet,
  FileBarChart2,
  LineChart,
  CheckSquare,
  RefreshCw,
  DollarSign,
  Mail,
  Target,
  Headphones,
  Repeat,
  HeartHandshake,
  ShieldCheck,
  FolderTree,
  AlertTriangle,
  Recycle,
  Database,
  Boxes,
  Home,
  Receipt,
  ArrowLeftRight,
  ScrollText,
  Handshake,
  FileCheck,
  FileClock,
  FileWarning,
  PackageCheck,
  PackageX,
  PieChart,
  FileInput,
  FileOutput,
  Scale,
  ReceiptText,
  Coins,
  CreditCard,
  BadgeCheck,
  UserCheck,
  Timer,
  MessagesSquare,
  PhoneCall,
  Star,
  ArrowDownUp,
  PackageSearch,
  FileSearch,
  ClipboardPen,
  Wrench,
  Hammer,
  ListChecks,
  FileCog,
  LandPlot,
  Building,
  GitBranch,
  CalendarCheck,
} from "lucide-react";

// Reusable Icon Component
const MenuIcon = ({ icon: Icon, size = 16, className = "" }) => {
  return Icon ? <Icon size={size} className={className} /> : null;
};

// === UPDATED MODULES WITH VALID LUCIDE ICONS ===
const modules = [
  { path: "/", label: "Dashboard", icon: Home },

  // INVENTORY
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    submodules: [
      { path: "/inventory/dashboard", label: "Dashboard", icon: BarChart3 },
      { path: "/inventory/products", label: "Products", icon: Boxes },
      { path: "/inventory/warehouse", label: "Warehouse", icon: Warehouse },
      {
        path: "/inventory/stock",
        label: "Stock Management",
        icon: PackageSearch,
      },
      { path: "/inventory/quality", label: "Quality View", icon: ArrowDownUp },

      { path: "/inventory/sales", label: "Sales View", icon: ArrowDownUp },
      {
        path: "/inventory/purchase_manage",
        label: "Purchase Management",
        icon: ShoppingCart,
      },
      { path: "/inventory/suppliers", label: "Suppliers", icon: UserCheck },
      { path: "/inventory/reports", label: "Reports", icon: FileBarChart2 },
    ],
  },

  // SALES
  {
    id: "sales",
    label: "Sales",
    icon: DollarSign,
    submodules: [
      { path: "/sales", label: "Overview", icon: PieChart },
      { path: "/sales/cm", label: "Customers Master", icon: Users },
      { path: "/sales/orders", label: "Sales Order", icon: ClipboardPen },
      {
        path: "/sales/pricing",
        label: "Pricing & Conditions",
        icon: ClipboardPen,
      },
      { path: "/sales/atp", label: "ATP", icon: ClipboardPen },
      { path: "/sales/credit", label: "Credit Management", icon: ClipboardPen },
      { path: "/sales/shipping", label: "Shipping & Delivery", icon: Truck },
      {
        path: "/sales/invoice",
        label: "Billing & Invoicing",
        icon: ReceiptText,
      },
      { path: "/sales/returns", label: "Returns", icon: PackageX },
      { path: "/sales/output", label: "Output Determination", icon: PackageX },
      { path: "/sales/analytics", label: "Sales Analytics", icon: LineChart },
    ],
  },

  // CRM
  {
    id: "crm",
    label: "CRM",
    icon: Handshake,
    submodules: [
      { path: "/crm/cm", label: "Customer Master", icon: Users },
      { path: "/crm/leads", label: "Leads & Opportunity", icon: Target },
      {
        path: "/crm/customer-support",
        label: "Customer Support",
        icon: Headphones,
      },
      {
        path: "/crm/sef",
        label: "Sales Engagement & Follow-ups",
        icon: MessagesSquare,
      },
      { path: "/crm/loyalty", label: "Loyalty Program", icon: Star },
      { path: "/crm/analytics", label: "CRM Analytics", icon: BarChart3 },
    ],
  },

  // HR
  {
    id: "hr",
    label: "Human Resources",
    icon: Users,
    submodules: [
      { path: "/hr/employees", label: "Employee Management", icon: Users },
      {
        path: "/hr/recruitment",
        label: "Recruitment & Onboarding",
        icon: FileCheck,
      },
      { path: "/hr/attendance", label: "Attendance & Time", icon: Timer },
      { path: "/hr/payroll", label: "Payroll Management", icon: CreditCard },
      {
        path: "/hr/performance",
        label: "Performance & Appraisal",
        icon: TrendingUp,
      },
    ],
  },

  // FINANCE
  {
    id: "finance",
    label: "Finance",
    icon: Calculator,
    submodules: [
      {
        path: "/finance/ledger",
        label: "General Ledger",
        icon: FileSpreadsheet,
      },
      { path: "/finance/ap", label: "Accounts Payable", icon: FileOutput },
      { path: "/finance/ar", label: "Accounts Receivable", icon: FileInput },
      {
        path: "/finance/fam",
        label: "Fixed Assets Management",
        icon: Building,
      },
      { path: "/finance/bank", label: "Bank & Cash Management" },
      {
        path: "/finance/bf",
        label: "Budgeting and Forecasting",
        icon: LineChart,
      },
      {
        path: "/finance/co",
        label: "Cost Accounting/Controlling",
        icon: Scale,
      },
      {
        path: "/finance/fscm",
        label: "Financial Supply Chain",
        icon: GitBranch,
      },
      {
        path: "/finance/taxcomp",
        label: "Taxation & Compliance",
        icon: ShieldCheck,
      },
      { path: "/finance/reports", label: "Reports", icon: FileBarChart2 },
      { path: "/finance/consolidation", label: "Financial Consolidation" },
      { path: "/finance/cost-center", label: "Cost Center/Profit Center" },
      { path: "/finance/product-costing", label: "Material Ledger" },
    ],
  },

  // QUALITY
  {
    id: "quality",
    label: "Quality Management",
    icon: BadgeCheck,
    submodules: [
      {
        path: "/quality/iqc",
        label: "Incoming Quality Control",
        icon: PackageCheck,
      },
      { path: "/quality/ipqc", label: "IPQC", icon: ClipboardList },
      { path: "/quality/fqc", label: "FQC", icon: FileCheck },
      { path: "/quality/ip", label: "Inspection Plan", icon: ScrollText },
      { path: "/quality/ncm", label: "NCM", icon: FileWarning },
      { path: "/quality/qc", label: "Quality Certificates", icon: BadgeCheck },
    ],
  },

  // LOGISTICS
  {
    id: "logistics",
    label: "Logistics",
    icon: Truck,
    submodules: [
      {
        path: "/logistics/warehouse",
        label: "Warehouse Management",
        icon: Warehouse,
      },
      {
        path: "/logistics/transport",
        label: "Transport Management",
        icon: Truck,
      },
      {
        path: "/logistics/cross-docking",
        label: "Cross-Docking & Transfer",
        icon: ArrowLeftRight,
      },
      {
        path: "/logistics/packaghandling",
        label: "Packaging & Handling",
        icon: Package,
      },
    ],
  },

  // PRODUCTION
  {
    id: "production",
    label: "Production",
    icon: Factory,
    submodules: [
      {
        path: "/production/ps",
        label: "Planning/Scheduling",
        icon: CalendarCheck,
      }, // Fixed: Valid icon
      { path: "/production/bom", label: "Bill of Materials", icon: ListChecks },
      { path: "/production/wo", label: "Work Orders", icon: ClipboardPen },
      { path: "/production/qc", label: "Quality Control", icon: BadgeCheck },
      { path: "/production/sfm", label: "Shop Floor Management", icon: Wrench },
      { path: "/production/im", label: "Inventory Materials", icon: Database },
      {
        path: "/production/mct",
        label: "Material Consumption",
        icon: ArrowDownUp,
      },
      { path: "/production/wm", label: "Wastage Management", icon: Recycle },
      {
        path: "/production/po",
        label: "Production Output & Yield",
        icon: FileOutput,
      },
      { path: "/production/cv", label: "Costing & Valuation", icon: Coins },
      {
        path: "/production/reporting",
        label: "Reporting/Analytics",
        icon: FileBarChart2,
      },
    ],
  },

  // PROCUREMENT
  {
    id: "procurement",
    label: "Procurement",
    icon: ShoppingCart,
    submodules: [
      { path: "/procurement/overview", label: "Overview", icon: PieChart },
      {
        path: "/procurement/purchase-requisition",
        label: "Purchase Requisition",
        icon: FileClock,
      },
      { path: "/procurement/rfq", label: "RFQ & Quotation", icon: Mail },
      { path: "/procurement/vm", label: "Vendor Management", icon: UserCheck },
      { path: "/procurement/po", label: "Purchase Orders", icon: FileText },
      { path: "/procurement/grn", label: "GRN", icon: PackageCheck },
      { path: "/procurement/invoice", label: "Invoice", icon: Receipt },
      { path: "/procurement/payment", label: "Payment", icon: CreditCard },
      { path: "/procurement/br", label: "Budget & Reports", icon: BarChart3 },
      { path: "/procurement/settings", label: "Settings", icon: Settings },
      { path: "/procurement/pr", label: "Purchase Return", icon: PackageX },
      {
        path: "/procurement/vrec",
        label: "Vendor Reconciliation",
        icon: Handshake,
      },
    ],
  },

  // SINGLE LINKS
  { path: "/multibranch", label: "Multibranch", icon: GitBranch },
  { path: "/plant", label: "Plant Maintenance", icon: Hammer },
  { path: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar = () => {
  const { canAccess } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const visible = useMemo(() => {
    return modules
      .map((module) => {
        if (module.submodules) {
          const accessibleSubs = module.submodules.filter((sub) =>
            canAccess(sub.path)
          );
          if (accessibleSubs.length === 0) return null;
          return { ...module, submodules: accessibleSubs };
        } else {
          return canAccess(module.path) ? module : null;
        }
      })
      .filter(Boolean);
  }, [canAccess]);

  const toggleMenu = useCallback((id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isParentActive = (submodules) => {
    return submodules.some((sub) => location.pathname.startsWith(sub.path));
  };

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 h-screen shadow-xl flex flex-col">
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 py-2">
        <ul className="space-y-1 px-2">
          {visible.map((module) => {
            const id = module.id || module.path;
            const hasSubmodules = !!module.submodules;
            const isOpen = openMenus[id];
            const isActiveParent =
              hasSubmodules && isParentActive(module.submodules);

            return (
              <li key={id}>
                {hasSubmodules ? (
                  <>
                    <button
                      onClick={() => toggleMenu(id)}
                      className={`
                        flex justify-between items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg
                        transition-all duration-200 group
                        ${
                          isActiveParent
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-800"
                        }
                      `}
                      aria-expanded={isOpen}
                      aria-controls={`submenu-${id}`}
                    >
                      <span className="flex items-center gap-3">
                        <MenuIcon
                          icon={module.icon}
                          size={18}
                          className="text-inherit"
                        />
                        <span>{module.label}</span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <ul
                      id={`submenu-${id}`}
                      role="menu"
                      className={`
                        ml-8 mt-1 space-y-1 overflow-hidden
                        grid transition-all duration-300 ease-in-out
                        ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
                      `}
                    >
                      <div className="min-h-0">
                        {module.submodules.map((sub) => {
                          const isActive = location.pathname === sub.path;
                          return (
                            <li key={sub.path} role="menuitem">
                              <NavLink
                                to={sub.path}
                                className={`
                                  flex items-center gap-2 px-3 py-1.5 text-sm rounded-md
                                  transition-colors duration-200
                                  ${
                                    isActive
                                      ? "bg-blue-600 text-white"
                                      : "hover:bg-gray-800 hover:text-white"
                                  }
                                `}
                              >
                                <MenuIcon
                                  icon={sub.icon}
                                  className="text-inherit"
                                />
                                <span>{sub.label}</span>
                              </NavLink>
                            </li>
                          );
                        })}
                      </div>
                    </ul>
                  </>
                ) : (
                  <NavLink
                    to={module.path}
                    className={({ isActive }) =>
                      `
                      flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-800 hover:text-white"
                      }
                    `
                    }
                  >
                    <MenuIcon icon={module.icon} size={18} />
                    <span>{module.label}</span>
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 text-xs text-gray-500 border-t border-gray-700">
        © 2025{" "}
        <span className="font-semibold text-gray-400">NextGen Ledger</span>
      </div>
    </aside>
  );
};
