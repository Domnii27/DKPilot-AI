import "./Dashboard.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    customers: 0,
    invoices: 0,
    emails: 0,
    schedules: 0,
    totalRevenue: 0,
    monthlyRevenue: [],
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  const userName = loggedInUser?.name || "Sanjay";
  const userEmail = loggedInUser?.email || "";

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchDashboardData = async () => {
    const token = getToken();

    if (!token) {
      setMessage("Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        "http://localhost:8081/api/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboardData({
        customers: Number(response.data.customers) || 0,
        invoices: Number(response.data.invoices) || 0,
        emails: Number(response.data.emails) || 0,
        schedules: Number(response.data.schedules) || 0,
        totalRevenue:
          Number(response.data.totalRevenue) || 0,
        monthlyRevenue: Array.isArray(
          response.data.monthlyRevenue
        )
          ? response.data.monthlyRevenue
          : [],
      });
    } catch (error) {
      console.error("Dashboard data error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setMessage("Session expired. Please login again.");
      } else {
        setMessage("Dashboard data load panna mudiyala.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");

    navigate("/login");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const formatChartValue = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>DKPilot AI</h2>

        <ul>
          <li onClick={() => navigate("/dashboard")}>
            🏠 Dashboard
          </li>

          <li onClick={() => navigate("/ai")}>
            🤖 AI Assistant
          </li>

          <li onClick={() => navigate("/email")}>
            📧 Email
          </li>

          <li onClick={() => navigate("/invoice")}>
            📄 Invoice
          </li>

          <li onClick={() => navigate("/customers")}>
            👥 Customers
          </li>

          <li onClick={() => navigate("/schedule")}>
            📅 Schedule
          </li>

          <li onClick={() => navigate("/settings")}>
            ⚙️ Settings
          </li>
        </ul>

        <button onClick={logout}>Logout</button>
      </div>

      <div className="dashboard">
        <div className="profile">
          <div>
            <h1>Welcome back, {userName} 👋</h1>

            <p>
              Manage your business automation from one dashboard.
            </p>

            {userEmail && (
              <p style={styles.userEmail}>{userEmail}</p>
            )}
          </div>

          <div style={styles.profileAvatar}>
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>

        <div style={styles.analyticsHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              📊 Business Analytics
            </h2>

            <p style={styles.sectionSubtitle}>
              Live overview of your DKPilot AI business records.
            </p>
          </div>

          <button
            style={styles.refreshButton}
            onClick={fetchDashboardData}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "🔄 Refresh Analytics"}
          </button>
        </div>

        {message && (
          <div style={styles.message}>{message}</div>
        )}

        <div style={styles.statisticsGrid}>
          <div
            style={{
              ...styles.statCard,
              ...styles.customerCard,
            }}
            onClick={() => navigate("/customers")}
          >
            <div style={styles.statIcon}>👥</div>

            <div>
              <span style={styles.statNumber}>
                {loading
                  ? "..."
                  : dashboardData.customers}
              </span>

              <span style={styles.statLabel}>
                Total Customers
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              ...styles.invoiceCard,
            }}
            onClick={() => navigate("/invoice")}
          >
            <div style={styles.statIcon}>📄</div>

            <div>
              <span style={styles.statNumber}>
                {loading
                  ? "..."
                  : dashboardData.invoices}
              </span>

              <span style={styles.statLabel}>
                Total Invoices
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              ...styles.emailCard,
            }}
            onClick={() => navigate("/email")}
          >
            <div style={styles.statIcon}>📧</div>

            <div>
              <span style={styles.statNumber}>
                {loading ? "..." : dashboardData.emails}
              </span>

              <span style={styles.statLabel}>
                Emails Sent
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              ...styles.scheduleCard,
            }}
            onClick={() => navigate("/schedule")}
          >
            <div style={styles.statIcon}>📅</div>

            <div>
              <span style={styles.statNumber}>
                {loading
                  ? "..."
                  : dashboardData.schedules}
              </span>

              <span style={styles.statLabel}>
                Total Schedules
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              ...styles.revenueCard,
            }}
            onClick={() => navigate("/invoice")}
          >
            <div style={styles.statIcon}>💰</div>

            <div>
              <span style={styles.revenueNumber}>
                {loading
                  ? "..."
                  : formatCurrency(
                      dashboardData.totalRevenue
                    )}
              </span>

              <span style={styles.statLabel}>
                Total Revenue
              </span>
            </div>
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h2 style={styles.chartTitle}>
                📈 Monthly Revenue
              </h2>

              <p style={styles.chartSubtitle}>
                Revenue calculated from generated invoices.
              </p>
            </div>

            <div style={styles.revenueSummary}>
              <span style={styles.revenueSummaryLabel}>
                Total Revenue
              </span>

              <strong style={styles.revenueSummaryValue}>
                {formatCurrency(
                  dashboardData.totalRevenue
                )}
              </strong>
            </div>
          </div>

          {loading ? (
            <div style={styles.chartLoading}>
              Loading revenue chart...
            </div>
          ) : (
            <div style={styles.chartWrapper}>
              <ResponsiveContainer
                width="100%"
                height={330}
              >
                <BarChart
                  data={dashboardData.monthlyRevenue}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 15,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tickFormatter={(value) =>
                      `₹${value}`
                    }
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatChartValue(value),
                      "Revenue",
                    ]}
                    labelFormatter={(label) =>
                      `Month: ${label}`
                    }
                  />

                  <Bar
                    dataKey="revenue"
                    fill="#2563eb"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={styles.quickHeader}>
          <h2 style={styles.sectionTitle}>
            ⚡ Quick Actions
          </h2>

          <p style={styles.sectionSubtitle}>
            Open a module and continue your business work.
          </p>
        </div>

        <div className="dashboard-cards">
          <div
            className="dashboard-card"
            onClick={() => navigate("/ai")}
          >
            <h3>🤖 AI Assistant</h3>

            <p>
              Ask questions and generate business content.
            </p>

            <span style={styles.openText}>
              Open Assistant →
            </span>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/email")}
          >
            <h3>📧 AI Email</h3>

            <p>
              Generate and send professional emails.
            </p>

            <span style={styles.openText}>
              Create Email →
            </span>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/invoice")}
          >
            <h3>📄 Invoice</h3>

            <p>
              Create invoices and download PDF files.
            </p>

            <span style={styles.openText}>
              Create Invoice →
            </span>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/customers")}
          >
            <h3>👥 Customers</h3>

            <p>
              Add, search, edit and manage customers.
            </p>

            <span style={styles.openText}>
              Manage Customers →
            </span>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/schedule")}
          >
            <h3>📅 Schedule</h3>

            <p>
              Manage meetings and business tasks.
            </p>

            <span style={styles.openText}>
              View Schedule →
            </span>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/settings")}
          >
            <h3>⚙️ Settings</h3>

            <p>
              Manage your account and application settings.
            </p>

            <span style={styles.openText}>
              Open Settings →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  userEmail: {
    marginTop: "6px",
    color: "#64748b",
    fontSize: "14px",
  },

  profileAvatar: {
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "bold",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
  },

  analyticsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginTop: "28px",
    marginBottom: "18px",
  },

  quickHeader: {
    marginTop: "35px",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "25px",
  },

  sectionSubtitle: {
    marginTop: "7px",
    marginBottom: 0,
    color: "#64748b",
  },

  refreshButton: {
    padding: "11px 17px",
    border: "none",
    borderRadius: "9px",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  message: {
    padding: "13px",
    marginBottom: "18px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: "bold",
    textAlign: "center",
  },

  statisticsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
  },

  statCard: {
    minHeight: "115px",
    padding: "22px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    color: "#ffffff",
    cursor: "pointer",
    boxShadow:
      "0 10px 25px rgba(15, 23, 42, 0.12)",
  },

  customerCard: {
    background:
      "linear-gradient(135deg, #2563eb, #1d4ed8)",
  },

  invoiceCard: {
    background:
      "linear-gradient(135deg, #7c3aed, #6d28d9)",
  },

  emailCard: {
    background:
      "linear-gradient(135deg, #0891b2, #0e7490)",
  },

  scheduleCard: {
    background:
      "linear-gradient(135deg, #16a34a, #15803d)",
  },

  revenueCard: {
    background:
      "linear-gradient(135deg, #ea580c, #c2410c)",
  },

  statIcon: {
    width: "58px",
    height: "58px",
    flexShrink: 0,
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.18)",
    fontSize: "29px",
  },

  statNumber: {
    display: "block",
    fontSize: "31px",
    fontWeight: "bold",
  },

  revenueNumber: {
    display: "block",
    fontSize: "24px",
    fontWeight: "bold",
    wordBreak: "break-word",
  },

  statLabel: {
    display: "block",
    marginTop: "5px",
    fontSize: "14px",
    opacity: 0.9,
  },

  chartCard: {
    marginTop: "25px",
    padding: "25px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  chartTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#0f172a",
  },

  chartSubtitle: {
    marginTop: "7px",
    marginBottom: 0,
    color: "#64748b",
  },

  revenueSummary: {
    padding: "13px 18px",
    borderRadius: "12px",
    background: "#eff6ff",
    textAlign: "right",
  },

  revenueSummaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "13px",
  },

  revenueSummaryValue: {
    display: "block",
    marginTop: "5px",
    color: "#1d4ed8",
    fontSize: "21px",
  },

  chartWrapper: {
    width: "100%",
    minHeight: "330px",
  },

  chartLoading: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#64748b",
  },

  openText: {
    display: "inline-block",
    marginTop: "12px",
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: "14px",
  },
};

export default Dashboard;