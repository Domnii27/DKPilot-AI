import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    companyName: "",
    phone: "",
    address: "",
    website: "",
    theme: "Light",
    notifications: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const headers = useMemo(() => {
    const token = getToken();

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  useEffect(() => {
    loadProfile();

    const savedTheme =
      localStorage.getItem("dkpilotTheme");

    if (savedTheme) {
      setProfile((previous) => ({
        ...previous,
        theme: savedTheme,
      }));
    }
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/settings/profile",
        {
          headers,
        }
      );

      if (response.data) {
        setProfile({
          name: response.data.name || "",
          email: response.data.email || "",
          companyName:
            response.data.companyName || "",
          phone: response.data.phone || "",
          address:
            response.data.address || "",
          website:
            response.data.website || "",
          theme:
            response.data.theme || "Light",
          notifications:
            response.data.notifications ??
            true,
        });

        if (response.data.profileImage) {
          setPreviewImage(
            response.data.profileImage
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setProfile((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImage = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setProfileImage(file);

    const reader = new FileReader();

    reader.onload = () => {
      setPreviewImage(reader.result);
    };

    reader.readAsDataURL(file);
  };
    const handleThemeChange = (themeValue) => {
    setProfile((previous) => ({
      ...previous,
      theme: themeValue,
    }));

    localStorage.setItem(
      "dkpilotTheme",
      themeValue
    );

    if (themeValue === "Dark") {
      document.body.style.background =
        "#020617";

      document.body.style.color =
        "#e2e8f0";
    } else {
      document.body.style.background =
        "#f1f5f9";

      document.body.style.color =
        "#0f172a";
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setPreviewImage("");

    localStorage.removeItem(
      "profilePhoto"
    );
  };

  const validateProfile = () => {
    if (!profile.name.trim()) {
      setError("Name enter pannu.");
      return false;
    }

    if (!profile.email.trim()) {
      setError("Email enter pannu.");
      return false;
    }

    if (!profile.email.includes("@")) {
      setError(
        "Valid email enter pannu."
      );
      return false;
    }

    setError("");
    return true;
  };

  const saveProfile = async () => {
    if (!validateProfile()) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Session expired. Please login again."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const formData = new FormData();

      formData.append(
        "name",
        profile.name.trim()
      );

      formData.append(
        "email",
        profile.email.trim()
      );

      formData.append(
        "companyName",
        profile.companyName.trim()
      );

      formData.append(
        "phone",
        profile.phone.trim()
      );

      formData.append(
        "address",
        profile.address.trim()
      );

      formData.append(
        "website",
        profile.website.trim()
      );

      formData.append(
        "theme",
        profile.theme
      );

      formData.append(
        "notifications",
        String(profile.notifications)
      );

      if (profileImage) {
        formData.append(
          "profileImage",
          profileImage
        );
      }

      const response = await axios.put(
        "http://localhost:8081/api/settings/profile",
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const updatedProfile =
        response.data || profile;

      setProfile((previous) => ({
        ...previous,
        name:
          updatedProfile.name ||
          previous.name,
        email:
          updatedProfile.email ||
          previous.email,
        companyName:
          updatedProfile.companyName ??
          previous.companyName,
        phone:
          updatedProfile.phone ??
          previous.phone,
        address:
          updatedProfile.address ??
          previous.address,
        website:
          updatedProfile.website ??
          previous.website,
        theme:
          updatedProfile.theme ||
          previous.theme,
        notifications:
          updatedProfile.notifications ??
          previous.notifications,
      }));

      if (updatedProfile.profileImage) {
        setPreviewImage(
          updatedProfile.profileImage
        );

        localStorage.setItem(
          "profilePhoto",
          updatedProfile.profileImage
        );
      } else if (previewImage) {
        localStorage.setItem(
          "profilePhoto",
          previewImage
        );
      }

      const existingUser =
        JSON.parse(
          localStorage.getItem(
            "loggedInUser"
          ) || "{}"
        );

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          ...existingUser,
          name: profile.name.trim(),
          email: profile.email.trim(),
        })
      );

      setProfileImage(null);

      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        setError(
          "Session expired. Please login again."
        );
      } else if (
        err.response?.data?.message
      ) {
        setError(
          err.response.data.message
        );
      } else {
        setError(
          "Profile update panna mudiyala."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (
      !passwordData.currentPassword
        .trim()
    ) {
      setError(
        "Current password enter pannu."
      );
      return;
    }

    if (
      !passwordData.newPassword.trim()
    ) {
      setError(
        "New password enter pannu."
      );
      return;
    }

    if (
      passwordData.newPassword.length <
      6
    ) {
      setError(
        "New password minimum 6 characters irukkanum."
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setError(
        "New password and confirm password match aagala."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Session expired. Please login again."
      );
      return;
    }

    try {
      setPasswordLoading(true);
      setMessage("");
      setError("");

      await axios.put(
        "http://localhost:8081/api/users/change-password",
        {
          currentPassword:
            passwordData.currentPassword,
          newPassword:
            passwordData.newPassword,
          confirmPassword:
            passwordData.confirmPassword,
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

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(
        "Password changed successfully."
      );
    } catch (err) {
      console.error(
        "Password change error:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        setError(
          "Current password incorrect or session expired."
        );
      } else if (
        typeof err.response?.data ===
        "string"
      ) {
        setError(err.response.data);
      } else if (
        err.response?.data?.message
      ) {
        setError(
          err.response.data.message
        );
      } else {
        setError(
          "Password change panna mudiyala."
        );
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const resetProfileForm = () => {
    loadProfile();
    setProfileImage(null);
    setMessage("");
    setError("");
  };

  const profileCompletion =
    useMemo(() => {
      const profileValues = [
        profile.name,
        profile.email,
        profile.companyName,
        profile.phone,
        profile.address,
        profile.website,
      ];

      const completedFields =
        profileValues.filter(
          (value) =>
            String(value || "").trim()
        ).length;

      return Math.round(
        (completedFields /
          profileValues.length) *
          100
      );
    }, [profile]);

  const isDarkMode =
    profile.theme === "Dark";

  const userInitial =
    profile.name
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  const pageStyle = {
    ...styles.page,
    background: isDarkMode
      ? "#020617"
      : "#f1f5f9",
    color: isDarkMode
      ? "#e2e8f0"
      : "#0f172a",
  };

  const cardStyle = {
    background: isDarkMode
      ? "#0f172a"
      : "#ffffff",
    color: isDarkMode
      ? "#e2e8f0"
      : "#0f172a",
  };

  const fieldStyle = {
    ...styles.input,
    background: isDarkMode
      ? "#111827"
      : "#ffffff",
    color: isDarkMode
      ? "#e2e8f0"
      : "#0f172a",
    borderColor: isDarkMode
      ? "#334155"
      : "#cbd5e1",
  };

  const textareaStyle = {
    ...styles.textarea,
    background: isDarkMode
      ? "#111827"
      : "#ffffff",
    color: isDarkMode
      ? "#e2e8f0"
      : "#0f172a",
    borderColor: isDarkMode
      ? "#334155"
      : "#cbd5e1",
  };

  return (
        <div style={pageStyle}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1
              style={{
                ...styles.title,
                color: isDarkMode
                  ? "#f8fafc"
                  : "#0f172a",
              }}
            >
              ⚙️ Settings
            </h1>

            <p
              style={{
                ...styles.subtitle,
                color: isDarkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              Manage your profile, company information,
              password and application preferences.
            </p>
          </div>

          <div
            style={{
              ...styles.progressCard,
              ...cardStyle,
            }}
          >
            <span style={styles.progressLabel}>
              Profile Completion
            </span>

            <strong style={styles.progressValue}>
              {profileCompletion}%
            </strong>

            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${profileCompletion}%`,
                }}
              />
            </div>
          </div>
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

        <div style={styles.grid}>
          <div
            style={{
              ...styles.leftCard,
              ...cardStyle,
            }}
          >
            <h2
              style={{
                ...styles.sectionTitle,
                color: isDarkMode
                  ? "#f8fafc"
                  : "#0f172a",
              }}
            >
              👤 Profile Information
            </h2>

            <div style={styles.profileTop}>
              <div style={styles.avatar}>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    style={styles.avatarImage}
                  />
                ) : (
                  userInitial
                )}
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  style={{
                    color: isDarkMode
                      ? "#cbd5e1"
                      : "#334155",
                  }}
                />

                <div style={styles.imageButtons}>
                  <button
                    onClick={removeProfileImage}
                    style={styles.removeButton}
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            </div>

            <label style={styles.label}>
              Full Name
            </label>

            <input
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              style={fieldStyle}
            />

            <label style={styles.label}>
              Email
            </label>

            <input
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              style={fieldStyle}
            />

            <label style={styles.label}>
              Company Name
            </label>

            <input
              name="companyName"
              value={profile.companyName}
              onChange={handleProfileChange}
              style={fieldStyle}
            />

            <label style={styles.label}>
              Phone Number
            </label>

            <input
              name="phone"
              value={profile.phone}
              onChange={handleProfileChange}
              style={fieldStyle}
            />

            <label style={styles.label}>
              Address
            </label>

            <textarea
              name="address"
              value={profile.address}
              onChange={handleProfileChange}
              rows="4"
              style={textareaStyle}
            />

            <label style={styles.label}>
              Website
            </label>

            <input
              name="website"
              value={profile.website}
              onChange={handleProfileChange}
              style={fieldStyle}
            />

            <div style={styles.buttonRow}>
              <button
                onClick={saveProfile}
                disabled={loading}
                style={{
                  ...styles.saveButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {loading
                  ? "Saving..."
                  : "💾 Save Profile"}
              </button>

              <button
                onClick={resetProfileForm}
                disabled={loading}
                style={{
                  ...styles.cancelButton,
                  background: isDarkMode
                    ? "#111827"
                    : "#ffffff",
                  color: isDarkMode
                    ? "#e2e8f0"
                    : "#334155",
                  borderColor: isDarkMode
                    ? "#334155"
                    : "#cbd5e1",
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div style={styles.rightColumn}>
            <div
              style={{
                ...styles.preferenceCard,
                ...cardStyle,
              }}
            >
              <h2
                style={{
                  ...styles.sectionTitle,
                  color: isDarkMode
                    ? "#f8fafc"
                    : "#0f172a",
                }}
              >
                🎨 Appearance
              </h2>

              <p
                style={{
                  ...styles.sectionSubtitle,
                  color: isDarkMode
                    ? "#94a3b8"
                    : "#64748b",
                }}
              >
                Choose your preferred application theme.
              </p>

              <div style={styles.themeGrid}>
                <button
                  onClick={() =>
                    handleThemeChange("Light")
                  }
                  style={{
                    ...styles.themeButton,
                    background: isDarkMode
                      ? "#111827"
                      : "#f8fafc",
                    color: isDarkMode
                      ? "#e2e8f0"
                      : "#334155",
                    borderColor: isDarkMode
                      ? "#334155"
                      : "#cbd5e1",
                    ...(profile.theme === "Light"
                      ? styles.activeThemeButton
                      : {}),
                  }}
                >
                  <span style={styles.themeIcon}>
                    ☀️
                  </span>

                  <strong>
                    Light Mode
                  </strong>

                  <small>
                    Bright and clean interface
                  </small>
                </button>

                <button
                  onClick={() =>
                    handleThemeChange("Dark")
                  }
                  style={{
                    ...styles.themeButton,
                    background: isDarkMode
                      ? "#111827"
                      : "#f8fafc",
                    color: isDarkMode
                      ? "#e2e8f0"
                      : "#334155",
                    borderColor: isDarkMode
                      ? "#334155"
                      : "#cbd5e1",
                    ...(profile.theme === "Dark"
                      ? styles.activeThemeButton
                      : {}),
                  }}
                >
                  <span style={styles.themeIcon}>
                    🌙
                  </span>

                  <strong>
                    Dark Mode
                  </strong>

                  <small>
                    Comfortable in low light
                  </small>
                </button>
              </div>
            </div>

            <div
              style={{
                ...styles.preferenceCard,
                ...cardStyle,
              }}
            >
              <h2
                style={{
                  ...styles.sectionTitle,
                  color: isDarkMode
                    ? "#f8fafc"
                    : "#0f172a",
                }}
              >
                🔔 Notifications
              </h2>

              <p
                style={{
                  ...styles.sectionSubtitle,
                  color: isDarkMode
                    ? "#94a3b8"
                    : "#64748b",
                }}
              >
                Control business reminders and application alerts.
              </p>

              <div style={styles.notificationRow}>
                <div>
                  <strong>
                    Application Notifications
                  </strong>

                  <p
                    style={{
                      ...styles.notificationText,
                      color: isDarkMode
                        ? "#94a3b8"
                        : "#64748b",
                    }}
                  >
                    Receive reminders for schedules and business activities.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setProfile(
                      (previousProfile) => ({
                        ...previousProfile,
                        notifications:
                          !previousProfile.notifications,
                      })
                    )
                  }
                  style={{
                    ...styles.toggleButton,
                    background:
                      profile.notifications
                        ? "#2563eb"
                        : "#94a3b8",
                  }}
                >
                  <span
                    style={{
                      ...styles.toggleCircle,
                      transform:
                        profile.notifications
                          ? "translateX(24px)"
                          : "translateX(0)",
                    }}
                  />
                </button>
              </div>
            </div>
                        <div
              style={{
                ...styles.securityCard,
                ...cardStyle,
              }}
            >
              <h2
                style={{
                  ...styles.sectionTitle,
                  color: isDarkMode
                    ? "#f8fafc"
                    : "#0f172a",
                }}
              >
                🔐 Change Password
              </h2>

              <p
                style={{
                  ...styles.sectionSubtitle,
                  color: isDarkMode
                    ? "#94a3b8"
                    : "#64748b",
                }}
              >
                Update your account password securely.
              </p>

              <label style={styles.label}>
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                style={fieldStyle}
              />

              <label style={styles.label}>
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                placeholder="Minimum 6 characters"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                style={fieldStyle}
              />

              <label style={styles.label}>
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                style={fieldStyle}
              />

              <button
                onClick={changePassword}
                disabled={passwordLoading}
                style={{
                  ...styles.passwordButton,
                  opacity: passwordLoading ? 0.7 : 1,
                  cursor: passwordLoading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {passwordLoading
                  ? "Updating..."
                  : "🔑 Change Password"}
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            ...styles.accountSummaryCard,
            ...cardStyle,
          }}
        >
          <div>
            <h2
              style={{
                ...styles.sectionTitle,
                color: isDarkMode
                  ? "#f8fafc"
                  : "#0f172a",
              }}
            >
              📌 Account Summary
            </h2>

            <p
              style={{
                ...styles.sectionSubtitle,
                color: isDarkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              Current profile and preference details.
            </p>
          </div>

          <div style={styles.summaryGrid}>
            {[
              {
                label: "Name",
                value:
                  profile.name || "Not available",
              },
              {
                label: "Email",
                value:
                  profile.email || "Not available",
              },
              {
                label: "Company",
                value:
                  profile.companyName ||
                  "Not available",
              },
              {
                label: "Theme",
                value: profile.theme,
              },
              {
                label: "Notifications",
                value: profile.notifications
                  ? "Enabled"
                  : "Disabled",
              },
              {
                label: "Profile Completion",
                value: `${profileCompletion}%`,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  ...styles.summaryItem,
                  background: isDarkMode
                    ? "#111827"
                    : "#f8fafc",
                  borderColor: isDarkMode
                    ? "#334155"
                    : "#e2e8f0",
                }}
              >
                <span
                  style={{
                    ...styles.summaryItemLabel,
                    color: isDarkMode
                      ? "#94a3b8"
                      : "#64748b",
                  }}
                >
                  {item.label}
                </span>

                <strong
                  style={{
                    ...styles.summaryItemValue,
                    color: isDarkMode
                      ? "#f8fafc"
                      : "#0f172a",
                  }}
                >
                  {item.value}
                </strong>
              </div>
            ))}
          </div>
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
      "background 0.25s ease, color 0.25s ease",
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
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    fontSize: "15px",
    lineHeight: "1.6",
  },

  progressCard: {
    minWidth: "220px",
    padding: "18px 20px",
    borderRadius: "16px",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  progressLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "13px",
  },

  progressValue: {
    display: "block",
    marginTop: "6px",
    color: "#2563eb",
    fontSize: "25px",
  },

  progressBar: {
    height: "8px",
    marginTop: "12px",
    borderRadius: "20px",
    background: "#e2e8f0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg, #2563eb, #7c3aed)",
    transition: "width 0.3s ease",
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

  grid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(340px, 1.3fr) minmax(320px, 1fr)",
    gap: "24px",
    alignItems: "start",
  },

  leftCard: {
    padding: "28px",
    borderRadius: "18px",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  rightColumn: {
    display: "grid",
    gap: "22px",
  },

  preferenceCard: {
    padding: "25px",
    borderRadius: "18px",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  securityCard: {
    padding: "25px",
    borderRadius: "18px",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "24px",
  },

  sectionSubtitle: {
    marginTop: "7px",
    marginBottom: "20px",
    lineHeight: "1.6",
  },

  profileTop: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginTop: "22px",
    marginBottom: "25px",
  },

  avatar: {
    width: "110px",
    height: "110px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "42px",
    fontWeight: "bold",
    overflow: "hidden",
    boxShadow:
      "0 10px 25px rgba(37, 99, 235, 0.25)",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  imageButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
    flexWrap: "wrap",
  },

  removeButton: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "bold",
    cursor: "pointer",
  },

  label: {
    display: "block",
    marginTop: "16px",
    marginBottom: "7px",
    color: "#64748b",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    padding: "13px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    padding: "13px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    resize: "vertical",
    outline: "none",
  },

  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "24px",
  },

  saveButton: {
    flex: 1,
    minWidth: "180px",
    padding: "13px 20px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "bold",
  },

  cancelButton: {
    padding: "13px 24px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },

  themeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },

  themeButton: {
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "7px",
    border: "1px solid #cbd5e1",
    borderRadius: "13px",
    cursor: "pointer",
    textAlign: "left",
  },

  activeThemeButton: {
    borderColor: "#2563eb",
    background: "#eff6ff",
    color: "#1d4ed8",
    boxShadow:
      "0 8px 20px rgba(37, 99, 235, 0.12)",
  },

  themeIcon: {
    fontSize: "28px",
  },

  notificationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  notificationText: {
    marginTop: "7px",
    marginBottom: 0,
    lineHeight: "1.6",
  },

  toggleButton: {
    width: "54px",
    height: "30px",
    flexShrink: 0,
    padding: "3px",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },

  toggleCircle: {
    width: "24px",
    height: "24px",
    display: "block",
    borderRadius: "50%",
    background: "#ffffff",
    transition: "transform 0.2s ease",
    boxShadow:
      "0 2px 6px rgba(15, 23, 42, 0.25)",
  },

  passwordButton: {
    width: "100%",
    marginTop: "22px",
    padding: "13px",
    border: "none",
    borderRadius: "10px",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "bold",
  },
    accountSummaryCard: {
    marginTop: "25px",
    padding: "28px",
    borderRadius: "18px",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
    marginTop: "20px",
  },

  summaryItem: {
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },

  summaryItemLabel: {
    display: "block",
    fontSize: "12px",
  },

  summaryItemValue: {
    display: "block",
    marginTop: "6px",
    fontSize: "15px",
    fontWeight: "bold",
    wordBreak: "break-word",
  },
};

export default Settings;