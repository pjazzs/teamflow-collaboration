import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import Login from "./pages/auth/Login";
import PlaceholderPage from "./pages/PlaceholderPage";
import Register from "./pages/auth/Register";
import PublicRoute from "./components/auth/PublicRoute";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";

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

      <div className="min-w-0 w-full lg:pl-65">
        <Topbar onMenu={() => setMobileOpen(true)} />

        <main className="mx-auto w-full min-w-0 max-w-[1600px] overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 lg:px-9 lg:pt-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />

            <Route path="/tasks" element={<Tasks />} />

            <Route path="/tasks/:taskId" element={<TaskDetails />} />

            <Route path="/team" element={<Team />} />

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
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<AppLayout />} />
      </Route>
    </Routes>
  );
};

export default App;
