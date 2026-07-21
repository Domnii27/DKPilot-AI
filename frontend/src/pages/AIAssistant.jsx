import { useState } from "react";
import axios from "axios";

function AIAssistant() {

  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {

    if (!message.trim()) {
      alert("Please enter your question");
      return;
    }

    setLoading(true);

    try {

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:8081/api/ai/chat",

        {
          message: message
        },

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAnswer(response.data.answer);

    } catch (error) {

      console.error(error);

      setAnswer("AI response generate panna mudiyala.");

    }

    setLoading(false);

  };

  return (

    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "auto"
      }}
    >

      <h1>🤖 DKPilot AI Assistant</h1>

      <textarea

        rows="6"

        style={{
          width: "100%",
          fontSize: "18px",
          padding: "10px"
        }}

        placeholder="Ask anything..."

        value={message}

        onChange={(e) =>
          setMessage(e.target.value)
        }

      />

      <br />
      <br />

      <button

        onClick={askAI}

        style={{
          padding: "12px 30px",
          fontSize: "18px"
        }}

      >
        Ask AI
      </button>

      <br />
      <br />

      {loading &&

        <h3>
          Thinking...
        </h3>

      }

      {answer &&

        <div

          style={{
            background: "#f3f3f3",
            padding: "20px",
            borderRadius: "10px"
          }}

        >

          <h2>AI Response</h2>

          <p
            style={{
              whiteSpace: "pre-wrap"
            }}
          >
            {answer}
          </p>

        </div>

      }

    </div>

  );

}

export default AIAssistant;