import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const logout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="profile-page-container">
      <div className="profile-sidebar">
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

      <div className="profile-content">
        <div className="profile-card">
          <img
            src="https://i.pravatar.cc/150"
            alt="Profile"
            className="profile-image"
          />

          <h1>My Profile</h1>

          <div className="profile-information">
            <label>Full Name</label>
            <input
              type="text"
              value={user ? user.name : ""}
              readOnly
            />

            <label>Email Address</label>
            <input
              type="email"
              value={user ? user.email : ""}
              readOnly
            />

            <label>User ID</label>
            <input
              type="text"
              value={user ? user.id : ""}
              readOnly
            />
          </div>

          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;