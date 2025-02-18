const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs").promises;

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

const getProjectsPath = () => {
  return path.join(app.getPath("userData"), "projects.json");
};

ipcMain.handle("load-projects", async () => {
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
});

ipcMain.handle("save-projects", async (event, projects) => {
  const projectsPath = getProjectsPath();
  await fs.writeFile(projectsPath, JSON.stringify(projects, null, 2));
  return true;
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

ipcMain.handle("open-directory-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result;
});
