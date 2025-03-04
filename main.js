const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fsPromises = require("fs").promises;
const fs = require("fs"); // Regular fs for createWriteStream
const archiver = require("archiver");

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
    const data = await fsPromises.readFile(projectsPath, "utf8");
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
  await fsPromises.writeFile(projectsPath, JSON.stringify(projects, null, 2));
}

// IPC Handlers
ipcMain.handle("load-projects", loadProjects);

ipcMain.handle("list-directory", async (_, { path: dirPath }) => {
  try {
    const files = await fsPromises.readdir(dirPath);
    return files;
  } catch (error) {
    console.error("Error listing directory:", error);
    throw error;
  }
});

ipcMain.handle("save-project", async (_, project) => {
  try {
    const projects = await loadProjects();
    let updatedProjects;

    if (project.id) {
      updatedProjects = projects.map((p) =>
        p.id === project.id ? { ...p, ...project } : p
      );
    } else {
      project.id = Date.now().toString();
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
    await fsPromises.access(filePath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle("read-file", async (_, { path: filePath, encoding }) => {
  try {
    return await fsPromises.readFile(filePath, { encoding });
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
    await fsPromises.writeFile(filePath, data);
    return true;
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
});

ipcMain.handle("zip-rocrate", async (_, { sourcePath, targetPath }) => {
  try {
    const output = fs.createWriteStream(targetPath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    return new Promise((resolve, reject) => {
      output.on("close", () => {
        resolve({ success: true, zipPath: targetPath });
      });

      archive.on("error", (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourcePath, false);
      archive.finalize();
    });
  } catch (error) {
    console.error("Error zipping folder:", error);
    throw error;
  }
});

ipcMain.handle("read-file-as-buffer", async (_, filePath) => {
  try {
    return await fsPromises.readFile(filePath);
  } catch (error) {
    console.error("Error reading file as buffer:", error);
    throw error;
  }
});

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
