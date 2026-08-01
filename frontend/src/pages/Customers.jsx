import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    address: "",
  });

  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(true);
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
      console.error("Customer load error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setMessage("Session expired. Please login again.");
      } else {
        setMessage("Customers load panna mudiyala.");
      }
    } finally {
      setCustomerLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
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
      alert("Customer phone number enter pannu");
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

    try {
      setLoading(true);
      setMessage("");

      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim(),
        address: formData.address.trim(),
      };

      if (editingCustomerId) {
        await axios.put(
          `http://localhost:8081/api/customers/${editingCustomerId}`,
          customerData,
          {
            headers: {
              ...getHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        alert("Customer updated successfully");
      } else {
        await axios.post(
          "http://localhost:8081/api/customers",
          customerData,
          {
            headers: {
              ...getHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        alert("Customer added successfully");
      }

      resetForm();
      await fetchCustomers();
    } catch (error) {
      console.error("Customer save error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        alert("Session expired. Please login again.");
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
      companyName: customer.companyName || "",
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

      alert("Customer deleted successfully");

      if (editingCustomerId === customer.id) {
        resetForm();
      }

      await fetchCustomers();
    } catch (error) {
      console.error("Customer delete error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        alert("Session expired. Please login again.");
      } else {
        alert("Customer delete panna mudiyala");
      }
    }
  };

  const filteredCustomers = useMemo(() => {
    const searchValue = searchText.toLowerCase().trim();

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

      return customerDetails.includes(searchValue);
    });
  }, [customers, searchText]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👥 Customer Management</h1>

            <p style={styles.subtitle}>
              Add, search, edit and manage your business customers.
            </p>
          </div>

          <div style={styles.customerCount}>
            <span style={styles.customerCountNumber}>
              {customers.length}
            </span>

            <span style={styles.customerCountText}>
              Total Customers
            </span>
          </div>
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
              Customer Name <span style={styles.required}>*</span>
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
              Customer Email <span style={styles.required}>*</span>
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
              Phone Number <span style={styles.required}>*</span>
            </label>

            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
            />

            <label style={styles.label}>Company Name</label>

            <input
              type="text"
              name="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleChange}
              style={styles.input}
            />

            <label style={styles.label}>Address</label>

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
                  cursor: loading ? "not-allowed" : "pointer",
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
            <div style={styles.infoIcon}>👥</div>

            <h2 style={styles.infoTitle}>
              Manage Customers Easily
            </h2>

            <p style={styles.infoText}>
              Customer details can be stored once and reused for
              invoices, emails and future business activities.
            </p>

            <div style={styles.infoItem}>
              <span style={styles.infoItemIcon}>✅</span>
              <span>Add customer details</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoItemIcon}>🔍</span>
              <span>Search customers quickly</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoItemIcon}>✏️</span>
              <span>Edit customer information</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoItemIcon}>🗑️</span>
              <span>Delete unwanted records</span>
            </div>
          </div>
        </div>

        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <div>
              <h2 style={styles.cardTitle}>📋 Customer List</h2>

              <p style={styles.cardSubtitle}>
                View and manage all saved customers.
              </p>
            </div>

            <button
              onClick={fetchCustomers}
              disabled={customerLoading}
              style={{
                ...styles.refreshButton,
                opacity: customerLoading ? 0.7 : 1,
              }}
            >
              {customerLoading
                ? "Loading..."
                : "🔄 Refresh"}
            </button>
          </div>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search by name, email, phone, company or address..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              style={styles.searchInput}
            />

            {searchText && (
              <button
                onClick={() => setSearchText("")}
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

          {customerLoading && customers.length === 0 && (
            <div style={styles.emptyState}>
              Loading customers...
            </div>
          )}

          {!customerLoading &&
            filteredCustomers.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>👤</div>

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
                    <th style={styles.tableHeader}>Customer</th>
                    <th style={styles.tableHeader}>Contact</th>
                    <th style={styles.tableHeader}>Company</th>
                    <th style={styles.tableHeader}>Address</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td style={styles.tableCell}>
                        <div style={styles.customerProfile}>
                          <div style={styles.avatar}>
                            {customer.name
                              ? customer.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "C"}
                          </div>

                          <div>
                            <div style={styles.customerName}>
                              {customer.name}
                            </div>

                            <div style={styles.customerId}>
                              Customer #{customer.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        <div style={styles.contactText}>
                          📧 {customer.email}
                        </div>

                        <div style={styles.contactText}>
                          📞 {customer.phone}
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        {customer.companyName || "-"}
                      </td>

                      <td style={styles.tableCell}>
                        <div style={styles.addressText}>
                          {customer.address || "-"}
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() =>
                              editCustomer(customer)
                            }
                            style={styles.editButton}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteCustomer(customer)
                            }
                            style={styles.deleteButton}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

  customerCount: {
    minWidth: "150px",
    padding: "18px 24px",
    borderRadius: "16px",
    background: "#2563eb",
    color: "#ffffff",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
  },

  customerCountNumber: {
    display: "block",
    fontSize: "30px",
    fontWeight: "bold",
  },

  customerCountText: {
    display: "block",
    marginTop: "4px",
    fontSize: "13px",
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
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  infoCard: {
    padding: "30px",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg, #0f172a, #1e293b)",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
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
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },

  infoItemIcon: {
    fontSize: "18px",
  },

  listCard: {
    marginTop: "25px",
    padding: "28px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
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