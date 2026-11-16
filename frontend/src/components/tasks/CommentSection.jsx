import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import commentService from "../../services/commentService";
import getApiErrorMessage from "../../utils/getApiErrorMessage";

const formatDate = (date) => {
  return new Date(date).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function CommentSection({ taskId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      try {
        const response = await commentService.getTaskComments(taskId);

        if (!cancelled) {
          setComments(response.data || []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setError("Please write a comment before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await commentService.createComment(taskId, {
        content: content.trim(),
      });

      setComments((current) => [...current, response.data]);
      setContent("");
      setSuccess("Comment added successfully.");

      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmed) return;

    setDeletingId(comment._id);
    setError("");
    setSuccess("");

    try {
      await commentService.deleteComment(comment._id);

      setComments((current) =>
        current.filter((item) => item._id !== comment._id),
      );

      setSuccess("Comment deleted successfully.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <MessageCircle size={17} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-800">Discussion</h2>

          <p className="text-[11px] text-slate-400">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
            {success}
          </div>
        )}

        {loading ? (
          <p className="py-6 text-center text-xs text-slate-400">
            Loading comments...
          </p>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article key={comment._id} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                  {(comment.authorName || "T").charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {comment.authorName || "Team member"}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(comment)}
                      disabled={deletingId === comment._id}
                      aria-label="Delete comment"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-600">
                    {comment.content}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-7 text-center">
            <MessageCircle size={25} className="mx-auto text-slate-300" />

            <p className="mt-3 text-xs font-semibold text-slate-600">
              No comments yet
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Start a discussion about this task.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-100 pt-4"
        >
          <label
            htmlFor="task-comment"
            className="text-xs font-semibold text-slate-600"
          >
            Add a comment
          </label>

          <textarea
            id="task-comment"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your comment..."
            rows={3}
            maxLength={2000}
            className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />

          <div className="mt-2 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
            <span className="text-[10px] text-slate-400">
              {content.length}/2000 characters
            </span>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={14} />
              {submitting ? "Sending..." : "Post comment"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
