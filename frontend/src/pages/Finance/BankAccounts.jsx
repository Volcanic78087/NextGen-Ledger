// src/components/finance/BankAccounts.jsx
import React, { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  Building,
  CreditCard,
  IndianRupee,
  ArrowUpRight,
  ArrowDownLeft,
  MoreVertical,
  Clock,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Receipt,
  Landmark,
  Wallet,
  Calendar,
  User,
  FileText,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { useFinance } from "../../context/FinanceContext";

const BankAccounts = () => {
  const {
    bankAccounts = [],
    bankTransactions = [],
    bankDeposits = [],
    receipts = [],
    customers = [],
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addBankTransaction,
    reconcileAccount,
    reconcileTransaction,
    matchDepositToReceipt,
    getCashFlowData,
    getCashFlowAnalysis,
    getAccountById,
    getTransactionsByAccountId,
  } = useFinance();

  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [accountFilter, setAccountFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    accountId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    reference: "",
    type: "withdrawal",
    amount: "",
    category: "general",
    glAccount: "",
  });

  // Safe cash flow data calculation
  const cashFlowData = useMemo(() => {
    if (typeof getCashFlowData === "function") {
      return getCashFlowData("month");
    }
    return {
      income: 0,
      expenses: 0,
      netCashFlow: 0,
      transactions: 0,
    };
  }, [getCashFlowData]);

  // Cash flow analysis
  const cashFlowAnalysis = useMemo(() => {
    if (typeof getCashFlowAnalysis === "function") {
      return getCashFlowAnalysis("month");
    }
    return {
      income: 0,
      expenses: 0,
      incomeByCategory: {},
      expensesByCategory: {},
      transactions: 0,
    };
  }, [getCashFlowAnalysis]);

  // Calculations and summaries with safe data access
  const totals = useMemo(() => {
    const totalBalance = bankAccounts.reduce(
      (sum, acc) => sum + (acc?.balance || 0),
      0
    );
    const cashBalance = bankAccounts
      .filter((acc) => acc?.accountType === "checking")
      .reduce((sum, acc) => sum + (acc?.balance || 0), 0);
    const creditBalance = bankAccounts
      .filter((acc) => acc?.accountType === "credit")
      .reduce((sum, acc) => sum + (acc?.balance || 0), 0);

    const reconciledAccounts = bankAccounts.filter(
      (acc) => acc?.isReconciled
    ).length;
    const totalAccounts = bankAccounts.length;

    // Transaction totals
    const pendingTransactions = bankTransactions.filter(
      (t) => !t.isReconciled
    ).length;
    const totalTransactions = bankTransactions.length;

    return {
      totalBalance: totalBalance || 0,
      cashBalance: cashBalance || 0,
      creditBalance: creditBalance || 0,
      ...cashFlowData,
      reconciledAccounts,
      totalAccounts,
      pendingTransactions,
      totalTransactions,
    };
  }, [bankAccounts, bankTransactions, cashFlowData]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let filtered = bankTransactions;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t?.description?.toLowerCase().includes(term) ||
          t?.reference?.toLowerCase().includes(term)
      );
    }

    if (accountFilter !== "all") {
      filtered = filtered.filter((t) => t?.accountId === accountFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t?.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) =>
        statusFilter === "reconciled" ? t.isReconciled : !t.isReconciled
      );
    }

    if (dateRange.start) {
      filtered = filtered.filter((t) => t?.date >= dateRange.start);
    }

    if (dateRange.end) {
      filtered = filtered.filter((t) => t?.date <= dateRange.end);
    }

    return filtered;
  }, [
    bankTransactions,
    searchTerm,
    accountFilter,
    typeFilter,
    statusFilter,
    dateRange,
  ]);

  // Unreconciled deposits
  const unreconciledDeposits = useMemo(() => {
    return bankDeposits.filter((deposit) => deposit.status !== "matched");
  }, [bankDeposits]);

  // Unreconciled receipts
  const unreconciledReceipts = useMemo(() => {
    return receipts.filter((receipt) => !receipt.reconciled);
  }, [receipts]);

  const accountTypes = {
    checking: { label: "Checking", icon: Landmark, color: "blue" },
    savings: { label: "Savings", icon: Wallet, color: "green" },
    credit: { label: "Credit Card", icon: CreditCard, color: "purple" },
  };

  const transactionCategories = [
    { id: "general", name: "General" },
    { id: "salary", name: "Salary" },
    { id: "supplies", name: "Office Supplies" },
    { id: "utilities", name: "Utilities" },
    { id: "rent", name: "Rent" },
    { id: "software", name: "Software" },
    { id: "marketing", name: "Marketing" },
    { id: "travel", name: "Travel" },
    { id: "client_payment", name: "Client Payment" },
    { id: "interest", name: "Interest" },
  ];

  // Modal Components
  const AccountModal = () => {
    const [form, setForm] = useState({
      name: "",
      bankName: "",
      accountNumber: "",
      accountType: "checking",
      openingDate: format(new Date(), "yyyy-MM-dd"),
      currency: "USD",
      creditLimit: 0,
      ...editingAccount,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
      const newErrors = {};
      if (!form.name.trim()) newErrors.name = "Account name is required";
      if (!form.bankName.trim()) newErrors.bankName = "Bank name is required";
      if (!form.accountNumber.trim())
        newErrors.accountNumber = "Account number is required";
      if (form.creditLimit < 0)
        newErrors.creditLimit = "Credit limit cannot be negative";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      try {
        const accountData = {
          name: form.name.trim(),
          bankName: form.bankName.trim(),
          accountNumber: form.accountNumber.trim(),
          accountType: form.accountType,
          openingDate: form.openingDate,
          currency: form.currency,
          creditLimit: form.creditLimit || 0,
          balance: 0,
          currentBalance: 0,
          availableBalance:
            form.accountType === "credit" ? form.creditLimit : 0,
          status: "active",
          isReconciled: false,
        };

        console.log("Submitting account data:", accountData);

        if (editingAccount && typeof updateBankAccount === "function") {
          console.log("Updating account:", editingAccount.id);
          updateBankAccount(editingAccount.id, accountData);
        } else if (typeof addBankAccount === "function") {
          console.log("Adding new account");
          addBankAccount(accountData);
        } else {
          console.error("addBankAccount function not available");
          setErrors({ submit: "Bank account functionality not available" });
          return;
        }

        // Reset form and close modal
        setForm({
          name: "",
          bankName: "",
          accountNumber: "",
          accountType: "checking",
          openingDate: format(new Date(), "yyyy-MM-dd"),
          currency: "USD",
          creditLimit: 0,
        });
        setErrors({});
        setShowAccountModal(false);
        setEditingAccount(null);

        // Show success message
        alert(
          `Bank account "${accountData.name}" has been ${
            editingAccount ? "updated" : "created"
          } successfully!`
        );
      } catch (error) {
        console.error("Error saving account:", error);
        setErrors({ submit: "Failed to save account. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleInputChange = (e) => {
      const { name, value, type } = e.target;

      if (type === "number") {
        setForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
      } else {
        setForm((prev) => ({ ...prev, [name]: value }));
      }

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    };

    const handleClose = () => {
      setShowAccountModal(false);
      setEditingAccount(null);
      setForm({
        name: "",
        bankName: "",
        accountNumber: "",
        accountType: "checking",
        openingDate: format(new Date(), "yyyy-MM-dd"),
        currency: "USD",
        creditLimit: 0,
      });
      setErrors({});
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {editingAccount ? "Edit Account" : "Add New Bank Account"}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
          </div>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Account Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Primary Business Account"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Bank Name *
              </label>
              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.bankName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Chase Bank"
              />
              {errors.bankName && (
                <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Account Number *
              </label>
              <input
                type="text"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.accountNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Last 4 digits or full number"
              />
              {errors.accountNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.accountNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Account Type
              </label>
              <select
                name="accountType"
                value={form.accountType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="checking">Checking Account</option>
                <option value="savings">Savings Account</option>
                <option value="credit">Credit Card</option>
              </select>
            </div>

            {form.accountType === "credit" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Credit Limit ($)
                </label>
                <input
                  type="number"
                  name="creditLimit"
                  min="0"
                  step="100"
                  value={form.creditLimit}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.creditLimit ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="5000"
                />
                {errors.creditLimit && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.creditLimit}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Opening Date
              </label>
              <input
                type="date"
                name="openingDate"
                value={form.openingDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : editingAccount ? (
                  "Update Account"
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TransactionModal = () => {
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add GL account options
    const glAccountOptions = [
      { id: "Sales", name: "Sales Revenue", type: "revenue" },
      { id: "Service Revenue", name: "Service Revenue", type: "revenue" },
      { id: "Interest Income", name: "Interest Income", type: "revenue" },
      { id: "Office Expenses", name: "Office Expenses", type: "expense" },
      { id: "Utilities", name: "Utilities", type: "expense" },
      { id: "Rent", name: "Rent Expense", type: "expense" },
      { id: "Salaries", name: "Salaries Expense", type: "expense" },
      { id: "Marketing", name: "Marketing Expense", type: "expense" },
      { id: "Travel", name: "Travel Expense", type: "expense" },
      { id: "Supplies", name: "Office Supplies", type: "expense" },
    ];

    const validateForm = () => {
      const newErrors = {};
      if (!transactionForm.accountId)
        newErrors.accountId = "Bank account is required";
      if (!transactionForm.description.trim())
        newErrors.description = "Description is required";
      if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0)
        newErrors.amount = "Valid amount is required";
      if (!transactionForm.glAccount)
        newErrors.glAccount = `${
          transactionForm.type === "deposit" ? "Revenue" : "Expense"
        } account is required`;

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleAddTransaction = async (transactionData) => {
      try {
        const balancedTransaction = {
          ...transactionData,
          amount: parseFloat(transactionData.amount),
          glAccount: transactionData.glAccount,
        };

        console.log("Submitting transaction:", balancedTransaction);

        if (addBankTransaction) {
          await addBankTransaction(balancedTransaction);
          setShowTransactionModal(false);
          setTransactionForm({
            accountId: "",
            date: format(new Date(), "yyyy-MM-dd"),
            description: "",
            reference: "",
            type: "withdrawal",
            amount: "",
            category: "general",
            glAccount: "",
          });
          setErrors({});

          // Show success message
          alert("Transaction added successfully!");
        } else {
          throw new Error("Transaction functionality not available");
        }
      } catch (error) {
        console.error("Error saving transaction:", error);
        let errorMessage = error.message;

        if (error.message.includes("Journal entry validation failed")) {
          errorMessage =
            "Accounting system error: Unable to create balanced journal entry. Please ensure all accounts exist.";
        } else if (error.message.includes("Account not found")) {
          errorMessage =
            "Required accounting account not found. Please check your chart of accounts.";
        }

        setErrors({ submit: errorMessage });
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setErrors({});

      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      await handleAddTransaction(transactionForm);
      setIsSubmitting(false);
    };

    const handleClose = () => {
      setShowTransactionModal(false);
      setTransactionForm({
        accountId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
        reference: "",
        type: "withdrawal",
        amount: "",
        category: "general",
        glAccount: "",
      });
      setErrors({});
    };

    // Filter GL accounts based on transaction type
    const filteredGlAccounts = glAccountOptions.filter((account) =>
      transactionForm.type === "deposit"
        ? account.type === "revenue"
        : account.type === "expense"
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add New Transaction</h3>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
          </div>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Bank Account *
              </label>
              <select
                value={transactionForm.accountId}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    accountId: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.accountId ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Bank Account</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.bankName}
                  </option>
                ))}
              </select>
              {errors.accountId && (
                <p className="text-red-500 text-xs mt-1">{errors.accountId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={transactionForm.type}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    type: e.target.value,
                    glAccount: "", // Reset GL account when type changes
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {transactionForm.type === "deposit"
                  ? "Revenue Account *"
                  : "Expense Account *"}
              </label>
              <select
                value={transactionForm.glAccount}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    glAccount: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.glAccount ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">
                  Select{" "}
                  {transactionForm.type === "deposit" ? "Revenue" : "Expense"}{" "}
                  Account
                </option>
                {filteredGlAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              {errors.glAccount && (
                <p className="text-red-500 text-xs mt-1">{errors.glAccount}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {transactionForm.type === "deposit"
                  ? "This revenue account will be credited"
                  : "This expense account will be debited"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={transactionForm.date}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    date: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description *
              </label>
              <input
                type="text"
                value={transactionForm.description}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    description: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Transaction description"
                required
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Reference
              </label>
              <input
                type="text"
                value={transactionForm.reference}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    reference: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Optional reference number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={transactionForm.amount}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    amount: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.amount ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
                required
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={transactionForm.category}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    category: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {transactionCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Add Transaction"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ReconcileModal = () => {
    const handleMatchDeposit = (depositId, receiptId) => {
      if (matchDepositToReceipt) {
        matchDepositToReceipt(depositId, receiptId);
      }
    };

    const handleReconcileTransaction = (transactionId) => {
      if (reconcileTransaction) {
        reconcileTransaction(transactionId);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Bank Reconciliation</h3>
            <button
              onClick={() => setShowReconcileModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unmatched Deposits */}
            <div>
              <h4 className="font-semibold mb-4">Unmatched Bank Deposits</h4>
              <div className="space-y-3">
                {unreconciledDeposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{deposit.description}</p>
                        <p className="text-sm text-gray-500">{deposit.date}</p>
                      </div>
                      <p className="text-lg font-semibold text-green-600">
                        ${deposit.amount?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Reference: {deposit.reference || "N/A"}
                    </p>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Unmatched
                      </span>
                    </div>
                  </div>
                ))}
                {unreconciledDeposits.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    All deposits have been matched
                  </p>
                )}
              </div>
            </div>

            {/* Unreconciled Receipts */}
            <div>
              <h4 className="font-semibold mb-4">Unreconciled Receipts</h4>
              <div className="space-y-3">
                {unreconciledReceipts.map((receipt) => {
                  const customer = customers.find(
                    (c) => c.id === receipt.customerId
                  );
                  return (
                    <div
                      key={receipt.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {customer?.name || "Unknown Customer"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {receipt.date}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-blue-600">
                          ${receipt.amount?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        Method: {receipt.method || "N/A"} | Invoices:{" "}
                        {receipt.invoiceIds?.length || 0}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Unreconciled
                        </span>
                        <button
                          onClick={() => handleMatchDeposit("d2", receipt.id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                        >
                          Match to Deposit
                        </button>
                      </div>
                    </div>
                  );
                })}
                {unreconciledReceipts.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    All receipts have been reconciled
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Unreconciled Transactions */}
          <div className="mt-8">
            <h4 className="font-semibold mb-4">Unreconciled Transactions</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border">Date</th>
                    <th className="px-4 py-2 border">Description</th>
                    <th className="px-4 py-2 border">Amount</th>
                    <th className="px-4 py-2 border">Account</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bankTransactions
                    .filter((t) => !t.isReconciled)
                    .slice(0, 10)
                    .map((transaction) => {
                      const account = bankAccounts.find(
                        (a) => a.id === transaction.accountId
                      );
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border">
                            {transaction.date}
                          </td>
                          <td className="px-4 py-2 border">
                            {transaction.description}
                          </td>
                          <td
                            className={`px-4 py-2 border text-right ${
                              transaction.type === "deposit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "deposit" ? "+" : "-"}$
                            {transaction.amount?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-4 py-2 border">
                            {account?.name || "Unknown"}
                          </td>
                          <td className="px-4 py-2 border">
                            <button
                              onClick={() =>
                                handleReconcileTransaction(transaction.id)
                              }
                              className="text-indigo-600 hover:text-indigo-900 text-sm"
                            >
                              Mark Reconciled
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t mt-6">
            <button
              onClick={() => setShowReconcileModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close Reconciliation
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Safe reconcile account function
  const handleReconcileAccount = (accountId) => {
    if (typeof reconcileAccount === "function") {
      reconcileAccount(accountId);
    } else {
      console.warn("reconcileAccount function not available");
    }
  };

  // Safe delete account function
  const handleDeleteAccount = (accountId) => {
    if (typeof deleteBankAccount === "function") {
      if (window.confirm("Are you sure you want to delete this account?")) {
        deleteBankAccount(accountId);
      }
    } else {
      console.warn("deleteBankAccount function not available");
    }
  };

  // Export functions
  const exportTransactions = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const data = filteredTransactions.map((t) => ({
      Date: t.date,
      Description: t.description,
      Reference: t.reference || "",
      Type: t.type,
      Amount: t.amount,
      Category: t.category,
      Account:
        bankAccounts.find((a) => a.id === t.accountId)?.name || "Unknown",
      Reconciled: t.isReconciled ? "Yes" : "No",
    }));

    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bank-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tab Components
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Balance",
            value: totals.totalBalance,
            trend: "up",
            icon: IndianRupee,
            color: "green",
          },
          {
            label: "Cash Balance",
            value: totals.cashBalance,
            trend: "up",
            icon: Landmark,
            color: "blue",
          },
          {
            label: "Monthly Cash Flow",
            value: totals.netCashFlow,
            trend: totals.netCashFlow >= 0 ? "up" : "down",
            icon: TrendingUp,
            color: totals.netCashFlow >= 0 ? "green" : "red",
          },
          {
            label: "Pending Reconciliation",
            value: `${totals.pendingTransactions} transactions`,
            trend: "up",
            icon: CheckCircle,
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
                  className={`text-2xl font-bold mt-1 ${
                    metric.color === "green"
                      ? "text-green-600"
                      : metric.color === "blue"
                      ? "text-blue-600"
                      : metric.color === "red"
                      ? "text-red-600"
                      : "text-purple-600"
                  }`}
                >
                  {metric.label.includes("Reconciled") ||
                  metric.label.includes("Pending")
                    ? metric.value
                    : `$${Math.abs(metric.value).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  metric.color === "green"
                    ? "bg-green-100"
                    : metric.color === "blue"
                    ? "bg-blue-100"
                    : metric.color === "red"
                    ? "bg-red-100"
                    : "bg-purple-100"
                }`}
              >
                <metric.icon
                  className={`w-6 h-6 ${
                    metric.color === "green"
                      ? "text-green-600"
                      : metric.color === "blue"
                      ? "text-blue-600"
                      : metric.color === "red"
                      ? "text-red-600"
                      : "text-purple-600"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accounts Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Bank Accounts</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowReconcileModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" /> Reconcile
            </button>
            <button
              onClick={() => {
                setEditingAccount(null);
                setShowAccountModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Add Account
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Landmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No bank accounts
              </h4>
              <p className="text-gray-600 mb-4">
                Get started by adding your first bank account.
              </p>
              <button
                onClick={() => {
                  setEditingAccount(null);
                  setShowAccountModal(true);
                }}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" /> Add Account
              </button>
            </div>
          ) : (
            bankAccounts.map((account) => {
              const AccountIcon =
                accountTypes[account?.accountType]?.icon || Landmark;
              const isCredit = account?.accountType === "credit";
              const color = accountTypes[account?.accountType]?.color || "gray";

              return (
                <div
                  key={account?.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        color === "blue"
                          ? "bg-blue-100"
                          : color === "green"
                          ? "bg-green-100"
                          : color === "purple"
                          ? "bg-purple-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <AccountIcon
                        className={`w-6 h-6 ${
                          color === "blue"
                            ? "text-blue-600"
                            : color === "green"
                            ? "text-green-600"
                            : color === "purple"
                            ? "text-purple-600"
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {account?.name || "Unnamed Account"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {account?.bankName || "Unknown Bank"} •{" "}
                        {account?.accountNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        isCredit ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {isCredit && (account?.balance || 0) < 0 ? "-" : ""}$
                      {Math.abs(account?.balance || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {accountTypes[account?.accountType]?.label || "Account"}
                      {account?.isReconciled && (
                        <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Account</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bankTransactions.slice(0, 5).map((transaction) => {
                const account = bankAccounts.find(
                  (a) => a.id === transaction.accountId
                );
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{transaction.date}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {transaction.description}
                      </div>
                      {transaction.reference && (
                        <div className="text-xs text-gray-500">
                          {transaction.reference}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{account?.name || "Unknown"}</td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        transaction.type === "deposit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "deposit" ? "+" : "-"}$
                      {transaction.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.isReconciled ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {bankTransactions.length === 0 && (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const AccountsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Bank Account Management</h3>
        <button
          onClick={() => {
            setEditingAccount(null);
            setShowAccountModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {bankAccounts.length === 0 ? (
        <div className="text-center py-12">
          <Landmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No bank accounts yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first bank account to manage your finances.
          </p>
          <button
            onClick={() => {
              setEditingAccount(null);
              setShowAccountModal(true);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" /> Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankAccounts.map((account) => {
            const AccountIcon =
              accountTypes[account?.accountType]?.icon || Landmark;
            const isCredit = account?.accountType === "credit";
            const color = accountTypes[account?.accountType]?.color || "gray";

            return (
              <div
                key={account?.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-full ${
                      color === "blue"
                        ? "bg-blue-100"
                        : color === "green"
                        ? "bg-green-100"
                        : color === "purple"
                        ? "bg-purple-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <AccountIcon
                      className={`w-6 h-6 ${
                        color === "blue"
                          ? "text-blue-600"
                          : color === "green"
                          ? "text-green-600"
                          : color === "purple"
                          ? "text-purple-600"
                          : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAccount(account);
                        setShowAccountModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account?.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-semibold text-lg mb-2">
                  {account?.name || "Unnamed Account"}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {account?.bankName || "Unknown Bank"} •{" "}
                  {account?.accountNumber || "N/A"}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Balance:</span>
                    <span
                      className={`font-semibold ${
                        isCredit ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {isCredit && (account?.balance || 0) < 0 ? "-" : ""}$
                      {Math.abs(account?.balance || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {account?.accountType === "credit" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Credit:</span>
                      <span className="font-semibold">
                        $
                        {(account?.availableBalance || 0).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReconcileAccount(account?.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      account?.isReconciled
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {account?.isReconciled ? "Reconciled" : "Mark Reconciled"}
                  </button>
                  <button
                    onClick={() => {
                      setAccountFilter(account.id);
                      setSelectedTab("transactions");
                    }}
                    className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200"
                  >
                    View Transactions
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const TransactionsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Bank Transactions</h3>
          <p className="text-gray-600 mt-1">
            {filteredTransactions.length} transactions found
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportTransactions}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Accounts</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="reconciled">Reconciled</option>
              <option value="unreconciled">Unreconciled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Account</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const account = bankAccounts.find(
                  (a) => a.id === transaction.accountId
                );
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{transaction.date}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {transaction.description}
                      </div>
                    </td>
                    <td className="px-4 py-3">{account?.name || "Unknown"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {transaction.reference || "-"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        transaction.type === "deposit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "deposit" ? "+" : "-"}$
                      {transaction.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {transaction.category?.replace("_", " ") || "General"}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.isReconciled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" /> Reconciled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!transaction.isReconciled && (
                        <button
                          onClick={() => reconcileTransaction(transaction.id)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Reconcile
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No transactions found
            </h4>
            <p className="text-gray-600">
              Try adjusting your search criteria or add a new transaction.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const ReconciliationTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Bank Reconciliation</h3>
          <p className="text-gray-600 mt-1">
            Match bank deposits with receipts and reconcile transactions
          </p>
        </div>
        <button
          onClick={() => setShowReconcileModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <RefreshCw className="w-4 h-4" /> Start Reconciliation
        </button>
      </div>

      {/* Reconciliation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unreconciled Transactions</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {bankTransactions.filter((t) => !t.isReconciled).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Receipt className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unmatched Deposits</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {unreconciledDeposits.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <IndianRupee className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unreconciled Receipts</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {unreconciledReceipts.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold mb-4">Quick Reconciliation Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              // Reconcile all transactions for this month
              bankTransactions
                .filter(
                  (t) =>
                    !t.isReconciled &&
                    t.date >= dateRange.start &&
                    t.date <= dateRange.end
                )
                .forEach((t) => reconcileTransaction(t.id));
              alert("Transactions reconciled for current period");
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Reconcile Current Period</p>
                <p className="text-sm text-gray-600">
                  Mark all current period transactions as reconciled
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              // Match all deposits with receipts
              unreconciledDeposits.forEach((deposit) => {
                const matchingReceipt = unreconciledReceipts.find(
                  (r) => Math.abs(r.amount - deposit.amount) < 0.01
                );
                if (matchingReceipt) {
                  matchDepositToReceipt(deposit.id, matchingReceipt.id);
                }
              });
              alert("Auto-matched deposits with receipts");
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Auto-Match Deposits</p>
                <p className="text-sm text-gray-600">
                  Automatically match deposits with matching receipt amounts
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const CashFlowTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Cash Flow Analysis</h3>
          <p className="text-gray-600 mt-1">
            Monitor your cash inflows and outflows
          </p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                $
                {cashFlowAnalysis.income.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                $
                {cashFlowAnalysis.expenses.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Cash Flow</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  cashFlowAnalysis.income - cashFlowAnalysis.expenses >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                $
                {(
                  cashFlowAnalysis.income - cashFlowAnalysis.expenses
                ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${
                cashFlowAnalysis.income - cashFlowAnalysis.expenses >= 0
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              <BarChart3
                className={`w-6 h-6 ${
                  cashFlowAnalysis.income - cashFlowAnalysis.expenses >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Income by Category */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold mb-4">Income by Category</h4>
        <div className="space-y-3">
          {Object.entries(cashFlowAnalysis.incomeByCategory).map(
            ([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="capitalize">{category.replace("_", " ")}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(amount / cashFlowAnalysis.income) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-medium text-green-600 w-20 text-right">
                    $
                    {amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            )
          )}
          {Object.keys(cashFlowAnalysis.incomeByCategory).length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No income data for this period
            </p>
          )}
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold mb-4">Expenses by Category</h4>
        <div className="space-y-3">
          {Object.entries(cashFlowAnalysis.expensesByCategory).map(
            ([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="capitalize">{category.replace("_", " ")}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${(amount / cashFlowAnalysis.expenses) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-medium text-red-600 w-20 text-right">
                    $
                    {amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            )
          )}
          {Object.keys(cashFlowAnalysis.expensesByCategory).length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No expense data for this period
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Bank & Cash Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage bank accounts, track cash flow, and reconcile
                transactions
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                $
                {totals.totalBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-sm text-gray-500">Total Balance</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-1">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "accounts", label: "Accounts", icon: Landmark },
              { id: "transactions", label: "Transactions", icon: Receipt },
              {
                id: "reconciliation",
                label: "Reconciliation",
                icon: CheckCircle,
              },
              { id: "cashflow", label: "Cash Flow", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap ${
                  selectedTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {selectedTab === "overview" && <OverviewTab />}
          {selectedTab === "accounts" && <AccountsTab />}
          {selectedTab === "transactions" && <TransactionsTab />}
          {selectedTab === "reconciliation" && <ReconciliationTab />}
          {selectedTab === "cashflow" && <CashFlowTab />}
        </div>
      </div>

      {/* Modals */}
      {showAccountModal && <AccountModal />}
      {showTransactionModal && <TransactionModal />}
      {showReconcileModal && <ReconcileModal />}
    </div>
  );
};

export default BankAccounts;
