import { useEffect, useMemo, useState } from "react";
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

const CUSTOMER_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#16a34a",
  "#ea580c",
];

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [invoiceHistory, setInvoiceHistory] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    address: "",
  });

  const [editingCustomerId, setEditingCustomerId] =
    useState(null);

  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(false);

  const [customerLoading, setCustomerLoading] =
    useState(true);

  const [analyticsLoading, setAnalyticsLoading] =
    useState(true);

  const [message, setMessage] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getHeaders = () => {
    const token = getToken();

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchCustomers = async () => {
    try {
      setCustomerLoading(true);
      setMessage("");

      const response = await axios.get(
        "http://localhost:8081/api/customers",
        {
          headers: getHeaders(),
        }
      );

      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error(
        "Customer load error:",
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
          "Customers load panna mudiyala."
        );
      }
    } finally {
      setCustomerLoading(false);
    }
  };

  const fetchInvoiceHistory = async () => {
    const token = getToken();

    if (!token) {
      setMessage("Please login again.");
      setAnalyticsLoading(false);
      return;
    }

    try {
      setAnalyticsLoading(true);

      const response = await axios.get(
        "http://localhost:8081/api/invoices/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setInvoiceHistory(response.data);
      } else {
        setInvoiceHistory([]);
      }
    } catch (error) {
      console.error(
        "Customer analytics invoice error:",
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
          "Customer analytics load panna mudiyala."
        );
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const refreshAllData = async () => {
    await Promise.all([
      fetchCustomers(),
      fetchInvoiceHistory(),
    ]);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert("Customer name enter pannu");
      return false;
    }

    if (!formData.email.trim()) {
      alert("Customer email enter pannu");
      return false;
    }

    if (!formData.email.includes("@")) {
      alert("Valid customer email enter pannu");
      return false;
    }

    if (!formData.phone.trim()) {
      alert(
        "Customer phone number enter pannu"
      );
      return false;
    }

    if (formData.phone.trim().length < 10) {
      alert("Valid phone number enter pannu");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      companyName: "",
      address: "",
    });

    setEditingCustomerId(null);
  };

  const saveCustomer = async () => {
    if (!validateForm()) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Please login again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyName:
          formData.companyName.trim(),
        address: formData.address.trim(),
      };

      if (editingCustomerId) {
        await axios.put(
          `http://localhost:8081/api/customers/${editingCustomerId}`,
          customerData,
          {
            headers: {
              ...getHeaders(),
              "Content-Type":
                "application/json",
            },
          }
        );

        alert(
          "Customer updated successfully"
        );
      } else {
        await axios.post(
          "http://localhost:8081/api/customers",
          customerData,
          {
            headers: {
              ...getHeaders(),
              "Content-Type":
                "application/json",
            },
          }
        );

        alert(
          "Customer added successfully"
        );
      }

      resetForm();
      await refreshAllData();
    } catch (error) {
      console.error(
        "Customer save error:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        alert(
          "Session expired. Please login again."
        );
      } else {
        alert(
          editingCustomerId
            ? "Customer update panna mudiyala"
            : "Customer add panna mudiyala"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const editCustomer = (customer) => {
    setEditingCustomerId(customer.id);

    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      companyName:
        customer.companyName || "",
      address: customer.address || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteCustomer = async (customer) => {
    const confirmation = window.confirm(
      `${customer.name} customer-a delete panna sure-ah?`
    );

    if (!confirmation) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8081/api/customers/${customer.id}`,
        {
          headers: getHeaders(),
        }
      );

      alert(
        "Customer deleted successfully"
      );

      if (
        editingCustomerId === customer.id
      ) {
        resetForm();
      }

      await refreshAllData();
    } catch (error) {
      console.error(
        "Customer delete error:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        alert(
          "Session expired. Please login again."
        );
      } else {
        alert(
          "Customer delete panna mudiyala"
        );
      }
    }
  };

  const filteredCustomers = useMemo(() => {
    const searchValue = searchText
      .toLowerCase()
      .trim();

    if (!searchValue) {
      return customers;
    }

    return customers.filter((customer) => {
      const customerDetails = [
        customer.name,
        customer.email,
        customer.phone,
        customer.companyName,
        customer.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return customerDetails.includes(
        searchValue
      );
    });
  }, [customers, searchText]);

  const customerAnalytics = useMemo(() => {
    const revenueMap = {};

    customers.forEach((customer) => {
      const email = String(
        customer.email || ""
      )
        .trim()
        .toLowerCase();

      revenueMap[email] = {
        id: customer.id,
        name:
          customer.name || "Unknown Customer",
        email: customer.email || "",
        companyName:
          customer.companyName || "",
        totalRevenue: 0,
        invoiceCount: 0,
      };
    });

    invoiceHistory.forEach((invoice) => {
      const invoiceEmail = String(
        invoice.clientEmail || ""
      )
        .trim()
        .toLowerCase();

      const invoiceName =
        invoice.clientName ||
        "Unknown Customer";

      if (!revenueMap[invoiceEmail]) {
        revenueMap[invoiceEmail] = {
          id: `invoice-${invoiceEmail}`,
          name: invoiceName,
          email: invoice.clientEmail || "",
          companyName: "",
          totalRevenue: 0,
          invoiceCount: 0,
        };
      }

      revenueMap[
        invoiceEmail
      ].totalRevenue +=
        Number(invoice.totalAmount) || 0;

      revenueMap[
        invoiceEmail
      ].invoiceCount += 1;
    });

    const customerRevenueList =
      Object.values(revenueMap).sort(
        (first, second) =>
          second.totalRevenue -
          first.totalRevenue
      );

    const customersWithInvoices =
      customerRevenueList.filter(
        (customer) =>
          customer.invoiceCount > 0
      );

    const totalCustomerRevenue =
      customerRevenueList.reduce(
        (sum, customer) =>
          sum + customer.totalRevenue,
        0
      );

    const averageRevenuePerCustomer =
      customersWithInvoices.length > 0
        ? totalCustomerRevenue /
          customersWithInvoices.length
        : 0;

    const topCustomer =
      customersWithInvoices.length > 0
        ? customersWithInvoices[0]
        : null;

    const topFiveCustomers =
      customersWithInvoices.slice(0, 5);

    const pieChartData =
      topFiveCustomers.map((customer) => ({
        name: customer.name,
        value: customer.totalRevenue,
      }));

    return {
      totalCustomers: customers.length,
      customersWithInvoices:
        customersWithInvoices.length,
      totalCustomerRevenue,
      averageRevenuePerCustomer,
      topCustomer,
      topFiveCustomers,
      pieChartData,
    };
  }, [customers, invoiceHistory]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const formatChartCurrency = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  };

  return (
        <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              👥 Customer Management
            </h1>

            <p style={styles.subtitle}>
              Add, search, edit and analyse your business customers.
            </p>
          </div>

          <button
            onClick={refreshAllData}
            disabled={customerLoading || analyticsLoading}
            style={{
              ...styles.headerRefreshButton,
              opacity:
                customerLoading || analyticsLoading
                  ? 0.7
                  : 1,
            }}
          >
            {customerLoading || analyticsLoading
              ? "Loading..."
              : "🔄 Refresh Data"}
          </button>
        </div>

        <div style={styles.analyticsHeader}>
          <div>
            <h2 style={styles.analyticsTitle}>
              📊 Customer Analytics
            </h2>

            <p style={styles.analyticsSubtitle}>
              Customer performance calculated from saved invoices.
            </p>
          </div>
        </div>

        <div style={styles.analyticsGrid}>
          <div
            style={{
              ...styles.analyticsCard,
              ...styles.totalCustomersCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              👥
            </div>

            <div>
              <span style={styles.analyticsLabel}>
                Total Customers
              </span>

              <strong style={styles.analyticsValue}>
                {customerLoading
                  ? "..."
                  : customerAnalytics.totalCustomers}
              </strong>

              <span style={styles.analyticsNote}>
                Saved customer records
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.activeCustomersCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              📄
            </div>

            <div>
              <span style={styles.analyticsLabel}>
                Customers with Invoices
              </span>

              <strong style={styles.analyticsValue}>
                {analyticsLoading
                  ? "..."
                  : customerAnalytics.customersWithInvoices}
              </strong>

              <span style={styles.analyticsNote}>
                Customers generating revenue
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.customerRevenueCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              💰
            </div>

            <div>
              <span style={styles.analyticsLabel}>
                Total Customer Revenue
              </span>

              <strong style={styles.analyticsValue}>
                {analyticsLoading
                  ? "..."
                  : formatCurrency(
                      customerAnalytics.totalCustomerRevenue
                    )}
              </strong>

              <span style={styles.analyticsNote}>
                Revenue from all customers
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.averageRevenueCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              📈
            </div>

            <div>
              <span style={styles.analyticsLabel}>
                Average Revenue
              </span>

              <strong style={styles.analyticsValue}>
                {analyticsLoading
                  ? "..."
                  : formatCurrency(
                      customerAnalytics.averageRevenuePerCustomer
                    )}
              </strong>

              <span style={styles.analyticsNote}>
                Per invoiced customer
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.bestCustomerCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              👑
            </div>

            <div style={styles.analyticsContent}>
              <span style={styles.analyticsLabel}>
                Best Customer
              </span>

              <strong style={styles.bestCustomerName}>
                {analyticsLoading
                  ? "..."
                  : customerAnalytics.topCustomer?.name ||
                    "No customer data"}
              </strong>

              <span style={styles.analyticsNote}>
                {customerAnalytics.topCustomer
                  ? `${formatCurrency(
                      customerAnalytics.topCustomer.totalRevenue
                    )} • ${
                      customerAnalytics.topCustomer.invoiceCount
                    } invoice(s)`
                  : "Create invoices to see insights"}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.chartSection}>
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div>
                <h2 style={styles.chartTitle}>
                  🏆 Top Customer Revenue
                </h2>

                <p style={styles.chartSubtitle}>
                  Revenue comparison for your top customers.
                </p>
              </div>
            </div>

            {analyticsLoading ? (
              <div style={styles.chartEmpty}>
                Loading customer revenue chart...
              </div>
            ) : customerAnalytics.topFiveCustomers.length === 0 ? (
              <div style={styles.chartEmpty}>
                No customer invoice data available.
              </div>
            ) : (
              <div style={styles.chartWrapper}>
                <ResponsiveContainer
                  width="100%"
                  height={330}
                >
                  <BarChart
                    data={
                      customerAnalytics.topFiveCustomers
                    }
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
                      dataKey="name"
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
                        formatChartCurrency(value),
                        "Revenue",
                      ]}
                    />

                    <Bar
                      dataKey="totalRevenue"
                      fill="#2563eb"
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
                  🥧 Revenue Distribution
                </h2>

                <p style={styles.chartSubtitle}>
                  Customer share of total invoice revenue.
                </p>
              </div>
            </div>

            {analyticsLoading ? (
              <div style={styles.chartEmpty}>
                Loading revenue distribution...
              </div>
            ) : customerAnalytics.pieChartData.length === 0 ? (
              <div style={styles.chartEmpty}>
                No customer revenue data available.
              </div>
            ) : (
              <div style={styles.chartWrapper}>
                <ResponsiveContainer
                  width="100%"
                  height={330}
                >
                  <PieChart>
                    <Pie
                      data={
                        customerAnalytics.pieChartData
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="44%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                      label={({ name }) => name}
                    >
                      {customerAnalytics.pieChartData.map(
                        (entry, index) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={
                              CUSTOMER_COLORS[
                                index %
                                  CUSTOMER_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        formatChartCurrency(value),
                        "Revenue",
                      ]}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div style={styles.leaderboardCard}>
          <div style={styles.leaderboardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                🥇 Top 5 Customer Leaderboard
              </h2>

              <p style={styles.cardSubtitle}>
                Customers ranked by total invoice revenue.
              </p>
            </div>
          </div>

          {analyticsLoading ? (
            <div style={styles.emptyState}>
              Loading customer leaderboard...
            </div>
          ) : customerAnalytics.topFiveCustomers.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                🏆
              </div>

              <h3 style={styles.emptyTitle}>
                No leaderboard data
              </h3>

              <p style={styles.emptyText}>
                Generate invoices for customers to build the leaderboard.
              </p>
            </div>
          ) : (
            <div style={styles.leaderboardList}>
              {customerAnalytics.topFiveCustomers.map(
                (customer, index) => (
                  <div
                    key={`${customer.email}-${index}`}
                    style={styles.leaderboardItem}
                  >
                    <div
                      style={{
                        ...styles.rankBadge,
                        background:
                          CUSTOMER_COLORS[
                            index %
                              CUSTOMER_COLORS.length
                          ],
                      }}
                    >
                      {index + 1}
                    </div>

                    <div style={styles.leaderboardCustomer}>
                      <div style={styles.leaderboardAvatar}>
                        {customer.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong
                          style={styles.leaderboardName}
                        >
                          {customer.name}
                        </strong>

                        <span
                          style={styles.leaderboardCompany}
                        >
                          {customer.companyName ||
                            customer.email ||
                            "Customer"}
                        </span>
                      </div>
                    </div>

                    <div style={styles.leaderboardStats}>
                      <strong
                        style={styles.leaderboardRevenue}
                      >
                        {formatCurrency(
                          customer.totalRevenue
                        )}
                      </strong>

                      <span
                        style={styles.leaderboardInvoices}
                      >
                        {customer.invoiceCount} invoice(s)
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div style={styles.contentGrid}>
          <div style={styles.formCard}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  {editingCustomerId
                    ? "✏️ Edit Customer"
                    : "➕ Add Customer"}
                </h2>

                <p style={styles.cardSubtitle}>
                  {editingCustomerId
                    ? "Update the selected customer details."
                    : "Enter the customer information below."}
                </p>
              </div>

              {editingCustomerId && (
                <button
                  onClick={resetForm}
                  style={styles.cancelEditButton}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <label style={styles.label}>
              Customer Name{" "}
              <span style={styles.required}>
                *
              </span>
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
            />

            <label style={styles.label}>
              Customer Email{" "}
              <span style={styles.required}>
                *
              </span>
            </label>

            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />

            <label style={styles.label}>
              Phone Number{" "}
              <span style={styles.required}>
                *
              </span>
            </label>

            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
            />

            <label style={styles.label}>
              Company Name
            </label>

            <input
              type="text"
              name="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleChange}
              style={styles.input}
            />

            <label style={styles.label}>
              Address
            </label>

            <textarea
              name="address"
              placeholder="Enter customer address"
              value={formData.address}
              onChange={handleChange}
              rows="5"
              style={styles.textarea}
            />

            <div style={styles.formButtonRow}>
              <button
                onClick={saveCustomer}
                disabled={loading}
                style={{
                  ...styles.saveButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {loading
                  ? "Saving..."
                  : editingCustomerId
                    ? "💾 Update Customer"
                    : "➕ Add Customer"}
              </button>

              <button
                onClick={resetForm}
                disabled={loading}
                style={styles.clearButton}
              >
                Clear
              </button>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              👥
            </div>

            <h2 style={styles.infoTitle}>
              Manage Customers Easily
            </h2>

            <p style={styles.infoText}>
              Customer details can be stored once and reused for invoices,
              emails and future business activities.
            </p>

            <div style={styles.infoItem}>
              <span style={styles.infoItemIcon}>
                ✅
              </span>

              <span>
                Add customer details
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoItemIcon}>
                🔍
              </span>

              <span>
                Search customers quickly
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoItemIcon}>
                ✏️
              </span>

              <span>
                Edit customer information
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoItemIcon}>
                📊
              </span>

              <span>
                Analyse customer revenue
              </span>
            </div>
          </div>
        </div>

        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                📋 Customer List
              </h2>

              <p style={styles.cardSubtitle}>
                View and manage all saved customers.
              </p>
            </div>

            <button
              onClick={fetchCustomers}
              disabled={customerLoading}
              style={{
                ...styles.refreshButton,
                opacity:
                  customerLoading ? 0.7 : 1,
              }}
            >
              {customerLoading
                ? "Loading..."
                : "🔄 Refresh"}
            </button>
          </div>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search by name, email, phone, company or address..."
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              style={styles.searchInput}
            />

            {searchText && (
              <button
                onClick={() =>
                  setSearchText("")
                }
                style={styles.clearSearchButton}
              >
                ✕
              </button>
            )}
          </div>

          {message && (
            <div style={styles.errorMessage}>
              {message}
            </div>
          )}

          {customerLoading &&
            customers.length === 0 && (
              <div style={styles.emptyState}>
                Loading customers...
              </div>
            )}

          {!customerLoading &&
            filteredCustomers.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  👤
                </div>

                <h3 style={styles.emptyTitle}>
                  {searchText
                    ? "No matching customers found"
                    : "No customers available"}
                </h3>

                <p style={styles.emptyText}>
                  {searchText
                    ? "Try using another search value."
                    : "Add your first customer using the form above."}
                </p>
              </div>
            )}

          {filteredCustomers.length > 0 && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>
                      Customer
                    </th>

                    <th style={styles.tableHeader}>
                      Contact
                    </th>

                    <th style={styles.tableHeader}>
                      Company
                    </th>

                    <th style={styles.tableHeader}>
                      Address
                    </th>

                    <th style={styles.tableHeader}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map(
                    (customer) => (
                      <tr key={customer.id}>
                        <td style={styles.tableCell}>
                          <div
                            style={
                              styles.customerProfile
                            }
                          >
                            <div style={styles.avatar}>
                              {customer.name
                                ? customer.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "C"}
                            </div>

                            <div>
                              <div
                                style={
                                  styles.customerName
                                }
                              >
                                {customer.name}
                              </div>

                              <div
                                style={
                                  styles.customerId
                                }
                              >
                                Customer #{customer.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={styles.tableCell}>
                          <div
                            style={
                              styles.contactText
                            }
                          >
                            📧 {customer.email}
                          </div>

                          <div
                            style={
                              styles.contactText
                            }
                          >
                            📞 {customer.phone}
                          </div>
                        </td>

                        <td style={styles.tableCell}>
                          {customer.companyName || "-"}
                        </td>

                        <td style={styles.tableCell}>
                          <div
                            style={
                              styles.addressText
                            }
                          >
                            {customer.address || "-"}
                          </div>
                        </td>

                        <td style={styles.tableCell}>
                          <div
                            style={
                              styles.actionButtons
                            }
                          >
                            <button
                              onClick={() =>
                                editCustomer(
                                  customer
                                )
                              }
                              style={
                                styles.editButton
                              }
                            >
                              ✏️ Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteCustomer(
                                  customer
                                )
                              }
                              style={
                                styles.deleteButton
                              }
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filteredCustomers.length > 0 && (
            <div style={styles.resultCount}>
              Showing {filteredCustomers.length} of{" "}
              {customers.length} customers
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
    page: {
    minHeight: "100vh",
    padding: "35px 20px",
    background: "#f1f5f9",
    color: "#0f172a",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "1250px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "16px",
  },

  headerRefreshButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  analyticsHeader: {
    marginBottom: "18px",
  },

  analyticsTitle: {
    margin: 0,
    fontSize: "27px",
    color: "#0f172a",
  },

  analyticsSubtitle: {
    marginTop: "7px",
    marginBottom: 0,
    color: "#64748b",
  },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  analyticsCard: {
    minHeight: "125px",
    padding: "22px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    color: "#ffffff",
    boxShadow:
      "0 10px 25px rgba(15, 23, 42, 0.12)",
  },

  totalCustomersCard: {
    background:
      "linear-gradient(135deg, #2563eb, #1d4ed8)",
  },

  activeCustomersCard: {
    background:
      "linear-gradient(135deg, #7c3aed, #6d28d9)",
  },

  customerRevenueCard: {
    background:
      "linear-gradient(135deg, #16a34a, #15803d)",
  },

  averageRevenueCard: {
    background:
      "linear-gradient(135deg, #0891b2, #0e7490)",
  },

  bestCustomerCard: {
    background:
      "linear-gradient(135deg, #ea580c, #c2410c)",
  },

  analyticsIcon: {
    width: "56px",
    height: "56px",
    flexShrink: 0,
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.18)",
    fontSize: "27px",
  },

  analyticsContent: {
    minWidth: 0,
  },

  analyticsLabel: {
    display: "block",
    fontSize: "13px",
    opacity: 0.9,
  },

  analyticsValue: {
    display: "block",
    marginTop: "6px",
    fontSize: "23px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  bestCustomerName: {
    display: "block",
    marginTop: "6px",
    fontSize: "20px",
    fontWeight: "bold",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "190px",
  },

  analyticsNote: {
    display: "block",
    marginTop: "6px",
    fontSize: "12px",
    opacity: 0.88,
  },

  chartSection: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "22px",
    marginBottom: "25px",
  },

  chartCard: {
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
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  chartTitle: {
    margin: 0,
    fontSize: "23px",
    color: "#0f172a",
  },

  chartSubtitle: {
    marginTop: "7px",
    marginBottom: 0,
    color: "#64748b",
  },

  chartWrapper: {
    width: "100%",
    minHeight: "330px",
  },

  chartEmpty: {
    padding: "80px 20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "13px",
    background: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
  },

  leaderboardCard: {
    marginBottom: "25px",
    padding: "28px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  leaderboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  leaderboardList: {
    display: "grid",
    gap: "12px",
  },

  leaderboardItem: {
    display: "grid",
    gridTemplateColumns: "50px 1fr auto",
    alignItems: "center",
    gap: "15px",
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "13px",
    background: "#f8fafc",
  },

  rankBadge: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontWeight: "bold",
  },

  leaderboardCustomer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  leaderboardAvatar: {
    width: "42px",
    height: "42px",
    flexShrink: 0,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "bold",
  },

  leaderboardName: {
    display: "block",
    color: "#0f172a",
    fontSize: "15px",
  },

  leaderboardCompany: {
    display: "block",
    marginTop: "4px",
    color: "#64748b",
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "260px",
  },

  leaderboardStats: {
    textAlign: "right",
  },

  leaderboardRevenue: {
    display: "block",
    color: "#0f172a",
    fontSize: "16px",
  },

  leaderboardInvoices: {
    display: "block",
    marginTop: "4px",
    color: "#64748b",
    fontSize: "12px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(320px, 1.5fr) minmax(280px, 0.8fr)",
    gap: "24px",
    alignItems: "start",
  },

  formCard: {
    padding: "28px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  infoCard: {
    padding: "30px",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg, #0f172a, #1e293b)",
    color: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.18)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "24px",
  },

  cardSubtitle: {
    marginTop: "7px",
    marginBottom: 0,
    color: "#64748b",
  },

  cancelEditButton: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#f1f5f9",
    color: "#334155",
    cursor: "pointer",
  },

  label: {
    display: "block",
    marginTop: "16px",
    marginBottom: "7px",
    color: "#334155",
    fontWeight: "bold",
  },

  required: {
    color: "#dc2626",
  },

  input: {
    width: "100%",
    padding: "13px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    padding: "13px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    resize: "vertical",
    outline: "none",
  },

  formButtonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "22px",
  },

  saveButton: {
    flex: 1,
    minWidth: "190px",
    padding: "13px 22px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "bold",
  },

  clearButton: {
    padding: "13px 24px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#334155",
    fontSize: "15px",
    cursor: "pointer",
  },

  infoIcon: {
    fontSize: "45px",
    marginBottom: "15px",
  },

  infoTitle: {
    marginTop: 0,
    fontSize: "25px",
  },

  infoText: {
    color: "#cbd5e1",
    lineHeight: "1.7",
    marginBottom: "25px",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 0",
    borderBottom:
      "1px solid rgba(255, 255, 255, 0.1)",
  },

  infoItemIcon: {
    fontSize: "18px",
  },

  listCard: {
    marginTop: "25px",
    padding: "28px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  refreshButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "14px",
    cursor: "pointer",
  },

  searchWrapper: {
    position: "relative",
    marginBottom: "22px",
  },

  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
  },

  searchInput: {
    width: "100%",
    padding: "14px 50px 14px 45px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "15px",
    outline: "none",
    background: "#f8fafc",
  },

  clearSearchButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "30px",
    height: "30px",
    border: "none",
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#475569",
    cursor: "pointer",
  },

  errorMessage: {
    padding: "14px",
    marginBottom: "18px",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
  },

  emptyState: {
    padding: "45px 20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    background: "#f8fafc",
    textAlign: "center",
    color: "#64748b",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  emptyTitle: {
    marginBottom: "7px",
    color: "#334155",
  },

  emptyText: {
    margin: 0,
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
  },

  tableHeader: {
    padding: "15px",
    background: "#f1f5f9",
    color: "#334155",
    textAlign: "left",
    borderBottom: "1px solid #cbd5e1",
    fontSize: "14px",
  },

  tableCell: {
    padding: "16px 15px",
    color: "#475569",
    verticalAlign: "middle",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "14px",
  },

  customerProfile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "17px",
  },

  customerName: {
    color: "#0f172a",
    fontWeight: "bold",
  },

  customerId: {
    marginTop: "4px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  contactText: {
    marginBottom: "6px",
    whiteSpace: "nowrap",
  },

  addressText: {
    maxWidth: "230px",
    lineHeight: "1.5",
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  editButton: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "bold",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  deleteButton: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "bold",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  resultCount: {
    marginTop: "18px",
    color: "#64748b",
    textAlign: "right",
    fontSize: "13px",
  },
};

export default Customers;