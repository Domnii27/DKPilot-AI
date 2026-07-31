import { useState } from "react";
import axios from "axios";
import "./AIAssistant.css";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:8081/api/ai/chat",
        {
          message: trimmedMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: response.data.answer,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);
    } catch (error) {
      console.error(error);

      const errorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: "AI response generate panna mudiyala. Please try again.",
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
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askAI();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setMessage("");
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

        <div className="sidebar-note">
          <p>Business Assistant</p>
          <span>Ask emails, ideas, reports and more.</span>
        </div>
      </aside>

      <main className="ai-main">
        <header className="ai-header">
          <div>
            <h1>DKPilot AI Assistant</h1>
            <p>Your intelligent business automation partner</p>
          </div>

          <div className="online-status">
            <span></span>
            Online
          </div>
        </header>

        <section className="chat-area">
          {messages.length === 0 && (
            <div className="welcome-card">
              <div className="welcome-icon">🤖</div>

              <h2>How can I help you today?</h2>

              <p>
                Ask me to create emails, business ideas,
                reports or professional content.
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
              <div className="message-avatar">🤖</div>

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
            disabled={loading || !message.trim()}
          >
            Send 🚀
          </button>
        </section>
      </main>
    </div>
  );
}

export default AIAssistant;