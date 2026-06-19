import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  Award,
  Download,
  Filter,
  ChevronDown,
  Upload,
  XCircle,
  FolderOpen,
  FileCheck,
  MessageSquare,
  X,
  Edit2,
  Save
} from "lucide-react";
import api from "../api/axios";
import { extractArray } from "../utils/apiHelpers";
import AssignmentComments from "../common-components-management/AssignmentComments";
// 👇 NEW: Imported the custom hook
import { useAutoSave } from "../hooks/useAutoSave";

export default function Assignment() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [submitting, setSubmitting] = useState<"draft" | "final" | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<any | null>(null);
  const [viewingComments, setViewingComments] = useState<any | null>(null); 
  
  const [submissionForm, setSubmissionForm] = useState({
    textResponse: "",
    link: "",
    file: null as File | null,
  });
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const activeSubmissionType = activeSubmission?.submissionType || "file";
  const requiresTextResponse = activeSubmissionType === "text" || activeSubmissionType === "both";

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/assignment/student");
      setAssignments(extractArray(res.data));
    } catch (err: any) {
      console.error("Assignment fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 👇 NEW: Using our custom Auto-Save Hook!
  const userId = localStorage.getItem("userId");
  const draftKey = activeSubmission && !submitting ? `draft_${activeSubmission._id}_${userId}` : "";
  
  useAutoSave(
    draftKey, 
    { textResponse: submissionForm.textResponse, link: submissionForm.link }, 
    setSubmissionForm
  );

  const openSubmission = (assignment: any) => {
    setActiveSubmission(assignment);
    const currentUserId = localStorage.getItem("userId");
    
    // 1. Load the backend draft text/link if it exists
    const existingDraft = assignment.submissions?.find((s: any) => s.student?.toString() === currentUserId);
    const initialText = existingDraft?.textResponse || "";
    const initialLink = existingDraft?.link || "";

    // The useAutoSave hook will automatically override this if a newer local draft exists!
    setSubmissionForm({ textResponse: initialText, link: initialLink, file: null });
    setSubmitError(null);
  };

  const closeSubmission = () => {
    if (submitting) return;
    setActiveSubmission(null);
    setSubmitError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      setSubmissionForm((prev) => ({ ...prev, file: null }));
      return;
    }

    // Size Validation (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setSubmitError("File is too large! Maximum allowed size is 5MB.");
      e.target.value = ""; 
      setSubmissionForm((prev) => ({ ...prev, file: null }));
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setSubmitError("Invalid file type! Please upload a .pdf, .doc, or .docx file.");
      e.target.value = ""; 
      setSubmissionForm((prev) => ({ ...prev, file: null }));
      return;
    }

    setSubmitError(null);
    setSubmissionForm((prev) => ({ ...prev, file: selectedFile }));
  };

  const submitAssignment = async () => {
    if (!activeSubmission || submitting) return;

    const textResponse = submissionForm.textResponse.trim();
    const link = submissionForm.link.trim();
    const currentUserId = localStorage.getItem("userId");
    const existingDraft = activeSubmission.submissions?.find((s: any) => s.student?.toString() === currentUserId);

    // Only strictly validate files if it's a FINAL submission
   const hasFile = Boolean(submissionForm.file) || Boolean(existingDraft?.file);
    
    if (activeSubmissionType === "file" && !hasFile) return setSubmitError("Please attach a file.");
    if (activeSubmissionType === "text" && !textResponse) return setSubmitError("Please enter your response.");
    if (activeSubmissionType === "link" && !link) return setSubmitError("Please provide a link.");
    if (activeSubmissionType === "both" && (!hasFile || !textResponse)) return setSubmitError("Please attach a file and enter your response.");

    setSubmitting("final");
    setSubmitError(null);

    try {
      const formData = new FormData();
      if (submissionForm.file) formData.append("file", submissionForm.file);
      if (textResponse) formData.append("textResponse", textResponse);
      if (link) formData.append("link", link);


      // 👇 FIX: Removed manual headers so Axios handles the boundary automatically (Fixes 400 Error!)
      await api.post(`/assignment/submit/${activeSubmission._id}`, formData);

      // Clear local storage completely upon successful submit/draft save
      localStorage.removeItem(`draft_${activeSubmission._id}_${currentUserId}`);
setSubmitSuccess("Assignment submitted successfully.");
      closeSubmission();
      await fetchAssignments();
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || "Submission failed.");
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(null);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    const currentUserId = localStorage.getItem("userId");
    const submission = a.submissions?.find((s: any) => s.student?.toString() === currentUserId);
    
    const isSubmitted = submission && submission.status !== "draft";
    const now = new Date();
    const dueDate = new Date(a.dueDate);
    const isOverdue = dueDate < now && !isSubmitted;

    switch (filter) {
      case "pending":
        return !isSubmitted && !isOverdue;
      case "submitted":
        return isSubmitted;
      case "overdue":
        return isOverdue;
      default:
        return true;
    }
  });

  // Sort assignments
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    const currentUserId = localStorage.getItem("userId");

    const aSubmission = a.submissions?.find((s: any) => s.student?.toString() === currentUserId);
    const bSubmission = b.submissions?.find((s: any) => s.student?.toString() === currentUserId);
    
    const aSubmitted = aSubmission && aSubmission.status !== "draft";
    const bSubmitted = bSubmission && bSubmission.status !== "draft";

    const aDue = new Date(a.dueDate);
    const bDue = new Date(b.dueDate);
    const now = new Date();

    const aOverdue = aDue < now && !aSubmitted;
    const bOverdue = bDue < now && !bSubmitted;

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    if (!aSubmitted && !bSubmitted) {
      return aDue.getTime() - bDue.getTime();
    }

    if (aSubmitted && !bSubmitted) return 1;
    if (!aSubmitted && bSubmitted) return -1;

    return 0;
  });

  // Calculate statistics
  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => {
      const currentUserId = localStorage.getItem("userId");
      const submission = a.submissions?.find((s: any) => s.student?.toString() === currentUserId);
      const isSubmitted = submission && submission.status !== "draft";
      const dueDate = new Date(a.dueDate);
      const now = new Date();
      return !isSubmitted && dueDate > now;
    }).length,
    submitted: assignments.filter((a) => {
      const currentUserId = localStorage.getItem("userId");
      const submission = a.submissions?.find((s: any) => s.student?.toString() === currentUserId);
      return submission && submission.status !== "draft";
    }).length,
    overdue: assignments.filter((a) => {
      const currentUserId = localStorage.getItem("userId");
      const submission = a.submissions?.find((s: any) => s.student?.toString() === currentUserId);
      const isSubmitted = submission && submission.status !== "draft";
      const dueDate = new Date(a.dueDate);
      const now = new Date();
      return !isSubmitted && dueDate < now;
    }).length,
  };

  const getStatusConfig = (assignment: any) => {
    const currentUserId = localStorage.getItem("userId");
    const submission = assignment.submissions?.find((s: any) => s.student?.toString() === currentUserId);
    const isSubmitted = submission && submission.status !== "draft";
    const isDraft = submission?.status === "draft";
    
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();

    if (isSubmitted) {
      return {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
        text: "Submitted",
      };
    }
    if (isDraft) {
      return {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Edit2,
        text: "Draft Saved",
      };
    }
    if (dueDate < now) {
      return {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        text: "Overdue",
      };
    }

    const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 1) {
      return {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertCircle,
        text: "Due Today",
      };
    }
    if (daysRemaining <= 3) {
      return {
        color: "bg-orange-50 text-orange-700 border-orange-200",
        icon: Clock,
        text: `${daysRemaining} days left`,
      };
    }
    return {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Clock,
      text: `${daysRemaining} days left`,
    };
  };

  const filterButtons = [
    { id: "all", label: "All", color: "blue", icon: FileText },
    { id: "pending", label: "Pending", color: "amber", icon: Clock },
    { id: "submitted", label: "Submitted", color: "green", icon: CheckCircle },
    { id: "overdue", label: "Overdue", color: "red", icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assignments</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Submitted</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.submitted}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {submitSuccess}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((btn) => {
                const Icon = btn.icon;
                const isActive = filter === btn.id;
                const colorClasses = {
                  blue: isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  amber: isActive
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  green: isActive
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  red: isActive
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                }[btn.color];

                return (
                  <button
                    key={btn.id}
                    onClick={() => setFilter(btn.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${colorClasses}`}
                  >
                    <Icon className="w-4 h-4" />
                    {btn.label} ({stats[btn.id as keyof typeof stats]})
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors sm:hidden"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Advanced Filters (Mobile) */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 sm:hidden">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Courses</option>
                  <option value="bca">BCA</option>
                  <option value="bba">BBA</option>
                  <option value="mba">MBA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="dueDate">Due Date</option>
                  <option value="title">Title</option>
                  <option value="course">Course</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading assignments...</p>
        </div>
      ) : sortedAssignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No assignments found
          </h3>
          <p className="text-gray-500">
            {filter === "all"
              ? "You don't have any assignments yet."
              : `No ${filter} assignments found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedAssignments.map((assignment) => {
            const currentUserId = localStorage.getItem("userId");
            const studentSubmission = assignment.submissions?.find((s: any) => s.student?.toString() === currentUserId);
            
            const isSubmitted = studentSubmission && studentSubmission.status !== "draft";
            const status = getStatusConfig(assignment);
            const StatusIcon = status.icon;

            return (
              <div
                key={assignment._id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
                      >
                        <StatusIcon className="inline w-3 h-3 mr-1" />
                        {status.text}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center text-gray-600">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {assignment.course?.name || "N/A"} (
                        {assignment.course?.code || "N/A"})
                      </span>

                      {assignment.totalPoints && (
                        <span className="flex items-center text-gray-600">
                          <Award className="w-4 h-4 mr-1" />
                          {assignment.totalPoints} points
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {assignment.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                {/* Due Date */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Due:{" "}
                    {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Submission Info */}
                {isSubmitted && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center text-sm text-green-700">
                      <FileCheck className="w-4 h-4 mr-2" />
                      Submitted on{" "}
                      {new Date(
                        studentSubmission?.submittedAt,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {studentSubmission?.file?.url && (
                      <a
                        href={`${studentSubmission.file.url}?token=${localStorage.getItem("token")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-xs text-green-700 hover:text-green-800"
                      >
                        View submission file
                      </a>
                    )}
                    {studentSubmission?.link && (
                      <a
                        href={studentSubmission.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block text-xs text-green-700 hover:text-green-800"
                      >
                        {studentSubmission.link}
                      </a>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  {assignment.instructionsFile && (
                    <a
                      href={assignment.instructionsFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Instructions
                    </a>
                  )}

                  <button
                    onClick={() => setViewingComments(assignment)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Class Comments ({assignment.comments?.length || 0})
                  </button>

                  {!isSubmitted ? (
                    <button
                      onClick={() => openSubmission(assignment)}
                      disabled={Boolean(submitting) && submitting === assignment._id}
                      className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                        Boolean(submitting) && submitting === assignment._id
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      } ml-auto`}
                    >
                      {Boolean(submitting) && submitting === assignment._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {studentSubmission?.status === "draft" ? "Continue Draft" : "Submit"}
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Submitted</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={closeSubmission}
          />
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Submit Assignment
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeSubmission.title}
                  </p>
                </div>
                <button
                  onClick={closeSubmission}
                  disabled={Boolean(submitting)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {requiresTextResponse ? "Response" : "Notes (optional)"}
                    {requiresTextResponse && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    value={submissionForm.textResponse}
                    onChange={(e) =>
                      setSubmissionForm((prev) => ({
                        ...prev,
                        textResponse: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {(activeSubmissionType === "link" ||
                activeSubmissionType === "both") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submission Link
                    {activeSubmissionType === "link" && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={submissionForm.link}
                    onChange={(e) =>
                      setSubmissionForm((prev) => ({
                        ...prev,
                        link: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {(activeSubmissionType === "file" ||
                activeSubmissionType === "both") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File (Max 5MB)
                    <span className="text-red-500"> *</span>
                  </label>
                  
                  {activeSubmission.submissions?.find((s:any) => s.student.toString() === localStorage.getItem("userId"))?.file && !submissionForm.file && (
                     <div className="mb-2 p-2 bg-blue-50 text-blue-700 text-sm rounded border border-blue-100 flex items-center justify-between">
                       <span>Draft file attached: {activeSubmission.submissions.find((s:any) => s.student.toString() === localStorage.getItem("userId")).file.originalName}</span>
                     </div>
                  )}

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleFileChange}
                  />
                  {submissionForm.file && (
                    <p className="mt-2 text-xs text-gray-500 font-medium">
                      Selected: {submissionForm.file.name}
                    </p>
                  )}
                </div>
              )}
            </div>

           <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={closeSubmission} 
                disabled={Boolean(submitting)} 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={submitAssignment}
                disabled={Boolean(submitting)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400"
              >
                {submitting === "final" ? "Submitting..." : <><Upload className="w-4 h-4"/> Submit</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {viewingComments && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setViewingComments(null)} 
          />
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewingComments.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Class Discussion</p>
              </div>
              <button 
                onClick={() => setViewingComments(null)} 
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <AssignmentComments 
                assignmentId={viewingComments._id} 
                initialComments={viewingComments.comments || []} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}