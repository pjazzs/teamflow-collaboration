import { useEffect, useMemo, useState } from "react";
import { Search, Users, X, Check } from "lucide-react";

import userService from "../../services/userService";
import getApiErrorMessage from "../../utils/getApiErrorMessage";

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function ProjectMembersModal({
  project,
  onClose,
  onSave,
  submitting = false,
}) {
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState(
    (project.members || []).map((member) =>
      typeof member === "string" ? member : member._id,
    ),
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await userService.getUsers({
          page: 1,
          limit: 100,
        });

        if (!cancelled) {
          const activeUsers = (response.data?.users || []).filter(
            (user) => user.isActive,
          );

          setUsers(activeUsers);
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

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    if (!searchTerm) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm),
    );
  }, [users, search]);

  const toggleMember = (userId) => {
    setSelectedMembers((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(selectedMembers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Users size={18} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Manage project members
                </h2>

                <p className="mt-0.5 max-w-xs truncate text-[11px] text-slate-400">
                  {project.name}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-slate-100 p-5 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">
                Select team members
              </p>

              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                {selectedMembers.length} selected
              </span>
            </div>

            <div className="relative mt-3">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search members by name or email..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            {loading ? (
              <p className="py-10 text-center text-xs text-slate-400">
                Loading team members...
              </p>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
                {error}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-1">
                {filteredUsers.map((member) => {
                  const isSelected = selectedMembers.includes(member._id);

                  return (
                    <button
                      key={member._id}
                      type="button"
                      disabled={submitting}
                      onClick={() => toggleMember(member._id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-violet-200 bg-violet-50/70"
                          : "border-transparent hover:bg-slate-50"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
                        {getInitials(member.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-700">
                          {member.name}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          {member.email}
                        </p>
                      </div>

                      <span className="mr-1 text-[9px] font-medium capitalize text-slate-400">
                        {member.role}
                      </span>

                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          isSelected
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <Check size={12} />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="py-10 text-center text-xs text-slate-400">
                {search
                  ? "No members match your search."
                  : "No active team members found."}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-4 sm:flex-row sm:justify-between sm:px-6">
            <button
              type="button"
              onClick={() => setSelectedMembers([])}
              disabled={submitting || selectedMembers.length === 0}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove all
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex-none"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || Boolean(error) || submitting}
                className="flex-1 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {submitting ? "Saving..." : "Save members"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
