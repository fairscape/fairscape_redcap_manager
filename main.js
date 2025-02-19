const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs").promises;

// Create the main window
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadFile("index.html");
}

// Get the path for projects.json
const getProjectsPath = () => {
  console.log("User data path:", app.getPath("userData"));
  return path.join(app.getPath("userData"), "projects.json");
};

// Load projects from file
async function loadProjects() {
  try {
    const projectsPath = getProjectsPath();
    const data = await fs.readFile(projectsPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

// Save projects to file
async function saveProjects(projects) {
  const projectsPath = getProjectsPath();
  await fs.writeFile(projectsPath, JSON.stringify(projects, null, 2));
}

// IPC Handlers
ipcMain.handle("load-projects", loadProjects);

ipcMain.handle("save-project", async (_, project) => {
  try {
    const projects = await loadProjects();
    let updatedProjects;

    if (project.id) {
      // Update existing project
      updatedProjects = projects.map((p) =>
        p.id === project.id ? { ...p, ...project } : p
      );
    } else {
      // Add new project
      project.id = Date.now().toString(); // Simple ID generation
      updatedProjects = [...projects, project];
    }

    await saveProjects(updatedProjects);
    return true;
  } catch (error) {
    console.error("Error saving project:", error);
    throw error;
  }
});

ipcMain.handle("save-projects", async (_, projects) => {
  try {
    await saveProjects(projects);
    return true;
  } catch (error) {
    console.error("Error saving projects:", error);
    throw error;
  }
});

ipcMain.handle("open-directory-dialog", async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result;
  } catch (error) {
    console.error("Error opening directory dialog:", error);
    throw error;
  }
});

ipcMain.handle("check-file-exists", async (_, { path: filePath }) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle("read-file", async (_, { path: filePath, encoding }) => {
  try {
    return await fs.readFile(filePath, { encoding });
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
});

ipcMain.handle("show-save-dialog", async (_, options) => {
  try {
    const result = await dialog.showSaveDialog({
      defaultPath: options.defaultPath,
      filters: options.filters,
      properties: ["createDirectory", "showOverwriteConfirmation"],
    });
    return result;
  } catch (error) {
    console.error("Error showing save dialog:", error);
    throw error;
  }
});

ipcMain.handle("save-file", async (_, { filePath, data }) => {
  try {
    await fs.writeFile(filePath, data);
    return true;
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
});

// App lifecycle events
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
