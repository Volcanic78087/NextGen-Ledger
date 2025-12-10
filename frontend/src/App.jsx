import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SalesProvider } from "./context/SalesContext";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { QualityProvider } from "./context/QualityContext";
import { CrmProvider } from "./context/CRmContext";
import { ProcurementProvider } from "./context/ProcurementContext";
import { ProductionProvider } from "./context/ProductionContext";
import { FinanceProvider } from "./context/FinanceContext";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Super Admin Modules

import HR from "./pages/HR/HR";
import Finance from "./pages/Finance/Finance";
import Settings from "./pages/Settings";
import Multibranch from "./pages/Multibranch/Multibranch";

// HR Submodules

import Attendance from "./pages/HR/Attendance";
import Payroll from "./pages/HR/Payroll";
import Leaves from "./pages/HR/Leaves";
import Performance from "./pages/HR/Performance";
import EmploymentManagement from "./pages/HR/EmployeeManagement";

// Finance
import GeneralLedger from "./pages/Finance/GeneralLedger";
import AccountPayable from "./pages/Finance/AccountsPayable";
import AccountReceivable from "./pages/Finance/AccountsReceivable";
import TaxationCompliance from "./pages/Finance/TaxationCompliance";
import FinancialReports from "./pages/Finance/Reports";
import FixedAssets from "./pages/Finance/AssetManagement";

// Sales
import CustomerMaster from "./pages/Sales/CustomerMaster";
import SalesOrder from "./pages/Sales/SalesOrder";
import Invoice from "./pages/Sales/Invoice";
import Shipping from "./pages/Sales/ShippingDelivery";
import SalesAnalytics from "./pages/Sales/SalesAnalytics";
import Returns from "./pages/Sales/Returns";

//Inventory
import InventoryDashboard from "./pages/Inventory/Dashboard";
import StockManagement from "./pages/Inventory/StockManagement";
import StockTransactions from "./pages/Inventory/StockTransactions";
import PurchaseManagement from "./pages/Inventory/PurchaseManagement";
import Products from "./pages/Inventory/Products";
import Suppliers from "./pages/Inventory/Suppliers";
import Reports from "./pages/Inventory/Reports";
import WarehouseManagement from "./pages/Inventory/Warehouse";

import BudgetsForecasting from "./pages/Finance/BudgetsForecasting";
import CostAccounting from "./pages/Finance/CostAccounting";
import FinanceSupplyChain from "./pages/Finance/Fscm";
import LeadsOpportunity from "./pages/CRM/LeadsOpportunity";
import CustomerSupport from "./pages/CRM/CustomerSupport";
import SalesEngagement from "./pages/CRM/SalesEngagement";
import LoyaltyProgram from "./pages/CRM/LoyltyPrograms";
import CrmAnalytics from "./pages/CRM/CrmAnalytics";
import OnboardingModule from "./pages/HR/OnboardingModule";
import { IncomingQualityControl } from "./pages/QualityManagement/IncomingQualityInspection";

import { InProcessQualityControl } from "./pages/QualityManagement/InProcessQualityControl";
import { FinalQualityControl } from "./pages/QualityManagement/FinalQualityControl";
import { InspectionPlan } from "./pages/QualityManagement/InspectionPlan";
import { NonConformanceManagement } from "./pages/QualityManagement/NCM";
import { QualityCertificate } from "./pages/QualityManagement/QualityCertificate";
import SalesDashboard from "./pages/Sales/SalesDashboard";
// import WarehouseManagement from "./pages/Logistics/WarehouseMangement";
import PlanningAndScheduling from "./pages/Production/PlanningAndScheduling";

import BOMManagement from "./pages/Production/BOM";
import WorkOrders from "./pages/Production/WorkOrders";
import ShopFloor from "./pages/Production/ShopFloor";
import QualityControl from "./pages/Production/QualityControl";
import InventoryManagement from "./pages/Production/InventoryManagement";
import ReportingAnalytics from "./pages/Production/ReportingAnalytics";
import WasteManagement from "./pages/Production/WasteManagement";
import MaterialConsumption from "./pages/Production/MaterialConsumption";
import CostValuation from "./pages/Production/CostValuation";

import ProcurementOverview from "./pages/Procurement/ProcurementOverview";

import PurchaseRequisition from "./pages/Procurement/PurchaseRequisition";
import RFQModule from "./pages/Procurement/RFQModule";
import VendorManagement from "./pages/Procurement/VendorManagement";
import PurchaseOrderModule from "./pages/Procurement/PurchaseOrders";
import GRNModule from "./pages/Procurement/GRNModule";
import InvoiceMatchingModule from "./pages/Procurement/InvoiceMatching";
import PaymentModule from "./pages/Procurement/PaymentModule";
import BudgetReportsModule from "./pages/Procurement/BudgetReports";
import SettingsModule from "./pages/Procurement/SettingsModule";
import { InventoryProvider } from "./context/InventoryContext";
import PlantMaintenanceModule from "./pages/PlantMaintenance/PlantMaintenance";
import { PlantMaintenanceProvider } from "./context/PlantMaintenanceContext";
import Pricing from "./pages/Sales/Pricing";
import ATP from "./pages/Sales/ATP";
import OutputDetermination from "./pages/Sales/OutputDetermination";
import CreditManagement from "./pages/Sales/CreditManagement";
import BankAccounts from "./pages/Finance/BankAccounts";
import Consolidation from "./pages/Finance/Consolidation";
import SalesIntegrationView from "./pages/Inventory/SalesIntegrationView";
import QualityIntegrationView from "./pages/Inventory/QualityIntegrationView";
import MaterialLedger from "./pages/Finance/MaterialLedger";
import InboundModule from "./pages/Logistics/Inbound";
import OutboundModule from "./pages/Logistics/Outbound";
import { LogisticsProvider } from "./context/logisticContext";

/* Layout (Navbar + Sidebar + Main) */

const Layout = ({ children }) => (
  <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
    <Navbar />

    {/* Main Layout */}
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <Sidebar />
      </aside>

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  </div>
);

/* Application Routes */

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Protected Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Dashboard */}
                  <Route path="/" element={<Dashboard />} />

                  {/* Inventory */}
                  <Route
                    path="/inventory/dashboard"
                    element={
                      <ProtectedRoute>
                        <InventoryProvider>
                          <InventoryDashboard />
                        </InventoryProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/stock"
                    element={
                      <ProtectedRoute>
                        <InventoryProvider>
                          <StockManagement />
                        </InventoryProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/st"
                    element={
                      <ProtectedRoute>
                        <InventoryProvider>
                          <StockTransactions />
                        </InventoryProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/purchase_manage"
                    element={
                      <ProtectedRoute>
                        <InventoryProvider>
                          <PurchaseManagement />
                        </InventoryProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/warehouse"
                    element={
                      <ProtectedRoute>
                        <InventoryProvider>
                          <WarehouseManagement />
                        </InventoryProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/products"
                    element={
                      <ProtectedRoute>
                        <InventoryProvider>
                          <Products />
                        </InventoryProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/suppliers"
                    element={
                      <ProtectedRoute>
                        <InventoryProvider>
                          <Suppliers />
                        </InventoryProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/reports"
                    element={
                      <ProtectedRoute>
                        <InventoryProvider>
                          <Reports />
                        </InventoryProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/quality"
                    element={
                      <ProtectedRoute>
                        <InventoryProvider>
                          <QualityIntegrationView />
                        </InventoryProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/sales"
                    element={
                      <ProtectedRoute>
                        <InventoryProvider>
                          <SalesIntegrationView />
                        </InventoryProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* Sales */}
                  <Route
                    path="/sales"
                    element={
                      <ProtectedRoute>
                        <SalesProvider>
                          <SalesDashboard />
                        </SalesProvider>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/sales/cm"
                    element={
                      <ProtectedRoute>
                        <SalesProvider>
                          <CustomerMaster />
                        </SalesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/orders"
                    element={
                      <ProtectedRoute>
                        <SalesProvider>
                          <SalesOrder />
                        </SalesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/invoice"
                    element={
                      <ProtectedRoute>
                        <Invoice />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/shipping"
                    element={
                      <ProtectedRoute>
                        <SalesProvider>
                          <Shipping />
                        </SalesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/analytics"
                    element={
                      <ProtectedRoute>
                        <SalesProvider>
                          <SalesAnalytics />
                        </SalesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/returns"
                    element={
                      <ProtectedRoute>
                        <SalesProvider>
                          <Returns />
                        </SalesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/credit"
                    element={
                      <ProtectedRoute>
                        <SalesProvider>
                          <CreditManagement />
                        </SalesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/output"
                    element={
                      <ProtectedRoute>
                        <SalesProvider>
                          <OutputDetermination />
                        </SalesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/atp"
                    element={
                      <ProtectedRoute>
                        <SalesProvider>
                          <ATP />
                        </SalesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/pricing"
                    element={
                      <ProtectedRoute>
                        <SalesProvider>
                          <Pricing />
                        </SalesProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* CRM */}
                  <Route
                    path="/crm/cm"
                    element={
                      <ProtectedRoute>
                        <CrmProvider>
                          <CustomerMaster />
                        </CrmProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/crm/leads"
                    element={
                      <ProtectedRoute>
                        <CrmProvider>
                          <LeadsOpportunity />
                        </CrmProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/crm/customer-support"
                    element={
                      <ProtectedRoute>
                        <CrmProvider>
                          <CustomerSupport />
                        </CrmProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/crm/sef"
                    element={
                      <ProtectedRoute>
                        <CrmProvider>
                          <SalesEngagement />
                        </CrmProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/crm/loyalty"
                    element={
                      <ProtectedRoute>
                        <CrmProvider>
                          <LoyaltyProgram />
                        </CrmProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/crm/analytics"
                    element={
                      <ProtectedRoute>
                        <CrmProvider>
                          <CrmAnalytics />
                        </CrmProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* HR Module */}
                  <Route
                    path="/hr"
                    element={
                      <ProtectedRoute>
                        <HR />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/employees"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <EmploymentManagement />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/attendance"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <Attendance />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/payroll"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <Payroll />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/leave"
                    element={
                      <ProtectedRoute>
                        <Leaves />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/performance"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <Performance />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/recruitment"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <OnboardingModule />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* Finance */}
                  <Route
                    path="/finance"
                    element={
                      <ProtectedRoute>
                        <Finance />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/ledger"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <GeneralLedger />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/ap"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <AccountPayable />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/ar"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <AccountReceivable />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/finance/taxcomp"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <TaxationCompliance />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/reports"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <FinancialReports />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/fam"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <FixedAssets />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/bf"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <BudgetsForecasting />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/co"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <CostAccounting />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/fscm"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <FinanceSupplyChain />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/bank"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <BankAccounts />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/consolidation"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <Consolidation />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance/product-costing"
                    element={
                      <ProtectedRoute>
                        <FinanceProvider>
                          <MaterialLedger />
                        </FinanceProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* Quality Management */}
                  <Route
                    path="/quality/iqc"
                    element={
                      <ProtectedRoute>
                        <QualityProvider>
                          <IncomingQualityControl />
                        </QualityProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quality/ipqc"
                    element={
                      <ProtectedRoute>
                        <QualityProvider>
                          <InProcessQualityControl />
                        </QualityProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quality/fqc"
                    element={
                      <ProtectedRoute>
                        <QualityProvider>
                          <FinalQualityControl />
                        </QualityProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quality/ip"
                    element={
                      <ProtectedRoute>
                        <QualityProvider>
                          <InspectionPlan />
                        </QualityProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quality/ncm"
                    element={
                      <ProtectedRoute>
                        <QualityProvider>
                          <NonConformanceManagement />
                        </QualityProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quality/qc"
                    element={
                      <ProtectedRoute>
                        <QualityProvider>
                          <QualityCertificate />
                        </QualityProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* Logistics */}
                  <Route
                    path="/logistics/inbound"
                    element={
                      <ProtectedRoute>
                        <LogisticsProvider>
                          <InboundModule />
                        </LogisticsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/logistics/outbound"
                    element={
                      <ProtectedRoute>
                        <LogisticsProvider>
                          <OutboundModule />
                        </LogisticsProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* Production */}
                  <Route
                    path="/production/ps"
                    element={
                      <ProtectedRoute>
                        <ProductionProvider>
                          <PlanningAndScheduling />
                        </ProductionProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/production/bom"
                    element={
                      <ProtectedRoute>
                        <ProductionProvider>
                          <BOMManagement />
                        </ProductionProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/production/wo"
                    element={
                      <ProtectedRoute>
                        <ProductionProvider>
                          <WorkOrders />
                        </ProductionProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/production/sfm"
                    element={
                      <ProtectedRoute>
                        <ProductionProvider>
                          <ShopFloor />
                        </ProductionProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/production/qc"
                    element={
                      <ProtectedRoute>
                        <ProductionProvider>
                          <QualityControl />
                        </ProductionProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/production/im"
                    element={
                      <ProtectedRoute>
                        <ProductionProvider>
                          <InventoryManagement />
                        </ProductionProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/production/reporting"
                    element={
                      <ProtectedRoute>
                        <ProductionProvider>
                          <ReportingAnalytics />
                        </ProductionProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/production/wm"
                    element={
                      <ProtectedRoute>
                        <ProductionProvider>
                          <WasteManagement />
                        </ProductionProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/production/mct"
                    element={
                      <ProtectedRoute>
                        <ProductionProvider>
                          <MaterialConsumption />
                        </ProductionProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/production/cv"
                    element={
                      <ProtectedRoute>
                        <ProductionProvider>
                          <CostValuation />
                        </ProductionProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* Procurement */}
                  <Route
                    path="/procurement/overview"
                    element={
                      <ProtectedRoute>
                        <ProcurementProvider>
                          <ProcurementOverview />
                        </ProcurementProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement/purchase-requisition"
                    element={
                      <ProtectedRoute>
                        <ProcurementProvider>
                          <PurchaseRequisition />
                        </ProcurementProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement/rfq"
                    element={
                      <ProtectedRoute>
                        <ProcurementProvider>
                          <RFQModule />
                        </ProcurementProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement/vm"
                    element={
                      <ProtectedRoute>
                        <ProcurementProvider>
                          <VendorManagement />
                        </ProcurementProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement/po"
                    element={
                      <ProtectedRoute>
                        <ProcurementProvider>
                          <PurchaseOrderModule />
                        </ProcurementProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement/grn"
                    element={
                      <ProtectedRoute>
                        <ProcurementProvider>
                          <GRNModule />
                        </ProcurementProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement/invoice"
                    element={
                      <ProtectedRoute>
                        <ProcurementProvider>
                          <InvoiceMatchingModule />
                        </ProcurementProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement/payment"
                    element={
                      <ProtectedRoute>
                        <ProcurementProvider>
                          <PaymentModule />
                        </ProcurementProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement/br"
                    element={
                      <ProtectedRoute>
                        <ProcurementProvider>
                          <BudgetReportsModule />
                        </ProcurementProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement/settings"
                    element={
                      <ProtectedRoute>
                        <ProcurementProvider>
                          <SettingsModule />
                        </ProcurementProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* Settings */}
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute requireSuperAdmin>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/multibranch"
                    element={
                      <ProtectedRoute>
                        <Multibranch />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/plant"
                    element={
                      <ProtectedRoute>
                        <PlantMaintenanceProvider>
                          <PlantMaintenanceModule />
                        </PlantMaintenanceProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      {/* SAB PROVIDERS YAHAN ROOT ME */}
      <InventoryProvider>
        <ProcurementProvider>
          <SalesProvider>
            <FinanceProvider>
              <QualityProvider>
                <ProductionProvider>
                  <CrmProvider>
                    <AppRoutes />
                  </CrmProvider>
                </ProductionProvider>
              </QualityProvider>
            </FinanceProvider>
          </SalesProvider>
        </ProcurementProvider>
      </InventoryProvider>
    </AuthProvider>
  );
};
export default App;
