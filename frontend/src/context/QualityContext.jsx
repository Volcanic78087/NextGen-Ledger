// src/context/QualityContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { qualityData } from "../data/qualityData";

const QualityContext = createContext();

const initialState = {
  inspections: [],
  suppliers: [],
  defects: [],
  inspectionPlans: [],
  filters: { status: "all", supplier: "all", dateFrom: "", dateTo: "" },
  loading: false,
  error: null,
  ncmRecords: [],
  certificates: [],
};

const qualityReducer = (state, action) => {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        inspections: action.payload.inspections,
        suppliers: action.payload.suppliers,
        defects: action.payload.defects,
      };
    case "ADD_INSPECTION":
      return { ...state, inspections: [...state.inspections, action.payload] };
    case "UPDATE_INSPECTION":
      return {
        ...state,
        inspections: state.inspections.map((insp) =>
          insp.id === action.payload.id ? action.payload : insp
        ),
      };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "ADD_INSPECTION_PLAN":
      return {
        ...state,
        inspectionPlans: [...state.inspectionPlans, action.payload],
      };
    case "ADD_NCM":
      return { ...state, ncmRecords: [...state.ncmRecords, action.payload] };
    case "ADD_CERTIFICATE":
      return {
        ...state,
        certificates: [...state.certificates, action.payload],
      };
    default:
      return state;
  }
};

export const QualityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(qualityReducer, initialState);

  useEffect(() => {
    // Load sample data on mount (later API call)
    dispatch({ type: "SET_DATA", payload: qualityData });
  }, []);

  const addInspection = (inspection) => {
    dispatch({
      type: "ADD_INSPECTION",
      payload: {
        ...inspection,
        id: Date.now(),
        date: new Date().toISOString().split("T")[0],
      },
    });
  };

  const updateInspection = (inspection) => {
    dispatch({ type: "UPDATE_INSPECTION", payload: inspection });
  };
  const addInspectionPlan = (plan) => {
    dispatch({ type: "ADD_INSPECTION_PLAN", payload: plan });
  };
  const addNCM = (ncm) => {
    dispatch({ type: "ADD_NCM", payload: ncm });
  };
  const addCertificate = (cert) => {
    dispatch({ type: "ADD_CERTIFICATE", payload: cert });
  };

  const setFilters = (filters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  };

  const value = {
    ...state,
    addInspection,
    updateInspection,
    setFilters,
    inspectionPlans: state.inspectionPlans,
    addInspectionPlan,
    ncmRecords: state.ncmRecords,
    addNCM,
    certificates: state.certificates,
    addCertificate,
  };

  return (
    <QualityContext.Provider value={value}>{children}</QualityContext.Provider>
  );
};

export const useQuality = () => {
  const context = useContext(QualityContext);
  if (!context)
    throw new Error("useQuality must be used within QualityProvider");
  return context;
};
