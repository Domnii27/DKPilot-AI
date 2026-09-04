import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./AIAssistant.css";

function AIAssistant() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [showAnalytics, setShowAnalytics] = useState(false);

  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const chatAreaRef = useRef(null);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getLoggedInUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("loggedInUser")
      );
    } catch (error) {
      console.error(
        "Logged user read error:",
        error
      );

      return null;
    }
  };

  const loggedInUser = getLoggedInUser();

  const userName =
    loggedInUser?.name || "Sanjay";

  const userEmail =
    loggedInUser?.email || "";

  const getChatStorageKey = () => {
    const safeEmail =
      userEmail || "default-user";

    return `dkpilot-ai-chat-${safeEmail}`;
  };

  const saveMessagesToLocalStorage = (
    updatedMessages
  ) => {
    try {
      localStorage.setItem(
        getChatStorageKey(),
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      console.error(
        "Chat save error:",
        error
      );
    }
  };

  const loadMessagesFromLocalStorage = () => {
    try {
      const savedMessages =
        localStorage.getItem(
          getChatStorageKey()
        );

      if (!savedMessages) {
        return [];
      }

      const parsedMessages =
        JSON.parse(savedMessages);

      return Array.isArray(parsedMessages)
        ? parsedMessages
        : [];
    } catch (error) {
      console.error(
        "Chat history load error:",
        error
      );

      return [];
    }
  };

  useEffect(() => {
    const savedMessages =
      loadMessagesFromLocalStorage();

    setMessages(savedMessages);
  }, []);

  useEffect(() => {
    saveMessagesToLocalStorage(messages);
  }, [messages]);

  useEffect(() => {
    if (!chatAreaRef.current) {
      return;
    }

    chatAreaRef.current.scrollTo({
      top: chatAreaRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const createMessage = (
    sender,
    text,
    extraData = {}
  ) => {
    return {
      id: `${Date.now()}-${Math.random()}`,
      sender,
      text,
      createdAt:
        new Date().toISOString(),
      ...extraData,
    };
  };

  const askAI = async (
    customMessage = null
  ) => {
    const messageToSend =
      customMessage !== null
        ? customMessage.trim()
        : message.trim();

    if (!messageToSend || loading) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert(
        "Session expired. Please login again."
      );

      return;
    }

    const userMessage = createMessage(
      "user",
      messageToSend
    );

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8081/api/ai/chat",
        {
          message: messageToSend,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const answer =
        response.data?.answer ||
        "AI response available illa.";

      const aiMessage = createMessage(
        "ai",
        answer
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);
    } catch (error) {
      console.error(
        "AI response error:",
        error
      );

      let errorText =
        "AI response generate panna mudiyala. Please try again.";

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        errorText =
          "Session expired. Please login again.";
      } else if (
        error.response?.data?.message
      ) {
        errorText =
          error.response.data.message;
      }

      const errorMessage = createMessage(
        "ai",
        errorText,
        {
          isError: true,
        }
      );

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

  const useSuggestion = (suggestion) => {
    setMessage(suggestion);
  };

  const sendSuggestion = (suggestion) => {
    askAI(suggestion);
  };

  const startNewChat = () => {
    const confirmation =
      messages.length === 0 ||
      window.confirm(
        "Current chat clear panni new chat start panna sure-ah?"
      );

    if (!confirmation) {
      return;
    }

    setMessages([]);
    setMessage("");
    setSearchText("");
    setCopiedMessageId(null);

    localStorage.removeItem(
      getChatStorageKey()
    );
  };

  const deleteMessage = (messageId) => {
    setMessages((previousMessages) =>
      previousMessages.filter(
        (chatMessage) =>
          chatMessage.id !== messageId
      )
    );
  };

  const copyMessage = async (
    chatMessage
  ) => {
    try {
      await navigator.clipboard.writeText(
        chatMessage.text
      );

      setCopiedMessageId(
        chatMessage.id
      );

      window.setTimeout(() => {
        setCopiedMessageId(null);
      }, 1800);
    } catch (error) {
      console.error(
        "Message copy error:",
        error
      );

      alert(
        "Message copy panna mudiyala"
      );
    }
  };

  const regenerateResponse = async (
    messageIndex
  ) => {
    if (loading) {
      return;
    }

    let previousUserMessage = null;

    for (
      let index = messageIndex - 1;
      index >= 0;
      index -= 1
    ) {
      if (
        messages[index].sender === "user"
      ) {
        previousUserMessage =
          messages[index];

        break;
      }
    }

    if (!previousUserMessage) {
      alert(
        "Previous user message available illa"
      );

      return;
    }

    await askAI(
      previousUserMessage.text
    );
  };

  const formatMessageDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const filteredMessages =
    useMemo(() => {
      const searchValue =
        searchText
          .trim()
          .toLowerCase();

      if (!searchValue) {
        return messages;
      }

      return messages.filter(
        (chatMessage) =>
          String(
            chatMessage.text || ""
          )
            .toLowerCase()
            .includes(searchValue)
      );
    }, [messages, searchText]);

  const chatAnalytics = useMemo(() => {
    const userMessages =
      messages.filter(
        (chatMessage) =>
          chatMessage.sender === "user"
      );

    const aiMessages =
      messages.filter(
        (chatMessage) =>
          chatMessage.sender === "ai" &&
          !chatMessage.isError
      );

    const errorMessages =
      messages.filter(
        (chatMessage) =>
          chatMessage.isError
      );

    const totalCharacters =
      messages.reduce(
        (total, chatMessage) =>
          total +
          String(
            chatMessage.text || ""
          ).length,
        0
      );

    const averageResponseLength =
      aiMessages.length > 0
        ? Math.round(
            aiMessages.reduce(
              (total, chatMessage) =>
                total +
                String(
                  chatMessage.text || ""
                ).length,
              0
            ) / aiMessages.length
          )
        : 0;

    const recentUserPrompts =
      [...userMessages]
        .reverse()
        .slice(0, 5);

    return {
      totalMessages: messages.length,
      userMessages:
        userMessages.length,
      aiResponses:
        aiMessages.length,
      failedResponses:
        errorMessages.length,
      totalCharacters,
      averageResponseLength,
      recentUserPrompts,
    };
  }, [messages]);

  const exportChatAsText = () => {
    if (messages.length === 0) {
      alert(
        "Export panna chat messages illa"
      );

      return;
    }

    const chatText = messages
      .map((chatMessage) => {
        const senderName =
          chatMessage.sender === "user"
            ? userName
            : "DKPilot AI";

        return `${senderName}
${formatMessageDate(
  chatMessage.createdAt
)}
${chatMessage.text}`;
      })
      .join(
        "\n\n------------------------------\n\n"
      );

    const fileContent = `DKPilot AI Chat Export

User: ${userName}
Email: ${userEmail || "Not available"}
Exported: ${new Date().toLocaleString(
      "en-IN"
    )}

================================

${chatText}
`;

    const blob = new Blob(
      [fileContent],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const downloadUrl =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = downloadUrl;
    link.download = `DKPilot-AI-Chat-${Date.now()}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(
      downloadUrl
    );
  };

  return (
        <div className="ai-page">
      <aside
        className={`ai-sidebar ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-icon">
              🤖
            </div>

            {sidebarOpen && (
              <div>
                <h2>DKPilot AI</h2>

                <span>
                  Business Assistant
                </span>
              </div>
            )}
          </div>

          <button
            className="sidebar-toggle-button"
            onClick={() =>
              setSidebarOpen(
                (previousValue) =>
                  !previousValue
              )
            }
            title={
              sidebarOpen
                ? "Close Sidebar"
                : "Open Sidebar"
            }
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        {sidebarOpen && (
          <>
            <button
              className="new-chat-button"
              onClick={startNewChat}
            >
              ＋ New Chat
            </button>

            <div className="sidebar-search-wrapper">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Search messages..."
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value
                  )
                }
              />

              {searchText && (
                <button
                  onClick={() =>
                    setSearchText("")
                  }
                >
                  ×
                </button>
              )}
            </div>

            <div className="sidebar-section">
              <div className="sidebar-section-header">
                <span>
                  Recent Prompts
                </span>

                <strong>
                  {
                    chatAnalytics
                      .recentUserPrompts
                      .length
                  }
                </strong>
              </div>

              {chatAnalytics
                .recentUserPrompts.length ===
              0 ? (
                <div className="empty-prompt-history">
                  No recent prompts
                </div>
              ) : (
                <div className="recent-prompt-list">
                  {chatAnalytics.recentUserPrompts.map(
                    (promptMessage) => (
                      <button
                        key={
                          promptMessage.id
                        }
                        className="recent-prompt-item"
                        onClick={() =>
                          useSuggestion(
                            promptMessage.text
                          )
                        }
                        title={
                          promptMessage.text
                        }
                      >
                        <span>💬</span>

                        <p>
                          {promptMessage.text}
                        </p>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="sidebar-bottom">
              <button
                className="sidebar-action-button"
                onClick={() =>
                  setShowAnalytics(
                    (previousValue) =>
                      !previousValue
                  )
                }
              >
                📊{" "}
                {showAnalytics
                  ? "Hide Analytics"
                  : "Show Analytics"}
              </button>

              <button
                className="sidebar-action-button"
                onClick={exportChatAsText}
              >
                📥 Export Chat
              </button>

              <button
                className="sidebar-danger-button"
                onClick={startNewChat}
              >
                🗑️ Clear Chat
              </button>
            </div>
          </>
        )}
      </aside>

      <main className="ai-main">
        <header className="ai-header">
          <div className="ai-header-left">
            {!sidebarOpen && (
              <button
                className="mobile-sidebar-button"
                onClick={() =>
                  setSidebarOpen(true)
                }
              >
                ☰
              </button>
            )}

            <div>
              <h1>
                DKPilot AI Assistant
              </h1>

              <p>
                Your intelligent business automation
                partner
              </p>
            </div>
          </div>

          <div className="ai-header-right">
            <div className="online-status">
              <span></span>
              Online
            </div>

            <div className="header-user">
              <div className="header-user-avatar">
                {userName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {userName}
                </strong>

                <span>
                  {userEmail ||
                    "DKPilot User"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {showAnalytics && (
          <section className="chat-analytics-section">
            <div className="analytics-heading">
              <div>
                <h2>
                  📊 AI Chat Analytics
                </h2>

                <p>
                  Live insights calculated from your
                  current chat history.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowAnalytics(false)
                }
              >
                ✕
              </button>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card analytics-blue">
                <div className="analytics-card-icon">
                  💬
                </div>

                <div>
                  <span>
                    Total Messages
                  </span>

                  <strong>
                    {
                      chatAnalytics
                        .totalMessages
                    }
                  </strong>

                  <small>
                    User and AI messages
                  </small>
                </div>
              </div>

              <div className="analytics-card analytics-purple">
                <div className="analytics-card-icon">
                  👤
                </div>

                <div>
                  <span>
                    Your Prompts
                  </span>

                  <strong>
                    {
                      chatAnalytics
                        .userMessages
                    }
                  </strong>

                  <small>
                    Questions sent to AI
                  </small>
                </div>
              </div>

              <div className="analytics-card analytics-green">
                <div className="analytics-card-icon">
                  🤖
                </div>

                <div>
                  <span>
                    AI Responses
                  </span>

                  <strong>
                    {
                      chatAnalytics
                        .aiResponses
                    }
                  </strong>

                  <small>
                    Successful responses
                  </small>
                </div>
              </div>

              <div className="analytics-card analytics-orange">
                <div className="analytics-card-icon">
                  📝
                </div>

                <div>
                  <span>
                    Total Characters
                  </span>

                  <strong>
                    {
                      chatAnalytics
                        .totalCharacters
                    }
                  </strong>

                  <small>
                    Complete chat content
                  </small>
                </div>
              </div>

              <div className="analytics-card analytics-cyan">
                <div className="analytics-card-icon">
                  📏
                </div>

                <div>
                  <span>
                    Average AI Length
                  </span>

                  <strong>
                    {
                      chatAnalytics
                        .averageResponseLength
                    }
                  </strong>

                  <small>
                    Characters per response
                  </small>
                </div>
              </div>

              <div className="analytics-card analytics-red">
                <div className="analytics-card-icon">
                  ⚠️
                </div>

                <div>
                  <span>
                    Failed Responses
                  </span>

                  <strong>
                    {
                      chatAnalytics
                        .failedResponses
                    }
                  </strong>

                  <small>
                    AI request errors
                  </small>
                </div>
              </div>
            </div>
          </section>
        )}

        <section
          className="chat-area"
          ref={chatAreaRef}
        >
          {messages.length === 0 && (
            <div className="welcome-section">
              <div className="welcome-card">
                <div className="welcome-icon">
                  🤖
                </div>

                <h2>
                  How can I help you today,
                  {` ${userName}`}?
                </h2>

                <p>
                  Ask DKPilot AI to create emails,
                  business reports, marketing ideas,
                  invoice content and professional
                  documents.
                </p>
              </div>

              <div className="suggestion-grid">
                <button
                  onClick={() =>
                    sendSuggestion(
                      "Write a professional leave email for tomorrow"
                    )
                  }
                >
                  <span className="suggestion-icon">
                    ✉️
                  </span>

                  <div>
                    <strong>
                      Write an Email
                    </strong>

                    <p>
                      Generate professional business
                      emails.
                    </p>
                  </div>

                  <span className="suggestion-arrow">
                    →
                  </span>
                </button>

                <button
                  onClick={() =>
                    sendSuggestion(
                      "Give me five marketing ideas for a small technology business"
                    )
                  }
                >
                  <span className="suggestion-icon">
                    💡
                  </span>

                  <div>
                    <strong>
                      Marketing Ideas
                    </strong>

                    <p>
                      Create practical promotion
                      strategies.
                    </p>
                  </div>

                  <span className="suggestion-arrow">
                    →
                  </span>
                </button>

                <button
                  onClick={() =>
                    sendSuggestion(
                      "Create a professional weekly business performance report"
                    )
                  }
                >
                  <span className="suggestion-icon">
                    📊
                  </span>

                  <div>
                    <strong>
                      Business Report
                    </strong>

                    <p>
                      Prepare structured business
                      reports.
                    </p>
                  </div>

                  <span className="suggestion-arrow">
                    →
                  </span>
                </button>

                <button
                  onClick={() =>
                    sendSuggestion(
                      "Create a professional invoice description for website development service"
                    )
                  }
                >
                  <span className="suggestion-icon">
                    📄
                  </span>

                  <div>
                    <strong>
                      Invoice Content
                    </strong>

                    <p>
                      Generate clear invoice
                      descriptions.
                    </p>
                  </div>

                  <span className="suggestion-arrow">
                    →
                  </span>
                </button>

                <button
                  onClick={() =>
                    sendSuggestion(
                      "Create a meeting agenda for a client project discussion"
                    )
                  }
                >
                  <span className="suggestion-icon">
                    📅
                  </span>

                  <div>
                    <strong>
                      Meeting Agenda
                    </strong>

                    <p>
                      Plan meetings and business
                      schedules.
                    </p>
                  </div>

                  <span className="suggestion-arrow">
                    →
                  </span>
                </button>

                <button
                  onClick={() =>
                    sendSuggestion(
                      "Suggest ways to improve customer satisfaction for a small business"
                    )
                  }
                >
                  <span className="suggestion-icon">
                    👥
                  </span>

                  <div>
                    <strong>
                      Customer Support
                    </strong>

                    <p>
                      Improve customer relationships.
                    </p>
                  </div>

                  <span className="suggestion-arrow">
                    →
                  </span>
                </button>
              </div>
            </div>
          )}
                    {messages.length > 0 && (
            <div className="message-list">
              {filteredMessages.length === 0 ? (
                <div className="no-search-result">
                  <div>🔍</div>

                  <h3>No matching messages</h3>

                  <p>
                    Try another search keyword.
                  </p>
                </div>
              ) : (
                filteredMessages.map(
                  (chatMessage, index) => (
                    <div
                      key={chatMessage.id}
                      className={`message-row ${
                        chatMessage.sender ===
                        "user"
                          ? "user-row"
                          : "ai-row"
                      }`}
                    >
                      <div className="message-avatar">
                        {chatMessage.sender ===
                        "user"
                          ? userName
                              .charAt(0)
                              .toUpperCase()
                          : "🤖"}
                      </div>

                      <div className="message-content">
                        <div className="message-header">
                          <div>
                            <strong>
                              {chatMessage.sender ===
                              "user"
                                ? userName
                                : "DKPilot AI"}
                            </strong>

                            <span>
                              {formatMessageDate(
                                chatMessage.createdAt
                              )}
                            </span>
                          </div>

                          <div className="message-actions">
                            <button
                              onClick={() =>
                                copyMessage(
                                  chatMessage
                                )
                              }
                              title="Copy Message"
                            >
                              {copiedMessageId ===
                              chatMessage.id
                                ? "✅"
                                : "📋"}
                            </button>

                            {chatMessage.sender ===
                              "ai" && (
                              <button
                                onClick={() =>
                                  regenerateResponse(
                                    messages.findIndex(
                                      (item) =>
                                        item.id ===
                                        chatMessage.id
                                    )
                                  )
                                }
                                disabled={loading}
                                title="Regenerate Response"
                              >
                                🔄
                              </button>
                            )}

                            <button
                              onClick={() =>
                                deleteMessage(
                                  chatMessage.id
                                )
                              }
                              title="Delete Message"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div
                          className={`message-bubble ${
                            chatMessage.sender ===
                            "user"
                              ? "user-bubble"
                              : chatMessage.isError
                                ? "error-bubble"
                                : "ai-bubble"
                          }`}
                        >
                          <p>
                            {chatMessage.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          )}

          {loading && (
            <div className="message-row ai-row">
              <div className="message-avatar">
                🤖
              </div>

              <div className="message-content">
                <div className="message-header">
                  <div>
                    <strong>
                      DKPilot AI
                    </strong>

                    <span>
                      Thinking...
                    </span>
                  </div>
                </div>

                <div className="message-bubble ai-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="chat-input-section">
          <div className="chat-input-toolbar">
            <div className="input-helper-text">
              <span>
                💡
              </span>

              <p>
                Enter press pannina send aagum.
                Shift + Enter use pannina new line
                varum.
              </p>
            </div>

            <div className="message-character-count">
              {message.length} characters
            </div>
          </div>

          <div className="chat-input-area">
            <textarea
              rows="1"
              placeholder="Message DKPilot AI..."
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              disabled={loading}
            />

            <button
              onClick={() => askAI()}
              disabled={
                loading ||
                !message.trim()
              }
            >
              {loading
                ? "Sending..."
                : "Send 🚀"}
            </button>
          </div>

          <div className="chat-footer-note">
            DKPilot AI can make mistakes.
            Important business information-a
            verify pannunga.
          </div>
        </section>
      </main>
    </div>
  );
}

export default AIAssistant;