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

const EMAIL_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#16a34a",
  "#ea580c",
];

function Email() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [emailHistory, setEmailHistory] =
    useState([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [historyError, setHistoryError] =
    useState("");

  const [selectedEmail, setSelectedEmail] =
    useState(null);

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
      console.error(
        "Email history error:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setHistoryError(
          "Session expired. Please login again."
        );
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
      alert(
        "Please enter your email requirement"
      );
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

      setGeneratedEmail(
        response.data.answer || ""
      );
    } catch (error) {
      console.error(
        "Email generation error:",
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
          "Email generation failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!to.trim()) {
      alert(
        "Please enter recipient email"
      );
      return;
    }

    if (!subject.trim()) {
      alert(
        "Please enter email subject"
      );
      return;
    }

    if (!generatedEmail.trim()) {
      alert(
        "Please generate the email first"
      );
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

      alert(
        response.data ||
          "Email Sent Successfully"
      );

      await loadEmailHistory();
    } catch (error) {
      console.error(
        "Email sending error:",
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
          "Email sending failed. Please check backend terminal."
        );
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
      await navigator.clipboard.writeText(
        generatedEmail
      );

      alert(
        "Email copied successfully"
      );
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

    const cleanedContent = content
      .replace(/\s+/g, " ")
      .trim();

    if (cleanedContent.length <= 100) {
      return cleanedContent;
    }

    return `${cleanedContent.substring(
      0,
      100
    )}...`;
  };

  const openEmailModal = (email) => {
    setSelectedEmail(email);
  };

  const closeEmailModal = () => {
    setSelectedEmail(null);
  };

  const emailAnalytics = useMemo(() => {
    const totalEmails = emailHistory.length;

    const today = new Date();

    const todayString =
      today.toDateString();

    const emailsSentToday =
      emailHistory.filter((email) => {
        if (!email.sentDate) {
          return false;
        }

        const sentDate = new Date(
          email.sentDate
        );

        if (
          Number.isNaN(
            sentDate.getTime()
          )
        ) {
          return false;
        }

        return (
          sentDate.toDateString() ===
          todayString
        );
      }).length;

    const recipientMap = {};
    const subjectMap = {};
    const dailyMap = {};

    emailHistory.forEach((email) => {
      const recipient = String(
        email.toEmail || "Unknown"
      )
        .trim()
        .toLowerCase();

      const subjectValue = String(
        email.subject || "No Subject"
      ).trim();

      if (!recipientMap[recipient]) {
        recipientMap[recipient] = {
          email:
            email.toEmail || "Unknown",
          count: 0,
        };
      }

      recipientMap[recipient].count += 1;

      if (!subjectMap[subjectValue]) {
        subjectMap[subjectValue] = 0;
      }

      subjectMap[subjectValue] += 1;

      if (email.sentDate) {
        const date = new Date(
          email.sentDate
        );

        if (
          !Number.isNaN(
            date.getTime()
          )
        ) {
          const dayKey =
            date.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
              }
            );

          if (!dailyMap[dayKey]) {
            dailyMap[dayKey] = 0;
          }

          dailyMap[dayKey] += 1;
        }
      }
    });

    const recipientList =
      Object.values(recipientMap).sort(
        (first, second) =>
          second.count - first.count
      );

    const subjectList =
      Object.entries(subjectMap).sort(
        (first, second) =>
          second[1] - first[1]
      );

    const topRecipient =
      recipientList.length > 0
        ? recipientList[0]
        : null;

    const mostUsedSubject =
      subjectList.length > 0
        ? {
            subject: subjectList[0][0],
            count: subjectList[0][1],
          }
        : null;

    const uniqueRecipients =
      recipientList.length;

    const recipientPieData =
      recipientList
        .slice(0, 5)
        .map((recipient) => ({
          name: recipient.email,
          value: recipient.count,
        }));

    const dailyEmailData =
      Object.entries(dailyMap)
        .map(([day, count]) => ({
          day,
          count,
        }))
        .slice(-7);

    return {
      totalEmails,
      emailsSentToday,
      uniqueRecipients,
      topRecipient,
      mostUsedSubject,
      recipientPieData,
      dailyEmailData,
    };
  }, [emailHistory]);

  return (
        <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              📧 AI Email Generator
            </h1>

            <p style={styles.subtitle}>
              Generate professional emails, send them and track email analytics.
            </p>
          </div>

          <button
            onClick={loadEmailHistory}
            disabled={historyLoading}
            style={{
              ...styles.headerRefreshButton,
              opacity: historyLoading ? 0.7 : 1,
              cursor: historyLoading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {historyLoading
              ? "Loading..."
              : "🔄 Refresh Data"}
          </button>
        </div>

        <div style={styles.analyticsHeader}>
          <div>
            <h2 style={styles.analyticsTitle}>
              📊 Email Analytics
            </h2>

            <p style={styles.analyticsSubtitle}>
              Live email performance calculated from sent email history.
            </p>
          </div>
        </div>

        <div style={styles.analyticsGrid}>
          <div
            style={{
              ...styles.analyticsCard,
              ...styles.totalEmailsCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              📧
            </div>

            <div>
              <span style={styles.analyticsLabel}>
                Total Emails Sent
              </span>

              <strong style={styles.analyticsValue}>
                {historyLoading
                  ? "..."
                  : emailAnalytics.totalEmails}
              </strong>

              <span style={styles.analyticsNote}>
                All successfully sent emails
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.todayEmailsCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              📅
            </div>

            <div>
              <span style={styles.analyticsLabel}>
                Emails Sent Today
              </span>

              <strong style={styles.analyticsValue}>
                {historyLoading
                  ? "..."
                  : emailAnalytics.emailsSentToday}
              </strong>

              <span style={styles.analyticsNote}>
                Emails sent on the current date
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.uniqueRecipientsCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              👥
            </div>

            <div>
              <span style={styles.analyticsLabel}>
                Unique Recipients
              </span>

              <strong style={styles.analyticsValue}>
                {historyLoading
                  ? "..."
                  : emailAnalytics.uniqueRecipients}
              </strong>

              <span style={styles.analyticsNote}>
                Different recipient addresses
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.topRecipientCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              🏆
            </div>

            <div style={styles.analyticsContent}>
              <span style={styles.analyticsLabel}>
                Top Recipient
              </span>

              <strong style={styles.topRecipientValue}>
                {historyLoading
                  ? "..."
                  : emailAnalytics.topRecipient?.email ||
                    "No recipient data"}
              </strong>

              <span style={styles.analyticsNote}>
                {emailAnalytics.topRecipient
                  ? `${emailAnalytics.topRecipient.count} email(s)`
                  : "Send emails to see insights"}
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.subjectAnalyticsCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              📝
            </div>

            <div style={styles.analyticsContent}>
              <span style={styles.analyticsLabel}>
                Most Used Subject
              </span>

              <strong style={styles.subjectValue}>
                {historyLoading
                  ? "..."
                  : emailAnalytics.mostUsedSubject?.subject ||
                    "No subject data"}
              </strong>

              <span style={styles.analyticsNote}>
                {emailAnalytics.mostUsedSubject
                  ? `${emailAnalytics.mostUsedSubject.count} time(s)`
                  : "Send emails to see insights"}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.chartSection}>
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div>
                <h2 style={styles.chartTitle}>
                  📈 Daily Email Activity
                </h2>

                <p style={styles.chartSubtitle}>
                  Number of emails sent on recent active dates.
                </p>
              </div>
            </div>

            {historyLoading ? (
              <div style={styles.chartEmpty}>
                Loading daily email chart...
              </div>
            ) : emailAnalytics.dailyEmailData.length === 0 ? (
              <div style={styles.chartEmpty}>
                No email activity data available.
              </div>
            ) : (
              <div style={styles.chartWrapper}>
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <BarChart
                    data={emailAnalytics.dailyEmailData}
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
                      dataKey="day"
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
                        "Emails",
                      ]}
                    />

                    <Bar
                      dataKey="count"
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
                  🥧 Recipient Distribution
                </h2>

                <p style={styles.chartSubtitle}>
                  Email share among the top recipients.
                </p>
              </div>
            </div>

            {historyLoading ? (
              <div style={styles.chartEmpty}>
                Loading recipient distribution...
              </div>
            ) : emailAnalytics.recipientPieData.length === 0 ? (
              <div style={styles.chartEmpty}>
                No recipient data available.
              </div>
            ) : (
              <div style={styles.chartWrapper}>
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <PieChart>
                    <Pie
                      data={emailAnalytics.recipientPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="44%"
                      innerRadius={62}
                      outerRadius={102}
                      paddingAngle={4}
                    >
                      {emailAnalytics.recipientPieData.map(
                        (entry, index) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={
                              EMAIL_COLORS[
                                index %
                                  EMAIL_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        value,
                        "Emails",
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

        <div style={styles.formCard}>
          <h2 style={styles.cardTitle}>
            ✨ Generate Professional Email
          </h2>

          <p style={styles.cardSubtitle}>
            Enter the details and let DKPilot AI write the email.
          </p>

          <label style={styles.label}>
            Recipient Email
          </label>

          <input
            type="email"
            placeholder="example@gmail.com"
            value={to}
            onChange={(event) =>
              setTo(event.target.value)
            }
            style={styles.input}
          />

          <label style={styles.label}>
            Subject
          </label>

          <input
            type="text"
            placeholder="Enter email subject"
            value={subject}
            onChange={(event) =>
              setSubject(event.target.value)
            }
            style={styles.input}
          />

          <label style={styles.label}>
            Email Requirement
          </label>

          <textarea
            rows="7"
            placeholder="Example: Write a professional leave email for tomorrow due to fever."
            value={prompt}
            onChange={(event) =>
              setPrompt(event.target.value)
            }
            style={styles.textarea}
          />

          <div style={styles.formButtonRow}>
            <button
              onClick={generateEmail}
              disabled={loading}
              style={{
                ...styles.generateButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Generating..."
                : "✨ Generate Email"}
            </button>

            <button
              onClick={clearForm}
              disabled={loading || sending}
              style={styles.clearButton}
            >
              Clear
            </button>
          </div>
        </div>

        {generatedEmail && (
          <div style={styles.generatedCard}>
            <h2 style={styles.cardTitle}>
              📄 Generated Email
            </h2>

            <div style={styles.generatedContent}>
              {generatedEmail}
            </div>

            <div style={styles.generatedButtonRow}>
              <button
                onClick={copyEmail}
                style={styles.copyButton}
              >
                📋 Copy Email
              </button>

              <button
                onClick={sendEmail}
                disabled={sending}
                style={{
                  ...styles.sendButton,
                  opacity: sending ? 0.7 : 1,
                  cursor: sending
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {sending
                  ? "Sending..."
                  : "📤 Send Email"}
              </button>
            </div>
          </div>
        )}

        <div style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                📜 Email History
              </h2>

              <p style={styles.cardSubtitle}>
                View emails successfully sent using DKPilot AI.
              </p>
            </div>

            <div style={styles.emailCount}>
              {emailHistory.length} Email
              {emailHistory.length === 1
                ? ""
                : "s"}
            </div>
          </div>

          {historyError && (
            <div style={styles.errorMessage}>
              {historyError}
            </div>
          )}

          {historyLoading &&
            emailHistory.length === 0 && (
              <div style={styles.emptyState}>
                Loading email history...
              </div>
            )}

          {!historyLoading &&
            !historyError &&
            emailHistory.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  📭
                </div>

                <h3 style={styles.emptyTitle}>
                  No emails sent yet
                </h3>

                <p style={styles.emptyText}>
                  Generate and send your first email.
                </p>
              </div>
            )}

          {emailHistory.length > 0 && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>
                      Recipient
                    </th>

                    <th style={styles.tableHeader}>
                      Subject
                    </th>

                    <th style={styles.tableHeader}>
                      Preview
                    </th>

                    <th style={styles.tableHeader}>
                      Sent Date
                    </th>

                    <th style={styles.tableHeader}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {emailHistory.map((email) => (
                    <tr key={email.id}>
                      <td style={styles.tableCell}>
                        {email.toEmail}
                      </td>

                      <td style={styles.tableCell}>
                        {email.subject}
                      </td>

                      <td
                        style={{
                          ...styles.tableCell,
                          maxWidth: "300px",
                          lineHeight: "1.5",
                        }}
                      >
                        {getContentPreview(
                          email.content
                        )}
                      </td>

                      <td
                        style={{
                          ...styles.tableCell,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(
                          email.sentDate
                        )}
                      </td>

                      <td style={styles.tableCell}>
                        <button
                          onClick={() =>
                            openEmailModal(email)
                          }
                          style={styles.viewButton}
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
          style={styles.modalOverlay}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={styles.modal}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.cardTitle}>
                📧 Email Details
              </h2>

              <button
                onClick={closeEmailModal}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div style={styles.detailBox}>
              <strong>Recipient</strong>

              <p style={styles.detailText}>
                {selectedEmail.toEmail}
              </p>
            </div>

            <div style={styles.detailBox}>
              <strong>Subject</strong>

              <p style={styles.detailText}>
                {selectedEmail.subject}
              </p>
            </div>

            <div style={styles.detailBox}>
              <strong>Sent Date</strong>

              <p style={styles.detailText}>
                {formatDate(
                  selectedEmail.sentDate
                )}
              </p>
            </div>

            <div style={styles.detailBox}>
              <strong>Email Content</strong>

              <div style={styles.modalContent}>
                {selectedEmail.content}
              </div>
            </div>

            <button
              onClick={closeEmailModal}
              style={styles.modalCloseButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
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
    color: "#64748b",
    marginBottom: 0,
  },

  headerRefreshButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#0f172a",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  analyticsHeader: {
    marginBottom: "18px",
  },

  analyticsTitle: {
    margin: 0,
    fontSize: "28px",
    color: "#0f172a",
  },

  analyticsSubtitle: {
    marginTop: "7px",
    color: "#64748b",
  },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px,1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  analyticsCard: {
    padding: "22px",
    borderRadius: "18px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    color: "#fff",
    boxShadow:
      "0 10px 25px rgba(15,23,42,.12)",
  },

  totalEmailsCard: {
    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",
  },

  todayEmailsCard: {
    background:
      "linear-gradient(135deg,#16a34a,#15803d)",
  },

  uniqueRecipientsCard: {
    background:
      "linear-gradient(135deg,#7c3aed,#6d28d9)",
  },

  topRecipientCard: {
    background:
      "linear-gradient(135deg,#0891b2,#0e7490)",
  },

  subjectAnalyticsCard: {
    background:
      "linear-gradient(135deg,#ea580c,#c2410c)",
  },

  analyticsIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "14px",
    background: "rgba(255,255,255,.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },

  analyticsContent: {
    minWidth: 0,
  },

  analyticsLabel: {
    display: "block",
    fontSize: "13px",
    opacity: .9,
  },

  analyticsValue: {
    display: "block",
    marginTop: "6px",
    fontSize: "23px",
    fontWeight: "bold",
  },

  topRecipientValue: {
    display: "block",
    marginTop: "6px",
    fontSize: "18px",
    fontWeight: "bold",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    maxWidth: "180px",
  },

  subjectValue: {
    display: "block",
    marginTop: "6px",
    fontSize: "18px",
    fontWeight: "bold",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    maxWidth: "180px",
  },

  analyticsNote: {
    display: "block",
    marginTop: "6px",
    fontSize: "12px",
    opacity: .9,
  },

  chartSection: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(360px,1fr))",
    gap: "22px",
    marginBottom: "28px",
  },

  chartCard: {
    padding: "25px",
    borderRadius: "18px",
    background: "#fff",
    boxShadow:
      "0 10px 30px rgba(15,23,42,.08)",
  },

  chartHeader: {
    marginBottom: "18px",
  },

  chartTitle: {
    margin: 0,
    fontSize: "22px",
  },

  chartSubtitle: {
    marginTop: "6px",
    color: "#64748b",
  },

  chartWrapper: {
    width: "100%",
    height: "330px",
  },

  chartEmpty: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#64748b",
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    background: "#f8fafc",
  },

  formCard: {
    padding: "28px",
    borderRadius: "18px",
    background: "#fff",
    boxShadow:
      "0 10px 30px rgba(15,23,42,.08)",
    marginBottom: "25px",
  },

  cardTitle: {
    margin: 0,
    color: "#0f172a",
  },

  cardSubtitle: {
    marginTop: "7px",
    color: "#64748b",
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "16px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    padding: "13px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    boxSizing: "border-box",
    fontSize: "15px",
  },

  textarea: {
    width: "100%",
    minHeight: "160px",
    padding: "13px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    resize: "vertical",
    boxSizing: "border-box",
    fontSize: "15px",
  },
    formButtonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "22px",
  },

  generateButton: {
    padding: "13px 28px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
  },

  clearButton: {
    padding: "13px 28px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#334155",
    fontSize: "16px",
    cursor: "pointer",
  },

  generatedCard: {
    marginBottom: "25px",
    padding: "28px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15,23,42,.08)",
  },

  generatedContent: {
    padding: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#f8fafc",
    color: "#1e293b",
    whiteSpace: "pre-wrap",
    lineHeight: "1.7",
  },

  generatedButtonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  copyButton: {
    padding: "11px 22px",
    border: "none",
    borderRadius: "10px",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
  },

  sendButton: {
    padding: "11px 22px",
    border: "none",
    borderRadius: "10px",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
  },

  historyCard: {
    padding: "28px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15,23,42,.08)",
  },

  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },

  emailCount: {
    padding: "10px 16px",
    borderRadius: "10px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "bold",
  },

  errorMessage: {
    padding: "14px",
    marginBottom: "20px",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
  },

  emptyState: {
    padding: "40px 20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    background: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
  },

  emptyIcon: {
    marginBottom: "10px",
    fontSize: "42px",
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
    minWidth: "850px",
    borderCollapse: "collapse",
  },

  tableHeader: {
    padding: "15px",
    borderBottom: "1px solid #cbd5e1",
    background: "#f1f5f9",
    color: "#334155",
    fontSize: "14px",
    textAlign: "left",
  },

  tableCell: {
    padding: "15px",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "14px",
    verticalAlign: "top",
  },

  viewButton: {
    padding: "9px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    padding: "20px",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(15,23,42,.65)",
  },

  modal: {
    width: "100%",
    maxWidth: "750px",
    maxHeight: "85vh",
    padding: "30px",
    overflowY: "auto",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 25px 60px rgba(0,0,0,.3)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
  },

  closeButton: {
    width: "38px",
    height: "38px",
    border: "none",
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#0f172a",
    fontSize: "20px",
    cursor: "pointer",
  },

  detailBox: {
    marginBottom: "18px",
    color: "#0f172a",
  },

  detailText: {
    marginTop: "7px",
    marginBottom: 0,
    color: "#475569",
  },

  modalContent: {
    marginTop: "12px",
    padding: "18px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#334155",
    whiteSpace: "pre-wrap",
    lineHeight: "1.7",
  },

  modalCloseButton: {
    width: "100%",
    marginTop: "10px",
    padding: "13px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Email;