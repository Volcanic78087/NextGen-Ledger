import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const roleLabel = (role) => {
  switch (role) {
    case 1:
      return "Super Admin";
    case 2:
      return "Admin";
    default:
      return "User";
  }
};

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/finance", label: "Finance" },
  { to: "/sales", label: "Sales" },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [dropdownOpen]);

  if (!user) return null;

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-900 text-white shadow-lg">
      {/* Brand */}
      <div className="text-xl font-bold tracking-wide">
        <Link to="/" className="hover:text-blue-400 transition-colors">
          NextGen Ledger
        </Link>
      </div>

      {/* Desktop Profile Dropdown */}
      <div className="relative hidden sm:block" ref={dropdownRef}>
        <button
          aria-label="User menu"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 transition"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-semibold">
            {roleLabel(user.role).charAt(0)}
          </div>
          <span className="font-medium">{roleLabel(user.role)}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="px-4 py-2 text-sm text-gray-600 border-b">
              Logged in as <strong>{roleLabel(user.role)}</strong>
            </div>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm text-gray-500"
              disabled
            >
              Settings (Soon)
            </button>
            <button
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition text-sm"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        aria-label="Open menu"
        className="sm:hidden flex items-center justify-center bg-gray-800 p-2 rounded-md hover:bg-gray-700 transition"
        onClick={() => setMobileMenuOpen(true)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 bg-gray-900 text-white p-4 shadow-lg transform transition-transform duration-300"
            style={{
              transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                className="text-gray-400 hover:text-white text-xl"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-2 py-1 hover:bg-gray-800 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
