import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import PlaceholderPage from "./pages/PlaceholderPage";

import Tasks from "./pages/Tasks";

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
        />
      )}

      <div className="lg:pl-65">
        <Topbar onMenu={() => setMobileOpen(true)} />

        <main className="mx-auto max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 lg:px-9 lg:pt-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />

            <Route path="/tasks" element={<Tasks />} />

            <Route
              path="/team"
              element={
                <PlaceholderPage
                  title="Team members"
                  description="Manage your workspace members."
                />
              }
            />

            <Route
              path="/activity"
              element={
                <PlaceholderPage
                  title="Activity"
                  description="Follow updates across your workspace."
                />
              }
            />

            <Route
              path="/settings"
              element={
                <PlaceholderPage
                  title="Settings"
                  description="Manage your workspace preferences."
                />
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return <AppLayout />;
}
