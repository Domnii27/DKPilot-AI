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

const SCHEDULE_COLORS = [
  "#f59e0b",
  "#7c3aed",
  "#16a34a",
];

function Schedule() {
  const [schedules, setSchedules] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduleDate: "",
    scheduleTime: "",
  });

  const [editingScheduleId, setEditingScheduleId] =
    useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] = useState(false);

  const [scheduleLoading, setScheduleLoading] =
    useState(true);

  const [message, setMessage] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getHeaders = () => {
    const token = getToken();

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchSchedules = async () => {
    try {
      setScheduleLoading(true);
      setMessage("");

      const response = await axios.get(
        "http://localhost:8081/api/schedules",
        {
          headers: getHeaders(),
        }
      );

      if (Array.isArray(response.data)) {
        setSchedules(response.data);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error(
        "Schedule loading error:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setMessage(
          "Session expired. Please login again."
        );
      } else {
        setMessage(
          "Schedules load panna mudiyala."
        );
      }
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      scheduleDate: "",
      scheduleTime: "",
    });

    setEditingScheduleId(null);
    setMessage("");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert("Schedule title enter pannu");
      return false;
    }

    if (!formData.description.trim()) {
      alert(
        "Schedule description enter pannu"
      );
      return false;
    }

    if (!formData.scheduleDate) {
      alert("Schedule date select pannu");
      return false;
    }

    if (!formData.scheduleTime) {
      alert("Schedule time select pannu");
      return false;
    }

    return true;
  };

  const saveSchedule = async () => {
    if (!validateForm()) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Please login again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const scheduleData = {
        title: formData.title.trim(),
        description:
          formData.description.trim(),
        scheduleDate:
          formData.scheduleDate,
        scheduleTime:
          formData.scheduleTime,
      };

      if (editingScheduleId) {
        await axios.put(
          `http://localhost:8081/api/schedules/${editingScheduleId}`,
          scheduleData,
          {
            headers: getHeaders(),
          }
        );

        alert(
          "Schedule updated successfully"
        );
      } else {
        await axios.post(
          "http://localhost:8081/api/schedules",
          scheduleData,
          {
            headers: getHeaders(),
          }
        );

        alert(
          "Schedule added successfully"
        );
      }

      resetForm();
      await fetchSchedules();
    } catch (error) {
      console.error(
        "Schedule save error:",
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
          editingScheduleId
            ? "Schedule update panna mudiyala"
            : "Schedule add panna mudiyala"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const editSchedule = (schedule) => {
    setEditingScheduleId(schedule.id);

    setFormData({
      title: schedule.title || "",
      description:
        schedule.description || "",
      scheduleDate:
        schedule.scheduleDate || "",
      scheduleTime:
        schedule.scheduleTime
          ? schedule.scheduleTime.substring(
              0,
              5
            )
          : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteSchedule = async (schedule) => {
    const confirmation = window.confirm(
      `"${schedule.title}" schedule-a delete panna sure-ah?`
    );

    if (!confirmation) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8081/api/schedules/${schedule.id}`,
        {
          headers: getHeaders(),
        }
      );

      alert(
        "Schedule deleted successfully"
      );

      if (
        editingScheduleId === schedule.id
      ) {
        resetForm();
      }

      await fetchSchedules();
    } catch (error) {
      console.error(
        "Schedule delete error:",
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
          "Schedule delete panna mudiyala"
        );
      }
    }
  };

  const getScheduleDateTime = (schedule) => {
    if (
      !schedule.scheduleDate ||
      !schedule.scheduleTime
    ) {
      return null;
    }

    return new Date(
      `${schedule.scheduleDate}T${schedule.scheduleTime}`
    );
  };

  const getStatus = (schedule) => {
    const scheduleDateTime =
      getScheduleDateTime(schedule);

    if (!scheduleDateTime) {
      return "UNKNOWN";
    }

    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const scheduleDay = new Date(
      scheduleDateTime.getFullYear(),
      scheduleDateTime.getMonth(),
      scheduleDateTime.getDate()
    );

    if (scheduleDateTime < now) {
      return "COMPLETED";
    }

    if (
      scheduleDay.getTime() ===
      today.getTime()
    ) {
      return "TODAY";
    }

    return "UPCOMING";
  };

  const getStatusStyle = (status) => {
    if (status === "TODAY") {
      return styles.todayBadge;
    }

    if (status === "UPCOMING") {
      return styles.upcomingBadge;
    }

    if (status === "COMPLETED") {
      return styles.completedBadge;
    }

    return styles.unknownBadge;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const [hours, minutes] =
      time.split(":");

    const temporaryDate = new Date();

    temporaryDate.setHours(
      Number(hours)
    );

    temporaryDate.setMinutes(
      Number(minutes)
    );

    return temporaryDate.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const filteredSchedules = useMemo(() => {
    const searchValue = searchText
      .trim()
      .toLowerCase();

    return [...schedules]
      .filter((schedule) => {
        const scheduleStatus =
          getStatus(schedule);

        const matchesStatus =
          statusFilter === "ALL" ||
          scheduleStatus ===
            statusFilter;

        const searchableText = [
          schedule.title,
          schedule.description,
          schedule.scheduleDate,
          schedule.scheduleTime,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !searchValue ||
          searchableText.includes(
            searchValue
          );

        return (
          matchesStatus &&
          matchesSearch
        );
      })
      .sort(
        (
          firstSchedule,
          secondSchedule
        ) => {
          const firstDate =
            getScheduleDateTime(
              firstSchedule
            );

          const secondDate =
            getScheduleDateTime(
              secondSchedule
            );

          if (
            !firstDate ||
            !secondDate
          ) {
            return 0;
          }

          return (
            firstDate - secondDate
          );
        }
      );
  }, [
    schedules,
    searchText,
    statusFilter,
  ]);

  const scheduleAnalytics = useMemo(() => {
    const todayCount =
      schedules.filter(
        (schedule) =>
          getStatus(schedule) ===
          "TODAY"
      ).length;

    const upcomingCount =
      schedules.filter(
        (schedule) =>
          getStatus(schedule) ===
          "UPCOMING"
      ).length;

    const completedCount =
      schedules.filter(
        (schedule) =>
          getStatus(schedule) ===
          "COMPLETED"
      ).length;

    const monthlyMap = {};

    schedules.forEach((schedule) => {
      if (!schedule.scheduleDate) {
        return;
      }

      const date = new Date(
        `${schedule.scheduleDate}T00:00:00`
      );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      const monthName =
        date.toLocaleDateString(
          "en-IN",
          {
            month: "short",
          }
        );

      if (!monthlyMap[monthName]) {
        monthlyMap[monthName] = 0;
      }

      monthlyMap[monthName] += 1;
    });

    const monthlyScheduleData =
      Object.entries(monthlyMap).map(
        ([month, count]) => ({
          month,
          count,
        })
      );

    let busiestMonth = null;

    monthlyScheduleData.forEach(
      (monthData) => {
        if (
          !busiestMonth ||
          monthData.count >
            busiestMonth.count
        ) {
          busiestMonth =
            monthData;
        }
      }
    );

    const statusDistribution = [
      {
        name: "Today",
        value: todayCount,
      },
      {
        name: "Upcoming",
        value: upcomingCount,
      },
      {
        name: "Completed",
        value: completedCount,
      },
    ];

    const upcomingTimeline =
      [...schedules]
        .filter((schedule) => {
          const status =
            getStatus(schedule);

          return (
            status === "TODAY" ||
            status === "UPCOMING"
          );
        })
        .sort(
          (
            firstSchedule,
            secondSchedule
          ) => {
            const firstDate =
              getScheduleDateTime(
                firstSchedule
              );

            const secondDate =
              getScheduleDateTime(
                secondSchedule
              );

            if (
              !firstDate ||
              !secondDate
            ) {
              return 0;
            }

            return (
              firstDate - secondDate
            );
          }
        )
        .slice(0, 5);

    const nextSchedule =
      upcomingTimeline.length > 0
        ? upcomingTimeline[0]
        : null;

    return {
      totalSchedules:
        schedules.length,
      todayCount,
      upcomingCount,
      completedCount,
      monthlyScheduleData,
      statusDistribution,
      busiestMonth,
      upcomingTimeline,
      nextSchedule,
    };
  }, [schedules]);

  return (
        <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              📅 Schedule Manager
            </h1>

            <p style={styles.subtitle}>
              Manage meetings, tasks, reminders and schedule analytics.
            </p>
          </div>

          <button
            onClick={fetchSchedules}
            disabled={scheduleLoading}
            style={{
              ...styles.refreshButton,
              opacity: scheduleLoading ? 0.7 : 1,
              cursor: scheduleLoading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {scheduleLoading
              ? "Loading..."
              : "🔄 Refresh Data"}
          </button>
        </div>

        <div style={styles.analyticsHeader}>
          <div>
            <h2 style={styles.analyticsTitle}>
              📊 Schedule Analytics
            </h2>

            <p style={styles.analyticsSubtitle}>
              Live schedule performance calculated from saved meetings and tasks.
            </p>
          </div>
        </div>

        <div style={styles.statisticsGrid}>
          <div
            style={{
              ...styles.analyticsCard,
              ...styles.totalCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              📅
            </div>

            <div>
              <span style={styles.statLabel}>
                Total Schedules
              </span>

              <strong style={styles.statNumber}>
                {scheduleLoading
                  ? "..."
                  : scheduleAnalytics.totalSchedules}
              </strong>

              <span style={styles.analyticsNote}>
                All saved schedules
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.todayCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              🕒
            </div>

            <div>
              <span style={styles.statLabel}>
                Today
              </span>

              <strong style={styles.statNumber}>
                {scheduleLoading
                  ? "..."
                  : scheduleAnalytics.todayCount}
              </strong>

              <span style={styles.analyticsNote}>
                Schedules planned for today
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.upcomingCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              ⏰
            </div>

            <div>
              <span style={styles.statLabel}>
                Upcoming
              </span>

              <strong style={styles.statNumber}>
                {scheduleLoading
                  ? "..."
                  : scheduleAnalytics.upcomingCount}
              </strong>

              <span style={styles.analyticsNote}>
                Future meetings and tasks
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.completedCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              ✅
            </div>

            <div>
              <span style={styles.statLabel}>
                Completed
              </span>

              <strong style={styles.statNumber}>
                {scheduleLoading
                  ? "..."
                  : scheduleAnalytics.completedCount}
              </strong>

              <span style={styles.analyticsNote}>
                Finished schedule records
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.analyticsCard,
              ...styles.busiestMonthCard,
            }}
          >
            <div style={styles.analyticsIcon}>
              🔥
            </div>

            <div style={styles.analyticsContent}>
              <span style={styles.statLabel}>
                Busiest Month
              </span>

              <strong style={styles.busiestMonthValue}>
                {scheduleLoading
                  ? "..."
                  : scheduleAnalytics.busiestMonth?.month ||
                    "No data"}
              </strong>

              <span style={styles.analyticsNote}>
                {scheduleAnalytics.busiestMonth
                  ? `${scheduleAnalytics.busiestMonth.count} schedule(s)`
                  : "Add schedules to see insights"}
              </span>
            </div>
          </div>
        </div>

        {scheduleAnalytics.nextSchedule && (
          <div style={styles.nextScheduleBanner}>
            <div style={styles.nextScheduleIcon}>
              ⏰
            </div>

            <div style={styles.nextScheduleContent}>
              <span style={styles.nextScheduleLabel}>
                Next Upcoming Schedule
              </span>

              <strong style={styles.nextScheduleTitle}>
                {scheduleAnalytics.nextSchedule.title}
              </strong>

              <span style={styles.nextScheduleDetails}>
                {formatDate(
                  scheduleAnalytics.nextSchedule.scheduleDate
                )}{" "}
                •{" "}
                {formatTime(
                  scheduleAnalytics.nextSchedule.scheduleTime
                )}
              </span>
            </div>

            <span
              style={getStatusStyle(
                getStatus(scheduleAnalytics.nextSchedule)
              )}
            >
              {getStatus(
                scheduleAnalytics.nextSchedule
              )}
            </span>
          </div>
        )}

        <div style={styles.chartSection}>
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div>
                <h2 style={styles.chartTitle}>
                  📈 Monthly Schedule Count
                </h2>

                <p style={styles.chartSubtitle}>
                  Number of schedules created for each month.
                </p>
              </div>
            </div>

            {scheduleLoading ? (
              <div style={styles.chartEmpty}>
                Loading monthly schedule chart...
              </div>
            ) : scheduleAnalytics.monthlyScheduleData.length === 0 ? (
              <div style={styles.chartEmpty}>
                No schedule chart data available.
              </div>
            ) : (
              <div style={styles.chartWrapper}>
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <BarChart
                    data={
                      scheduleAnalytics.monthlyScheduleData
                    }
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
                      dataKey="month"
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
                        "Schedules",
                      ]}
                    />

                    <Bar
                      dataKey="count"
                      fill="#7c3aed"
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
                  🥧 Schedule Status Distribution
                </h2>

                <p style={styles.chartSubtitle}>
                  Compare today, upcoming and completed schedules.
                </p>
              </div>
            </div>

            {scheduleLoading ? (
              <div style={styles.chartEmpty}>
                Loading status distribution...
              </div>
            ) : scheduleAnalytics.statusDistribution.every(
                (item) => item.value === 0
              ) ? (
              <div style={styles.chartEmpty}>
                No schedule status data available.
              </div>
            ) : (
              <div style={styles.chartWrapper}>
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <PieChart>
                    <Pie
                      data={
                        scheduleAnalytics.statusDistribution
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="44%"
                      innerRadius={62}
                      outerRadius={102}
                      paddingAngle={4}
                    >
                      {scheduleAnalytics.statusDistribution.map(
                        (entry, index) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={
                              SCHEDULE_COLORS[
                                index %
                                  SCHEDULE_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        value,
                        "Schedules",
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

        <div style={styles.timelineCard}>
          <div style={styles.timelineHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                🗓 Upcoming Timeline
              </h2>

              <p style={styles.cardSubtitle}>
                Your next five meetings and business tasks.
              </p>
            </div>
          </div>

          {scheduleLoading ? (
            <div style={styles.emptyState}>
              Loading upcoming timeline...
            </div>
          ) : scheduleAnalytics.upcomingTimeline.length ===
            0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                📭
              </div>

              <h3 style={styles.emptyTitle}>
                No upcoming schedules
              </h3>

              <p style={styles.emptyText}>
                Add a future meeting or task to build the timeline.
              </p>
            </div>
          ) : (
            <div style={styles.timelineList}>
              {scheduleAnalytics.upcomingTimeline.map(
                (schedule, index) => {
                  const status = getStatus(schedule);

                  return (
                    <div
                      key={schedule.id}
                      style={styles.timelineItem}
                    >
                      <div style={styles.timelineColumn}>
                        <div style={styles.timelineIcon}>
                          {status === "TODAY"
                            ? "🔥"
                            : "📅"}
                        </div>

                        {index <
                          scheduleAnalytics
                            .upcomingTimeline.length -
                            1 && (
                          <div style={styles.timelineLine} />
                        )}
                      </div>

                      <div style={styles.timelineContent}>
                        <div style={styles.timelineTitleRow}>
                          <h3 style={styles.timelineTitle}>
                            {schedule.title}
                          </h3>

                          <span
                            style={getStatusStyle(status)}
                          >
                            {status}
                          </span>
                        </div>

                        <p style={styles.timelineDescription}>
                          {schedule.description}
                        </p>

                        <div style={styles.timelineDateRow}>
                          <span>
                            📅{" "}
                            {formatDate(
                              schedule.scheduleDate
                            )}
                          </span>

                          <span>
                            🕒{" "}
                            {formatTime(
                              schedule.scheduleTime
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  {editingScheduleId
                    ? "✏️ Edit Schedule"
                    : "➕ Add Schedule"}
                </h2>

                <p style={styles.cardSubtitle}>
                  {editingScheduleId
                    ? "Update the selected schedule."
                    : "Create a new meeting or task."}
                </p>
              </div>

              {editingScheduleId && (
                <button
                  onClick={resetForm}
                  style={styles.cancelButton}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <label style={styles.label}>
              Schedule Title
              <span style={styles.required}>
                {" "}
                *
              </span>
            </label>

            <input
              type="text"
              name="title"
              placeholder="Example: Client Meeting"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
            />

            <label style={styles.label}>
              Description
              <span style={styles.required}>
                {" "}
                *
              </span>
            </label>

            <textarea
              name="description"
              placeholder="Enter meeting or task details"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              style={styles.textarea}
            />

            <div style={styles.twoColumn}>
              <div>
                <label style={styles.label}>
                  Date
                  <span style={styles.required}>
                    {" "}
                    *
                  </span>
                </label>

                <input
                  type="date"
                  name="scheduleDate"
                  value={formData.scheduleDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Time
                  <span style={styles.required}>
                    {" "}
                    *
                  </span>
                </label>

                <input
                  type="time"
                  name="scheduleTime"
                  value={formData.scheduleTime}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {message && (
              <div style={styles.message}>
                {message}
              </div>
            )}

            <div style={styles.buttonRow}>
              <button
                onClick={saveSchedule}
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
                  : editingScheduleId
                    ? "💾 Update Schedule"
                    : "➕ Add Schedule"}
              </button>

              <button
                onClick={resetForm}
                disabled={loading}
                style={styles.clearButton}
              >
                Clear
              </button>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              📆
            </div>

            <h2 style={styles.infoTitle}>
              Plan Your Business Day
            </h2>

            <p style={styles.infoText}>
              Add important meetings and tasks so that your daily business
              activities stay organized.
            </p>

            <div style={styles.infoItem}>
              ✅ Add meetings and tasks
            </div>

            <div style={styles.infoItem}>
              🕒 Select date and time
            </div>

            <div style={styles.infoItem}>
              ✏️ Edit schedule details
            </div>

            <div style={styles.infoItem}>
              📊 Analyse schedule performance
            </div>
          </div>
        </div>

        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                📋 Schedule List
              </h2>

              <p style={styles.cardSubtitle}>
                View and manage your saved schedules.
              </p>
            </div>

            <div style={styles.filterButtons}>
              {[
                "ALL",
                "TODAY",
                "UPCOMING",
                "COMPLETED",
              ].map((filter) => (
                <button
                  key={filter}
                  onClick={() =>
                    setStatusFilter(filter)
                  }
                  style={{
                    ...styles.filterButton,
                    ...(statusFilter === filter
                      ? styles.activeFilterButton
                      : {}),
                  }}
                >
                  {filter === "ALL"
                    ? "All"
                    : filter.charAt(0) +
                      filter
                        .slice(1)
                        .toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search by title, description, date or time..."
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              style={styles.searchInput}
            />

            {searchText && (
              <button
                onClick={() =>
                  setSearchText("")
                }
                style={styles.clearSearchButton}
              >
                ✕
              </button>
            )}
          </div>

          {scheduleLoading ? (
            <div style={styles.emptyState}>
              Loading schedules...
            </div>
          ) : filteredSchedules.length ===
            0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                📅
              </div>

              <h3 style={styles.emptyTitle}>
                No schedules found
              </h3>

              <p style={styles.emptyText}>
                Add your first meeting or business task.
              </p>
            </div>
          ) : (
            <div style={styles.scheduleGrid}>
              {filteredSchedules.map(
                (schedule) => {
                  const status =
                    getStatus(schedule);

                  return (
                    <div
                      key={schedule.id}
                      style={styles.scheduleCard}
                    >
                      <div
                        style={
                          styles.scheduleCardHeader
                        }
                      >
                        <div>
                          <span
                            style={getStatusStyle(
                              status
                            )}
                          >
                            {status}
                          </span>

                          <h3
                            style={
                              styles.scheduleTitle
                            }
                          >
                            {schedule.title}
                          </h3>
                        </div>

                        <div
                          style={styles.scheduleId}
                        >
                          #{schedule.id}
                        </div>
                      </div>

                      <p
                        style={
                          styles.description
                        }
                      >
                        {schedule.description}
                      </p>

                      <div
                        style={
                          styles.dateTimeBox
                        }
                      >
                        <div
                          style={
                            styles.dateTimeItem
                          }
                        >
                          <span>📅</span>

                          <span>
                            {formatDate(
                              schedule.scheduleDate
                            )}
                          </span>
                        </div>

                        <div
                          style={
                            styles.dateTimeItem
                          }
                        >
                          <span>🕒</span>

                          <span>
                            {formatTime(
                              schedule.scheduleTime
                            )}
                          </span>
                        </div>
                      </div>

                      <div style={styles.actionRow}>
                        <button
                          onClick={() =>
                            editSchedule(
                              schedule
                            )
                          }
                          style={
                            styles.editButton
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteSchedule(
                              schedule
                            )
                          }
                          style={
                            styles.deleteButton
                          }
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {filteredSchedules.length > 0 && (
            <div style={styles.resultCount}>
              Showing {filteredSchedules.length} of{" "}
              {schedules.length} schedules
            </div>
          )}
        </div>
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
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#64748b",
  },

  refreshButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
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
    marginBottom: 0,
    color: "#64748b",
  },

  statisticsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  analyticsCard: {
    minHeight: "125px",
    padding: "22px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    color: "#ffffff",
    boxShadow:
      "0 10px 25px rgba(15, 23, 42, 0.12)",
  },

  totalCard: {
    background:
      "linear-gradient(135deg, #2563eb, #1d4ed8)",
  },

  todayCard: {
    background:
      "linear-gradient(135deg, #f59e0b, #d97706)",
  },

  upcomingCard: {
    background:
      "linear-gradient(135deg, #7c3aed, #6d28d9)",
  },

  completedCard: {
    background:
      "linear-gradient(135deg, #16a34a, #15803d)",
  },

  busiestMonthCard: {
    background:
      "linear-gradient(135deg, #ea580c, #c2410c)",
  },

  analyticsIcon: {
    width: "56px",
    height: "56px",
    flexShrink: 0,
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.18)",
    fontSize: "27px",
  },

  analyticsContent: {
    minWidth: 0,
  },

  statNumber: {
    display: "block",
    marginTop: "6px",
    fontSize: "27px",
    fontWeight: "bold",
  },

  statLabel: {
    display: "block",
    fontSize: "13px",
    opacity: 0.9,
  },

  analyticsNote: {
    display: "block",
    marginTop: "6px",
    fontSize: "12px",
    opacity: 0.88,
  },

  busiestMonthValue: {
    display: "block",
    marginTop: "6px",
    fontSize: "22px",
    fontWeight: "bold",
  },

  nextScheduleBanner: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "25px",
    padding: "18px 20px",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #eff6ff, #eef2ff)",
    border: "1px solid #bfdbfe",
  },

  nextScheduleIcon: {
    width: "50px",
    height: "50px",
    flexShrink: 0,
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "23px",
  },

  nextScheduleContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    minWidth: 0,
  },

  nextScheduleLabel: {
    color: "#64748b",
    fontSize: "12px",
  },

  nextScheduleTitle: {
    color: "#0f172a",
    fontSize: "17px",
  },

  nextScheduleDetails: {
    color: "#475569",
    fontSize: "13px",
  },

  chartSection: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "22px",
    marginBottom: "25px",
  },

  chartCard: {
    padding: "25px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  chartHeader: {
    marginBottom: "18px",
  },

  chartTitle: {
    margin: 0,
    fontSize: "23px",
    color: "#0f172a",
  },

  chartSubtitle: {
    marginTop: "7px",
    marginBottom: 0,
    color: "#64748b",
  },

  chartWrapper: {
    width: "100%",
    minHeight: "320px",
  },

  chartEmpty: {
    padding: "80px 20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "13px",
    background: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
  },

  timelineCard: {
    marginBottom: "25px",
    padding: "28px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  timelineHeader: {
    marginBottom: "20px",
  },

  timelineList: {
    display: "grid",
    gap: "0",
  },

  timelineItem: {
    display: "grid",
    gridTemplateColumns: "56px 1fr",
    gap: "14px",
  },

  timelineColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  timelineIcon: {
    width: "44px",
    height: "44px",
    flexShrink: 0,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    fontSize: "20px",
  },

  timelineLine: {
    width: "2px",
    minHeight: "65px",
    flex: 1,
    marginTop: "7px",
    background: "#e2e8f0",
  },

  timelineContent: {
    paddingBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
  },

  timelineTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  timelineTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "17px",
  },

  timelineDescription: {
    marginTop: "8px",
    marginBottom: "8px",
    color: "#475569",
    lineHeight: "1.6",
  },

  timelineDateRow: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    color: "#64748b",
    fontSize: "13px",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(320px, 1.5fr) minmax(280px, 0.8fr)",
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

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
  },

  cardTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#0f172a",
  },

  cardSubtitle: {
    marginTop: "7px",
    color: "#64748b",
  },

  cancelButton: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#f1f5f9",
    color: "#334155",
    cursor: "pointer",
  },

  label: {
    display: "block",
    marginTop: "16px",
    marginBottom: "7px",
    color: "#334155",
    fontWeight: "bold",
  },

  required: {
    color: "#dc2626",
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
    resize: "vertical",
    fontSize: "15px",
    outline: "none",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
  },

  message: {
    padding: "12px",
    marginTop: "16px",
    borderRadius: "9px",
    background: "#fef2f2",
    color: "#b91c1c",
    textAlign: "center",
    fontWeight: "bold",
  },

  buttonRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "12px",
    marginTop: "22px",
  },

  saveButton: {
    padding: "13px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
  },

  clearButton: {
    padding: "13px 24px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
  },

  infoIcon: {
    fontSize: "45px",
  },

  infoTitle: {
    marginTop: "15px",
    fontSize: "25px",
  },

  infoText: {
    color: "#cbd5e1",
    lineHeight: "1.7",
  },

  infoItem: {
    padding: "12px 0",
    borderBottom:
      "1px solid rgba(255, 255, 255, 0.1)",
  },

  listCard: {
    marginTop: "25px",
    padding: "28px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  filterButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  filterButton: {
    padding: "9px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
  },

  activeFilterButton: {
    borderColor: "#2563eb",
    background: "#2563eb",
    color: "#ffffff",
  },

  searchWrapper: {
    position: "relative",
    marginBottom: "22px",
  },

  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
  },

  searchInput: {
    width: "100%",
    padding: "14px 50px 14px 45px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "15px",
    background: "#f8fafc",
    outline: "none",
  },

  clearSearchButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "30px",
    height: "30px",
    border: "none",
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#475569",
    cursor: "pointer",
  },

  scheduleGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  scheduleCard: {
    padding: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    background: "#ffffff",
    boxShadow:
      "0 5px 15px rgba(15, 23, 42, 0.06)",
  },

  scheduleCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },

  scheduleTitle: {
    margin: "12px 0 0",
    color: "#0f172a",
  },

  scheduleId: {
    color: "#94a3b8",
    fontSize: "13px",
  },

  description: {
    minHeight: "45px",
    color: "#64748b",
    lineHeight: "1.6",
  },

  dateTimeBox: {
    padding: "13px",
    borderRadius: "10px",
    background: "#f8fafc",
  },

  dateTimeItem: {
    display: "flex",
    gap: "9px",
    padding: "5px 0",
    color: "#334155",
  },

  actionRow: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },

  editButton: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "bold",
    cursor: "pointer",
  },

  deleteButton: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "bold",
    cursor: "pointer",
  },

  todayBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#fef3c7",
    color: "#b45309",
    fontSize: "11px",
    fontWeight: "bold",
  },

  upcomingBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#ede9fe",
    color: "#6d28d9",
    fontSize: "11px",
    fontWeight: "bold",
  },

  completedBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#dcfce7",
    color: "#15803d",
    fontSize: "11px",
    fontWeight: "bold",
  },

  unknownBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#e2e8f0",
    color: "#475569",
    fontSize: "11px",
    fontWeight: "bold",
  },

  emptyState: {
    padding: "45px 20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    background: "#f8fafc",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "42px",
  },

  emptyTitle: {
    color: "#334155",
  },

  emptyText: {
    color: "#64748b",
  },

  resultCount: {
    marginTop: "18px",
    color: "#64748b",
    textAlign: "right",
    fontSize: "13px",
  },
};

export default Schedule;