import { useState } from "react";

type EventItem = {
  title: string;
  date: string;
  type: string;
};

const AcademicCalendar = () => {
  const [filter, setFilter] = useState("all");

  // ✅ STATIC DATA (NO API)
  const events: EventItem[] = [
    { title: "Mid Term Exams", date: "2026-06-10", type: "exam" },
    { title: "Sports Day", date: "2026-06-15", type: "holiday" },
    { title: "Fee Deadline", date: "2026-06-20", type: "deadline" },
    { title: "Diwali Holiday", date: "2026-11-01", type: "holiday" },
  ];

  // filter safely
  const filteredEvents =
    filter === "all"
      ? events
      : events.filter((e) => e.type === filter);

  const getColor = (type: string) => {
    switch (type) {
      case "exam":
        return "#ff4d4d";
      case "holiday":
        return "#4caf50";
      case "deadline":
        return "#2196f3";
      default:
        return "#999";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 Academic Calendar</h2>

      {/* FILTER */}
      <select onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="exam">Exam</option>
        <option value="holiday">Holiday</option>
        <option value="deadline">Deadline</option>
      </select>

      {/* EVENTS */}
      <div style={{ marginTop: "20px" }}>
        {filteredEvents.map((event, index) => (
          <div
            key={index}
            style={{
              borderLeft: `6px solid ${getColor(event.type)}`,
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          >
            <h4>{event.title}</h4>
            <p>{event.date}</p>
            <small>{event.type}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicCalendar;