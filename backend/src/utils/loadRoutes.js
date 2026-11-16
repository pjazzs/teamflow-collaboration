const fs = require("fs");
const path = require("path");

// Route filename to API URL mapping
const routePrefixes = {
  healthRoutes: "health",
  projectRoutes: "projects",
  taskRoutes: "tasks",
  commentRoutes: "comments",
  activityRoutes: "activities",
  authRoutes: "auth",
};

const loadRoutes = (app) => {
  const routesDirectory = path.join(__dirname, "../routes");

  const routeFiles = fs
    .readdirSync(routesDirectory)
    .filter((file) => file.endsWith("Routes.js"));

  routeFiles.forEach((file) => {
    const routePath = path.join(routesDirectory, file);
    const routeName = routePrefixes[file.replace(".js", "")];

    if (!routeName) {
      throw new Error(`No API prefix configured for ${file}`);
    }

    const router = require(routePath);

    if (typeof router !== "function") {
      throw new Error(
        `Invalid route export in ${file}. Expected an Express router.`,
      );
    }

    app.use(`/api/${routeName}`, router);

    console.log(`Route registered: /api/${routeName}`);
  });
};

module.exports = loadRoutes;
