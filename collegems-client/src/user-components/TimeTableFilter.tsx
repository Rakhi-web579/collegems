export default function TimetableFilters() {
  return (
    <>
        <div className="grid gap-4 md:grid-cols-3">
        <div>
            <label className="mb-2 block text-sm font-medium">
            Semester
            </label>
            <select className="w-full rounded-lg border p-2">
            <option>Select Semester</option>
            <option>1-1</option>
            <option>1-2</option>
            <option>2-1</option>
            <option>2-2</option>
            <option>3-1</option>
            <option>3-2</option>
            <option>4-1</option>
            <option>4-2</option>
            </select>
        </div>

        <div>
            <label className="mb-2 block text-sm font-medium">
            Department
            </label>
            <select className="w-full rounded-lg border p-2">
            <option>Select Department</option>
            <option>CSE</option>
            <option>ECE</option>
            <option>EEE</option>
            <option>MECH</option>
            </select>
        </div>

        <div>
            <label className="mb-2 block text-sm font-medium">
            Section
            </label>
            <select className="w-full rounded-lg border p-2">
            <option>Select Section</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            </select>
        </div>
        </div>
    </>
  );
}