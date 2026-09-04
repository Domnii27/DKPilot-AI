import { useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";

function BusinessReport() {
  const [reportType, setReportType] =
    useState("Monthly Business Report");

  const [customPrompt, setCustomPrompt] =
    useState("");

  const [generatedReport, setGeneratedReport] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const reportTypes = [
    "Monthly Business Report",
    "Sales Performance Report",
    "Revenue Analysis Report",
    "Customer Performance Report",
    "Executive Business Summary",
    "Business Growth Report",
    "Custom Business Report",
  ];

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getLoggedInUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "loggedInUser"
        ) || "{}"
      );
    } catch (readError) {
      console.error(
        "Logged user read error:",
        readError
      );

      return {};
    }
  };

  const loggedInUser =
    getLoggedInUser();

  const userName =
    loggedInUser.name || "Sanjay";

  const userEmail =
    loggedInUser.email || "";
const cleanReportText = (text) => {
  if (!text) {
    return "";
  }

  const decoder = document.createElement("textarea");
  decoder.innerHTML = text;

  return decoder.value
    .replace(/\\([*_#-])/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^[ \t]*[-*][ \t]+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .trim();
};
  const generateReport = async () => {
    const token = getToken();

    if (!token) {
      setError(
        "Session expired. Please login again."
      );

      return;
    }

    if (
      reportType ===
        "Custom Business Report" &&
      !customPrompt.trim()
    ) {
      setError(
        "Custom report requirement enter pannu."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setGeneratedReport(cleanReportText(report));

      const response = await axios.post(
        "http://localhost:8081/api/business-report/generate",
        {
          reportType,
          customPrompt:
            customPrompt.trim(),
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

      const report =
        response.data?.report;

      if (
        !report ||
        typeof report !== "string"
      ) {
        throw new Error(
          "Invalid business report response"
        );
      }

      if (
        report.toLowerCase().includes(
          "not authenticated"
        )
      ) {
        setError(
          "Session expired. Please login again."
        );

        return;
      }

      setGeneratedReport(report);

      setMessage(
        "Business report generated successfully."
      );
    } catch (requestError) {
      console.error(
        "Business report generation error:",
        requestError
      );

      if (
        requestError.response?.status ===
          401 ||
        requestError.response?.status ===
          403
      ) {
        setError(
          "Session expired. Please login again."
        );
      } else if (
        requestError.response?.data
          ?.message
      ) {
        setError(
          requestError.response.data
            .message
        );
      } else {
        setError(
          "Business report generate panna mudiyala. Backend terminal check pannu."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const clearReport = () => {
    setReportType(
      "Monthly Business Report"
    );

    setCustomPrompt("");
    setGeneratedReport("");
    setMessage("");
    setError("");
  };

  const copyReport = async () => {
    if (!generatedReport.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedReport
      );

      setMessage(
        "Business report copied successfully."
      );

      setError("");
    } catch (copyError) {
      console.error(
        "Report copy error:",
        copyError
      );

      setError(
        "Report copy panna mudiyala."
      );
    }
  };

  const downloadReportAsText = () => {
    if (!generatedReport.trim()) {
      setError(
        "Download panna report available illa."
      );

      return;
    }

    const reportContent = `
DKPILOT AI BUSINESS REPORT

Report Type: ${reportType}
Generated For: ${userName}
User Email: ${userEmail || "Not available"}
Generated Date: ${new Date().toLocaleString(
      "en-IN"
    )}

==================================================

${generatedReport}
`;

    const blob = new Blob(
      [reportContent],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const downloadUrl =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = downloadUrl;

    link.download =
      `DKPilot-Business-Report-${Date.now()}.txt`;

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(
      downloadUrl
    );

    setMessage(
      "Text report downloaded successfully."
    );
  };

  const downloadReportAsPDF = () => {
    if (!generatedReport.trim()) {
      setError(
        "PDF download panna report available illa."
      );

      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const leftMargin = 18;
      const rightMargin = 18;
      const topMargin = 20;
      const bottomMargin = 18;

      const contentWidth =
        pageWidth -
        leftMargin -
        rightMargin;

      let currentY = topMargin;

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(20);

      pdf.text(
        "DKPilot AI",
        leftMargin,
        currentY
      );

      currentY += 9;

      pdf.setFontSize(15);

      pdf.text(
        "AI Business Report",
        leftMargin,
        currentY
      );

      currentY += 10;

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(10);

      pdf.text(
        `Report Type: ${reportType}`,
        leftMargin,
        currentY
      );

      currentY += 6;

      pdf.text(
        `Generated For: ${userName}`,
        leftMargin,
        currentY
      );

      currentY += 6;

      pdf.text(
        `Generated Date: ${new Date().toLocaleString(
          "en-IN"
        )}`,
        leftMargin,
        currentY
      );

      currentY += 8;

      pdf.line(
        leftMargin,
        currentY,
        pageWidth - rightMargin,
        currentY
      );

      currentY += 9;

      pdf.setFontSize(11);

      const reportLines =
        pdf.splitTextToSize(
          generatedReport,
          contentWidth
        );

      reportLines.forEach((line) => {
        if (
          currentY >
          pageHeight - bottomMargin
        ) {
          pdf.addPage();

          currentY = topMargin;
        }

        pdf.text(
          line,
          leftMargin,
          currentY
        );

        currentY += 6;
      });

      pdf.save(
        `DKPilot-Business-Report-${Date.now()}.pdf`
      );

      setMessage(
        "PDF report downloaded successfully."
      );

      setError("");
    } catch (pdfError) {
      console.error(
        "PDF generation error:",
        pdfError
      );

      setError(
        "PDF generate panna mudiyala."
      );
    }
  };

  const reportSections =
    useMemo(() => {
      if (!generatedReport.trim()) {
        return [];
      }

      return generatedReport
        .split(/\n\s*\n/)
        .map((section) =>
          section.trim()
        )
        .filter(Boolean);
    }, [generatedReport]);

  return (
        <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              📊 AI Business Report Generator
            </h1>

            <p style={styles.subtitle}>
              Generate professional business reports using your
              live customer, invoice, email and schedule data.
            </p>
          </div>

          <button
            onClick={clearReport}
            disabled={loading}
            style={styles.headerClearButton}
          >
            🧹 Clear Report
          </button>
        </div>

        {message && (
          <div style={styles.successMessage}>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <div style={styles.mainGrid}>
          <div style={styles.formCard}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  🤖 Generate Business Report
                </h2>

                <p style={styles.cardSubtitle}>
                  Select a report type and provide additional
                  instructions if required.
                </p>
              </div>
            </div>

            <label style={styles.label}>
              Report Type
            </label>

            <select
              value={reportType}
              onChange={(event) => {
                setReportType(
                  event.target.value
                );

                setMessage("");
                setError("");
              }}
              style={styles.select}
            >
              {reportTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>

            <label style={styles.label}>
              Additional Report Requirement
            </label>

            <textarea
              rows="8"
              placeholder="Example: Focus more on revenue growth, customer performance and recommendations for next month."
              value={customPrompt}
              onChange={(event) => {
                setCustomPrompt(
                  event.target.value
                );

                setMessage("");
                setError("");
              }}
              style={styles.textarea}
            />

            <div style={styles.promptExamples}>
              <span style={styles.promptTitle}>
                💡 Quick Prompts
              </span>

              <div style={styles.promptGrid}>
                <button
                  onClick={() =>
                    setCustomPrompt(
                      "Focus on monthly revenue performance and give practical recommendations for increasing sales."
                    )
                  }
                  style={styles.promptButton}
                >
                  💰 Revenue Analysis
                </button>

                <button
                  onClick={() =>
                    setCustomPrompt(
                      "Analyse customer performance, identify the strongest customer segment and suggest retention strategies."
                    )
                  }
                  style={styles.promptButton}
                >
                  👥 Customer Insights
                </button>

                <button
                  onClick={() =>
                    setCustomPrompt(
                      "Create an executive summary for management with risks, opportunities and next action points."
                    )
                  }
                  style={styles.promptButton}
                >
                  📋 Executive Summary
                </button>

                <button
                  onClick={() =>
                    setCustomPrompt(
                      "Analyse overall business growth and suggest a practical plan for the next three months."
                    )
                  }
                  style={styles.promptButton}
                >
                  📈 Growth Strategy
                </button>
              </div>
            </div>

            <button
              onClick={generateReport}
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
                ? "AI is generating report..."
                : "✨ Generate AI Business Report"}
            </button>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              📊
            </div>

            <h2 style={styles.infoTitle}>
              Smart Business Analysis
            </h2>

            <p style={styles.infoText}>
              DKPilot AI uses your current business records to
              prepare a professional report with useful insights.
            </p>

            <div style={styles.infoItem}>
              <span>✅</span>

              <div>
                <strong>
                  Executive Summary
                </strong>

                <p>
                  Quick overview of your business performance.
                </p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <span>💰</span>

              <div>
                <strong>
                  Revenue Analysis
                </strong>

                <p>
                  Understand invoice value and total revenue.
                </p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <span>👥</span>

              <div>
                <strong>
                  Customer Analysis
                </strong>

                <p>
                  Review customer activity and business value.
                </p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <span>💡</span>

              <div>
                <strong>
                  AI Recommendations
                </strong>

                <p>
                  Receive practical next-step suggestions.
                </p>
              </div>
            </div>

            <div style={styles.userBox}>
              <span style={styles.userBoxLabel}>
                Report Generated For
              </span>

              <strong>
                {userName}
              </strong>

              <small>
                {userEmail ||
                  "Logged-in DKPilot user"}
              </small>
            </div>
          </div>
        </div>

        {loading && (
          <div style={styles.loadingCard}>
            <div style={styles.loadingIcon}>
              🤖
            </div>

            <h2>
              DKPilot AI is analysing your business
            </h2>

            <p>
              Customer, invoice, revenue, email and schedule
              statistics are being processed.
            </p>

            <div style={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {generatedReport && !loading && (
          <div style={styles.reportCard}>
            <div style={styles.reportHeader}>
              <div>
                <span style={styles.reportBadge}>
                  AI GENERATED REPORT
                </span>

                <h2 style={styles.reportTitle}>
                  {reportType}
                </h2>

                <p style={styles.reportMeta}>
                  Generated for {userName} •{" "}
                  {new Date().toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <div style={styles.reportActions}>
                <button
                  onClick={copyReport}
                  style={styles.copyButton}
                >
                  📋 Copy
                </button>

                <button
                  onClick={downloadReportAsText}
                  style={styles.textButton}
                >
                  📄 Text
                </button>

                <button
                  onClick={downloadReportAsPDF}
                  style={styles.pdfButton}
                >
                  ⬇ PDF
                </button>
              </div>
            </div>

            <div style={styles.reportBody}>
              <div style={styles.reportBrand}>
                <div style={styles.reportBrandIcon}>
                  🤖
                </div>

                <div>
                  <strong>
                    DKPilot AI
                  </strong>

                  <span>
                    Intelligent Business Automation
                  </span>
                </div>
              </div>

              <div style={styles.reportDivider} />

              {reportSections.map(
                (section, index) => (
                  <div
                    key={`${section.substring(
                      0,
                      20
                    )}-${index}`}
                    style={styles.reportSection}
                  >
                    <p>
                      {section}
                    </p>
                  </div>
                )
              )}

              <div style={styles.reportFooter}>
                <span>
                  Generated automatically by DKPilot AI.
                </span>

                <span>
                  Important business decisions should be reviewed
                  before implementation.
                </span>
              </div>
            </div>
          </div>
        )}

        {!generatedReport && !loading && (
          <div style={styles.emptyReportCard}>
            <div style={styles.emptyReportIcon}>
              📑
            </div>

            <h2>
              Your AI business report will appear here
            </h2>

            <p>
              Choose a report type and click Generate AI Business
              Report.
            </p>
          </div>
        )}
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
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    color: "#0f172a",
  },

  subtitle: {
    maxWidth: "760px",
    marginTop: "8px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "15px",
    lineHeight: "1.6",
  },

  headerClearButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#0f172a",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  successMessage: {
    padding: "14px",
    marginBottom: "18px",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#166534",
    fontWeight: "bold",
  },

  errorMessage: {
    padding: "14px",
    marginBottom: "18px",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: "bold",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(340px, 1.4fr) minmax(280px, 0.8fr)",
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
    lineHeight: "1.6",
  },

  label: {
    display: "block",
    marginTop: "18px",
    marginBottom: "8px",
    color: "#334155",
    fontWeight: "bold",
  },

  select: {
    width: "100%",
    padding: "13px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "15px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    padding: "13px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "15px",
    lineHeight: "1.6",
    resize: "vertical",
    outline: "none",
  },

  promptExamples: {
    marginTop: "20px",
    padding: "16px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  promptTitle: {
    display: "block",
    marginBottom: "12px",
    color: "#334155",
    fontWeight: "bold",
  },

  promptGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "10px",
  },

  promptButton: {
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: "bold",
    cursor: "pointer",
    textAlign: "left",
  },

  generateButton: {
    width: "100%",
    marginTop: "22px",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
  },

  infoIcon: {
    fontSize: "46px",
    marginBottom: "14px",
  },

  infoTitle: {
    marginTop: 0,
    marginBottom: "10px",
    fontSize: "25px",
  },

  infoText: {
    color: "#cbd5e1",
    lineHeight: "1.7",
    marginBottom: "24px",
  },

  infoItem: {
    display: "grid",
    gridTemplateColumns: "34px 1fr",
    gap: "12px",
    alignItems: "start",
    padding: "13px 0",
    borderBottom:
      "1px solid rgba(255, 255, 255, 0.1)",
  },

  userBox: {
    marginTop: "24px",
    padding: "17px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.08)",
  },

  userBoxLabel: {
    display: "block",
    marginBottom: "7px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  loadingCard: {
    marginTop: "25px",
    padding: "45px 25px",
    borderRadius: "18px",
    background: "#ffffff",
    textAlign: "center",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  loadingIcon: {
    fontSize: "50px",
    marginBottom: "15px",
  },

  loadingDots: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "18px",
  },

  reportCard: {
    marginTop: "25px",
    padding: "28px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },

  reportBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "11px",
    fontWeight: "bold",
  },

  reportTitle: {
    margin: "10px 0 0",
    color: "#0f172a",
    fontSize: "27px",
  },

  reportMeta: {
    marginTop: "7px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  reportActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  copyButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "9px",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  textButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "9px",
    background: "#7c3aed",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  pdfButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "9px",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  reportBody: {
    padding: "26px",
    border: "1px solid #e2e8f0",
    borderRadius: "15px",
    background: "#f8fafc",
  },

  reportBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  reportBrandIcon: {
    width: "46px",
    height: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    fontSize: "23px",
  },

  reportDivider: {
    height: "1px",
    margin: "20px 0",
    background: "#cbd5e1",
  },

  reportSection: {
    marginBottom: "18px",
    color: "#334155",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
  },

  reportFooter: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "25px",
    paddingTop: "18px",
    borderTop: "1px solid #cbd5e1",
    color: "#94a3b8",
    fontSize: "11px",
  },

  emptyReportCard: {
    marginTop: "25px",
    padding: "55px 25px",
    border: "1px dashed #cbd5e1",
    borderRadius: "18px",
    background: "#ffffff",
    color: "#64748b",
    textAlign: "center",
  },

  emptyReportIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
};

export default BusinessReport;