import { useEffect, useState } from "react";
import axios from "axios";

function Email() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [emailHistory, setEmailHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [selectedEmail, setSelectedEmail] = useState(null);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadEmailHistory = async () => {
    const token = getToken();

    if (!token) {
      setHistoryError("Please login again.");
      return;
    }

    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await axios.get(
        "http://localhost:8081/api/email/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setEmailHistory(response.data);
      } else {
        setEmailHistory([]);
      }
    } catch (error) {
      console.error("Email history error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setHistoryError("Session expired. Please login again.");
      } else {
        setHistoryError(
          "Unable to load email history. Please check backend."
        );
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadEmailHistory();
  }, []);

  const generateEmail = async () => {
    if (!prompt.trim()) {
      alert("Please enter your email requirement");
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Please login again");
      return;
    }

    setLoading(true);
    setGeneratedEmail("");

    try {
      const aiPrompt = `
Write a professional email.

Recipient email: ${to || "Not provided"}
Subject: ${subject || "Create a suitable subject"}
Requirement: ${prompt}

Return only the complete professional email content.
Include a suitable subject line, greeting, body, closing, and sender name as Sanjay.
`;

      const response = await axios.post(
        "http://localhost:8081/api/ai/chat",
        {
          message: aiPrompt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGeneratedEmail(response.data.answer);
    } catch (error) {
      console.error("Email generation error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        alert("Session expired. Please login again.");
      } else {
        alert("Email generation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!to.trim()) {
      alert("Please enter recipient email");
      return;
    }

    if (!subject.trim()) {
      alert("Please enter email subject");
      return;
    }

    if (!generatedEmail.trim()) {
      alert("Please generate the email first");
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Please login again");
      return;
    }

    setSending(true);

    try {
      const response = await axios.post(
        "http://localhost:8081/api/email/send",
        {
          to,
          subject,
          body: generatedEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data || "Email Sent Successfully");

      await loadEmailHistory();
    } catch (error) {
      console.error("Email sending error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        alert("Session expired. Please login again.");
      } else {
        alert("Email sending failed. Please check backend terminal.");
      }
    } finally {
      setSending(false);
    }
  };

  const copyEmail = async () => {
    if (!generatedEmail) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedEmail);
      alert("Email copied successfully");
    } catch (error) {
      console.error("Copy error:", error);
      alert("Unable to copy email");
    }
  };

  const clearForm = () => {
    setTo("");
    setSubject("");
    setPrompt("");
    setGeneratedEmail("");
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "No date";
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

  const getContentPreview = (content) => {
    if (!content) {
      return "No content";
    }

    const cleanedContent = content.replace(/\s+/g, " ").trim();

    if (cleanedContent.length <= 100) {
      return cleanedContent;
    }

    return `${cleanedContent.substring(0, 100)}...`;
  };

  const openEmailModal = (email) => {
    setSelectedEmail(email);
  };

  const closeEmailModal = () => {
    setSelectedEmail(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "40px 20px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              color: "#0f172a",
            }}
          >
            📧 AI Email Generator
          </h1>

          <p
            style={{
              color: "#64748b",
              marginBottom: "25px",
            }}
          >
            Enter the email details and let DKPilot AI generate a professional
            email for you.
          </p>

          <label style={labelStyle}>Recipient Email</label>

          <input
            type="email"
            placeholder="example@gmail.com"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Subject</label>

          <input
            type="text"
            placeholder="Enter subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Email Requirement</label>

          <textarea
            rows="7"
            placeholder="Example: Write a professional leave email for tomorrow due to fever."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            style={{
              ...inputStyle,
              resize: "vertical",
              marginBottom: "22px",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={generateEmail}
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                background: loading ? "#94a3b8" : "#2563eb",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Generating..." : "✨ Generate Email"}
            </button>

            <button
              onClick={clearForm}
              disabled={loading || sending}
              style={{
                padding: "13px 28px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "white",
                color: "#334155",
                fontSize: "16px",
                cursor:
                  loading || sending ? "not-allowed" : "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {generatedEmail && (
          <div style={cardStyle}>
            <h2
              style={{
                marginTop: 0,
                color: "#0f172a",
              }}
            >
              Generated Email
            </h2>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                whiteSpace: "pre-wrap",
                lineHeight: "1.7",
                color: "#1e293b",
              }}
            >
              {generatedEmail}
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={copyEmail}
                style={{
                  ...smallButtonStyle,
                  background: "#0f172a",
                }}
              >
                📋 Copy Email
              </button>

              <button
                onClick={sendEmail}
                disabled={sending}
                style={{
                  ...smallButtonStyle,
                  background: sending ? "#94a3b8" : "#16a34a",
                  cursor: sending ? "not-allowed" : "pointer",
                }}
              >
                {sending ? "Sending..." : "📤 Send Email"}
              </button>
            </div>
          </div>
        )}

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "22px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#0f172a",
                }}
              >
                📜 Email History
              </h2>

              <p
                style={{
                  color: "#64748b",
                  marginBottom: 0,
                }}
              >
                View emails successfully sent using DKPilot AI.
              </p>
            </div>

            <button
              onClick={loadEmailHistory}
              disabled={historyLoading}
              style={{
                ...smallButtonStyle,
                background: historyLoading ? "#94a3b8" : "#2563eb",
                cursor: historyLoading ? "not-allowed" : "pointer",
              }}
            >
              {historyLoading ? "Loading..." : "🔄 Refresh History"}
            </button>
          </div>

          {historyError && (
            <div
              style={{
                padding: "14px",
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              {historyError}
            </div>
          )}

          {historyLoading && emailHistory.length === 0 && (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading email history...
            </div>
          )}

          {!historyLoading &&
            !historyError &&
            emailHistory.length === 0 && (
              <div
                style={{
                  padding: "35px",
                  textAlign: "center",
                  background: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "12px",
                  color: "#64748b",
                }}
              >
                No emails sent yet.
              </div>
            )}

          {emailHistory.length > 0 && (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "850px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f1f5f9",
                    }}
                  >
                    <th style={tableHeaderStyle}>Recipient</th>
                    <th style={tableHeaderStyle}>Subject</th>
                    <th style={tableHeaderStyle}>Preview</th>
                    <th style={tableHeaderStyle}>Sent Date</th>
                    <th style={tableHeaderStyle}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {emailHistory.map((email) => (
                    <tr
                      key={email.id}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <td style={tableCellStyle}>{email.toEmail}</td>

                      <td style={tableCellStyle}>{email.subject}</td>

                      <td
                        style={{
                          ...tableCellStyle,
                          maxWidth: "300px",
                          lineHeight: "1.5",
                        }}
                      >
                        {getContentPreview(email.content)}
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(email.sentDate)}
                      </td>

                      <td style={tableCellStyle}>
                        <button
                          onClick={() => openEmailModal(email)}
                          style={{
                            padding: "9px 16px",
                            border: "none",
                            borderRadius: "8px",
                            background: "#0f172a",
                            color: "white",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          👁 View Email
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedEmail && (
        <div
          onClick={closeEmailModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "750px",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "18px",
              padding: "30px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#0f172a",
                }}
              >
                📧 Email Details
              </h2>

              <button
                onClick={closeEmailModal}
                style={{
                  width: "38px",
                  height: "38px",
                  border: "none",
                  borderRadius: "50%",
                  background: "#e2e8f0",
                  color: "#0f172a",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={detailBoxStyle}>
              <strong>Recipient</strong>
              <p style={detailTextStyle}>{selectedEmail.toEmail}</p>
            </div>

            <div style={detailBoxStyle}>
              <strong>Subject</strong>
              <p style={detailTextStyle}>{selectedEmail.subject}</p>
            </div>

            <div style={detailBoxStyle}>
              <strong>Sent Date</strong>
              <p style={detailTextStyle}>
                {formatDate(selectedEmail.sentDate)}
              </p>
            </div>

            <div style={detailBoxStyle}>
              <strong>Email Content</strong>

              <div
                style={{
                  marginTop: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "18px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.7",
                  color: "#334155",
                }}
              >
                {selectedEmail.content}
              </div>
            </div>

            <button
              onClick={closeEmailModal}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "10px",
                background: "#2563eb",
                color: "white",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "bold",
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  padding: "13px",
  marginBottom: "18px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  fontSize: "16px",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  padding: "13px 28px",
  border: "none",
  borderRadius: "10px",
  color: "white",
  fontSize: "16px",
};

const smallButtonStyle = {
  padding: "11px 22px",
  border: "none",
  borderRadius: "10px",
  color: "white",
  fontSize: "15px",
  cursor: "pointer",
};

const cardStyle = {
  marginTop: "25px",
  background: "white",
  padding: "30px",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const tableHeaderStyle = {
  textAlign: "left",
  padding: "15px",
  color: "#334155",
  fontSize: "14px",
  borderBottom: "1px solid #cbd5e1",
};

const tableCellStyle = {
  padding: "15px",
  color: "#475569",
  fontSize: "14px",
  verticalAlign: "top",
};

const detailBoxStyle = {
  marginBottom: "18px",
  color: "#0f172a",
};

const detailTextStyle = {
  marginTop: "7px",
  marginBottom: 0,
  color: "#475569",
};

export default Email;