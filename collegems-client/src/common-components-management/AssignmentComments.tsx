import { useState, useEffect } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import api from "../api/axios";

interface CommentUser {
  _id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  photo?: string;
}

interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  user: CommentUser;
}

interface AssignmentCommentsProps {
  assignmentId: string;
  initialComments?: Comment[];
}

export default function AssignmentComments({ assignmentId, initialComments = [] }: AssignmentCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if initialComments update from the parent
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/assignment/${assignmentId}/comments`, { 
        text: newComment 
      });
      
      if (res.data.success) {
        setComments(res.data.data); // The backend sends back the fully updated array
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Class Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-6 mb-6 max-h-80 overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            No comments yet. Ask a question or share a clarification!
          </p>
        ) : (
          comments.map((comment, index) => {
            const isTeacher = comment.user?.role === "teacher" || comment.user?.role === "hod";
            const avatar = comment.user?.avatarUrl || comment.user?.photo;
            const initials = comment.user?.name?.charAt(0).toUpperCase() || "U";

            return (
              <div key={comment._id || index} className="flex gap-4">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${isTeacher ? "bg-blue-100 text-blue-700" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>
                  {avatar ? (
                    <img src={avatar} alt={comment.user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-semibold text-sm">{initials}</span>
                  )}
                </div>

                {/* Comment Body */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {comment.user?.name || "Unknown User"}
                    </span>
                    {isTeacher && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        INSTRUCTOR
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a class comment..."
            className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors shrink-0 flex items-center justify-center h-[46px] w-[46px]"
          title="Post comment"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}