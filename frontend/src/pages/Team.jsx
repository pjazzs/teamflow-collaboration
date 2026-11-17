import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
  Users,
} from "lucide-react";

import useUsers from "../hooks/useUsers";
import useAuth from "../context/useAuth";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function Team() {
  const { user: currentUser } = useAuth();

  const {
    users,
    pagination,
    loading,
    error,
    searchUsers,
    changePage,
    updateUserRole,
    updateUserStatus,
  } = useUsers();

  const [searchInput, setSearchInput] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const isAdmin = currentUser?.role === "admin";

  const activeCount = users.filter((member) => member.isActive).length;
  const adminCount = users.filter((member) => member.role === "admin").length;

  const handleSearch = async (event) => {
    event.preventDefault();
    setActionError("");
    setActionSuccess("");

    await searchUsers(searchInput);
  };

  const handleRoleChange = async (member, role) => {
    if (member._id === currentUser?._id || actionLoadingId) return;

    setActionLoadingId(member._id);
    setActionError("");
    setActionSuccess("");

    const result = await updateUserRole(member._id, role);

    if (result.success) {
      setActionSuccess(`${member.name}'s role was updated successfully.`);
    } else {
      setActionError(result.error || "Unable to update this user's role.");
    }

    setActionLoadingId("");
  };

  const handleStatusChange = async (member) => {
    if (member._id === currentUser?._id || actionLoadingId) return;

    const nextStatus = !member.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Activate ${member.name}'s account?`
        : `Deactivate ${member.name}'s account? They will no longer be able to access the workspace.`,
    );

    if (!confirmed) return;

    setActionLoadingId(member._id);
    setActionError("");
    setActionSuccess("");

    const result = await updateUserStatus(member._id, nextStatus);

    if (result.success) {
      setActionSuccess(
        `${member.name}'s account was ${nextStatus ? "activated" : "deactivated"} successfully.`,
      );
    } else {
      setActionError(
        result.error || "Unable to update this user's account status.",
      );
    }

    setActionLoadingId("");
  };

  const handlePageChange = async (page) => {
    setActionError("");
    setActionSuccess("");
    await changePage(page);
  };

  return (
    <div className="space-y-7">
      {/* Page header */}
      <section>
        <p className="text-xs font-medium text-violet-600">
          Workspace management
        </p>

        <h1 className="heading-font mt-1 text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[30px]">
          Team members
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and manage the people in your workspace.
        </p>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Total members</p>

            <Users size={18} className="text-violet-500" />
          </div>

          <p className="heading-font mt-3 text-2xl font-extrabold text-slate-900">
            {pagination.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Active members</p>

            <UserCheck size={18} className="text-emerald-500" />
          </div>

          <p className="heading-font mt-3 text-2xl font-extrabold text-emerald-600">
            {activeCount}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">On this page</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Administrators</p>

            <ShieldCheck size={18} className="text-blue-500" />
          </div>

          <p className="heading-font mt-3 text-2xl font-extrabold text-blue-600">
            {adminCount}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">On this page</p>
        </div>
      </section>

      {/* Search */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-xs outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={15} />
            Search
          </button>
        </form>
      </section>

      {/* Feedback */}
      {(error || actionError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError || error}
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionSuccess}
        </div>
      )}

      {/* Team members table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading team members...
        </div>
      ) : users.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                All team members
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Workspace members and their account details
              </p>
            </div>

            <span className="text-[11px] font-semibold text-violet-600">
              {pagination.total} members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left">
              <thead>
                <tr className="bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  {isAdmin && <th className="px-4 py-3">Actions</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((member) => {
                  const isCurrentUser = member._id === currentUser?._id;
                  const isProcessing = actionLoadingId === member._id;

                  return (
                    <tr
                      key={member._id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-48 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
                            {getInitials(member.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-700">
                              {member.name}
                              {isCurrentUser && (
                                <span className="ml-1.5 text-[9px] font-medium text-violet-500">
                                  You
                                </span>
                              )}
                            </p>

                            <p className="mt-0.5 truncate text-[10px] text-slate-400">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {isAdmin && !isCurrentUser ? (
                          <select
                            aria-label={`Change role for ${member.name}`}
                            value={member.role}
                            disabled={isProcessing || Boolean(actionLoadingId)}
                            onChange={(event) =>
                              handleRoleChange(member, event.target.value)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none transition focus:border-violet-400 disabled:opacity-50"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${
                              member.role === "admin"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {member.role === "admin" && (
                              <ShieldCheck size={11} />
                            )}
                            {member.role === "admin" ? "Admin" : "Member"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold ${
                            member.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.isActive ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-[11px] text-slate-500">
                        {formatDate(member.createdAt)}
                      </td>

                      {isAdmin && (
                        <td className="px-4 py-4">
                          {isCurrentUser ? (
                            <span className="text-[10px] text-slate-400">
                              Your account
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                isProcessing || Boolean(actionLoadingId)
                              }
                              onClick={() => handleStatusChange(member)}
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                member.isActive
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              {member.isActive ? (
                                <UserX size={13} />
                              ) : (
                                <UserCheck size={13} />
                              )}

                              {isProcessing
                                ? "Updating..."
                                : member.isActive
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-400">
              Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
              <span className="mx-1.5">·</span>
              {pagination.total} total members
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            {searchInput ? <UserRound size={26} /> : <Users size={26} />}
          </div>

          <h2 className="mt-4 text-sm font-bold text-slate-800">
            {searchInput ? "No matching members" : "No team members found"}
          </h2>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
            {searchInput
              ? "Try searching with a different name or email address."
              : "There are currently no members in this workspace."}
          </p>

          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                searchUsers("");
              }}
              className="mt-4 text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              Clear search
            </button>
          )}
        </section>
      )}
    </div>
  );
}
