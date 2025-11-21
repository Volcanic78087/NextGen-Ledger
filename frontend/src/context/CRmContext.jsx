import { createContext, useContext, useState, useEffect } from "react";
import { sampleData } from "../data/crmData";

const CrmContext = createContext();

export const CrmProvider = ({ children, sharedState }) => {
  const {
    customers: sharedCustomers,
    setCustomers: setSharedCustomers,
    auditLogs,
    setAuditLogs,
    logAudit,
  } = sharedState || {};
  const { postToGL: sharedPostToGL } = sharedState || {};
  // LOCAL STORAGE HELPERS
  const load = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  const save = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  /* --------------------------- STATE (Persisted) --------------------------- */
  const [leads, setLeads] = useState(() =>
    load("leads", sampleData.leads || [])
  );
  const [supportTickets, setTickets] = useState(() =>
    load("tickets", sampleData.supportTickets || [])
  );

  const [loyaltyPrograms, setLoyaltyPrograms] = useState(() =>
    load("loyaltyPrograms", sampleData.loyaltyPrograms || [])
  );
  const [loyaltyRules, setLoyaltyRules] = useState(() =>
    load("loyaltyRules", sampleData.loyaltyRules || [])
  );
  const [loyaltyLedger, setLoyaltyLedger] = useState(() =>
    load("loyaltyLedger", sampleData.loyaltyLedger || [])
  );
  const [loyaltyTransactions, setLoyaltyTransactions] = useState(() =>
    load("loyaltyTransactions", sampleData.loyaltyTransactions || [])
  );
  const [loyaltyRedemptions, setLoyaltyRedemptions] = useState(() =>
    load("loyaltyRedemptions", sampleData.loyaltyRedemptions || [])
  );

  const [sales, setSales] = useState(() =>
    load("sales", sampleData.sales || [])
  );

  // Shared customers state (managed here for CRM/Loyalty, exposed to Finance)
  const [customers, setCustomers] = useState(() =>
    load("customers", sharedCustomers || [])
  );

  useEffect(() => {
    if (sharedCustomers !== undefined) {
      setCustomers(sharedCustomers);
    }
  }, [sharedCustomers]);

  useEffect(() => {
    setSharedCustomers?.(customers);
  }, [customers, setSharedCustomers]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  /* --------------------------- AUTO-SAVE TO LOCALSTORAGE --------------------------- */
  useEffect(() => {
    const saveAll = () => {
      // CRM & Loyalty
      save("leads", leads);
      save("tickets", supportTickets);
      save("sales", sales);
      save("loyaltyPrograms", loyaltyPrograms);
      save("loyaltyRules", loyaltyRules);
      save("loyaltyLedger", loyaltyLedger);
      save("loyaltyTransactions", loyaltyTransactions);
      save("loyaltyRedemptions", loyaltyRedemptions);
      save("customers", customers);
    };

    saveAll();
  }, [
    leads,
    supportTickets,
    sales,
    loyaltyPrograms,
    loyaltyRules,
    loyaltyLedger,
    loyaltyTransactions,
    loyaltyRedemptions,
    customers,
  ]);

  /* --------------------------- LOYALTY POINTS ENGINE --------------------------- */
  const awardLoyaltyPoints = (
    customerId,
    triggerType,
    referenceId,
    amount = 0
  ) => {
    const activeRules = loyaltyRules.filter(
      (r) =>
        r.trigger_type === triggerType &&
        loyaltyPrograms.some((p) => p.id === r.program_id && p.is_active)
    );

    let totalPoints = 0;
    const appliedRules = [];

    for (const rule of activeRules) {
      const condition = rule.condition_json || {};
      if (
        triggerType === "SALE" &&
        condition.min_amount &&
        amount < condition.min_amount
      )
        continue;
      totalPoints += rule.points_awarded;
      appliedRules.push(rule.id);
    }

    if (totalPoints === 0) return;

    // Find or create ledger
    let ledger = loyaltyLedger.find((l) => l.customer_id === customerId);
    if (!ledger) {
      const newLedger = {
        id: `ledger-${Date.now()}`,
        customer_id: customerId,
        program_id: loyaltyPrograms[0]?.id,
        points: 0,
      };
      ledger = newLedger;
      setLoyaltyLedger((prev) => [...prev, newLedger]);
    }

    // Update points
    setLoyaltyLedger((prev) =>
      prev.map((l) =>
        l.id === ledger.id ? { ...l, points: l.points + totalPoints } : l
      )
    );

    // Record transaction
    const txn = {
      id: `txn-${Date.now()}`,
      ledger_id: ledger.id,
      type: "EARN",
      points: totalPoints,
      reference_id: referenceId,
      notes: `${triggerType} → ${appliedRules.join(", ")}`,
      created_at: new Date().toISOString(),
    };
    setLoyaltyTransactions((prev) => [...prev, txn]);

    if (logAudit) {
      logAudit(
        "Loyalty Points",
        `${totalPoints} pts → ${
          customers.find((c) => c.id === customerId)?.name
        }`,
        "Loyalty Engine"
      );
    }
  };

  /* --------------------------- SALES → GL + LOYALTY --------------------------- */
  const recordSale = (saleData) => {
    const {
      customer_id,
      amount,
      items = [],
      date = new Date().toISOString().split("T")[0],
    } = saleData;
    const saleId = `sale-${Date.now()}`;

    // 1. Record in sales
    const newSale = { id: saleId, customer_id, amount, items, date };
    setSales((prev) => [...prev, newSale]);

    // 2. Post to GL: Dr. Cash/Bank, Cr. Sales (via shared)
    if (sharedPostToGL) {
      sharedPostToGL("Cash", "Sales", amount, `Sale #${saleId}`, saleId, date);
    }

    // 3. Award Loyalty Points
    awardLoyaltyPoints(customer_id, "SALE", saleId, amount);

    if (logAudit && sharedFormatCurrency) {
      logAudit(
        "Sale Recorded",
        `${formatCurrency(amount)} from ${
          customers.find((c) => c.id === customer_id)?.name
        }`
      );
    }
    return newSale;
  };

  /* --------------------------- LEAD CONVERTED → POINTS --------------------------- */
  const convertLead = (leadId, customerId) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status: "CONVERTED", customer_id: customerId }
          : l
      )
    );
    awardLoyaltyPoints(customerId, "LEAD_CONVERTED", leadId);
    if (logAudit) {
      logAudit("Lead Converted", `Lead #${leadId} → Customer #${customerId}`);
    }
  };

  /* --------------------------- SUPPORT TICKET CLOSED → POINTS --------------------------- */
  const closeSupportTicket = (ticketId, customerId) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: "CLOSED" } : t))
    );
    awardLoyaltyPoints(customerId, "TICKET_CLOSED", ticketId);
    if (logAudit) {
      logAudit("Ticket Closed", `Ticket #${ticketId} resolved`);
    }
  };

  /* --------------------------- REDEEM LOYALTY POINTS --------------------------- */
  const redeemPoints = (customerId, redemptionId) => {
    const redemption = loyaltyRedemptions.find((r) => r.id === redemptionId);
    if (!redemption) return false;

    const ledger = loyaltyLedger.find((l) => l.customer_id === customerId);
    if (!ledger || ledger.points < redemption.points_cost) {
      alert("Not enough points!");
      return false;
    }

    // Deduct points
    setLoyaltyLedger((prev) =>
      prev.map((l) =>
        l.id === ledger.id
          ? { ...l, points: l.points - redemption.points_cost }
          : l
      )
    );

    // Log redemption
    const txn = {
      id: `redeem-${Date.now()}`,
      ledger_id: ledger.id,
      type: "REDEEM",
      points: -redemption.points_cost,
      reference_id: redemptionId,
      notes: redemption.title,
      created_at: new Date().toISOString(),
    };
    setLoyaltyTransactions((prev) => [...prev, txn]);

    if (logAudit) {
      logAudit(
        "Points Redeemed",
        `${redemption.points_cost} pts → ${redemption.title}`
      );
    }
    return true;
  };

  /* --------------------------- SHARED AUDIT LOGS (Managed here for CRM/Loyalty) --------------------------- */
  const [localAuditLogs, setLocalAuditLogs] = useState(() =>
    load("audit", [
      {
        timestamp: new Date().toISOString(),
        action: "CRM & Loyalty System Started",
        user: "System",
        details: "Welcome to NextGen CRM + Finance!",
      },
    ])
  );

  useEffect(() => {
    setAuditLogs?.([...localAuditLogs, ...auditLogs]);
  }, [localAuditLogs, auditLogs, setAuditLogs]);

  const localLogAudit = (action, details, user = "You") => {
    setLocalAuditLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        action,
        user,
        details,
      },
    ]);
    logAudit?.(action, details, user);
  };

  useEffect(() => {
    save("audit", localAuditLogs);
  }, [localAuditLogs]);

  /* -------------------------------------------------------------------------- */
  /*                               CONTEXT VALUE                                */
  /* -------------------------------------------------------------------------- */
  return (
    <CrmContext.Provider
      value={{
        // === DATA ===
        leads,
        setLeads,
        supportTickets,
        setTickets,
        sales,
        setSales,
        loyaltyPrograms,
        setLoyaltyPrograms,
        loyaltyRules,
        setLoyaltyRules,
        loyaltyLedger,
        setLoyaltyLedger,
        loyaltyTransactions,
        setLoyaltyTransactions,
        loyaltyRedemptions,
        setLoyaltyRedemptions,
        customers,
        setCustomers,
        auditLogs: localAuditLogs,
        setAuditLogs: setLocalAuditLogs,

        // === ACTIONS ===
        recordSale,
        convertLead,
        closeSupportTicket,
        redeemPoints,
        awardLoyaltyPoints,
        logAudit: localLogAudit,

        // === SHARED ACCESS ===
        postToGL: sharedPostToGL,
        formatCurrency,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/*                           USE CRM LOYALTY HOOK                             */
/* -------------------------------------------------------------------------- */
export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error("useCrmLoyalty must be used within CrmLoyaltyProvider");
  }
  return context;
};
