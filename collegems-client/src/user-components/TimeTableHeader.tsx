export default function TimeTableHeader() {
  return (
    <div className="flex items-center justify-between rounded-xl border-1 bg-white p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Timetable Management
        </h1>
        <p className="mt-1 text-gray-500">
          Create and manage class schedules
        </p>
      </div>

      <button className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700">
        + New Schedule
      </button>
    </div>
  );
}