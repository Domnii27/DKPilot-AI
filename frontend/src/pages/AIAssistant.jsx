import { useEffect, useState } from "react";
import axios from "axios";
import "./AIAssistant.css";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] =
    useState(false);
  const [historyError, setHistoryError] =
    useState("");

  const [selectedHistoryId, setSelectedHistoryId] =
    useState(null);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadChatHistory = async () => {
    const token = getToken();

    if (!token) {
      setHistoryError("Please login again.");
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError("");

      const response = await axios.get(
        "http://localhost:8081/api/ai/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setChatHistory(response.data);
      } else {
        setChatHistory([]);
      }
    } catch (error) {
      console.error("Chat history error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setHistoryError(
          "Session expired. Please login again."
        );
      } else {
        setHistoryError(
          "Chat history load panna mudiyala."
        );
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  const askAI = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Please login again.");
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmedMessage,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);
    setSelectedHistoryId(null);

    try {
      const response = await axios.post(
        "http://localhost:8081/api/ai/chat",
        {
          message: trimmedMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text:
          response.data?.answer ||
          "AI response not available.",
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);

      await loadChatHistory();
    } catch (error) {
      console.error("AI chat error:", error);

      let errorText =
        "AI response generate panna mudiyala. Please try again.";

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        errorText =
          "Session expired. Please login again.";
      } else if (error.response?.data?.message) {
        errorText = error.response.data.message;
      }

      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: "ai",
        text: errorText,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askAI();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setMessage("");
    setSelectedHistoryId(null);
  };

  const openHistoryChat = (historyItem) => {
    setSelectedHistoryId(historyItem.id);

    setMessages([
      {
        id: `history-user-${historyItem.id}`,
        sender: "user",
        text: historyItem.userMessage,
      },
      {
        id: `history-ai-${historyItem.id}`,
        sender: "ai",
        text: historyItem.aiResponse,
      },
    ]);
  };

  const deleteHistoryChat = async (
    event,
    historyId
  ) => {
    event.stopPropagation();

    const confirmation = window.confirm(
      "Indha chat-ai delete panna sure-ah?"
    );

    if (!confirmation) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Please login again.");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8081/api/ai/history/${historyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (selectedHistoryId === historyId) {
        setMessages([]);
        setSelectedHistoryId(null);
      }

      await loadChatHistory();
    } catch (error) {
      console.error("Delete chat error:", error);

      alert(
        error.response?.data?.message ||
          "Chat delete panna mudiyala."
      );
    }
  };

  const clearAllHistory = async () => {
    if (chatHistory.length === 0) {
      return;
    }

    const confirmation = window.confirm(
      "Ella AI chat history-um delete panna sure-ah?"
    );

    if (!confirmation) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Please login again.");
      return;
    }

    try {
      const response = await axios.delete(
        "http://localhost:8081/api/ai/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChatHistory([]);
      setMessages([]);
      setSelectedHistoryId(null);

      alert(
        response.data?.message ||
          "Chat history cleared successfully."
      );
    } catch (error) {
      console.error(
        "Clear chat history error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Chat history clear panna mudiyala."
      );
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "";
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

  const createPreview = (text) => {
    if (!text) {
      return "Empty chat";
    }

    const cleanedText = text
      .replace(/\s+/g, " ")
      .trim();

    if (cleanedText.length <= 42) {
      return cleanedText;
    }

    return `${cleanedText.substring(0, 42)}...`;
  };

  return (
    <div className="ai-page">
      <aside className="ai-sidebar">
        <h2>🤖 DKPilot AI</h2>

        <button
          className="new-chat-button"
          onClick={startNewChat}
        >
          + New Chat
        </button>

        <div style={styles.historyHeader}>
          <div>
            <strong>Chat History</strong>

            <span style={styles.historyCount}>
              {chatHistory.length}
            </span>
          </div>

          {chatHistory.length > 0 && (
            <button
              style={styles.clearButton}
              onClick={clearAllHistory}
              title="Clear all history"
            >
              Clear
            </button>
          )}
        </div>

        <div style={styles.historyContainer}>
          {historyLoading && (
            <p style={styles.historyStatus}>
              Loading history...
            </p>
          )}

          {historyError && (
            <p style={styles.historyError}>
              {historyError}
            </p>
          )}

          {!historyLoading &&
            !historyError &&
            chatHistory.length === 0 && (
              <div style={styles.emptyHistory}>
                <span>💬</span>

                <p>No previous chats</p>
              </div>
            )}

          {chatHistory.map((historyItem) => (
            <div
              key={historyItem.id}
              onClick={() =>
                openHistoryChat(historyItem)
              }
              style={{
                ...styles.historyItem,
                ...(selectedHistoryId ===
                historyItem.id
                  ? styles.activeHistoryItem
                  : {}),
              }}
            >
              <div style={styles.historyItemContent}>
                <strong
                  style={styles.historyItemTitle}
                >
                  {createPreview(
                    historyItem.userMessage
                  )}
                </strong>

                <span style={styles.historyItemDate}>
                  {formatDate(
                    historyItem.createdDate
                  )}
                </span>
              </div>

              <button
                style={styles.deleteButton}
                onClick={(event) =>
                  deleteHistoryChat(
                    event,
                    historyItem.id
                  )
                }
                title="Delete chat"
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-note">
          <p>Business Assistant</p>

          <span>
            Ask emails, ideas, reports and more.
          </span>
        </div>
      </aside>

      <main className="ai-main">
        <header className="ai-header">
          <div>
            <h1>DKPilot AI Assistant</h1>

            <p>
              Your intelligent business automation
              partner
            </p>
          </div>

          <div className="online-status">
            <span></span>
            Online
          </div>
        </header>

        <section className="chat-area">
          {messages.length === 0 && (
            <div className="welcome-card">
              <div className="welcome-icon">
                🤖
              </div>

              <h2>How can I help you today?</h2>

              <p>
                Ask me to create emails, business
                ideas, reports or professional
                content.
              </p>

              <div className="suggestion-grid">
                <button
                  onClick={() =>
                    setMessage(
                      "Write a professional leave email"
                    )
                  }
                >
                  ✉️ Write an email
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "Give me five marketing ideas for a small business"
                    )
                  }
                >
                  💡 Marketing ideas
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "Create a short business report"
                    )
                  }
                >
                  📊 Business report
                </button>
              </div>
            </div>
          )}

          {messages.map((chatMessage) => (
            <div
              key={chatMessage.id}
              className={`message-row ${
                chatMessage.sender === "user"
                  ? "user-row"
                  : "ai-row"
              }`}
            >
              <div className="message-avatar">
                {chatMessage.sender === "user"
                  ? "👤"
                  : "🤖"}
              </div>

              <div
                className={`message-bubble ${
                  chatMessage.sender === "user"
                    ? "user-bubble"
                    : "ai-bubble"
                }`}
              >
                <p>{chatMessage.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row ai-row">
              <div className="message-avatar">
                🤖
              </div>

              <div className="message-bubble ai-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="chat-input-area">
          <textarea
            rows="1"
            placeholder="Message DKPilot AI..."
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={askAI}
            disabled={
              loading || !message.trim()
            }
          >
            {loading ? "Sending..." : "Send 🚀"}
          </button>
        </section>
      </main>
    </div>
  );
}

const styles = {
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginTop: "24px",
    marginBottom: "10px",
    color: "#e2e8f0",
    fontSize: "14px",
  },

  historyCount: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "21px",
    height: "21px",
    marginLeft: "7px",
    padding: "0 5px",
    borderRadius: "20px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "10px",
  },

  clearButton: {
    padding: "5px 8px",
    border: "none",
    borderRadius: "6px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  historyContainer: {
    flex: 1,
    maxHeight: "55vh",
    overflowY: "auto",
    paddingRight: "4px",
  },

  historyStatus: {
    color: "#94a3b8",
    fontSize: "12px",
    textAlign: "center",
  },

  historyError: {
    padding: "9px",
    borderRadius: "7px",
    background: "rgba(220, 38, 38, 0.15)",
    color: "#fca5a5",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  emptyHistory: {
    padding: "20px 10px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "12px",
  },

  historyItem: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "8px",
    alignItems: "center",
    marginBottom: "7px",
    padding: "11px",
    borderRadius: "9px",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#e2e8f0",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },

  activeHistoryItem: {
    background: "rgba(37, 99, 235, 0.3)",
    border: "1px solid rgba(96, 165, 250, 0.5)",
  },

  historyItemContent: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  historyItemTitle: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "12px",
  },

  historyItemDate: {
    color: "#94a3b8",
    fontSize: "9px",
  },

  deleteButton: {
    padding: "4px",
    border: "none",
    background: "transparent",
    color: "#fca5a5",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default AIAssistant;