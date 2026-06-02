import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Award,
  Calendar,
  BookOpen,
  CalendarDays,
  CalendarCheck,
  Users,
  ArrowLeft,
  Search,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const allItems = [
  // Original 6
  {
    label: "Academic Results",
    description: "View your semester grades, GPA breakdown and performance analytics",
    icon: Award,
    badge: "4 Subjects",
    badgeColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    route: "/results",
    category: "Academics",
  },
  {
    label: "Examination Schedule",
    description: "Upcoming exams, dates, venues and seating arrangements",
    icon: Calendar,
    badge: "2 Upcoming",
    badgeColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    route: "/examschedule",
    category: "Academics",
  },
  {
    label: "Course Catalog",
    description: "Browse and manage your enrolled courses and syllabus",
    icon: BookOpen,
    badge: "6 Enrolled",
    badgeColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconColor: "text-emerald-600",
    route: "/courses",
    category: "Academics",
  },
  {
    label: "Campus Events",
    description: "Upcoming college activities, fests, workshops and seminars",
    icon: CalendarDays,
    badge: "3 New",
    badgeColor: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    route: "/events",
    category: "Campus Life",
  },
  {
    label: "Class Schedule",
    description: "Daily timetable, room details and class timings",
    icon: CalendarCheck,
    badge: "This Week",
    badgeColor: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    iconColor: "text-rose-600",
    route: "/timetable",
    category: "Campus Life",
  },
  {
    label: "Faculty Directory",
    description: "Connect with your professors, view office hours and contact info",
    icon: Users,
    badge: "12 Teachers",
    badgeColor: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    iconColor: "text-cyan-600",
    route: "/faculty",
    category: "Campus Life",
  },
];

const categories = ["All", "Academics", "Campus Life"];

export default function QuickAccessAll() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = allItems.filter((item) => {
    const matchSearch =
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "All" || item.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back 
            </button>
            
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
        
          </div>

         
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {search && (
          <p className="text-sm text-gray-500 mb-4">
            Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}{" "}
            for "{search}"
          </p>
        )}

        {/* Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(item.route)}
                  className={`bg-white text-left rounded-xl border-2 ${item.borderColor} p-5 hover:shadow-lg transition-all duration-200 group relative overflow-hidden`}
                >
                  {/* Background tint on hover */}
                  <div
                    className={`absolute inset-0 ${item.bgColor} opacity-0 group-hover:opacity-30 transition-opacity duration-200`}
                  />

                  <div className="relative">
                    {/* Top row: icon + badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${item.bgColor}`}>
                        <Icon className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${item.bgColor} ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Label + description */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 text-base mb-1">
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">
                        {item.category}
                      </span>
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${item.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        Open <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No modules found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}