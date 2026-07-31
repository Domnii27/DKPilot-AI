import { useEffect, useState } from "react";
import axios from "axios";
import { downloadInvoicePDF } from "../utils/InvoicePDF";

function Invoice() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [gstPercentage, setGstPercentage] = useState("");
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [aiInvoicePrompt, setAiInvoicePrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const numericAmount = Number(amount) || 0;
  const numericGst = Number(gstPercentage) || 0;

  const gstAmount = (numericAmount * numericGst) / 100;
  const totalAmount = numericAmount + gstAmount;

  const getToken = () => {
    return localStorage.getItem("token");
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

      answer = answer
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const aiResult = JSON.parse(answer);

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

  const fetchInvoiceHistory = async () => {
    const token = getToken();

    if (!token) {
      setMessage("Please login again");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:8081/api/invoices/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInvoiceHistory(response.data);
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
    }
  };

  useEffect(() => {
    fetchInvoiceHistory();
  }, []);

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

      setClientName("");
      setClientEmail("");
      setItemDescription("");
      setAmount("");
      setGstPercentage("");
      setAiInvoicePrompt("");

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

  const formatAmount = (value) => {
    return Number(value || 0).toFixed(2);
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            📄 AI Invoice Generator
          </h1>

          <p style={styles.subtitle}>
            Create invoices and automatically calculate GST.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={fetchInvoiceHistory}
        >
          🔄 Refresh History
        </button>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create Invoice</h2>

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
            onChange={(event) =>
              setClientName(event.target.value)
            }
          />

          <label style={styles.label}>Client Email</label>

          <input
            style={styles.input}
            type="email"
            placeholder="Enter client email"
            value={clientEmail}
            onChange={(event) =>
              setClientEmail(event.target.value)
            }
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
              <strong>₹{formatAmount(gstAmount)}</strong>
            </div>

            <div style={styles.totalRow}>
              <span>Total Amount</span>
              <strong>
                ₹{formatAmount(totalAmount)}
              </strong>
            </div>
          </div>

          {message && (
            <p style={styles.message}>{message}</p>
          )}

          <button
            style={{
              ...styles.createButton,
              opacity: loading ? 0.7 : 1,
            }}
            onClick={createInvoice}
            disabled={loading}
          >
            {loading
              ? "Creating Invoice..."
              : "Generate Invoice"}
          </button>
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
              <strong>₹{formatAmount(gstAmount)}</strong>
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
        <h2 style={styles.cardTitle}>
          Invoice History
        </h2>

        {invoiceHistory.length === 0 ? (
          <p style={styles.emptyText}>
            No invoices created yet.
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
                {invoiceHistory.map((invoice) => (
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
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
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

  cardTitle: {
    marginTop: 0,
    marginBottom: "20px",
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
    cursor: "pointer",
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
    gridTemplateColumns: "1fr 1fr",
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

  createButton: {
    width: "100%",
    marginTop: "15px",
    padding: "13px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
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

  message: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 0,
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
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
    color: "#6b7280",
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
    marginTop: "0",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#111827",
    color: "#ffffff",
    cursor: "pointer",
  },
};

export default Invoice;