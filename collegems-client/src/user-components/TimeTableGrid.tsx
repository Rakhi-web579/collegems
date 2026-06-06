import React from "react";
export default function TimetableGrid() {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  const slots = [
    "9:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 1:00",
    "2:00 - 3:00",
  ];

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <div className="grid grid-cols-6 min-w-[900px]">
        
        {/* Header Row */}
        <div className="border-b border-r p-4 font-semibold">
          Time
        </div>

        {days.map((day) => (
          <div
            key={day}
            className="border-b border-r p-4 text-center font-semibold"
          >
            {day}
          </div>
        ))}

        {/* Timetable Rows */}
        {slots.map((slot) => (
          <React.Fragment key={slot}>
            {/* Time Column */}
            <div className="border-b border-r p-4 font-medium">
              {slot}
            </div>

            {/* Empty Cells */}
            {days.map((day) => (
              <div
                key={`${day}-${slot}`}
                className="border-b border-r p-4 min-h-[100px]"
              >
                {/* Subject Card will go here later */}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}