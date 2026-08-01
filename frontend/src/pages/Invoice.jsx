import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { downloadInvoicePDF } from "../utils/InvoicePDF";

function Invoice() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [gstPercentage, setGstPercentage] = useState("");

  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [aiInvoicePrompt, setAiInvoicePrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const numericAmount = Number(amount) || 0;
  const numericGst = Number(gstPercentage) || 0;

  const gstAmount = (numericAmount * numericGst) / 100;
  const totalAmount = numericAmount + gstAmount;

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getAuthHeaders = () => {
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

      const response = await axios.get(
        "http://localhost:8081/api/customers",
        {
          headers: getAuthHeaders(),
        }
      );

      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Customer loading error:", error);
      setCustomers([]);
      setMessage("Customers load panna mudiyala");
    } finally {
      setCustomerLoading(false);
    }
  };

  const fetchInvoiceHistory = async () => {
    const token = getToken();

    if (!token) {
      setMessage("Please login again");
      return;
    }

    try {
      setHistoryLoading(true);

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
      console.error("Invoice history error:", error);

      if (error.response?.status === 401) {
        setMessage("Login expired. Please login again");
      } else if (error.response?.status === 403) {
        setMessage(
          "You are not authorized to view invoice history"
        );
      } else {
        setMessage("Failed to load invoice history");
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchInvoiceHistory();
  }, []);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) {
      return null;
    }

    return customers.find(
      (customer) =>
        String(customer.id) === String(selectedCustomerId)
    );
  }, [customers, selectedCustomerId]);

  const filteredInvoices = useMemo(() => {
    if (!selectedCustomer) {
      return invoiceHistory;
    }

    return invoiceHistory.filter((invoice) => {
      const invoiceEmail = String(
        invoice.clientEmail || ""
      )
        .trim()
        .toLowerCase();

      const customerEmail = String(
        selectedCustomer.email || ""
      )
        .trim()
        .toLowerCase();

      return invoiceEmail === customerEmail;
    });
  }, [invoiceHistory, selectedCustomer]);

  const handleCustomerSelection = (event) => {
    const customerId = event.target.value;

    setSelectedCustomerId(customerId);
    setMessage("");

    if (!customerId) {
      setClientName("");
      setClientEmail("");
      return;
    }

    const customer = customers.find(
      (item) => String(item.id) === String(customerId)
    );

    if (customer) {
      setClientName(customer.name || "");
      setClientEmail(customer.email || "");

      setMessage(
        `${customer.name} customer details selected successfully`
      );
    }
  };

  const generateInvoiceWithAI = async () => {
    if (!aiInvoicePrompt.trim()) {
      alert("Please enter an invoice prompt");
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Please login again");
      return;
    }

    try {
      setAiLoading(true);
      setMessage("");

      const response = await axios.post(
        "http://localhost:8081/api/ai/invoice",
        {
          message: aiInvoicePrompt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let answer = response.data.answer;

      if (typeof answer !== "string") {
        throw new Error("Invalid AI response");
      }

      answer = answer
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const aiResult = JSON.parse(answer);

      setSelectedCustomerId("");
      setClientName(aiResult.clientName || "");
      setClientEmail(aiResult.clientEmail || "");
      setItemDescription(aiResult.itemDescription || "");

      setAmount(
        aiResult.amount !== undefined &&
          aiResult.amount !== null
          ? String(aiResult.amount)
          : ""
      );

      setGstPercentage(
        aiResult.gstPercentage !== undefined &&
          aiResult.gstPercentage !== null
          ? String(aiResult.gstPercentage)
          : ""
      );

      setMessage("AI filled the invoice successfully");
    } catch (error) {
      console.error("AI invoice error:", error);

      if (error.response?.status === 401) {
        setMessage("Login expired. Please login again");
      } else if (error.response?.status === 403) {
        setMessage("You are not authorized to use AI invoice");
      } else {
        setMessage("AI failed to generate invoice");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const createInvoice = async () => {
    if (
      !clientName.trim() ||
      !clientEmail.trim() ||
      !itemDescription.trim() ||
      amount === "" ||
      gstPercentage === ""
    ) {
      setMessage("Please fill all invoice fields");
      return;
    }

    if (!clientEmail.includes("@")) {
      setMessage("Please enter a valid client email");
      return;
    }

    if (numericAmount <= 0) {
      setMessage("Amount must be greater than 0");
      return;
    }

    if (numericGst < 0) {
      setMessage("GST percentage cannot be negative");
      return;
    }

    const token = getToken();

    if (!token) {
      setMessage("Please login again");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        "http://localhost:8081/api/invoices",
        {
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          itemDescription: itemDescription.trim(),
          amount: numericAmount,
          gstPercentage: numericGst,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Invoice created successfully");
      setSelectedInvoice(response.data);

      setItemDescription("");
      setAmount("");
      setGstPercentage("");
      setAiInvoicePrompt("");

      if (!selectedCustomerId) {
        setClientName("");
        setClientEmail("");
      }

      await fetchInvoiceHistory();
    } catch (error) {
      console.error("Invoice creation error:", error);

      if (error.response?.status === 401) {
        setMessage("Login expired. Please login again");
      } else if (error.response?.status === 403) {
        setMessage(
          "You are not authorized to create invoice"
        );
      } else if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Failed to create invoice");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetInvoiceForm = () => {
    setSelectedCustomerId("");
    setClientName("");
    setClientEmail("");
    setItemDescription("");
    setAmount("");
    setGstPercentage("");
    setAiInvoicePrompt("");
    setMessage("");
  };

  const formatAmount = (value) => {
    return Number(value || 0).toFixed(2);
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN");
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            📄 AI Invoice Generator
          </h1>

          <p style={styles.subtitle}>
            Select a customer or use AI to create a professional
            invoice.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={async () => {
            await fetchCustomers();
            await fetchInvoiceHistory();
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create Invoice</h2>

          <div style={styles.customerBox}>
            <label style={styles.customerLabel}>
              👥 Select Saved Customer
            </label>

            <select
              value={selectedCustomerId}
              onChange={handleCustomerSelection}
              disabled={customerLoading}
              style={styles.select}
            >
              <option value="">
                {customerLoading
                  ? "Loading customers..."
                  : "All Customers / Manual Entry"}
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={String(customer.id)}
                >
                  {customer.name}
                  {customer.companyName
                    ? ` - ${customer.companyName}`
                    : ""}
                </option>
              ))}
            </select>

            <p style={styles.customerHelpText}>
              Customer select pannina name, email auto fill
              aagum; history-um andha customer-ku filter aagum.
            </p>
          </div>

          <div style={styles.orDivider}>
            <span style={styles.orLine}></span>
            <span style={styles.orText}>OR</span>
            <span style={styles.orLine}></span>
          </div>

          <div style={styles.aiBox}>
            <label style={styles.aiLabel}>
              🤖 Describe Invoice
            </label>

            <textarea
              style={styles.aiTextarea}
              placeholder="Example: Create invoice for ABC Technologies, email abc@gmail.com, website development worth 50000 with 18% GST"
              value={aiInvoicePrompt}
              onChange={(event) =>
                setAiInvoicePrompt(event.target.value)
              }
            />

            <button
              style={{
                ...styles.aiButton,
                opacity: aiLoading ? 0.7 : 1,
                cursor: aiLoading
                  ? "not-allowed"
                  : "pointer",
              }}
              onClick={generateInvoiceWithAI}
              disabled={aiLoading}
            >
              {aiLoading
                ? "AI is filling..."
                : "✨ Auto Fill with AI"}
            </button>
          </div>

          <label style={styles.label}>Client Name</label>

          <input
            style={styles.input}
            type="text"
            placeholder="Enter client name"
            value={clientName}
            onChange={(event) => {
              setClientName(event.target.value);
              setSelectedCustomerId("");
            }}
          />

          <label style={styles.label}>Client Email</label>

          <input
            style={styles.input}
            type="email"
            placeholder="Enter client email"
            value={clientEmail}
            onChange={(event) => {
              setClientEmail(event.target.value);
              setSelectedCustomerId("");
            }}
          />

          <label style={styles.label}>
            Item Description
          </label>

          <textarea
            style={styles.textarea}
            placeholder="Enter product or service details"
            value={itemDescription}
            onChange={(event) =>
              setItemDescription(event.target.value)
            }
          />

          <div style={styles.twoColumn}>
            <div>
              <label style={styles.label}>Amount</label>

              <input
                style={styles.input}
                type="number"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
              />
            </div>

            <div>
              <label style={styles.label}>
                GST Percentage
              </label>

              <input
                style={styles.input}
                type="number"
                min="0"
                placeholder="Example: 18"
                value={gstPercentage}
                onChange={(event) =>
                  setGstPercentage(event.target.value)
                }
              />
            </div>
          </div>

          <div style={styles.calculationBox}>
            <div style={styles.calculationRow}>
              <span>Base Amount</span>
              <strong>
                ₹{formatAmount(numericAmount)}
              </strong>
            </div>

            <div style={styles.calculationRow}>
              <span>GST Amount</span>
              <strong>
                ₹{formatAmount(gstAmount)}
              </strong>
            </div>

            <div style={styles.totalRow}>
              <span>Total Amount</span>
              <strong>
                ₹{formatAmount(totalAmount)}
              </strong>
            </div>
          </div>

          {message && (
            <div style={styles.message}>{message}</div>
          )}

          <div style={styles.formButtonRow}>
            <button
              style={{
                ...styles.createButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
              onClick={createInvoice}
              disabled={loading}
            >
              {loading
                ? "Creating Invoice..."
                : "Generate Invoice"}
            </button>

            <button
              style={styles.clearButton}
              onClick={resetInvoiceForm}
              disabled={loading || aiLoading}
            >
              Clear
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            Invoice Preview
          </h2>

          <div style={styles.previewBox}>
            <h2 style={styles.invoiceLogo}>
              DKPilot AI
            </h2>

            <p style={styles.previewMuted}>
              Professional Invoice
            </p>

            <hr style={styles.divider} />

            <p>
              <strong>Client:</strong>{" "}
              {clientName || "Client Name"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {clientEmail || "client@email.com"}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {itemDescription ||
                "Item description will appear here"}
            </p>

            <hr style={styles.divider} />

            <div style={styles.calculationRow}>
              <span>Amount</span>
              <strong>
                ₹{formatAmount(numericAmount)}
              </strong>
            </div>

            <div style={styles.calculationRow}>
              <span>GST ({numericGst}%)</span>
              <strong>
                ₹{formatAmount(gstAmount)}
              </strong>
            </div>

            <div style={styles.totalRow}>
              <span>Total</span>
              <strong>
                ₹{formatAmount(totalAmount)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.historyCard}>
        <div style={styles.historyHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              Invoice History
            </h2>

            <p style={styles.historySubtitle}>
              {selectedCustomer
                ? `Showing invoices for ${selectedCustomer.name}`
                : "Showing invoices for all customers"}
            </p>
          </div>

          <div style={styles.invoiceCount}>
            {filteredInvoices.length} Invoice
            {filteredInvoices.length === 1 ? "" : "s"}
          </div>
        </div>

        {historyLoading ? (
          <p style={styles.emptyText}>
            Loading invoice history...
          </p>
        ) : filteredInvoices.length === 0 ? (
          <p style={styles.emptyText}>
            {selectedCustomer
              ? "No invoices found for this customer."
              : "No invoices created yet."}
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Client</th>
                  <th style={styles.tableHeader}>Email</th>
                  <th style={styles.tableHeader}>Amount</th>
                  <th style={styles.tableHeader}>GST</th>
                  <th style={styles.tableHeader}>Total</th>
                  <th style={styles.tableHeader}>Date</th>
                  <th style={styles.tableHeader}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={styles.tableCell}>
                      {invoice.clientName}
                    </td>

                    <td style={styles.tableCell}>
                      {invoice.clientEmail}
                    </td>

                    <td style={styles.tableCell}>
                      ₹{formatAmount(invoice.amount)}
                    </td>

                    <td style={styles.tableCell}>
                      {invoice.gstPercentage}% / ₹
                      {formatAmount(invoice.gstAmount)}
                    </td>

                    <td style={styles.tableCell}>
                      ₹{formatAmount(invoice.totalAmount)}
                    </td>

                    <td style={styles.tableCell}>
                      {formatDate(invoice.createdDate)}
                    </td>

                    <td style={styles.tableCell}>
                      <button
                        style={styles.viewButton}
                        onClick={() =>
                          setSelectedInvoice(invoice)
                        }
                      >
                        👁 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInvoice && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            style={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.cardTitle}>
                Invoice Details
              </h2>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setSelectedInvoice(null)
                }
              >
                ✕
              </button>
            </div>

            <div style={styles.modalInvoice}>
              <h2 style={styles.invoiceLogo}>
                DKPilot AI
              </h2>

              <p style={styles.previewMuted}>
                Invoice #{selectedInvoice.id}
              </p>

              <hr style={styles.divider} />

              <p>
                <strong>Client Name:</strong>{" "}
                {selectedInvoice.clientName}
              </p>

              <p>
                <strong>Client Email:</strong>{" "}
                {selectedInvoice.clientEmail}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {selectedInvoice.itemDescription}
              </p>

              <p>
                <strong>Created Date:</strong>{" "}
                {formatDate(selectedInvoice.createdDate)}
              </p>

              <hr style={styles.divider} />

              <div style={styles.calculationRow}>
                <span>Amount</span>
                <strong>
                  ₹{formatAmount(selectedInvoice.amount)}
                </strong>
              </div>

              <div style={styles.calculationRow}>
                <span>
                  GST ({selectedInvoice.gstPercentage}%)
                </span>
                <strong>
                  ₹
                  {formatAmount(
                    selectedInvoice.gstAmount
                  )}
                </strong>
              </div>

              <div style={styles.totalRow}>
                <span>Total Amount</span>
                <strong>
                  ₹
                  {formatAmount(
                    selectedInvoice.totalAmount
                  )}
                </strong>
              </div>
            </div>

            <div style={styles.modalButtonRow}>
              <button
                style={styles.downloadButton}
                onClick={() =>
                  downloadInvoicePDF(selectedInvoice)
                }
              >
                ⬇ Download PDF
              </button>

              <button
                style={styles.modalCloseButton}
                onClick={() =>
                  setSelectedInvoice(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "#f5f7fb",
    color: "#1f2937",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow:
      "0 8px 24px rgba(0, 0, 0, 0.08)",
  },

  historyCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    marginTop: "24px",
    boxShadow:
      "0 8px 24px rgba(0, 0, 0, 0.08)",
  },

  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  historySubtitle: {
    margin: "7px 0 0",
    color: "#6b7280",
  },

  invoiceCount: {
    padding: "10px 16px",
    borderRadius: "10px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "bold",
  },

  cardTitle: {
    marginTop: 0,
    marginBottom: "20px",
  },

  customerBox: {
    padding: "16px",
    marginBottom: "18px",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    background: "#eff6ff",
  },

  customerLabel: {
    display: "block",
    marginBottom: "9px",
    color: "#1e40af",
    fontWeight: "bold",
  },

  select: {
    width: "100%",
    padding: "13px",
    boxSizing: "border-box",
    border: "1px solid #93c5fd",
    borderRadius: "9px",
    background: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
  },

  customerHelpText: {
    marginBottom: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  orDivider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "18px 0",
  },

  orLine: {
    flex: 1,
    height: "1px",
    background: "#d1d5db",
  },

  orText: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "bold",
  },

  aiBox: {
    padding: "16px",
    marginBottom: "20px",
    borderRadius: "12px",
    border: "1px solid #c7d2fe",
    background: "#eef2ff",
  },

  aiLabel: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#3730a3",
  },

  aiTextarea: {
    width: "100%",
    minHeight: "90px",
    padding: "12px",
    boxSizing: "border-box",
    borderRadius: "8px",
    border: "1px solid #a5b4fc",
    resize: "vertical",
    fontSize: "15px",
  },

  aiButton: {
    width: "100%",
    marginTop: "10px",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#7c3aed",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "bold",
  },

  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "7px",
    marginTop: "15px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "100px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    resize: "vertical",
    fontSize: "15px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
  },

  calculationBox: {
    marginTop: "20px",
    padding: "18px",
    borderRadius: "12px",
    background: "#f3f4f6",
  },

  calculationRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "8px 0",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginTop: "8px",
    paddingTop: "14px",
    borderTop: "1px solid #d1d5db",
    fontSize: "18px",
  },

  message: {
    padding: "12px",
    marginTop: "15px",
    borderRadius: "8px",
    background: "#f0fdf4",
    color: "#166534",
    textAlign: "center",
    fontWeight: "bold",
  },

  formButtonRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "12px",
    marginTop: "15px",
  },

  createButton: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
  },

  clearButton: {
    padding: "13px 24px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#334155",
    fontSize: "15px",
    cursor: "pointer",
  },

  refreshButton: {
    padding: "11px 16px",
    border: "none",
    borderRadius: "9px",
    background: "#111827",
    color: "#ffffff",
    cursor: "pointer",
  },

  previewBox: {
    padding: "25px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    background: "#fafafa",
  },

  invoiceLogo: {
    marginBottom: "4px",
    color: "#2563eb",
  },

  previewMuted: {
    color: "#6b7280",
    marginTop: 0,
  },

  divider: {
    border: "none",
    borderTop: "1px solid #d1d5db",
    margin: "20px 0",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "850px",
    borderCollapse: "collapse",
  },

  tableHeader: {
    padding: "13px",
    textAlign: "left",
    borderBottom: "2px solid #e5e7eb",
    background: "#f9fafb",
  },

  tableCell: {
    padding: "13px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },

  viewButton: {
    padding: "7px 11px",
    border: "none",
    borderRadius: "7px",
    background: "#e0e7ff",
    cursor: "pointer",
  },

  emptyText: {
    padding: "25px",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#6b7280",
    textAlign: "center",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "620px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "22px",
    cursor: "pointer",
  },

  modalInvoice: {
    padding: "22px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    background: "#fafafa",
  },

  modalButtonRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "18px",
  },

  downloadButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  modalCloseButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#111827",
    color: "#ffffff",
    cursor: "pointer",
  },
};

export default Invoice;