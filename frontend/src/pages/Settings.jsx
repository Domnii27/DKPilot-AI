import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Settings() {
  const navigate = useNavigate();

  const getSavedUser = () => {
    try {
      const savedUser = localStorage.getItem("loggedInUser");

      return savedUser
        ? JSON.parse(savedUser)
        : {
            name: "Sanjay",
            email: "",
          };
    } catch (error) {
      console.error("User data read error:", error);

      return {
        name: "Sanjay",
        email: "",
      };
    }
  };

  const savedUser = getSavedUser();

  const [name, setName] = useState(
    savedUser?.name || "Sanjay"
  );

  const [email] = useState(
    savedUser?.email || "Email not available"
  );

  const [profilePhoto, setProfilePhoto] = useState(
    localStorage.getItem("profilePhoto") || ""
  );

  const [theme, setTheme] = useState(
    localStorage.getItem("appTheme") || "light"
  );

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(
      localStorage.getItem("notificationsEnabled") !== "false"
    );

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (selectedTheme) => {
    document.body.style.backgroundColor =
      selectedTheme === "dark"
        ? "#020617"
        : "#f1f5f9";

    document.body.style.color =
      selectedTheme === "dark"
        ? "#f8fafc"
        : "#0f172a";
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showMessage(
        "Please select a valid image file.",
        "error"
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showMessage(
        "Profile image must be below 2 MB.",
        "error"
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      setProfilePhoto(imageData);

      showMessage(
        "Profile photo selected. Save Changes click pannu."
      );
    };

    reader.onerror = () => {
      showMessage(
        "Profile photo load panna mudiyala.",
        "error"
      );
    };

    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = () => {
    setProfilePhoto("");
    localStorage.removeItem("profilePhoto");

    showMessage("Profile photo removed.");
  };

  const saveSettings = () => {
    if (!name.trim()) {
      showMessage(
        "Name empty-ah irukka koodadhu.",
        "error"
      );
      return;
    }

    const currentSavedUser = getSavedUser();

    const updatedUser = {
      ...currentSavedUser,
      name: name.trim(),
      email: currentSavedUser?.email || email,
    };

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify(updatedUser)
    );

    if (profilePhoto) {
      localStorage.setItem(
        "profilePhoto",
        profilePhoto
      );
    } else {
      localStorage.removeItem("profilePhoto");
    }

    localStorage.setItem("appTheme", theme);

    localStorage.setItem(
      "notificationsEnabled",
      String(notificationsEnabled)
    );

    applyTheme(theme);

    showMessage("Settings saved successfully.");
  };

  const resetSettings = () => {
    const currentUser = getSavedUser();

    setName(currentUser?.name || "Sanjay");

    setProfilePhoto(
      localStorage.getItem("profilePhoto") || ""
    );

    setTheme(
      localStorage.getItem("appTheme") || "light"
    );

    setNotificationsEnabled(
      localStorage.getItem("notificationsEnabled") !==
        "false"
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    showMessage("Unsaved changes cleared.");
  };

  const changePassword = async () => {
    if (!currentPassword) {
      showMessage(
        "Current password enter pannu.",
        "error"
      );
      return;
    }

    if (!newPassword) {
      showMessage(
        "New password enter pannu.",
        "error"
      );
      return;
    }

    if (newPassword.length < 6) {
      showMessage(
        "New password minimum 6 characters irukkanum.",
        "error"
      );
      return;
    }

    if (!confirmPassword) {
      showMessage(
        "Confirm password enter pannu.",
        "error"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        "New password and confirm password match aagala.",
        "error"
      );
      return;
    }

    if (currentPassword === newPassword) {
      showMessage(
        "New password current password-la irundhu different-ah irukkanum.",
        "error"
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      showMessage(
        "Login session expired. Please login again.",
        "error"
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await axios.post(
        "http://localhost:8081/api/users/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showMessage(
        response.data?.message ||
          "Password updated successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);

      if (
        error.response?.status === 401 &&
        error.response?.data?.message ===
          "Current password is incorrect"
      ) {
        showMessage(
          "Current password is incorrect.",
          "error"
        );
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        showMessage(
          error.response?.data?.message ||
            "Login session expired. Please login again.",
          "error"
        );
      } else if (error.response?.data?.message) {
        showMessage(
          error.response.data.message,
          "error"
        );
      } else {
        showMessage(
          "Password update panna mudiyala.",
          "error"
        );
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const logout = () => {
    const confirmation = window.confirm(
      "Logout panna sure-ah?"
    );

    if (!confirmation) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");

    navigate("/login");
  };

  const userInitial =
    name.trim().charAt(0).toUpperCase() || "U";

  const darkMode = theme === "dark";

  const pageStyle = {
    ...styles.page,
    background: darkMode ? "#020617" : "#f1f5f9",
    color: darkMode ? "#f8fafc" : "#0f172a",
  };

  const cardStyle = {
    ...styles.card,
    background: darkMode ? "#0f172a" : "#ffffff",
    color: darkMode ? "#f8fafc" : "#0f172a",
    borderColor: darkMode ? "#334155" : "#e2e8f0",
  };

  const inputStyle = {
    ...styles.input,
    background: darkMode ? "#1e293b" : "#ffffff",
    color: darkMode ? "#f8fafc" : "#0f172a",
    borderColor: darkMode ? "#475569" : "#cbd5e1",
  };

  return (
    <div style={pageStyle}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>⚙️ Settings</h1>

            <p
              style={{
                ...styles.subtitle,
                color: darkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              Manage your profile, password and application
              preferences.
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>

        {message && (
          <div
            style={{
              ...styles.message,
              background:
                messageType === "error"
                  ? darkMode
                    ? "#450a0a"
                    : "#fef2f2"
                  : darkMode
                    ? "#052e16"
                    : "#f0fdf4",
              color:
                messageType === "error"
                  ? darkMode
                    ? "#fca5a5"
                    : "#b91c1c"
                  : darkMode
                    ? "#86efac"
                    : "#166534",
            }}
          >
            {message}
          </div>
        )}

        <div style={styles.mainGrid}>
          <div style={cardStyle}>
            <h2 style={styles.cardTitle}>
              👤 Profile Settings
            </h2>

            <p
              style={{
                ...styles.cardSubtitle,
                color: darkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              Update your display name and profile photo.
            </p>

            <div style={styles.profileSection}>
              <div style={styles.avatarWrapper}>
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    style={styles.profileImage}
                  />
                ) : (
                  <div style={styles.profileAvatar}>
                    {userInitial}
                  </div>
                )}

                <label style={styles.uploadButton}>
                  📷 Upload Photo

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={styles.hiddenInput}
                  />
                </label>

                {profilePhoto && (
                  <button
                    onClick={removeProfilePhoto}
                    style={styles.removePhotoButton}
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <div style={styles.profileForm}>
                <label style={styles.label}>
                  Display Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your name"
                  style={inputStyle}
                />

                <label style={styles.label}>
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  readOnly
                  style={{
                    ...inputStyle,
                    opacity: 0.75,
                    cursor: "not-allowed",
                  }}
                />

                <p
                  style={{
                    ...styles.helpText,
                    color: darkMode
                      ? "#94a3b8"
                      : "#64748b",
                  }}
                >
                  Email login account-la irundhu load aagudhu.
                </p>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={styles.cardTitle}>
              🎨 Appearance
            </h2>

            <p
              style={{
                ...styles.cardSubtitle,
                color: darkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              Choose your preferred application theme.
            </p>

            <div style={styles.themeGrid}>
              <button
                onClick={() => setTheme("light")}
                style={{
                  ...styles.themeButton,
                  ...(theme === "light"
                    ? styles.activeThemeButton
                    : {}),
                  background:
                    theme === "light"
                      ? "#eff6ff"
                      : darkMode
                        ? "#1e293b"
                        : "#ffffff",
                  color: darkMode
                    ? "#f8fafc"
                    : "#0f172a",
                }}
              >
                <span style={styles.themeIcon}>☀️</span>

                <span style={styles.themeTitle}>
                  Light Mode
                </span>

                <span
                  style={{
                    ...styles.themeText,
                    color: darkMode
                      ? "#94a3b8"
                      : "#64748b",
                  }}
                >
                  Bright and clean interface
                </span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                style={{
                  ...styles.themeButton,
                  ...(theme === "dark"
                    ? styles.activeThemeButton
                    : {}),
                  background:
                    theme === "dark"
                      ? "#1e293b"
                      : "#ffffff",
                  color:
                    theme === "dark"
                      ? "#ffffff"
                      : "#0f172a",
                }}
              >
                <span style={styles.themeIcon}>🌙</span>

                <span style={styles.themeTitle}>
                  Dark Mode
                </span>

                <span
                  style={{
                    ...styles.themeText,
                    color:
                      theme === "dark"
                        ? "#cbd5e1"
                        : "#64748b",
                  }}
                >
                  Comfortable for low-light use
                </span>
              </button>
            </div>
          </div>
        </div>

        <div style={styles.bottomGrid}>
          <div style={cardStyle}>
            <h2 style={styles.cardTitle}>
              🔔 Notifications
            </h2>

            <p
              style={{
                ...styles.cardSubtitle,
                color: darkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              Manage application notification preferences.
            </p>

            <div style={styles.settingRow}>
              <div>
                <strong>Application Notifications</strong>

                <p
                  style={{
                    ...styles.settingDescription,
                    color: darkMode
                      ? "#94a3b8"
                      : "#64748b",
                  }}
                >
                  Allow reminders and business alerts.
                </p>
              </div>

              <button
                onClick={() =>
                  setNotificationsEnabled(
                    !notificationsEnabled
                  )
                }
                style={{
                  ...styles.toggleButton,
                  background: notificationsEnabled
                    ? "#2563eb"
                    : "#94a3b8",
                }}
              >
                <span
                  style={{
                    ...styles.toggleCircle,
                    transform: notificationsEnabled
                      ? "translateX(24px)"
                      : "translateX(0)",
                  }}
                />
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={styles.cardTitle}>
              🔐 Change Password
            </h2>

            <p
              style={{
                ...styles.cardSubtitle,
                color: darkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              Enter your current password and choose a new
              secure password.
            </p>

            <label style={styles.label}>
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              placeholder="Enter current password"
              style={inputStyle}
            />

            <label style={styles.label}>
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="Minimum 6 characters"
              style={inputStyle}
            />

            <label style={styles.label}>
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Enter new password again"
              style={inputStyle}
            />

            <button
              style={{
                ...styles.changePasswordButton,
                opacity: passwordLoading ? 0.7 : 1,
                cursor: passwordLoading
                  ? "not-allowed"
                  : "pointer",
              }}
              onClick={changePassword}
              disabled={passwordLoading}
            >
              {passwordLoading
                ? "Updating Password..."
                : "🔑 Update Password"}
            </button>

            <button
              style={styles.logoutButton}
              onClick={logout}
            >
              🚪 Logout Account
            </button>
          </div>
        </div>

        <div
          style={{
            ...styles.actionBar,
            background: darkMode
              ? "#0f172a"
              : "#ffffff",
          }}
        >
          <button
            style={styles.resetButton}
            onClick={resetSettings}
          >
            Reset Changes
          </button>

          <button
            style={styles.saveButton}
            onClick={saveSettings}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "35px 20px",
    fontFamily: "Arial, Helvetica, sans-serif",
    transition:
      "background-color 0.25s ease, color 0.25s ease",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
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
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
  },

  backButton: {
    padding: "11px 17px",
    border: "none",
    borderRadius: "9px",
    background: "#0f172a",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  message: {
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "10px",
    textAlign: "center",
    fontWeight: "bold",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(320px, 1.4fr) minmax(280px, 0.8fr)",
    gap: "22px",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "22px",
    marginTop: "22px",
  },

  card: {
    padding: "27px",
    border: "1px solid",
    borderRadius: "18px",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  cardTitle: {
    marginTop: 0,
    marginBottom: "8px",
    fontSize: "23px",
  },

  cardSubtitle: {
    marginTop: 0,
    marginBottom: "22px",
    lineHeight: "1.6",
  },

  profileSection: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: "30px",
    alignItems: "start",
  },

  avatarWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },

  profileAvatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "45px",
    fontWeight: "bold",
  },

  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #dbeafe",
  },

  uploadButton: {
    padding: "10px 14px",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  hiddenInput: {
    display: "none",
  },

  removePhotoButton: {
    border: "none",
    background: "transparent",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: "bold",
  },

  profileForm: {
    width: "100%",
  },

  label: {
    display: "block",
    marginTop: "15px",
    marginBottom: "7px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    padding: "13px",
    boxSizing: "border-box",
    border: "1px solid",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
  },

  helpText: {
    marginTop: "8px",
    fontSize: "13px",
  },

  themeGrid: {
    display: "grid",
    gap: "14px",
  },

  themeButton: {
    width: "100%",
    padding: "18px",
    border: "2px solid #e2e8f0",
    borderRadius: "13px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    cursor: "pointer",
  },

  activeThemeButton: {
    borderColor: "#2563eb",
  },

  themeIcon: {
    fontSize: "28px",
    marginBottom: "10px",
  },

  themeTitle: {
    fontWeight: "bold",
    fontSize: "16px",
  },

  themeText: {
    marginTop: "6px",
    fontSize: "13px",
  },

  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "18px",
    borderRadius: "12px",
    background: "rgba(148, 163, 184, 0.1)",
  },

  settingDescription: {
    marginTop: "6px",
    marginBottom: 0,
    fontSize: "13px",
  },

  toggleButton: {
    width: "52px",
    height: "28px",
    flexShrink: 0,
    padding: "2px",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
  },

  toggleCircle: {
    display: "block",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#ffffff",
    transition: "transform 0.2s ease",
  },

  changePasswordButton: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
  },

  logoutButton: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    border: "none",
    borderRadius: "9px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "bold",
    cursor: "pointer",
  },

  actionBar: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "24px",
    padding: "20px",
    borderRadius: "15px",
  },

  resetButton: {
    padding: "12px 22px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "bold",
  },

  saveButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Settings;