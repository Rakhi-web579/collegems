export default function TimetableStats() {
  const stats = [
    {
      title: "Total Classes",
      value: 42,
    },
    {
      title: "Today's Classes",
      value: 8,
    },
    {
      title: "Teachers Assigned",
      value: 12,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border bg-white p-6 shadow-sm"
        >
          <p className="text-sm text-gray-500">{stat.title}</p>

          <h2 className="mt-2 text-3xl font-bold">
            {stat.value}
          </h2>
        </div>
      ))}
    </div>
  );
}