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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#16a34a",
];

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    customers: 0,
    invoices: 0,
    emails: 0,
    schedules: 0,
    totalRevenue: 0,

    averageInvoiceValue: 0,
    currentMonthRevenue: 0,
    highestInvoice: null,
    topCustomer: null,
    monthlyInvoiceCount: [],

    monthlyRevenue: [],
    recentActivities: [],
    notifications: [],
    notificationCount: 0,
    todayScheduleCount: 0,
    nextSchedule: null,
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  let loggedInUser = null;

  try {
    loggedInUser = JSON.parse(
      localStorage.getItem("loggedInUser")
    );
  } catch (error) {
    console.error("Logged user read error:", error);
  }

  const userName = loggedInUser?.name || "Sanjay";
  const userEmail = loggedInUser?.email || "";

  const profilePhoto =
    localStorage.getItem("profilePhoto") || "";

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
        customers:
          Number(response.data.customers) || 0,

        invoices:
          Number(response.data.invoices) || 0,

        emails:
          Number(response.data.emails) || 0,

        schedules:
          Number(response.data.schedules) || 0,

        totalRevenue:
          Number(response.data.totalRevenue) || 0,

        averageInvoiceValue:
          Number(
            response.data.averageInvoiceValue
          ) || 0,

        currentMonthRevenue:
          Number(
            response.data.currentMonthRevenue
          ) || 0,

        highestInvoice:
          response.data.highestInvoice || null,

        topCustomer:
          response.data.topCustomer || null,

        monthlyInvoiceCount: Array.isArray(
          response.data.monthlyInvoiceCount
        )
          ? response.data.monthlyInvoiceCount
          : [],

        monthlyRevenue: Array.isArray(
          response.data.monthlyRevenue
        )
          ? response.data.monthlyRevenue
          : [],

        recentActivities: Array.isArray(
          response.data.recentActivities
        )
          ? response.data.recentActivities
          : [],

        notifications: Array.isArray(
          response.data.notifications
        )
          ? response.data.notifications
          : [],

        notificationCount:
          Number(
            response.data.notificationCount
          ) || 0,

        todayScheduleCount:
          Number(
            response.data.todayScheduleCount
          ) || 0,

        nextSchedule:
          response.data.nextSchedule || null,
      });
    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setMessage(
          "Session expired. Please login again."
        );
      } else {
        setMessage(
          "Dashboard data load panna mudiyala."
        );
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
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  };

  const formatActivityDate = (dateValue) => {
    if (!dateValue) {
      return "Date not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatScheduleDate = (dateValue) => {
    if (!dateValue) {
      return "Date not available";
    }

    const date = new Date(
      `${dateValue}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatScheduleTime = (timeValue) => {
    if (!timeValue) {
      return "Time not available";
    }

    const parts = timeValue.split(":");

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return timeValue;
    }

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityColor = (type) => {
    if (type === "INVOICE") {
      return "#7c3aed";
    }

    if (type === "EMAIL") {
      return "#0891b2";
    }

    if (type === "SCHEDULE") {
      return "#16a34a";
    }

    if (type === "CUSTOMER") {
      return "#2563eb";
    }

    return "#64748b";
  };

  const openActivity = (activity) => {
    if (activity.type === "INVOICE") {
      navigate("/invoice");
      return;
    }

    if (activity.type === "EMAIL") {
      navigate("/email");
      return;
    }

    if (activity.type === "SCHEDULE") {
      navigate("/schedule");
      return;
    }

    if (activity.type === "CUSTOMER") {
      navigate("/customers");
    }
  };

  const openScheduleFromNotification = () => {
    setNotificationOpen(false);
    navigate("/schedule");
  };

  const distributionData = [
    {
      name: "Customers",
      value: dashboardData.customers,
    },
    {
      name: "Invoices",
      value: dashboardData.invoices,
    },
    {
      name: "Emails",
      value: dashboardData.emails,
    },
    {
      name: "Schedules",
      value: dashboardData.schedules,
    },
  ];

  const hasDistributionData =
    distributionData.some(
      (item) => item.value > 0
    );

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

        <button onClick={logout}>
          Logout
        </button>
      </div>

      <div className="dashboard">
        <div className="profile">
          <div>
            <h1>
              Welcome back, {userName} 👋
            </h1>

            <p>
              Manage your business automation from one
              dashboard.
            </p>

            {userEmail && (
              <p style={styles.userEmail}>
                {userEmail}
              </p>
            )}
          </div>

          <div style={styles.profileRight}>
            <div style={styles.notificationWrapper}>
              <button
                style={styles.notificationButton}
                onClick={() =>
                  setNotificationOpen(
                    !notificationOpen
                  )
                }
              >
                🔔

                {dashboardData.notificationCount > 0 && (
                  <span
                    style={styles.notificationBadge}
                  >
                    {dashboardData.notificationCount > 9
                      ? "9+"
                      : dashboardData.notificationCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div style={styles.notificationPopup}>
                  <div
                    style={
                      styles.notificationPopupHeader
                    }
                  >
                    <div>
                      <h3
                        style={
                          styles.notificationPopupTitle
                        }
                      >
                        🔔 Notifications
                      </h3>

                      <p
                        style={
                          styles.notificationPopupSubtitle
                        }
                      >
                        Upcoming schedule reminders
                      </p>
                    </div>

                    <button
                      style={
                        styles.notificationCloseButton
                      }
                      onClick={() =>
                        setNotificationOpen(false)
                      }
                    >
                      ✕
                    </button>
                  </div>

                  <div
                    style={
                      styles.todayScheduleSummary
                    }
                  >
                    <span>
                      📅 Today&apos;s schedules
                    </span>

                    <strong>
                      {
                        dashboardData.todayScheduleCount
                      }
                    </strong>
                  </div>

                  {dashboardData.notifications.length ===
                  0 ? (
                    <div
                      style={
                        styles.emptyNotification
                      }
                    >
                      <div
                        style={
                          styles.emptyNotificationIcon
                        }
                      >
                        🔕
                      </div>

                      <strong>
                        No upcoming notifications
                      </strong>

                      <p>
                        New schedule reminders will
                        appear here.
                      </p>
                    </div>
                  ) : (
                    <div
                      style={
                        styles.notificationList
                      }
                    >
                      {dashboardData.notifications.map(
                        (notification) => (
                          <div
                            key={notification.id}
                            style={
                              styles.notificationItem
                            }
                            onClick={
                              openScheduleFromNotification
                            }
                          >
                            <div
                              style={
                                styles.notificationItemIcon
                              }
                            >
                              📅
                            </div>

                            <div
                              style={
                                styles.notificationContent
                              }
                            >
                              <div
                                style={
                                  styles.notificationTitleRow
                                }
                              >
                                <strong
                                  style={
                                    styles.notificationTitle
                                  }
                                >
                                  {notification.title}
                                </strong>

                                {notification.isToday && (
                                  <span
                                    style={
                                      styles.todayBadge
                                    }
                                  >
                                    TODAY
                                  </span>
                                )}
                              </div>

                              <p
                                style={
                                  styles.notificationDescription
                                }
                              >
                                {notification.description ||
                                  "No description"}
                              </p>

                              <div
                                style={
                                  styles.notificationDateRow
                                }
                              >
                                <span>
                                  🗓️{" "}
                                  {formatScheduleDate(
                                    notification.date
                                  )}
                                </span>

                                <span>
                                  🕒{" "}
                                  {formatScheduleTime(
                                    notification.time
                                  )}
                                </span>
                              </div>
                            </div>

                            <span
                              style={
                                styles.notificationArrow
                              }
                            >
                              →
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <button
                    style={
                      styles.viewAllScheduleButton
                    }
                    onClick={
                      openScheduleFromNotification
                    }
                  >
                    View All Schedules →
                  </button>
                </div>
              )}
            </div>

            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                style={styles.profilePhoto}
              />
            ) : (
              <div style={styles.profileAvatar}>
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {dashboardData.nextSchedule && (
          <div style={styles.nextScheduleBanner}>
            <div style={styles.nextScheduleIcon}>
              ⏰
            </div>

            <div style={styles.nextScheduleContent}>
              <span
                style={styles.nextScheduleLabel}
              >
                Next Schedule
              </span>

              <strong
                style={styles.nextScheduleTitle}
              >
                {dashboardData.nextSchedule.title}
              </strong>

              <span
                style={styles.nextScheduleDetails}
              >
                {formatScheduleDate(
                  dashboardData.nextSchedule.date
                )}{" "}
                •{" "}
                {formatScheduleTime(
                  dashboardData.nextSchedule.time
                )}
              </span>
            </div>

            <button
              style={styles.nextScheduleButton}
              onClick={() => navigate("/schedule")}
            >
              View Schedule →
            </button>
          </div>
        )}

        <div style={styles.analyticsHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              📊 Business Analytics
            </h2>

            <p style={styles.sectionSubtitle}>
              Live overview of your DKPilot AI business
              records.
            </p>
          </div>

          <button
            style={{
              ...styles.refreshButton,
              opacity: loading ? 0.7 : 1,
            }}
            onClick={fetchDashboardData}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "🔄 Refresh Analytics"}
          </button>
        </div>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <div style={styles.statisticsGrid}>
          <div
            style={{
              ...styles.statCard,
              ...styles.customerCard,
            }}
            onClick={() =>
              navigate("/customers")
            }
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
            onClick={() =>
              navigate("/invoice")
            }
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
            onClick={() =>
              navigate("/email")
            }
          >
            <div style={styles.statIcon}>📧</div>

            <div>
              <span style={styles.statNumber}>
                {loading
                  ? "..."
                  : dashboardData.emails}
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
            onClick={() =>
              navigate("/schedule")
            }
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
            onClick={() =>
              navigate("/invoice")
            }
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

        <div style={styles.invoiceAnalyticsSection}>
          <div style={styles.invoiceAnalyticsHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                💼 Invoice Analytics
              </h2>

              <p style={styles.sectionSubtitle}>
                Key invoice performance and customer
                insights.
              </p>
            </div>

            <button
              style={styles.invoiceAnalyticsButton}
              onClick={() => navigate("/invoice")}
            >
              View Invoices →
            </button>
          </div>

          <div style={styles.invoiceMetricGrid}>
            <div
              style={{
                ...styles.invoiceMetricCard,
                ...styles.highestInvoiceCard,
              }}
            >
              <div style={styles.invoiceMetricIcon}>
                💰
              </div>

              <div>
                <span style={styles.invoiceMetricLabel}>
                  Highest Invoice
                </span>

                <strong
                  style={styles.invoiceMetricValue}
                >
                  {loading
                    ? "..."
                    : formatCurrency(
                        dashboardData.highestInvoice
                          ?.totalAmount || 0
                      )}
                </strong>

                <span style={styles.invoiceMetricNote}>
                  {dashboardData.highestInvoice
                    ?.clientName || "No invoice data"}
                </span>
              </div>
            </div>

            <div
              style={{
                ...styles.invoiceMetricCard,
                ...styles.averageInvoiceCard,
              }}
            >
              <div style={styles.invoiceMetricIcon}>
                📊
              </div>

              <div>
                <span style={styles.invoiceMetricLabel}>
                  Average Invoice
                </span>

                <strong
                  style={styles.invoiceMetricValue}
                >
                  {loading
                    ? "..."
                    : formatCurrency(
                        dashboardData.averageInvoiceValue
                      )}
                </strong>

                <span style={styles.invoiceMetricNote}>
                  Average invoice value
                </span>
              </div>
            </div>

            <div
              style={{
                ...styles.invoiceMetricCard,
                ...styles.monthRevenueCard,
              }}
            >
              <div style={styles.invoiceMetricIcon}>
                📅
              </div>

              <div>
                <span style={styles.invoiceMetricLabel}>
                  Current Month Revenue
                </span>

                <strong
                  style={styles.invoiceMetricValue}
                >
                  {loading
                    ? "..."
                    : formatCurrency(
                        dashboardData.currentMonthRevenue
                      )}
                </strong>

                <span style={styles.invoiceMetricNote}>
                  Revenue generated this month
                </span>
              </div>
            </div>

            <div
              style={{
                ...styles.invoiceMetricCard,
                ...styles.topCustomerCard,
              }}
            >
              <div style={styles.invoiceMetricIcon}>
                👑
              </div>

              <div>
                <span style={styles.invoiceMetricLabel}>
                  Top Customer
                </span>

                <strong
                  style={styles.topCustomerName}
                >
                  {dashboardData.topCustomer?.name ||
                    "No customer data"}
                </strong>

                <span style={styles.invoiceMetricNote}>
                  {dashboardData.topCustomer
                    ? `${formatCurrency(
                        dashboardData.topCustomer
                          .totalRevenue
                      )} • ${
                        dashboardData.topCustomer
                          .invoiceCount
                      } invoice(s)`
                    : "Create invoices to see insights"}
                </span>
              </div>
            </div>
          </div>
        </div>
                <div style={styles.invoiceCountChartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h2 style={styles.chartTitle}>
                📄 Monthly Invoice Count
              </h2>

              <p style={styles.chartSubtitle}>
                Number of invoices generated each month.
              </p>
            </div>

            <div style={styles.invoiceCountSummary}>
              <span style={styles.revenueSummaryLabel}>
                Total Invoices
              </span>

              <strong
                style={styles.invoiceCountSummaryValue}
              >
                {dashboardData.invoices}
              </strong>
            </div>
          </div>

          {loading ? (
            <div style={styles.chartLoading}>
              Loading invoice count chart...
            </div>
          ) : (
            <div style={styles.chartWrapper}>
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart
                  data={
                    dashboardData.monthlyInvoiceCount
                  }
                  margin={{
                    top: 20,
                    right: 20,
                    left: 5,
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
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    formatter={(value) => [
                      value,
                      "Invoices",
                    ]}
                    labelFormatter={(label) =>
                      `Month: ${label}`
                    }
                  />

                  <Bar
                    dataKey="count"
                    fill="#7c3aed"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
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

              <strong
                style={styles.revenueSummaryValue}
              >
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

        <div style={styles.pieSection}>
          <div style={styles.pieChartCard}>
            <div style={styles.chartHeader}>
              <div>
                <h2 style={styles.chartTitle}>
                  🥧 Business Distribution
                </h2>

                <p style={styles.chartSubtitle}>
                  Compare customers, invoices, emails and
                  schedules.
                </p>
              </div>
            </div>

            {loading ? (
              <div style={styles.chartLoading}>
                Loading distribution chart...
              </div>
            ) : !hasDistributionData ? (
              <div style={styles.chartLoading}>
                No business records available.
              </div>
            ) : (
              <div style={styles.pieChartWrapper}>
                <ResponsiveContainer
                  width="100%"
                  height={360}
                >
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={75}
                      outerRadius={125}
                      paddingAngle={4}
                      label={({ name, value }) =>
                        `${name}: ${value}`
                      }
                    >
                      {distributionData.map(
                        (entry, index) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div style={styles.summaryCard}>
            <h2 style={styles.summaryTitle}>
              📌 Record Summary
            </h2>

            <p style={styles.summarySubtitle}>
              Current records available in your platform.
            </p>

            {distributionData.map(
              (item, index) => (
                <div
                  style={styles.summaryItem}
                  key={item.name}
                >
                  <div style={styles.summaryItemLeft}>
                    <span
                      style={{
                        ...styles.summaryDot,
                        background:
                          PIE_COLORS[index],
                      }}
                    />

                    <span>{item.name}</span>
                  </div>

                  <strong>{item.value}</strong>
                </div>
              )
            )}

            <div style={styles.summaryRevenue}>
              <span>Total Revenue</span>

              <strong>
                {formatCurrency(
                  dashboardData.totalRevenue
                )}
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.activitiesCard}>
          <div style={styles.activitiesHeader}>
            <div>
              <h2 style={styles.chartTitle}>
                🕒 Recent Activities
              </h2>

              <p style={styles.chartSubtitle}>
                Latest invoices, emails and scheduled tasks.
              </p>
            </div>

            <button
              style={styles.activityRefreshButton}
              onClick={fetchDashboardData}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div style={styles.emptyActivity}>
              Loading recent activities...
            </div>
          ) : dashboardData.recentActivities.length ===
            0 ? (
            <div style={styles.emptyActivity}>
              <div style={styles.emptyActivityIcon}>
                🕒
              </div>

              <h3>No recent activities</h3>

              <p>
                Create an invoice, send an email or add a
                schedule.
              </p>
            </div>
          ) : (
            <div style={styles.activityList}>
              {dashboardData.recentActivities.map(
                (activity, index) => {
                  const activityColor =
                    getActivityColor(
                      activity.type
                    );

                  return (
                    <div
                      key={
                        activity.id ||
                        `${activity.type}-${index}`
                      }
                      style={styles.activityItem}
                      onClick={() =>
                        openActivity(activity)
                      }
                    >
                      <div style={styles.timelineColumn}>
                        <div
                          style={{
                            ...styles.activityIcon,
                            background:
                              `${activityColor}18`,
                            color: activityColor,
                            borderColor:
                              `${activityColor}45`,
                          }}
                        >
                          {activity.icon || "🔔"}
                        </div>

                        {index <
                          dashboardData
                            .recentActivities.length -
                            1 && (
                          <div
                            style={styles.timelineLine}
                          />
                        )}
                      </div>

                      <div style={styles.activityContent}>
                        <div
                          style={styles.activityTitleRow}
                        >
                          <h3
                            style={styles.activityTitle}
                          >
                            {activity.title}
                          </h3>

                          <span
                            style={{
                              ...styles.activityBadge,
                              background:
                                `${activityColor}18`,
                              color: activityColor,
                            }}
                          >
                            {activity.type}
                          </span>
                        </div>

                        <p
                          style={
                            styles.activityDescription
                          }
                        >
                          {activity.description}
                        </p>

                        <p style={styles.activityDate}>
                          🕒{" "}
                          {formatActivityDate(
                            activity.date
                          )}
                        </p>
                      </div>

                      <div style={styles.activityArrow}>
                        →
                      </div>
                    </div>
                  );
                }
              )}
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

  profileRight: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "16px",
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
    boxShadow:
      "0 8px 20px rgba(37, 99, 235, 0.25)",
  },

  profilePhoto: {
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #dbeafe",
    boxShadow:
      "0 8px 20px rgba(37, 99, 235, 0.2)",
  },

  notificationWrapper: {
    position: "relative",
  },

  notificationButton: {
    position: "relative",
    width: "50px",
    height: "50px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    background: "#ffffff",
    fontSize: "23px",
    cursor: "pointer",
    boxShadow:
      "0 8px 20px rgba(15, 23, 42, 0.08)",
  },

  notificationBadge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    minWidth: "21px",
    height: "21px",
    padding: "0 5px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dc2626",
    color: "#ffffff",
    border: "2px solid #ffffff",
    fontSize: "11px",
    fontWeight: "bold",
  },

  notificationPopup: {
    position: "absolute",
    top: "62px",
    right: 0,
    width: "390px",
    maxWidth: "calc(100vw - 40px)",
    padding: "20px",
    zIndex: 2000,
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow:
      "0 24px 65px rgba(15, 23, 42, 0.25)",
    border: "1px solid #e2e8f0",
  },

  notificationPopupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    paddingBottom: "15px",
    borderBottom: "1px solid #e2e8f0",
  },

  notificationPopupTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "20px",
  },

  notificationPopupSubtitle: {
    marginTop: "5px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  notificationCloseButton: {
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontSize: "18px",
    cursor: "pointer",
  },

  todayScheduleSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "15px",
    marginBottom: "10px",
    padding: "12px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#1d4ed8",
  },

  notificationList: {
    maxHeight: "340px",
    overflowY: "auto",
  },

  notificationItem: {
    display: "grid",
    gridTemplateColumns: "42px 1fr auto",
    gap: "12px",
    padding: "15px 5px",
    borderBottom: "1px solid #e2e8f0",
    cursor: "pointer",
  },

  notificationItemIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dcfce7",
    fontSize: "19px",
  },

  notificationContent: {
    minWidth: 0,
  },

  notificationTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  notificationTitle: {
    color: "#0f172a",
    fontSize: "14px",
  },

  todayBadge: {
    padding: "3px 7px",
    borderRadius: "20px",
    background: "#dcfce7",
    color: "#15803d",
    fontSize: "9px",
    fontWeight: "bold",
  },

  notificationDescription: {
    marginTop: "6px",
    marginBottom: "7px",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  notificationDateRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    color: "#94a3b8",
    fontSize: "11px",
  },

  notificationArrow: {
    alignSelf: "center",
    color: "#94a3b8",
  },

  emptyNotification: {
    padding: "30px 15px",
    textAlign: "center",
    color: "#64748b",
  },

  emptyNotificationIcon: {
    marginBottom: "10px",
    fontSize: "34px",
  },

  viewAllScheduleButton: {
    width: "100%",
    marginTop: "15px",
    padding: "11px",
    border: "none",
    borderRadius: "9px",
    background: "#0f172a",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  nextScheduleBanner: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "22px",
    padding: "18px 20px",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #eff6ff, #eef2ff)",
    border: "1px solid #bfdbfe",
  },

  nextScheduleIcon: {
    width: "50px",
    height: "50px",
    flexShrink: 0,
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "23px",
  },

  nextScheduleContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },

  nextScheduleLabel: {
    color: "#64748b",
    fontSize: "12px",
  },

  nextScheduleTitle: {
    color: "#0f172a",
    fontSize: "17px",
  },

  nextScheduleDetails: {
    color: "#475569",
    fontSize: "13px",
  },

  nextScheduleButton: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
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
    fontSize: "21px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  statLabel: {
    display: "block",
    marginTop: "5px",
    fontSize: "14px",
    opacity: 0.9,
  },

  invoiceAnalyticsSection: {
    marginTop: "28px",
  },

  invoiceAnalyticsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  invoiceAnalyticsButton: {
    padding: "11px 17px",
    border: "none",
    borderRadius: "9px",
    background: "#7c3aed",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  invoiceMetricGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
  },

  invoiceMetricCard: {
    minHeight: "130px",
    padding: "22px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    color: "#ffffff",
    boxShadow:
      "0 10px 25px rgba(15, 23, 42, 0.12)",
  },

  highestInvoiceCard: {
    background:
      "linear-gradient(135deg, #7c3aed, #5b21b6)",
  },

  averageInvoiceCard: {
    background:
      "linear-gradient(135deg, #0284c7, #0369a1)",
  },

  monthRevenueCard: {
    background:
      "linear-gradient(135deg, #16a34a, #15803d)",
  },

  topCustomerCard: {
    background:
      "linear-gradient(135deg, #ea580c, #c2410c)",
  },

  invoiceMetricIcon: {
    width: "54px",
    height: "54px",
    flexShrink: 0,
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.18)",
    fontSize: "27px",
  },

  invoiceMetricLabel: {
    display: "block",
    fontSize: "13px",
    opacity: 0.9,
  },

  invoiceMetricValue: {
    display: "block",
    marginTop: "6px",
    fontSize: "23px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  topCustomerName: {
    display: "block",
    marginTop: "6px",
    fontSize: "20px",
    fontWeight: "bold",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "190px",
  },

  invoiceMetricNote: {
    display: "block",
    marginTop: "6px",
    fontSize: "12px",
    opacity: 0.88,
  },

  invoiceCountChartCard: {
    marginTop: "22px",
    padding: "25px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  invoiceCountSummary: {
    padding: "13px 18px",
    borderRadius: "12px",
    background: "#f5f3ff",
    textAlign: "right",
  },

  invoiceCountSummaryValue: {
    display: "block",
    marginTop: "5px",
    color: "#7c3aed",
    fontSize: "22px",
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

  pieSection: {
    display: "grid",
    gridTemplateColumns:
      "minmax(320px, 1.6fr) minmax(260px, 0.7fr)",
    gap: "22px",
    marginTop: "25px",
  },

  pieChartCard: {
    padding: "25px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  pieChartWrapper: {
    width: "100%",
    minHeight: "360px",
  },

  summaryCard: {
    padding: "25px",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg, #0f172a, #1e293b)",
    color: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.16)",
  },

  summaryTitle: {
    marginTop: 0,
    marginBottom: "8px",
    fontSize: "23px",
  },

  summarySubtitle: {
    marginTop: 0,
    marginBottom: "22px",
    color: "#cbd5e1",
    lineHeight: "1.6",
  },

  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom:
      "1px solid rgba(255, 255, 255, 0.1)",
  },

  summaryItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  summaryDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    display: "inline-block",
  },

  summaryRevenue: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginTop: "22px",
    padding: "17px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.1)",
  },

  activitiesCard: {
    marginTop: "25px",
    padding: "25px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  activitiesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "25px",
  },

  activityRefreshButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "9px",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  activityList: {
    maxHeight: "560px",
    overflowY: "auto",
    paddingRight: "8px",
  },

  activityItem: {
    display: "grid",
    gridTemplateColumns: "55px 1fr auto",
    gap: "14px",
    cursor: "pointer",
  },

  timelineColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  activityIcon: {
    width: "44px",
    height: "44px",
    flexShrink: 0,
    borderRadius: "50%",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  timelineLine: {
    width: "2px",
    minHeight: "65px",
    flex: 1,
    marginTop: "7px",
    background: "#e2e8f0",
  },

  activityContent: {
    paddingBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
  },

  activityTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  activityTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "17px",
  },

  activityBadge: {
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "bold",
  },

  activityDescription: {
    marginTop: "8px",
    marginBottom: "7px",
    color: "#475569",
    lineHeight: "1.6",
  },

  activityDate: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
  },

  activityArrow: {
    paddingTop: "12px",
    color: "#94a3b8",
    fontSize: "20px",
  },

  emptyActivity: {
    padding: "45px 20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    background: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
  },

  emptyActivityIcon: {
    fontSize: "40px",
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