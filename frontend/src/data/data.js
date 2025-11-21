// src/data/data.js

// Sample Chart of Accounts
export const sampleChartOfAccounts = [
  {
    id: "acc-1",
    code: "1001",
    name: "Cash",
    type: "Asset",
    subtype: "Current Asset",
    balance: 150000,
    opening: 100000,
    isActive: true,
    currency: "INR",
  },
  {
    id: "acc-2",
    code: "1002",
    name: "Bank Account",
    type: "Bank",
    subtype: "Current Asset",
    balance: 500000,
    opening: 400000,
    isActive: true,
    currency: "INR",
  },
  {
    id: "acc-3",
    code: "2001",
    name: "Accounts Payable",
    type: "Liability",
    subtype: "Current Liability",
    balance: 200000,
    opening: 150000,
    isActive: true,
    currency: "INR",
  },
  {
    id: "acc-4",
    code: "3001",
    name: "Sales",
    type: "Income",
    subtype: "Revenue",
    balance: 0,
    opening: 0,
    isActive: true,
    currency: "INR",
  },
  {
    id: "acc-5",
    code: "4001",
    name: "Office Expenses",
    type: "Expense",
    subtype: "Operating Expense",
    balance: 0,
    opening: 0,
    isActive: true,
    currency: "INR",
  },
  {
    id: "acc-6",
    code: "5001",
    name: "Fixed Assets",
    type: "Asset",
    subtype: "Fixed Asset",
    balance: 1000000,
    opening: 1000000,
    isActive: true,
    currency: "INR",
  },
  {
    id: "acc-7",
    code: "6001",
    name: "Accounts Receivable",
    type: "Asset",
    subtype: "Current Asset",
    balance: 300000,
    opening: 250000,
    isActive: true,
    currency: "INR",
  },
];

// Sample Vendors
export const sampleVendors = [
  {
    id: "ven-1",
    name: "ABC Suppliers",
    email: "contact@abcsuppliers.com",
    phone: "+91-9876543210",
    address: "Mumbai, India",
    taxId: "GSTIN123456789",
    paymentTerms: "Net 30",
    balance: 150000,
    isActive: true,
  },
  {
    id: "ven-2",
    name: "XYZ Corporation",
    email: "accounts@xyzcorp.com",
    phone: "+91-9876543211",
    address: "Delhi, India",
    taxId: "GSTIN123456790",
    paymentTerms: "Net 45",
    balance: 75000,
    isActive: true,
  },
];

// Sample Invoices
export const sampleInvoices = [
  {
    id: "inv-1",
    vendorId: "ven-1",
    invoiceNumber: "INV-001",
    date: "2024-01-15",
    dueDate: "2024-02-14",
    amount: 50000,
    tax: 9000,
    total: 59000,
    status: "paid",
    items: [
      {
        description: "Office Supplies",
        quantity: 100,
        rate: 500,
        amount: 50000,
      },
    ],
  },
  {
    id: "inv-2",
    vendorId: "ven-2",
    invoiceNumber: "INV-002",
    date: "2024-01-20",
    dueDate: "2024-03-05",
    amount: 30000,
    tax: 5400,
    total: 35400,
    status: "pending",
    items: [
      { description: "IT Equipment", quantity: 5, rate: 6000, amount: 30000 },
    ],
  },
];

// Sample Journal Entries
export const sampleJournalEntries = [
  {
    id: "je-1",
    date: "2024-01-01",
    ref: "OPENING",
    desc: "Opening Balance Entry",
    status: "posted",
    lines: [
      {
        accountId: "acc-1",
        debit: 100000,
        credit: 0,
        description: "Cash Opening",
      },
      {
        accountId: "acc-2",
        debit: 400000,
        credit: 0,
        description: "Bank Opening",
      },
      {
        accountId: "acc-6",
        debit: 1000000,
        credit: 0,
        description: "Fixed Assets Opening",
      },
      {
        accountId: "acc-3",
        debit: 0,
        credit: 150000,
        description: "AP Opening",
      },
      {
        accountId: "acc-7",
        debit: 250000,
        credit: 0,
        description: "AR Opening",
      },
    ],
  },
  {
    id: "je-2",
    date: "2024-01-15",
    ref: "SALES-001",
    desc: "Sales Revenue",
    status: "posted",
    lines: [
      {
        accountId: "acc-1",
        debit: 59000,
        credit: 0,
        description: "Cash Sales",
      },
      {
        accountId: "acc-4",
        debit: 0,
        credit: 50000,
        description: "Sales Revenue",
      },
      {
        accountId: "acc-3",
        debit: 0,
        credit: 9000,
        description: "Tax Payable",
      },
    ],
  },
];

// Default Payments
export const defaultPayments = [
  {
    id: "pay-1",
    invoiceId: "inv-1",
    amount: 59000,
    date: "2024-01-30",
    method: "bank_transfer",
    reference: "PYMT-001",
    status: "completed",
  },
];

// Default Customers
export const defaultCustomers = [
  {
    id: "cust-1",
    name: "Global Enterprises",
    email: "accounts@globalent.com",
    phone: "+91-9876543212",
    address: "Bangalore, India",
    taxId: "GSTIN123456791",
    creditLimit: 500000,
    currentBalance: 150000,
    isActive: true,
  },
  {
    id: "cust-2",
    name: "Tech Solutions Ltd",
    email: "billing@techsolutions.com",
    phone: "+91-9876543213",
    address: "Hyderabad, India",
    taxId: "GSTIN123456792",
    creditLimit: 300000,
    currentBalance: 75000,
    isActive: true,
  },
];

// Default AR Invoices
export const defaultArInvoices = [
  {
    id: "arinv-1",
    customerId: "cust-1",
    invoiceNumber: "AR-INV-001",
    date: "2024-01-10",
    dueDate: "2024-02-09",
    amount: 150000,
    tax: 27000,
    total: 177000,
    status: "pending",
    items: [
      {
        description: "Consulting Services",
        quantity: 100,
        rate: 1500,
        amount: 150000,
      },
    ],
  },
];

// Default Receipts
export const defaultReceipts = [
  {
    id: "rcpt-1",
    customerId: "cust-2",
    amount: 75000,
    date: "2024-01-25",
    method: "cheque",
    reference: "RCPT-001",
    invoiceIds: [],
    status: "completed",
  },
];

// Default Budgets
export const defaultBudgets = [
  {
    id: "budget-1",
    name: "Q1 2024 Operating Budget",
    period: "quarterly",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    accounts: [
      { accountId: "acc-5", allocated: 200000, spent: 50000 },
      { accountId: "acc-4", target: 1000000, achieved: 250000 },
    ],
    status: "active",
  },
];

// Default Cost Centers
export const defaultCostCenters = [
  { id: "cc-1", name: "Sales & Marketing", code: "SM", isActive: true },
  { id: "cc-2", name: "Research & Development", code: "RD", isActive: true },
  { id: "cc-3", name: "Administration", code: "ADMIN", isActive: true },
  { id: "cc-4", name: "Operations", code: "OPS", isActive: true },
];

// Initial Finance Data
export const initialFinanceData = {
  companyName: "Your Company",
  fiscalYearStart: "2024-01-01",
  fiscalYearEnd: "2024-12-31",
  baseCurrency: "INR",
  taxRate: 18,
  defaultPaymentTerms: 30,
};

// Bank & Cash Management Sample Data
export const initialBankAccounts = [
  {
    id: "ba-1",
    name: "HDFC Current Account",
    bankName: "HDFC Bank",
    accountNumber: "123456789012",
    accountType: "checking",
    balance: 500000,
    currency: "INR",
    status: "active",
    openingDate: "2023-01-01",
    creditLimit: 0,
    currentBalance: 500000,
    availableBalance: 500000,
    isReconciled: true,
    branch: "Mumbai Main",
  },
  {
    id: "ba-2",
    name: "SBI Savings Account",
    bankName: "State Bank of India",
    accountNumber: "987654321098",
    accountType: "savings",
    balance: 250000,
    currency: "INR",
    status: "active",
    openingDate: "2023-01-01",
    creditLimit: 0,
    currentBalance: 250000,
    availableBalance: 250000,
    isReconciled: false,
    branch: "Delhi Branch",
  },
];

export const initialBankTransactions = [
  {
    id: "bt-1",
    accountId: "ba-1",
    type: "deposit",
    amount: 100000,
    date: "2024-01-15",
    description: "Customer Payment - INV-001",
    reference: "PYMT-001",
    category: "revenue",
    status: "completed",
    isReconciled: true,
    balanceAfter: 600000,
  },
  {
    id: "bt-2",
    accountId: "ba-1",
    type: "withdrawal",
    amount: 50000,
    date: "2024-01-20",
    description: "Vendor Payment - ABC Suppliers",
    reference: "VP-001",
    category: "expense",
    status: "completed",
    isReconciled: false,
    balanceAfter: 550000,
  },
];

export const initialBankDeposits = [
  {
    id: "dep-1",
    accountId: "ba-1",
    amount: 100000,
    date: "2024-01-15",
    description: "Customer Payment Batch",
    reference: "DEP-001",
    status: "matched",
    matchedReceipts: ["rcpt-1"],
  },
];

export const initialCashFlowCategories = [
  { id: "cf-1", name: "Sales Revenue", type: "income", isActive: true },
  { id: "cf-2", name: "Service Revenue", type: "income", isActive: true },
  { id: "cf-3", name: "Supplier Payments", type: "expense", isActive: true },
  { id: "cf-4", name: "Salary & Wages", type: "expense", isActive: true },
  { id: "cf-5", name: "Office Expenses", type: "expense", isActive: true },
  { id: "cf-6", name: "Loan Receipt", type: "income", isActive: true },
  { id: "cf-7", name: "Loan Repayment", type: "expense", isActive: true },
];

// Fixed Assets Sample Data
export const initialFixedAssets = [
  {
    id: "fa-1",
    name: "Office Building",
    category: "building",
    cost: 5000000,
    purchaseDate: "2020-01-15",
    usefulLife: 30,
    depreciationMethod: "straight-line",
    salvageValue: 500000,
    accumulatedDepreciation: 500000,
    netBookValue: 4500000,
    currentValue: 4500000,
    location: "Mumbai",
    department: "Administration",
    status: "active",
    isInsured: true,
    insuranceExpiry: "2024-12-31",
  },
  {
    id: "fa-2",
    name: "Delivery Van",
    category: "vehicle",
    cost: 800000,
    purchaseDate: "2022-03-10",
    usefulLife: 8,
    depreciationMethod: "straight-line",
    salvageValue: 80000,
    accumulatedDepreciation: 90000,
    netBookValue: 710000,
    currentValue: 710000,
    location: "Delhi",
    department: "Operations",
    status: "active",
    isInsured: true,
    insuranceExpiry: "2024-06-30",
  },
];

export const initialassetCategories = [
  { id: "cat-1", name: "Land", code: "LAND", isActive: true },
  { id: "cat-2", name: "Building", code: "BLDG", isActive: true },
  { id: "cat-3", name: "Vehicle", code: "VEH", isActive: true },
  { id: "cat-4", name: "Equipment", code: "EQP", isActive: true },
  { id: "cat-5", name: "Furniture", code: "FURN", isActive: true },
  { id: "cat-6", name: "Computer", code: "COMP", isActive: true },
];

export const initialDepreciationMethods = [
  {
    id: "dep-1",
    name: "Straight Line",
    code: "SLM",
    formula: "(Cost - Salvage) / Useful Life",
  },
  {
    id: "dep-2",
    name: "Declining Balance",
    code: "DB",
    formula: "Book Value * (Rate / Useful Life)",
  },
  {
    id: "dep-3",
    name: "Double Declining",
    code: "DDB",
    formula: "Book Value * (2 / Useful Life)",
  },
  {
    id: "dep-4",
    name: "Units of Production",
    code: "UOP",
    formula: "(Cost - Salvage) * (Units This Period / Total Units)",
  },
];

export const initialLocations = [
  { id: "loc-1", name: "Mumbai HQ", code: "BOM", isActive: true },
  { id: "loc-2", name: "Delhi Branch", code: "DEL", isActive: true },
  { id: "loc-3", name: "Bangalore Office", code: "BLR", isActive: true },
  { id: "loc-4", name: "Chennai Unit", code: "MAA", isActive: true },
];

export const initialDepartments = [
  { id: "dept-1", name: "Administration", code: "ADMIN", isActive: true },
  { id: "dept-2", name: "Sales", code: "SALES", isActive: true },
  { id: "dept-3", name: "Marketing", code: "MKT", isActive: true },
  { id: "dept-4", name: "Operations", code: "OPS", isActive: true },
  { id: "dept-5", name: "IT", code: "IT", isActive: true },
  { id: "dept-6", name: "HR", code: "HR", isActive: true },
];

// Consolidation Sample Data
export const consolidationEntities = [
  {
    id: "entity-1",
    name: "HQ - Mumbai",
    code: "HQ",
    currency: "INR",
    exchangeRate: 1,
    isActive: true,
    type: "headquarters",
    address: "Mumbai, India",
    taxId: "GSTIN123456789",
    contact: "manager@hq.com",
  },
  {
    id: "entity-2",
    name: "Delhi Branch",
    code: "DEL",
    currency: "INR",
    exchangeRate: 1,
    isActive: true,
    type: "branch",
    address: "Delhi, India",
    taxId: "GSTIN123456790",
    contact: "branch.delhi@company.com",
  },
  {
    id: "entity-3",
    name: "Bangalore Unit",
    code: "BLR",
    currency: "INR",
    exchangeRate: 1,
    isActive: true,
    type: "branch",
    address: "Bangalore, India",
    taxId: "GSTIN123456791",
    contact: "unit.blr@company.com",
  },
  {
    id: "entity-4",
    name: "US Subsidiary",
    code: "USA",
    currency: "USD",
    exchangeRate: 83.25,
    isActive: true,
    type: "subsidiary",
    address: "New York, USA",
    taxId: "EIN123456789",
    contact: "us@company.com",
  },
];

export const initialIntercompanyTransactions = [
  {
    id: "ict-1",
    fromEntity: "entity-1",
    toEntity: "entity-2",
    amount: 500000,
    currency: "INR",
    date: "2024-01-10",
    description: "Intercompany Loan",
    type: "loan",
    status: "active",
    reconciliationStatus: "pending",
  },
  {
    id: "ict-2",
    fromEntity: "entity-1",
    toEntity: "entity-4",
    amount: 10000,
    currency: "USD",
    date: "2024-01-15",
    description: "Management Fees",
    type: "fee",
    status: "completed",
    reconciliationStatus: "reconciled",
  },
];
