// contexts/LogisticsContext.jsx - Complete Context for Both Modules
import React, { createContext, useState, useContext, useEffect } from "react";

const LogisticsContext = createContext();

export const useLogistics = () => useContext(LogisticsContext);

export const LogisticsProvider = ({ children }) => {
  // Inbound Deliveries State
  const [inboundDeliveries, setInboundDeliveries] = useState([
    {
      id: "INB001",
      reference: "INB-001-2024",
      supplier: "Tata Motors Ltd.",
      supplierCode: "TM001",
      status: "pending",
      expectedDate: "2024-01-15",
      arrivalTime: "10:00 AM",
      totalItems: 3,
      receivedItems: 0,
      totalValue: 250000,
      priority: "high",
      warehouse: "Main Warehouse",
      dock: "Dock 3",
      poNumber: "PO-2024-001",
      contactPerson: "Rajesh Kumar",
      contactPhone: "+91 9876543210",
      vehicleNumber: "MH01AB1234",
      driverName: "Ramesh Patel",
      notes: "Fragile items - Handle with care",
      createdAt: "2024-01-10",
      items: [
        {
          id: 1,
          name: "Engine Assembly",
          quantity: 50,
          received: 0,
          unit: "pieces",
          value: 150000,
        },
        {
          id: 2,
          name: "Brake Pads",
          quantity: 200,
          received: 0,
          unit: "sets",
          value: 75000,
        },
        {
          id: 3,
          name: "Transmission Fluid",
          quantity: 100,
          received: 0,
          unit: "liters",
          value: 25000,
        },
      ],
    },
    {
      id: "INB002",
      reference: "INB-002-2024",
      supplier: "Bosch India",
      supplierCode: "BI002",
      status: "in-progress",
      expectedDate: "2024-01-16",
      arrivalTime: "2:30 PM",
      totalItems: 2,
      receivedItems: 1,
      totalValue: 150000,
      priority: "medium",
      warehouse: "West Warehouse",
      dock: "Dock 1",
      poNumber: "PO-2024-002",
      contactPerson: "Priya Sharma",
      contactPhone: "+91 9876543211",
      vehicleNumber: "MH02CD5678",
      driverName: "Suresh Verma",
      notes: "Temperature controlled items",
      createdAt: "2024-01-11",
      items: [
        {
          id: 1,
          name: "Spark Plugs",
          quantity: 1000,
          received: 500,
          unit: "pieces",
          value: 100000,
        },
        {
          id: 2,
          name: "Fuel Injectors",
          quantity: 200,
          received: 0,
          unit: "pieces",
          value: 50000,
        },
      ],
    },
    {
      id: "INB003",
      reference: "INB-003-2024",
      supplier: "Mahindra Logistics",
      supplierCode: "ML003",
      status: "completed",
      expectedDate: "2024-01-14",
      arrivalTime: "9:00 AM",
      totalItems: 4,
      receivedItems: 4,
      totalValue: 180000,
      priority: "low",
      warehouse: "North Warehouse",
      dock: "Dock 2",
      poNumber: "PO-2024-003",
      contactPerson: "Amit Jain",
      contactPhone: "+91 9876543212",
      vehicleNumber: "MH03EF9012",
      driverName: "Vikram Singh",
      notes: "All items verified and stored",
      createdAt: "2024-01-09",
      items: [
        {
          id: 1,
          name: "Car Batteries",
          quantity: 100,
          received: 100,
          unit: "pieces",
          value: 120000,
        },
        {
          id: 2,
          name: "Headlights",
          quantity: 50,
          received: 50,
          unit: "pairs",
          value: 60000,
        },
      ],
    },
  ]);

  // Outbound Deliveries State
  const [outboundDeliveries, setOutboundDeliveries] = useState([
    {
      id: "OUT001",
      reference: "OUT-001-2024",
      customer: "Reliance Auto",
      customerCode: "RA001",
      warehouse: "wh1", // warehouse ID
      warehouseName: "Mumbai Central", // warehouse name
      warehouseCode: "MUM-CEN",
      status: "pending",
      deliveryDate: "2024-01-15",
      dispatchTime: "11:00 AM",
      totalItems: 2,
      dispatchedItems: 0,
      totalValue: 175000,
      priority: "high",
      destination: "Mumbai",
      vehicleNumber: "DL01XY7890",
      driverName: "Anil Kapoor",
      salesOrder: "SO-2024-001",
      contactPerson: "Sunil Mehta",
      contactPhone: "+91 9876543220",
      shippingMethod: "Road",
      notes: "Urgent delivery required",
      createdAt: "2024-01-10",
      items: [
        {
          id: 1,
          name: "Engine Oil",
          quantity: 500,
          dispatched: 0,
          unit: "liters",
          value: 125000,
        },
        {
          id: 2,
          name: "Air Filters",
          quantity: 300,
          dispatched: 0,
          unit: "pieces",
          value: 50000,
        },
      ],
    },
    {
      id: "OUT002",
      reference: "OUT-002-2024",
      customer: "Aditya Birla Motors",
      customerCode: "AB002",
      status: "in-progress",
      deliveryDate: "2024-01-16",
      dispatchTime: "3:00 PM",
      totalItems: 3,
      dispatchedItems: 1,
      totalValue: 220000,
      priority: "medium",
      destination: "Delhi",
      vehicleNumber: "HR02MN3456",
      driverName: "Raj Malhotra",
      salesOrder: "SO-2024-002",
      contactPerson: "Vijay Chauhan",
      contactPhone: "+91 9876543221",
      shippingMethod: "Rail",
      notes: "Partial dispatch completed",
      createdAt: "2024-01-11",
      items: [
        {
          id: 1,
          name: "Brake Discs",
          quantity: 200,
          dispatched: 100,
          unit: "pieces",
          value: 150000,
        },
        {
          id: 2,
          name: "Shock Absorbers",
          quantity: 100,
          dispatched: 0,
          unit: "pairs",
          value: 70000,
        },
      ],
    },
    {
      id: "OUT003",
      reference: "OUT-003-2024",
      customer: "Tata Service Center",
      customerCode: "TS003",
      status: "completed",
      deliveryDate: "2024-01-14",
      dispatchTime: "10:00 AM",
      totalItems: 4,
      dispatchedItems: 4,
      totalValue: 195000,
      priority: "low",
      destination: "Pune",
      vehicleNumber: "MH04GH6789",
      driverName: "Sanjay Gupta",
      salesOrder: "SO-2024-003",
      contactPerson: "Rohit Nair",
      contactPhone: "+91 9876543222",
      shippingMethod: "Road",
      notes: "Delivered and signed",
      createdAt: "2024-01-09",
      items: [
        {
          id: 1,
          name: "Clutch Plates",
          quantity: 150,
          dispatched: 150,
          unit: "pieces",
          value: 120000,
        },
        {
          id: 2,
          name: "Timing Belts",
          quantity: 100,
          dispatched: 100,
          unit: "pieces",
          value: 75000,
        },
      ],
    },
  ]);
  const [warehouses, setWarehouses] = useState([
    { id: "wh1", name: "Mumbai Central", code: "MUM-CEN", location: "Mumbai" },
    { id: "wh2", name: "Delhi North", code: "DEL-NOR", location: "Delhi" },
    {
      id: "wh3",
      name: "Bangalore South",
      code: "BLR-SOU",
      location: "Bangalore",
    },
    { id: "wh4", name: "Chennai Port", code: "CHE-PRT", location: "Chennai" },
    { id: "wh5", name: "Kolkata East", code: "KOL-EAS", location: "Kolkata" },
  ]);

  // Inbound Statistics
  const inboundStats = {
    total: inboundDeliveries.length,
    pending: inboundDeliveries.filter((d) => d.status === "pending").length,
    inProgress: inboundDeliveries.filter((d) => d.status === "in-progress")
      .length,
    completed: inboundDeliveries.filter((d) => d.status === "completed").length,
    totalValue: inboundDeliveries.reduce((sum, d) => sum + d.totalValue, 0),
    totalItems: inboundDeliveries.reduce((sum, d) => sum + d.totalItems, 0),
    receivedItems: inboundDeliveries.reduce(
      (sum, d) => sum + d.receivedItems,
      0
    ),
  };

  // Outbound Statistics
  const outboundStats = {
    total: outboundDeliveries.length,
    pending: outboundDeliveries.filter((d) => d.status === "pending").length,
    inProgress: outboundDeliveries.filter((d) => d.status === "in-progress")
      .length,
    completed: outboundDeliveries.filter((d) => d.status === "completed")
      .length,
    totalValue: outboundDeliveries.reduce((sum, d) => sum + d.totalValue, 0),
    totalItems: outboundDeliveries.reduce((sum, d) => sum + d.totalItems, 0),
    dispatchedItems: outboundDeliveries.reduce(
      (sum, d) => sum + d.dispatchedItems,
      0
    ),
  };

  // Inbound Functions
  const addInboundDelivery = (delivery) => {
    const newDelivery = {
      ...delivery,
      id: `INB${String(inboundDeliveries.length + 1).padStart(3, "0")}`,
      reference: `INB-${String(inboundDeliveries.length + 1).padStart(
        3,
        "0"
      )}-2024`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setInboundDeliveries([...inboundDeliveries, newDelivery]);
  };

  const updateInboundStatus = (id, status) => {
    setInboundDeliveries((prev) =>
      prev.map((delivery) =>
        delivery.id === id ? { ...delivery, status } : delivery
      )
    );
  };

  const updateInboundItemReceived = (deliveryId, itemId, receivedQty) => {
    setInboundDeliveries((prev) =>
      prev.map((delivery) => {
        if (delivery.id === deliveryId) {
          const updatedItems = delivery.items.map((item) =>
            item.id === itemId ? { ...item, received: receivedQty } : item
          );
          const totalReceived = updatedItems.reduce(
            (sum, item) => sum + item.received,
            0
          );
          return {
            ...delivery,
            items: updatedItems,
            receivedItems: totalReceived,
            status:
              totalReceived === delivery.totalItems
                ? "completed"
                : delivery.status,
          };
        }
        return delivery;
      })
    );
  };

  // Outbound Functions
  const addOutboundDelivery = (delivery) => {
    const newDelivery = {
      ...delivery,
      id: `OUT${String(outboundDeliveries.length + 1).padStart(3, "0")}`,
      reference: `OUT-${String(outboundDeliveries.length + 1).padStart(
        3,
        "0"
      )}-2024`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setOutboundDeliveries([...outboundDeliveries, newDelivery]);
  };

  const updateOutboundStatus = (id, status) => {
    setOutboundDeliveries((prev) =>
      prev.map((delivery) =>
        delivery.id === id ? { ...delivery, status } : delivery
      )
    );
  };

  const updateOutboundItemDispatched = (deliveryId, itemId, dispatchedQty) => {
    setOutboundDeliveries((prev) =>
      prev.map((delivery) => {
        if (delivery.id === deliveryId) {
          const updatedItems = delivery.items.map((item) =>
            item.id === itemId ? { ...item, dispatched: dispatchedQty } : item
          );
          const totalDispatched = updatedItems.reduce(
            (sum, item) => sum + item.dispatched,
            0
          );
          return {
            ...delivery,
            items: updatedItems,
            dispatchedItems: totalDispatched,
            status:
              totalDispatched === delivery.totalItems
                ? "completed"
                : delivery.status,
          };
        }
        return delivery;
      })
    );
  };

  return (
    <LogisticsContext.Provider
      value={{
        // Inbound Data & Functions
        inboundDeliveries,
        inboundStats,
        addInboundDelivery,
        updateInboundStatus,
        updateInboundItemReceived,

        // Outbound Data & Functions
        outboundDeliveries,
        outboundStats,
        addOutboundDelivery,
        updateOutboundStatus,
        updateOutboundItemDispatched,
        warehouses,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};
