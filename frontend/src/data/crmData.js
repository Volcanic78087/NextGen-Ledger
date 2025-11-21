export const sampleData = {
  customers: [
    {
      id: "c1",
      name: "Rahul Sharma",
      email: "rahul@xyz.com",
      phone: "+919876543210",
    },
    {
      id: "c2",
      name: "Priya Mehta",
      email: "priya@abc.com",
      phone: "+918765432109",
    },
    {
      id: "c3",
      name: "Amit Kumar",
      email: "amit@def.com",
      phone: "+917654321098",
    },
  ],

  loyaltyPrograms: [
    {
      id: "p1",
      name: "Gold Tier",
      description: "Earn 1 point per ₹100 spent",
      start_date: "2025-01-01",
      end_date: "2025-12-31",
      is_active: true,
    },
    {
      id: "p2",
      name: "Welcome Bonus",
      description: "100 points on first purchase",
      start_date: "2025-01-01",
      end_date: null,
      is_active: true,
    },
  ],

  loyaltyRules: [
    {
      id: "r1",
      program_id: "p1",
      trigger_type: "SALE",
      trigger_ref_table: "sales",
      condition_json: { min_amount: 1000 },
      points_awarded: 10,
    },
    {
      id: "r2",
      program_id: "p1",
      trigger_type: "LEAD_CONVERTED",
      trigger_ref_table: "leads",
      condition_json: {},
      points_awarded: 50,
    },
    {
      id: "r3",
      program_id: "p1",
      trigger_type: "TICKET_CLOSED",
      trigger_ref_table: "support_tickets",
      condition_json: {},
      points_awarded: 20,
    },
  ],

  loyaltyLedger: [
    { id: "l1", customer_id: "c1", program_id: "p1", points: 320 },
    { id: "l2", customer_id: "c2", program_id: "p1", points: 180 },
    { id: "l3", customer_id: "c3", program_id: "p1", points: 90 },
  ],

  loyaltyTransactions: [
    {
      id: "t1",
      ledger_id: "l1",
      type: "EARN",
      points: 100,
      reference_id: "s1",
      notes: "Sale #1001",
      created_at: "2025-03-15T10:30:00Z",
    },
    {
      id: "t2",
      ledger_id: "l1",
      type: "EARN",
      points: 50,
      reference_id: "l1",
      notes: "Lead converted",
      created_at: "2025-03-16T14:20:00Z",
    },
    {
      id: "t3",
      ledger_id: "l1",
      type: "REDEEM",
      points: -30,
      reference_id: "red1",
      notes: "Gift Card",
      created_at: "2025-03-20T09:15:00Z",
    },
  ],

  loyaltyRedemptions: [
    {
      id: "red1",
      program_id: "p1",
      title: "₹500 Gift Card",
      description: "Valid at partner stores",
      points_cost: 30,
      max_per_user: 2,
      is_active: true,
    },
    {
      id: "red2",
      program_id: "p1",
      title: "Free Coffee",
      description: "At Cafe X",
      points_cost: 15,
      max_per_user: 5,
      is_active: true,
    },
  ],
};
