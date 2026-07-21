import "./Dashboard.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("loggedInUser");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  useEffect(() => {
    if (!token || !user) {
      navigate("/login", { replace: true });
    }
  }, [token, user, navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");

    navigate("/login", { replace: true });
  };

  if (!token || !user) {
    return null;
  }

  return (
    <div className="dashboard-container">

      <div className="sidebar">
        <h2>DKPilot AI</h2>

        <ul>
          <li onClick={() => navigate("/dashboard")}>
            🏠 Dashboard
          </li>

          <li onClick={() => navigate("/profile")}>
            👤 Profile
          </li>

          <li onClick={() => navigate("/ai")}>
            🤖 AI Assistant
          </li>

          <li onClick={() => navigate("/email")}>
            📧 Email
          </li>

          <li onClick={() => navigate("/invoice")}>
            📄 Invoice
          </li>

          <li onClick={() => navigate("/schedule")}>
            📅 Schedule
          </li>

          <li onClick={() => navigate("/settings")}>
            ⚙️ Settings
          </li>
        </ul>

        <button onClick={logout}>
          Logout
        </button>
      </div>

      <div className="dashboard">

        <div className="profile">
          <img
            src="https://i.pravatar.cc/100"
            alt="Profile"
          />

          <div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <h1>
          🚀 Welcome Back {user.name} 👋
        </h1>

        <div
          className="card"
          onClick={() => navigate("/ai")}
        >
          <h2>🤖 AI Assistant</h2>
          <p>Chat with AI for business automation.</p>
        </div>

        <div
          className="card"
          onClick={() => navigate("/email")}
        >
          <h2>📧 Email Automation</h2>
          <p>Automatically send emails to customers.</p>
        </div>

        <div
          className="card"
          onClick={() => navigate("/invoice")}
        >
          <h2>📄 Invoice Generator</h2>
          <p>Create invoices instantly.</p>
        </div>

        <div
          className="card"
          onClick={() => navigate("/schedule")}
        >
          <h2>📅 Schedule</h2>
          <p>Manage meetings and appointments.</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;