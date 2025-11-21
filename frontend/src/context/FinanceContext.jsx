// src/context/FinanceContext.js
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  sampleChartOfAccounts,
  sampleVendors,
  sampleInvoices,
  sampleJournalEntries,
  defaultPayments,
  defaultCustomers,
  defaultArInvoices,
  defaultReceipts,
  defaultBudgets,
  defaultCostCenters,
  initialFinanceData,
  initialBankAccounts,
  initialBankTransactions,
  initialBankDeposits,
  initialCashFlowCategories,
  initialFixedAssets,
  initialassetCategories,
  initialDepreciationMethods,
  initialLocations,
  initialDepartments,
  consolidationEntities,
  initialIntercompanyTransactions,
} from "../data/data";

const FinanceContext = createContext();

// Validation schemas
const ACCOUNT_TYPES = [
  "Asset",
  "Liability",
  "Equity",
  "Income",
  "Expense",
  "Bank",
  "Cash",
];
const ENTRY_STATUSES = ["draft", "posted", "void", "reconciled"];

// Utility functions
const generateId = (prefix = "") =>
  `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const isValidDate = (dateString) => !isNaN(Date.parse(dateString));
const roundCurrency = (amount) => Math.round(amount * 100) / 100;

export const FinanceProvider = ({ children, sharedState }) => {
  // Fixed Assets states with proper initialization
  const [assets, setAssets] = useState(initialFixedAssets || []);
  const [assetCategories, setAssetCategories] = useState(
    initialassetCategories || []
  );
  const [depreciationMethods, setDepreciationMethods] = useState(
    initialDepreciationMethods || []
  );
  const [locations, setLocations] = useState(initialLocations || []);
  const [departments, setDepartments] = useState(initialDepartments || []);
  const [depreciationHistory, setDepreciationHistory] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [disposalHistory, setDisposalHistory] = useState([]);

  // Bank & Cash Management states with proper initialization
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts || []);
  const [bankTransactions, setBankTransactions] = useState(
    initialBankTransactions || []
  );
  const [bankDeposits, setBankDeposits] = useState(initialBankDeposits || []);
  const [cashFlowCategories, setCashFlowCategories] = useState(
    initialCashFlowCategories || []
  );

  // Finance Consolidation states

  const load = useCallback((key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed !== null ? parsed : fallback;
      }
      return fallback;
    } catch (err) {
      console.warn(`[FinanceContext] Failed to load ${key}:`, err);
      return fallback;
    }
  }, []);
  const [entities, setEntities] = useState(consolidationEntities || []);
  const [intercompanyTransactions, setIntercompanyTransactions] = useState(
    initialIntercompanyTransactions || []
  );
  const [consolidationSettings, setConsolidationSettings] = useState({
    reportingCurrency: "INR",
    autoConsolidate: true,
    eliminationEntries: true,
    intercompanyReconciliation: true,
    consolidationMethod: "full",
    reportingPeriod: "monthly",
  });
  const [consolidationHistory, setConsolidationHistory] = useState(() =>
    load("consolidationHistory", [])
  );
  const [eliminationEntries, setEliminationEntries] = useState(() =>
    load("eliminationEntries", [])
  );

  const [customers, setCustomers] = useState([]);
  const {
    customers: sharedCustomers = [],
    setCustomers: setSharedCustomers,
    logAudit: sharedLogAudit,
    user,
  } = sharedState || {};

  /* --------------------------- LOCAL STORAGE HELPERS --------------------------- */

  const save = useCallback((key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`[FinanceContext] Failed to save ${key}:`, err);
    }
  }, []);

  /* --------------------------- STATE (Persisted) --------------------------- */
  const [chartOfAccounts, setChartOfAccounts] = useState(() => {
    const saved = load("coa", []);
    return saved.length > 0 ? saved : sampleChartOfAccounts;
  });

  const [journalEntries, setJournalEntries] = useState(() =>
    load("entries", sampleJournalEntries)
  );

  const [vendors, setVendors] = useState(() => load("vendors", sampleVendors));
  const [invoices, setInvoices] = useState(() =>
    load("invoices", sampleInvoices)
  );
  const [payments, setPayments] = useState(() =>
    load("payments", defaultPayments)
  );
  const [arInvoices, setArInvoices] = useState(() =>
    load("arInvoices", defaultArInvoices)
  );
  const [receipts, setReceipts] = useState(() =>
    load("receipts", defaultReceipts)
  );
  const [budgets, setBudgets] = useState(() => load("budgets", defaultBudgets));
  const [costCenters, setCostCenters] = useState(() =>
    load("costCenters", defaultCostCenters)
  );
  const [fixedAssets, setFixedAssets] = useState(() => load("assets", []));
  const [financeData, setFinanceData] = useState(() =>
    load("financeData", initialFinanceData)
  );
  const [auditLogs, setAuditLogs] = useState(() => load("auditLogs", []));

  // Load consolidation data
  useEffect(() => {
    const savedEntities = load("consolidationEntities", []);
    if (savedEntities.length === 0) {
      setEntities(consolidationEntities);
    }

    const savedIntercompany = load("intercompanyTransactions", []);
    if (savedIntercompany.length === 0) {
      setIntercompanyTransactions(initialIntercompanyTransactions);
    }

    const savedHistory = load("consolidationHistory", []);
    setConsolidationHistory(savedHistory);

    const savedEliminations = load("eliminationEntries", []);
    setEliminationEntries(savedEliminations);
  }, [load]);

  /* --------------------------- AUTO-SAVE TO LOCALSTORAGE --------------------------- */
  useEffect(() => {
    save("coa", chartOfAccounts);
    save("entries", journalEntries);
    save("vendors", vendors);
    save("invoices", invoices);
    save("payments", payments);
    save("arInvoices", arInvoices);
    save("receipts", receipts);
    save("budgets", budgets);
    save("costCenters", costCenters);
    save("assets", fixedAssets);
    save("financeData", financeData);
    save("auditLogs", auditLogs);
    save("consolidationEntities", entities);
    save("intercompanyTransactions", intercompanyTransactions);
    save("consolidationSettings", consolidationSettings);
    save("consolidationHistory", consolidationHistory);
    save("eliminationEntries", eliminationEntries);
  }, [
    chartOfAccounts,
    journalEntries,
    vendors,
    invoices,
    payments,
    arInvoices,
    receipts,
    budgets,
    costCenters,
    fixedAssets,
    financeData,
    auditLogs,
    entities,
    intercompanyTransactions,
    consolidationSettings,
    consolidationHistory,
    eliminationEntries,
    save,
  ]);

  /* --------------------------- CURRENCY FORMATTER --------------------------- */
  const formatCurrency = useCallback(
    (amount) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }).format(amount || 0),
    []
  );

  /* --------------------------- AUDIT LOGGING --------------------------- */
  const logAudit = useCallback(
    (action, details = {}) => {
      const log = {
        id: generateId("audit-"),
        timestamp: new Date().toISOString(),
        action,
        user: user?.email || "Unknown",
        details:
          typeof details === "object" ? details : { message: String(details) },
      };

      setAuditLogs((prev) => [...prev.slice(-999), log]); // Keep last 1000 logs

      // Also log to shared audit if available
      if (sharedLogAudit) {
        sharedLogAudit(action, details);
      }
    },
    [user, sharedLogAudit]
  );

  /* --------------------------- ACCOUNT MANAGEMENT --------------------------- */
  const accountsMap = useMemo(() => {
    const map = {};
    chartOfAccounts.forEach((a) => {
      map[a.id] = a;
      map[a.name] = a;
      if (a.code) map[a.code] = a;
    });
    return map;
  }, [chartOfAccounts]);

  const getAccount = useCallback(
    (idOrNameOrCode) => {
      if (!idOrNameOrCode) return null;
      const key = String(idOrNameOrCode).trim();

      // Direct map lookup
      const account = accountsMap[key];
      if (account) return account;

      const lowerKey = key.toLowerCase();

      for (const acc of chartOfAccounts) {
        const idStr = String(acc.id);
        const nameStr = String(acc.name || "");
        const codeStr = String(acc.code || "");

        if (
          idStr === key ||
          nameStr.toLowerCase() === lowerKey ||
          codeStr.toLowerCase() === lowerKey
        ) {
          return acc;
        }
      }

      console.warn(`[FinanceContext] Account not found: "${key}"`);
      return null;
    },
    [accountsMap, chartOfAccounts]
  );

  const validateAccount = useCallback((account, isCreation = false) => {
    const errors = [];

    // Only require ID for updates, not for creation
    if (!isCreation && !account.id) {
      errors.push("Account ID is required");
    }

    if (!account.name || account.name.trim() === "") {
      errors.push("Account name is required");
    }

    if (!account.type || !ACCOUNT_TYPES.includes(account.type)) {
      errors.push(`Account type must be one of: ${ACCOUNT_TYPES.join(", ")}`);
    }

    if (account.opening && typeof account.opening !== "number") {
      errors.push("Opening balance must be a number");
    }

    if (account.balance && typeof account.balance !== "number") {
      errors.push("Balance must be a number");
    }

    return errors;
  }, []);

  const createAccount = useCallback(
    (accountData) => {
      // For creation, don't require ID yet
      const validationErrors = validateAccount(accountData, true);
      if (validationErrors.length > 0) {
        throw new Error(
          `Account validation failed: ${validationErrors.join(", ")}`
        );
      }

      const newAccount = {
        id: generateId("acc-"),
        opening: 0,
        balance: 0,
        ...accountData,
        createdAt: new Date().toISOString(),
        createdBy: user?.email || "system",
      };

      setChartOfAccounts((prev) => [...prev, newAccount]);
      logAudit("Account Created", newAccount);
      return newAccount;
    },
    [validateAccount, user, logAudit]
  );

  const updateAccount = useCallback(
    (accountId, updates) => {
      const existingAccount = chartOfAccounts.find(
        (acc) => acc.id === accountId
      );
      if (!existingAccount) throw new Error("Account not found");

      const updatedAccount = { ...existingAccount, ...updates };
      // For updates, require ID
      const validationErrors = validateAccount(updatedAccount, false);
      if (validationErrors.length > 0) {
        throw new Error(
          `Account validation failed: ${validationErrors.join(", ")}`
        );
      }

      setChartOfAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? {
                ...acc,
                ...updates,
                updatedAt: new Date().toISOString(),
                updatedBy: user?.email,
              }
            : acc
        )
      );

      logAudit("Account Updated", { accountId, updates });
      return true;
    },
    [chartOfAccounts, user, logAudit, validateAccount]
  );

  const deleteAccount = useCallback(
    (accountId) => {
      const account = chartOfAccounts.find((acc) => acc.id === accountId);
      if (!account) throw new Error("Account not found");

      // Check if account has transactions
      const hasTransactions = journalEntries.some((entry) =>
        entry.lines.some((line) => line.accountId === accountId)
      );

      if (hasTransactions) {
        throw new Error("Cannot delete account with existing transactions");
      }

      setChartOfAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      logAudit("Account Deleted", account);
      return true;
    },
    [chartOfAccounts, journalEntries, logAudit]
  );

  /* --------------------------- JOURNAL ENTRIES MANAGEMENT --------------------------- */
  const validateJournalEntry = useCallback((entry) => {
    const errors = [];

    if (!entry.date || !isValidDate(entry.date))
      errors.push("Valid date is required");
    if (
      !entry.lines ||
      !Array.isArray(entry.lines) ||
      entry.lines.length === 0
    ) {
      errors.push("Journal entry must have at least one line");
    }

    if (entry.lines) {
      const totalDebit = entry.lines.reduce(
        (sum, line) => sum + (line.debit || 0),
        0
      );
      const totalCredit = entry.lines.reduce(
        (sum, line) => sum + (line.credit || 0),
        0
      );

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        errors.push(
          `Journal entry not balanced: Debit ${totalDebit} ≠ Credit ${totalCredit}`
        );
      }

      entry.lines.forEach((line, index) => {
        if (!line.accountId)
          errors.push(`Line ${index + 1}: Account ID is required`);
        if (typeof line.debit !== "number" || typeof line.credit !== "number") {
          errors.push(`Line ${index + 1}: Debit and credit must be numbers`);
        }
        if (line.debit < 0 || line.credit < 0) {
          errors.push(`Line ${index + 1}: Debit and credit cannot be negative`);
        }
      });
    }

    return errors;
  }, []);

  const createJournalEntry = useCallback(
    (entryData) => {
      const validationErrors = validateJournalEntry(entryData);
      if (validationErrors.length > 0) {
        throw new Error(
          `Journal entry validation failed: ${validationErrors.join(", ")}`
        );
      }

      const newEntry = {
        id: generateId("je-"),
        status: "posted",
        createdAt: new Date().toISOString(),
        createdBy: user?.email || "system",
        ...entryData,
      };

      setJournalEntries((prev) => [...prev, newEntry]);

      // Update account balances
      setChartOfAccounts((prev) =>
        prev.map((account) => {
          const entryLines = newEntry.lines.filter(
            (line) => line.accountId === account.id
          );
          if (entryLines.length === 0) return account;

          const netChange = entryLines.reduce(
            (sum, line) => sum + line.debit - line.credit,
            0
          );
          return {
            ...account,
            balance: roundCurrency((account.balance || 0) + netChange),
            updatedAt: new Date().toISOString(),
          };
        })
      );

      logAudit("Journal Entry Created", newEntry);
      return newEntry;
    },
    [validateJournalEntry, user, logAudit]
  );

  const updateJournalEntry = useCallback(
    (entryId, updates) => {
      const existingEntry = journalEntries.find(
        (entry) => entry.id === entryId
      );
      if (!existingEntry) throw new Error("Journal entry not found");

      if (existingEntry.status === "posted") {
        throw new Error("Cannot modify posted journal entry");
      }

      const updatedEntry = { ...existingEntry, ...updates };
      const validationErrors = validateJournalEntry(updatedEntry);
      if (validationErrors.length > 0) {
        throw new Error(
          `Journal entry validation failed: ${validationErrors.join(", ")}`
        );
      }

      setJournalEntries((prev) =>
        prev.map((entry) => (entry.id === entryId ? updatedEntry : entry))
      );

      logAudit("Journal Entry Updated", { entryId, updates });
      return updatedEntry;
    },
    [journalEntries, validateJournalEntry, logAudit]
  );

  const voidJournalEntry = useCallback(
    (entryId) => {
      setJournalEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                status: "void",
                voidedAt: new Date().toISOString(),
                voidedBy: user?.email,
              }
            : entry
        )
      );

      logAudit("Journal Entry Voided", { entryId });
      return true;
    },
    [user, logAudit]
  );

  /* --------------------------- UNIVERSAL GL POSTING --------------------------- */
  const postToGL = useCallback(
    (
      debitAccountIdOrName,
      creditAccountIdOrName,
      amount,
      description,
      ref = "",
      date = new Date().toISOString().split("T")[0],
      costCenter = null
    ) => {
      if (!amount || amount <= 0) {
        throw new Error(`Invalid amount: ${amount}`);
      }

      const debitAcc = debitAccountIdOrName
        ? getAccount(debitAccountIdOrName)
        : null;
      const creditAcc = creditAccountIdOrName
        ? getAccount(creditAccountIdOrName)
        : null;

      if (!debitAcc && !creditAcc) {
        throw new Error("At least one account must be provided");
      }

      const lines = [];
      if (debitAcc)
        lines.push({
          accountId: debitAcc.id,
          debit: amount,
          credit: 0,
          costCenter,
        });
      if (creditAcc)
        lines.push({
          accountId: creditAcc.id,
          debit: 0,
          credit: amount,
          costCenter,
        });

      const entry = {
        date,
        ref: ref || `JE-${Date.now().toString().slice(-6)}`,
        desc: description || "Journal Entry",
        lines,
      };

      return createJournalEntry(entry);
    },
    [getAccount, createJournalEntry]
  );

  /* --------------------------- BALANCE CALCULATIONS --------------------------- */
  const getBalance = useCallback(
    (accountIdOrName, { fromDate, toDate } = {}) => {
      const account = getAccount(accountIdOrName);
      if (!account) return 0;

      const opening = account.opening || 0;

      const relevantEntries = journalEntries
        .filter((entry) => entry.status !== "void")
        .filter((entry) => {
          if (fromDate && entry.date < fromDate) return false;
          if (toDate && entry.date > toDate) return false;
          return true;
        });

      const balanceChange = relevantEntries
        .flatMap((entry) => entry.lines)
        .filter((line) => line.accountId === account.id)
        .reduce((sum, line) => sum + line.debit - line.credit, 0);

      return roundCurrency(opening + balanceChange);
    },
    [journalEntries, getAccount]
  );

  const getAccountBalance = useCallback(
    (accountIdOrName) => {
      const account = getAccount(accountIdOrName);
      return account ? account.balance || 0 : 0;
    },
    [getAccount]
  );

  /* --------------------------- FINANCIAL REPORTS --------------------------- */
  const getTrialBalance = useCallback(
    (asOfDate = new Date().toISOString().split("T")[0]) => {
      const trialBalance = chartOfAccounts.map((account) => {
        const balance = getBalance(account.id, { toDate: asOfDate });
        return {
          account: account.name,
          code: account.code,
          type: account.type,
          debit: balance > 0 ? balance : 0,
          credit: balance < 0 ? Math.abs(balance) : 0,
        };
      });

      const totalDebit = trialBalance.reduce((sum, acc) => sum + acc.debit, 0);
      const totalCredit = trialBalance.reduce(
        (sum, acc) => sum + acc.credit,
        0
      );

      return {
        data: trialBalance,
        totalDebit: roundCurrency(totalDebit),
        totalCredit: roundCurrency(totalCredit),
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
        asOfDate,
      };
    },
    [chartOfAccounts, getBalance]
  );

  const getProfitAndLoss = useCallback(
    (fromDate, toDate) => {
      const revenueAccounts = chartOfAccounts.filter(
        (acc) => acc.type === "Income"
      );
      const expenseAccounts = chartOfAccounts.filter(
        (acc) => acc.type === "Expense"
      );

      const revenue = revenueAccounts.reduce(
        (sum, acc) => sum + getBalance(acc.id, { fromDate, toDate }),
        0
      );

      const expenses = expenseAccounts.reduce(
        (sum, acc) => sum + getBalance(acc.id, { fromDate, toDate }),
        0
      );

      const grossProfit = revenue - expenses;

      return {
        revenue: roundCurrency(revenue),
        expenses: roundCurrency(expenses),
        grossProfit: roundCurrency(grossProfit),
        margin: revenue ? roundCurrency((grossProfit / revenue) * 100) : 0,
        period: { fromDate, toDate },
      };
    },
    [chartOfAccounts, getBalance]
  );

  const getBalanceSheet = useCallback(
    (asOfDate = new Date().toISOString().split("T")[0]) => {
      const assets = chartOfAccounts
        .filter((acc) => acc.type === "Asset")
        .map((acc) => ({
          ...acc,
          balance: getBalance(acc.id, { toDate: asOfDate }),
        }));

      const liabilities = chartOfAccounts
        .filter((acc) => acc.type === "Liability")
        .map((acc) => ({
          ...acc,
          balance: getBalance(acc.id, { toDate: asOfDate }),
        }));

      const equity = chartOfAccounts
        .filter((acc) => acc.type === "Equity")
        .map((acc) => ({
          ...acc,
          balance: getBalance(acc.id, { toDate: asOfDate }),
        }));

      const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
      const totalLiabilities = liabilities.reduce(
        (sum, acc) => sum + acc.balance,
        0
      );
      const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);

      return {
        assets: {
          items: assets,
          total: roundCurrency(totalAssets),
        },
        liabilities: {
          items: liabilities,
          total: roundCurrency(totalLiabilities),
        },
        equity: {
          items: equity,
          total: roundCurrency(totalEquity),
        },
        isBalanced:
          Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
        asOfDate,
      };
    },
    [chartOfAccounts, getBalance]
  );

  /* --------------------------- FINANCE CONSOLIDATION --------------------------- */

  // Entity Management
  const addEntity = useCallback(
    (entityData) => {
      const newEntity = {
        id: `entity-${Date.now()}`,
        isActive: true,
        exchangeRate: 1,
        ...entityData,
        createdAt: new Date().toISOString(),
      };

      setEntities((prev) => [...prev, newEntity]);
      logAudit("Entity Added", newEntity);
      return newEntity;
    },
    [logAudit]
  );

  const updateEntity = useCallback(
    (entityId, updates) => {
      setEntities((prev) =>
        prev.map((entity) =>
          entity.id === entityId
            ? { ...entity, ...updates, updatedAt: new Date().toISOString() }
            : entity
        )
      );
      logAudit("Entity Updated", { entityId, updates });
    },
    [logAudit]
  );

  const toggleEntityActive = useCallback(
    (entityId) => {
      setEntities((prev) =>
        prev.map((entity) =>
          entity.id === entityId
            ? { ...entity, isActive: !entity.isActive }
            : entity
        )
      );
      logAudit("Entity Status Toggled", { entityId });
    },
    [logAudit]
  );

  const deleteEntity = useCallback(
    (entityId) => {
      setEntities((prev) => prev.filter((entity) => entity.id !== entityId));
      logAudit("Entity Deleted", { entityId });
    },
    [logAudit]
  );

  const updateExchangeRate = useCallback(
    (entityId, newRate) => {
      setEntities((prev) =>
        prev.map((entity) =>
          entity.id === entityId
            ? {
                ...entity,
                exchangeRate: newRate,
                previousExchangeRate: entity.exchangeRate,
                rateUpdatedAt: new Date().toISOString(),
              }
            : entity
        )
      );
      logAudit("Exchange Rate Updated", { entityId, newRate });
    },
    [logAudit]
  );

  // Currency Conversion
  const convertCurrency = useCallback(
    (amount, fromCurrency, toCurrency, customRate = null) => {
      if (fromCurrency === toCurrency) return amount;

      const entity = entities.find((e) => e.currency === fromCurrency);
      const rate = customRate || (entity ? entity.exchangeRate : 1);

      return roundCurrency(amount * rate);
    },
    [entities]
  );

  // Consolidated Financial Reports
  const getConsolidatedBalanceSheet = useCallback(
    (asOfDate, selectedEntities = null) => {
      const activeEntities =
        selectedEntities || entities.filter((e) => e.isActive);

      const consolidated = {
        assets: { items: [], total: 0 },
        liabilities: { items: [], total: 0 },
        equity: { items: [], total: 0 },
        entities: activeEntities.map((e) => ({
          code: e.code,
          name: e.name,
          currency: e.currency,
        })),
        asOfDate,
        reportingCurrency: consolidationSettings.reportingCurrency,
        totalAssets: 0,
        totalLiabilitiesEquity: 0,
        isBalanced: false,
      };

      // For demo - actual implementation would fetch data for each entity
      const baseBalanceSheet = getBalanceSheet(asOfDate);

      // Consolidate base data (in real scenario, this would be per entity)
      baseBalanceSheet.assets.items.forEach((asset) => {
        const consolidatedAsset = {
          ...asset,
          entityBreakdown: {},
        };

        activeEntities.forEach((entity) => {
          const convertedBalance = convertCurrency(
            asset.balance,
            entity.currency,
            consolidationSettings.reportingCurrency,
            entity.exchangeRate
          );
          consolidatedAsset.entityBreakdown[entity.code] = convertedBalance;
        });

        consolidatedAsset.balance = Object.values(
          consolidatedAsset.entityBreakdown
        ).reduce((sum, bal) => sum + bal, 0);

        consolidated.assets.items.push(consolidatedAsset);
        consolidated.assets.total += consolidatedAsset.balance;
      });

      consolidated.totalAssets = consolidated.assets.total;
      consolidated.totalLiabilitiesEquity = consolidated.totalAssets;
      consolidated.isBalanced = true;

      return consolidated;
    },
    [entities, consolidationSettings, getBalanceSheet, convertCurrency]
  );

  const getConsolidatedProfitAndLoss = useCallback(
    (fromDate, toDate, selectedEntities = null) => {
      const activeEntities =
        selectedEntities || entities.filter((e) => e.isActive);

      const basePnl = getProfitAndLoss(fromDate, toDate);

      const consolidated = {
        revenue: 0,
        expenses: 0,
        grossProfit: 0,
        margin: 0,
        entities: activeEntities.map((e) => ({ code: e.code, name: e.name })),
        period: { fromDate, toDate },
        entityBreakdown: {},
      };

      // Calculate consolidated figures with currency conversion
      activeEntities.forEach((entity) => {
        const entityRevenue = convertCurrency(
          basePnl.revenue * 0.3, // Demo - real would have actual entity data
          entity.currency,
          consolidationSettings.reportingCurrency,
          entity.exchangeRate
        );

        const entityExpenses = convertCurrency(
          basePnl.expenses * 0.3,
          entity.currency,
          consolidationSettings.reportingCurrency,
          entity.exchangeRate
        );

        consolidated.entityBreakdown[entity.code] = {
          revenue: entityRevenue,
          expenses: entityExpenses,
          profit: entityRevenue - entityExpenses,
        };

        consolidated.revenue += entityRevenue;
        consolidated.expenses += entityExpenses;
      });

      consolidated.grossProfit = consolidated.revenue - consolidated.expenses;
      consolidated.margin = consolidated.revenue
        ? roundCurrency((consolidated.grossProfit / consolidated.revenue) * 100)
        : 0;

      return consolidated;
    },
    [entities, consolidationSettings, getProfitAndLoss, convertCurrency]
  );

  const getConsolidatedTrialBalance = useCallback(
    (asOfDate, selectedEntities = null) => {
      const activeEntities =
        selectedEntities || entities.filter((e) => e.isActive);

      const trialBalance = chartOfAccounts.map((account) => {
        const balance = getBalance(account.id, { toDate: asOfDate });
        const entityCount = activeEntities.length;
        const consolidatedBalance = balance * entityCount;

        return {
          account: account.name,
          code: account.code,
          type: account.type,
          debit: consolidatedBalance > 0 ? consolidatedBalance : 0,
          credit: consolidatedBalance < 0 ? Math.abs(consolidatedBalance) : 0,
          entityBreakdown: {},
        };
      });

      const totalDebit = trialBalance.reduce((sum, acc) => sum + acc.debit, 0);
      const totalCredit = trialBalance.reduce(
        (sum, acc) => sum + acc.credit,
        0
      );

      return {
        data: trialBalance,
        totalDebit: roundCurrency(totalDebit),
        totalCredit: roundCurrency(totalCredit),
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
        asOfDate,
        reportingCurrency: consolidationSettings.reportingCurrency,
      };
    },
    [chartOfAccounts, entities, getBalance, consolidationSettings]
  );

  // Intercompany Transactions
  const addIntercompanyTransaction = useCallback(
    (transactionData) => {
      const fromEntity = entities.find(
        (e) => e.id === transactionData.fromEntity
      );
      const toEntity = entities.find((e) => e.id === transactionData.toEntity);

      const convertedAmount = convertCurrency(
        transactionData.amount,
        fromEntity?.currency || "INR",
        consolidationSettings.reportingCurrency,
        transactionData.exchangeRate
      );

      const newTransaction = {
        id: `ict-${Date.now()}`,
        ...transactionData,
        convertedAmount,
        exchangeRate:
          transactionData.exchangeRate || fromEntity?.exchangeRate || 1,
        createdAt: new Date().toISOString(),
        reconciliationStatus: "pending",
      };

      setIntercompanyTransactions((prev) => [...prev, newTransaction]);
      logAudit("Intercompany Transaction Added", newTransaction);
      return newTransaction;
    },
    [entities, consolidationSettings, convertCurrency, logAudit]
  );

  const reconcileIntercompanyTransaction = useCallback(
    (transactionId) => {
      setIntercompanyTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === transactionId
            ? {
                ...transaction,
                reconciliationStatus: "reconciled",
                reconciledAt: new Date().toISOString(),
              }
            : transaction
        )
      );
      logAudit("Intercompany Transaction Reconciled", { transactionId });
    },
    [logAudit]
  );

  const markIntercompanyAsEliminated = useCallback(
    (transactionId) => {
      setIntercompanyTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === transactionId
            ? {
                ...transaction,
                reconciliationStatus: "eliminated",
                eliminatedAt: new Date().toISOString(),
              }
            : transaction
        )
      );
      logAudit("Intercompany Transaction Eliminated", { transactionId });
    },
    [logAudit]
  );

  // Elimination Entries
  const createEliminationEntry = useCallback(
    (eliminationData) => {
      const eliminationEntry = {
        id: `elim-${Date.now()}`,
        ...eliminationData,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      setEliminationEntries((prev) => [...prev, eliminationEntry]);
      logAudit("Elimination Entry Created", eliminationEntry);
      return eliminationEntry;
    },
    [logAudit]
  );

  const autoGenerateEliminationEntries = useCallback(
    (period) => {
      const pendingIntercompany = intercompanyTransactions.filter(
        (t) => t.reconciliationStatus === "pending"
      );

      const eliminationEntries = pendingIntercompany.map((transaction) => {
        return {
          id: `auto-elim-${transaction.id}`,
          transactionId: transaction.id,
          description: `Elimination: ${transaction.description}`,
          amount: transaction.amount || 0,
          debitAccount: "Intercompany Elimination",
          creditAccount: "Intercompany Elimination",
          period,
          autoGenerated: true,
          status: "posted",
        };
      });

      setEliminationEntries((prev) => [...prev, ...eliminationEntries]);

      // Mark transactions as eliminated
      pendingIntercompany.forEach((transaction) => {
        markIntercompanyAsEliminated(transaction.id);
      });

      logAudit("Auto Elimination Entries Generated", {
        count: eliminationEntries.length,
        period,
      });

      return eliminationEntries;
    },
    [intercompanyTransactions, markIntercompanyAsEliminated, logAudit]
  );

  // Consolidation Process
  const runConsolidation = useCallback(
    (period, selectedEntities = null) => {
      const consolidationRun = {
        id: `consolidation-${Date.now()}`,
        period,
        timestamp: new Date().toISOString(),
        entities:
          selectedEntities ||
          entities.filter((e) => e.isActive).map((e) => e.id),
        settings: { ...consolidationSettings },
        status: "in-progress",
        results: {},
      };

      try {
        // Generate consolidated reports
        consolidationRun.results = {
          balanceSheet: getConsolidatedBalanceSheet(
            period.split("T")[0],
            selectedEntities
          ),
          profitAndLoss: getConsolidatedProfitAndLoss(
            `${period}-01`,
            new Date(
              new Date(`${period}-01`).getFullYear(),
              new Date(`${period}-01`).getMonth() + 1,
              0
            )
              .toISOString()
              .slice(0, 10),
            selectedEntities
          ),
          trialBalance: getConsolidatedTrialBalance(
            period.split("T")[0],
            selectedEntities
          ),
        };

        // Generate elimination entries if enabled
        if (consolidationSettings.eliminationEntries) {
          consolidationRun.eliminationEntries =
            autoGenerateEliminationEntries(period);
        }

        consolidationRun.status = "completed";
        consolidationRun.completedAt = new Date().toISOString();
      } catch (error) {
        consolidationRun.status = "failed";
        consolidationRun.error = error.message;
      }

      setConsolidationHistory((prev) => [
        consolidationRun,
        ...prev.slice(0, 49),
      ]);
      logAudit("Consolidation Run Completed", consolidationRun);

      return consolidationRun;
    },
    [
      entities,
      consolidationSettings,
      getConsolidatedBalanceSheet,
      getConsolidatedProfitAndLoss,
      getConsolidatedTrialBalance,
      autoGenerateEliminationEntries,
      logAudit,
    ]
  );

  // Entity Performance
  const getEntityPerformance = useCallback(
    (entityId, fromDate, toDate) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return null;

      const basePnl = getProfitAndLoss(fromDate, toDate);

      return {
        entity: entity.name,
        currency: entity.currency,
        revenue: basePnl.revenue,
        expenses: basePnl.expenses,
        profit: basePnl.grossProfit,
        period: { fromDate, toDate },
      };
    },
    [entities, getProfitAndLoss]
  );

  // Consolidation Settings
  const updateConsolidationSettings = useCallback(
    (updates) => {
      setConsolidationSettings((prev) => ({ ...prev, ...updates }));
      logAudit("Consolidation Settings Updated", updates);
    },
    [logAudit]
  );

  /* --------------------------- QUICK ACCOUNTS --------------------------- */
  const quickAccounts = useMemo(() => {
    return {
      cash: getAccount("Cash"),
      bank: getAccount("Bank"),
      salesAccount: getAccount("Sales"),
      ap: getAccount("Accounts Payable"),
      ar: getAccount("Accounts Receivable"),
    };
  }, [getAccount]);

  /* --------------------------- BRANCHES & COST CENTERS --------------------------- */
  const branches = ["All", "HQ", "Mumbai", "Delhi", "Bangalore"];

  const allCostCenters = useMemo(() => {
    const fromMaster = costCenters.map((c) => c.name);
    const fromEntries = journalEntries.flatMap((e) =>
      e.lines.map((l) => l.costCenter).filter(Boolean)
    );
    return [...new Set([...fromMaster, ...fromEntries])].sort();
  }, [costCenters, journalEntries]);

  // Bank & Cash Management Functions
  const addBankAccount = useCallback(
    (accountData) => {
      const newAccount = {
        id: `ba${Date.now()}`,
        name: accountData.name || "Unnamed Account",
        bankName: accountData.bankName || "Unknown Bank",
        accountNumber: accountData.accountNumber || "N/A",
        accountType: accountData.accountType || "checking",
        balance: accountData.balance || 0,
        currency: accountData.currency || "USD",
        status: accountData.status || "active",
        openingDate:
          accountData.openingDate || new Date().toISOString().split("T")[0],
        creditLimit: accountData.creditLimit || 0,
        currentBalance: accountData.currentBalance || accountData.balance || 0,
        availableBalance:
          accountData.availableBalance ||
          (accountData.accountType === "credit"
            ? accountData.creditLimit
            : accountData.balance || 0),
        isReconciled: accountData.isReconciled || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setBankAccounts((prev) => {
        const updatedAccounts = [...(prev || []), newAccount];
        return updatedAccounts;
      });

      logAudit("Bank Account Created", newAccount);
      return newAccount;
    },
    [logAudit]
  );

  const updateBankAccount = useCallback(
    (accountId, updates) => {
      setBankAccounts((prev) =>
        prev.map((account) =>
          account.id === accountId
            ? { ...account, ...updates, updatedAt: new Date().toISOString() }
            : account
        )
      );

      logAudit("Bank Account Updated", { accountId, updates });
    },
    [logAudit]
  );

  const deleteBankAccount = useCallback(
    (accountId) => {
      setBankAccounts((prev) => {
        const filteredAccounts = prev.filter(
          (account) => account.id !== accountId
        );
        return filteredAccounts;
      });

      logAudit("Bank Account Deleted", { accountId });
    },
    [logAudit]
  );

  const reconcileAccount = useCallback(
    (accountId) => {
      setBankAccounts((prev) =>
        prev.map((account) =>
          account.id === accountId
            ? {
                ...account,
                isReconciled: true,
                lastReconciled: new Date().toISOString().split("T")[0],
                updatedAt: new Date().toISOString(),
              }
            : account
        )
      );

      logAudit("Bank Account Reconciled", { accountId });
    },
    [logAudit]
  );

  const addBankTransaction = useCallback(
    (transactionData) => {
      const newTransaction = {
        id: `bt${Date.now()}`,
        ...transactionData,
        status: "completed",
        isReconciled: false,
        createdAt: new Date().toISOString(),
      };

      setBankTransactions((prev) => [...(prev || []), newTransaction]);

      // Update account balance
      const account = bankAccounts.find(
        (acc) => acc.id === transactionData.accountId
      );
      if (account) {
        const balanceChange =
          transactionData.type === "deposit"
            ? transactionData.amount
            : -transactionData.amount;

        updateBankAccount(account.id, {
          balance: account.balance + balanceChange,
          currentBalance: account.currentBalance + balanceChange,
          availableBalance:
            account.accountType === "credit"
              ? account.availableBalance -
                (transactionData.type === "withdrawal"
                  ? transactionData.amount
                  : 0)
              : account.availableBalance + balanceChange,
        });
      }

      // Post to GL
      try {
        if (transactionData.type === "deposit") {
          postToGL(
            transactionData.accountId,
            transactionData.glAccount || "Sales",
            transactionData.amount,
            `Bank Deposit - ${transactionData.description}`,
            `BT-${newTransaction.id}`
          );
        } else {
          postToGL(
            transactionData.glAccount || "Office Expenses",
            transactionData.accountId,
            transactionData.amount,
            `Bank Withdrawal - ${transactionData.description}`,
            `BT-${newTransaction.id}`
          );
        }
      } catch (error) {
        console.error("Error posting to GL:", error);
      }

      logAudit("Bank Transaction Added", newTransaction);
      return newTransaction;
    },
    [bankAccounts, postToGL, updateBankAccount, logAudit]
  );

  const reconcileTransaction = useCallback(
    (transactionId) => {
      setBankTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, isReconciled: true }
            : transaction
        )
      );

      logAudit("Bank Transaction Reconciled", { transactionId });
    },
    [logAudit]
  );

  const matchDepositToReceipt = useCallback(
    (depositId, receiptId) => {
      setBankDeposits((prev) =>
        prev.map((deposit) =>
          deposit.id === depositId
            ? {
                ...deposit,
                status: "matched",
                matchedReceipts: [
                  ...(deposit.matchedReceipts || []),
                  receiptId,
                ],
              }
            : deposit
        )
      );

      setReceipts((prev) =>
        prev.map((receipt) =>
          receipt.id === receiptId ? { ...receipt, reconciled: true } : receipt
        )
      );

      logAudit("Deposit Matched to Receipt", { depositId, receiptId });
    },
    [logAudit]
  );

  // Cash Flow Analysis
  const getCashFlowData = useCallback(
    (period = "month") => {
      const now = new Date();
      let startDate, endDate;

      if (period === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === "quarter") {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
      }

      const periodTransactions = (bankTransactions || []).filter((t) => {
        if (!t || !t.date) return false;
        const transDate = new Date(t.date);
        return (
          transDate >= startDate &&
          transDate <= endDate &&
          t.status === "completed"
        );
      });

      const income = periodTransactions
        .filter((t) => t.type === "deposit")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const expenses = periodTransactions
        .filter((t) => t.type === "withdrawal")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        income: income || 0,
        expenses: expenses || 0,
        netCashFlow: (income || 0) - (expenses || 0),
        transactions: periodTransactions.length,
      };
    },
    [bankTransactions]
  );

  const getCashFlowAnalysis = useCallback(
    (period = "month") => {
      const now = new Date();
      let startDate, endDate;

      if (period === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === "quarter") {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
      }

      const periodTransactions = (bankTransactions || []).filter((t) => {
        if (!t || !t.date) return false;
        const transDate = new Date(t.date);
        return transDate >= startDate && transDate <= endDate;
      });

      const incomeByCategory = {};
      const expensesByCategory = {};

      periodTransactions.forEach((transaction) => {
        if (transaction.type === "deposit") {
          incomeByCategory[transaction.category] =
            (incomeByCategory[transaction.category] || 0) + transaction.amount;
        } else {
          expensesByCategory[transaction.category] =
            (expensesByCategory[transaction.category] || 0) +
            transaction.amount;
        }
      });

      return {
        income: periodTransactions
          .filter((t) => t.type === "deposit")
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        expenses: periodTransactions
          .filter((t) => t.type === "withdrawal")
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        incomeByCategory,
        expensesByCategory,
        transactions: periodTransactions.length,
      };
    },
    [bankTransactions]
  );

  // Get account by ID helper function
  const getAccountById = useCallback(
    (accountId) => {
      return (bankAccounts || []).find((account) => account.id === accountId);
    },
    [bankAccounts]
  );

  // Get transactions by account ID
  const getTransactionsByAccountId = useCallback(
    (accountId) => {
      return (bankTransactions || []).filter(
        (transaction) => transaction.accountId === accountId
      );
    },
    [bankTransactions]
  );

  // Fixed Assets Functions
  const addAsset = useCallback(
    (assetData) => {
      const newAsset = {
        id: `fa${Date.now()}`,
        ...assetData,
        status: "active",
        accumulatedDepreciation: 0,
        netBookValue: assetData.cost,
        currentValue: assetData.cost,
        createdAt: new Date().toISOString(),
        purchaseDate:
          assetData.purchaseDate || new Date().toISOString().split("T")[0],
      };

      setAssets((prev) => [...(prev || []), newAsset]);

      // Post to GL for asset acquisition
      postToGL(
        "Fixed Assets",
        "Cash",
        assetData.cost,
        `Asset Acquisition - ${assetData.name}`
      );

      logAudit("Fixed Asset Added", newAsset);
      return newAsset;
    },
    [postToGL, logAudit]
  );

  const updateAsset = useCallback(
    (assetId, updates) => {
      setAssets((prev) =>
        (prev || []).map((asset) =>
          asset.id === assetId
            ? { ...asset, ...updates, updatedAt: new Date().toISOString() }
            : asset
        )
      );

      logAudit("Fixed Asset Updated", { assetId, updates });
    },
    [logAudit]
  );

  const deleteAsset = useCallback(
    (assetId) => {
      const asset = assets.find((a) => a.id === assetId);
      if (
        asset &&
        window.confirm(`Are you sure you want to delete ${asset.name}?`)
      ) {
        setAssets((prev) => prev.filter((a) => a.id !== assetId));

        // Post to GL for asset removal
        postToGL(
          "Accumulated Depreciation",
          "Fixed Assets",
          asset.netBookValue,
          `Asset Deletion - ${asset.name}`
        );

        logAudit("Fixed Asset Deleted", asset);
      }
    },
    [assets, postToGL, logAudit]
  );

  const disposeAsset = useCallback(
    (assetId, disposalData) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) return;

      const disposalRecord = {
        id: `disp${Date.now()}`,
        assetId,
        assetName: asset.name,
        disposalDate: disposalData.disposalDate,
        disposalMethod: disposalData.method,
        proceeds: disposalData.proceeds || 0,
        netBookValue: asset.netBookValue,
        gainLoss: (disposalData.proceeds || 0) - asset.netBookValue,
        reason: disposalData.reason,
        disposedBy: disposalData.disposedBy,
        createdAt: new Date().toISOString(),
      };

      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? {
                ...a,
                status: "disposed",
                disposalDate: disposalData.disposalDate,
                disposalValue: disposalData.proceeds || 0,
              }
            : a
        )
      );

      setDisposalHistory((prev) => [...prev, disposalRecord]);

      // Post to GL for asset disposal
      if (disposalData.proceeds > 0) {
        postToGL(
          "Cash",
          "Fixed Assets",
          disposalData.proceeds,
          `Asset Disposal - ${asset.name}`
        );

        const gainLoss = disposalData.proceeds - asset.netBookValue;
        if (gainLoss > 0) {
          postToGL(
            "Gain on Disposal",
            "Retained Earnings",
            gainLoss,
            `Gain on Asset Disposal - ${asset.name}`
          );
        } else if (gainLoss < 0) {
          postToGL(
            "Loss on Disposal",
            "Retained Earnings",
            Math.abs(gainLoss),
            `Loss on Asset Disposal - ${asset.name}`
          );
        }
      }

      logAudit("Fixed Asset Disposed", { assetId, disposalData });
    },
    [assets, postToGL, logAudit]
  );

  const transferAsset = useCallback(
    (assetId, transferData) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) return;

      const transferRecord = {
        id: `trans${Date.now()}`,
        assetId,
        assetName: asset.name,
        fromLocation: asset.location,
        toLocation: transferData.location,
        fromDepartment: asset.department,
        toDepartment: transferData.department,
        transferDate: transferData.transferDate,
        transferredBy: transferData.transferredBy,
        reason: transferData.reason,
        createdAt: new Date().toISOString(),
      };

      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? {
                ...a,
                location: transferData.location,
                department: transferData.department,
                lastTransferDate: transferData.transferDate,
              }
            : a
        )
      );

      setTransferHistory((prev) => [...prev, transferRecord]);
      logAudit("Fixed Asset Transferred", { assetId, transferData });
    },
    [assets, logAudit]
  );

  const calculateDepreciation = useCallback(
    (assetId, period = "monthly") => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset || asset.status !== "active") return 0;

      let annualDepreciation = 0;
      const remainingValue = asset.cost - asset.accumulatedDepreciation;

      switch (asset.depreciationMethod) {
        case "straight-line":
          annualDepreciation =
            (asset.cost - (asset.salvageValue || 0)) / asset.usefulLife;
          break;

        case "declining-balance":
          const rate = 1 / asset.usefulLife;
          annualDepreciation = remainingValue * rate;
          break;

        case "double-declining":
          const doubleRate = 2 / asset.usefulLife;
          annualDepreciation = remainingValue * doubleRate;
          break;

        default:
          annualDepreciation =
            (asset.cost - (asset.salvageValue || 0)) / asset.usefulLife;
      }

      return period === "monthly"
        ? annualDepreciation / 12
        : annualDepreciation;
    },
    [assets]
  );

  const postMonthlyDepreciation = useCallback(() => {
    const depreciationRecords = [];

    assets.forEach((asset) => {
      if (asset.status === "active") {
        const monthlyDepreciation = calculateDepreciation(asset.id, "monthly");
        if (monthlyDepreciation > 0) {
          const newAccumulatedDepreciation =
            asset.accumulatedDepreciation + monthlyDepreciation;
          const newNetBookValue = asset.cost - newAccumulatedDepreciation;

          // Update asset
          updateAsset(asset.id, {
            accumulatedDepreciation: newAccumulatedDepreciation,
            netBookValue: newNetBookValue,
          });

          // Record depreciation entry
          const depRecord = {
            id: `dep${Date.now()}_${asset.id}`,
            assetId: asset.id,
            assetName: asset.name,
            period: new Date().toISOString().slice(0, 7),
            depreciationAmount: monthlyDepreciation,
            accumulatedDepreciation: newAccumulatedDepreciation,
            netBookValue: newNetBookValue,
            postedAt: new Date().toISOString(),
          };

          depreciationRecords.push(depRecord);

          // Post to GL
          postToGL(
            "Depreciation Expense",
            "Accumulated Depreciation",
            monthlyDepreciation,
            `Monthly Depreciation - ${asset.name}`
          );
        }
      }
    });

    setDepreciationHistory((prev) => [...prev, ...depreciationRecords]);
    logAudit("Monthly Depreciation Posted", {
      recordsCount: depreciationRecords.length,
    });
    return depreciationRecords;
  }, [assets, calculateDepreciation, updateAsset, postToGL, logAudit]);

  const getAssetDepreciationSchedule = useCallback(
    (assetId) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) return [];

      const schedule = [];
      let accumulatedDepreciation = 0;
      let netBookValue = asset.cost;

      for (let year = 1; year <= asset.usefulLife; year++) {
        const annualDepreciation = calculateDepreciation(asset.id, "annual");
        accumulatedDepreciation += annualDepreciation;
        netBookValue = asset.cost - accumulatedDepreciation;

        schedule.push({
          year,
          annualDepreciation,
          accumulatedDepreciation,
          netBookValue,
        });
      }

      return schedule;
    },
    [assets, calculateDepreciation]
  );

  /* --------------------------- CONTEXT VALUE --------------------------- */
  const value = useMemo(
    () => ({
      // Data
      chartOfAccounts,
      setChartOfAccounts,
      journalEntries,
      setJournalEntries,
      vendors,
      setVendors,
      invoices,
      setInvoices,
      payments,
      setPayments,
      arInvoices,
      setArInvoices,
      receipts,
      setReceipts,
      budgets,
      setBudgets,
      costCenters,
      setCostCenters,
      fixedAssets,
      setFixedAssets,
      financeData,
      setFinanceData,
      auditLogs,
      setAuditLogs,

      // Shared
      customers: sharedCustomers,
      setCustomers: setSharedCustomers,

      // Account Management
      getAccount,
      createAccount,
      updateAccount,
      deleteAccount,

      // Journal Entries
      createJournalEntry,
      updateJournalEntry,
      voidJournalEntry,

      // Core Actions
      postToGL,
      getBalance,
      getAccountBalance,
      formatCurrency,

      // Financial Reports
      getTrialBalance,
      getProfitAndLoss,
      getBalanceSheet,

      // Helpers
      branches,
      allCostCenters,

      // Quick Access Accounts
      ...quickAccounts,

      // Audit
      logAudit,

      // Validation
      validateAccount,
      validateJournalEntry,

      // Fixed Assets
      assets: assets || [],
      assetCategories: assetCategories || [],
      depreciationMethods: depreciationMethods || [],
      locations: locations || [],
      departments: departments || [],
      depreciationHistory: depreciationHistory || [],
      transferHistory: transferHistory || [],
      disposalHistory: disposalHistory || [],
      addAsset,
      updateAsset,
      deleteAsset,
      disposeAsset,
      transferAsset,
      calculateDepreciation,
      postMonthlyDepreciation,
      getAssetDepreciationSchedule,

      // Bank & Cash Management
      bankAccounts: bankAccounts || [],
      bankTransactions: bankTransactions || [],
      bankDeposits: bankDeposits || [],
      cashFlowCategories: cashFlowCategories || [],
      addBankAccount,
      updateBankAccount,
      deleteBankAccount,
      reconcileAccount,
      addBankTransaction,
      reconcileTransaction,
      matchDepositToReceipt,
      getCashFlowData,
      getCashFlowAnalysis,
      getAccountById,
      getTransactionsByAccountId,

      // Finance Consolidation
      entities,
      intercompanyTransactions,
      consolidationSettings,
      consolidationHistory,
      eliminationEntries,
      addEntity,
      updateEntity,
      toggleEntityActive,
      deleteEntity,
      updateExchangeRate,
      getConsolidatedBalanceSheet,
      getConsolidatedProfitAndLoss,
      getConsolidatedTrialBalance,
      addIntercompanyTransaction,
      reconcileIntercompanyTransaction,
      markIntercompanyAsEliminated,
      createEliminationEntry,
      autoGenerateEliminationEntries,
      runConsolidation,
      getEntityPerformance,
      updateConsolidationSettings,
      convertCurrency,
    }),
    [
      // Data
      chartOfAccounts,
      journalEntries,
      vendors,
      invoices,
      payments,
      arInvoices,
      receipts,
      budgets,
      costCenters,
      fixedAssets,
      financeData,
      auditLogs,

      // Shared
      sharedCustomers,
      setSharedCustomers,

      // Account Management
      getAccount,
      createAccount,
      updateAccount,
      deleteAccount,

      // Journal Entries
      createJournalEntry,
      updateJournalEntry,
      voidJournalEntry,

      // Core Actions
      postToGL,
      getBalance,
      getAccountBalance,
      formatCurrency,

      // Financial Reports
      getTrialBalance,
      getProfitAndLoss,
      getBalanceSheet,

      // Helpers
      branches,
      allCostCenters,
      quickAccounts,

      // Audit
      logAudit,

      // Validation
      validateAccount,
      validateJournalEntry,

      // Fixed Assets
      assets,
      assetCategories,
      depreciationMethods,
      locations,
      departments,
      depreciationHistory,
      transferHistory,
      disposalHistory,
      addAsset,
      updateAsset,
      deleteAsset,
      disposeAsset,
      transferAsset,
      calculateDepreciation,
      postMonthlyDepreciation,
      getAssetDepreciationSchedule,

      // Bank & Cash Management
      bankAccounts,
      bankTransactions,
      bankDeposits,
      cashFlowCategories,
      addBankAccount,
      updateBankAccount,
      deleteBankAccount,
      reconcileAccount,
      addBankTransaction,
      reconcileTransaction,
      matchDepositToReceipt,
      getCashFlowData,
      getCashFlowAnalysis,
      getAccountById,
      getTransactionsByAccountId,

      // Finance Consolidation
      entities,
      intercompanyTransactions,
      consolidationSettings,
      consolidationHistory,
      eliminationEntries,
      addEntity,
      updateEntity,
      toggleEntityActive,
      deleteEntity,
      updateExchangeRate,
      getConsolidatedBalanceSheet,
      getConsolidatedProfitAndLoss,
      getConsolidatedTrialBalance,
      addIntercompanyTransaction,
      reconcileIntercompanyTransaction,
      markIntercompanyAsEliminated,
      createEliminationEntry,
      autoGenerateEliminationEntries,
      runConsolidation,
      getEntityPerformance,
      updateConsolidationSettings,
      convertCurrency,
    ]
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return context;
};

// Custom hooks for specific functionality
export const useAccounts = () => {
  const {
    chartOfAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountBalance,
  } = useFinance();

  return {
    accounts: chartOfAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountBalance,
  };
};

export const useJournal = () => {
  const {
    journalEntries,
    createJournalEntry,
    updateJournalEntry,
    voidJournalEntry,
    postToGL,
  } = useFinance();

  return {
    entries: journalEntries,
    createJournalEntry,
    updateJournalEntry,
    voidJournalEntry,
    postToGL,
  };
};

export const useFinancialReports = () => {
  const { getTrialBalance, getProfitAndLoss, getBalanceSheet } = useFinance();

  return {
    getTrialBalance,
    getProfitAndLoss,
    getBalanceSheet,
  };
};

export const useBankAccounts = () => {
  const {
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    reconcileAccount,
    getAccountById,
    getTransactionsByAccountId,
  } = useFinance();

  return {
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    reconcileAccount,
    getAccountById,
    getTransactionsByAccountId,
  };
};

export const useFixedAssets = () => {
  const {
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    disposeAsset,
    transferAsset,
    calculateDepreciation,
    postMonthlyDepreciation,
    getAssetDepreciationSchedule,
  } = useFinance();

  return {
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    disposeAsset,
    transferAsset,
    calculateDepreciation,
    postMonthlyDepreciation,
    getAssetDepreciationSchedule,
  };
};

export const useConsolidation = () => {
  const {
    entities,
    intercompanyTransactions,
    consolidationSettings,
    consolidationHistory,
    eliminationEntries,
    addEntity,
    updateEntity,
    toggleEntityActive,
    deleteEntity,
    updateExchangeRate,
    getConsolidatedBalanceSheet,
    getConsolidatedProfitAndLoss,
    getConsolidatedTrialBalance,
    addIntercompanyTransaction,
    reconcileIntercompanyTransaction,
    markIntercompanyAsEliminated,
    createEliminationEntry,
    autoGenerateEliminationEntries,
    runConsolidation,
    getEntityPerformance,
    updateConsolidationSettings,
    convertCurrency,
  } = useFinance();

  return {
    entities,
    intercompanyTransactions,
    consolidationSettings,
    consolidationHistory,
    eliminationEntries,
    addEntity,
    updateEntity,
    toggleEntityActive,
    deleteEntity,
    updateExchangeRate,
    getConsolidatedBalanceSheet,
    getConsolidatedProfitAndLoss,
    getConsolidatedTrialBalance,
    addIntercompanyTransaction,
    reconcileIntercompanyTransaction,
    markIntercompanyAsEliminated,
    createEliminationEntry,
    autoGenerateEliminationEntries,
    runConsolidation,
    getEntityPerformance,
    updateConsolidationSettings,
    convertCurrency,
  };
};
