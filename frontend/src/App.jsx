import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";

import { useState } from "react";

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

            <Route
              path="/projects"
              element={
                <PlaceholderPage
                  title="Projects"
                  description="Your team's projects will live here."
                />
              }
            />

            <Route
              path="/tasks"
              element={
                <PlaceholderPage
                  title="My tasks"
                  description="A focused view of the work assigned to you."
                />
              }
            />

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
