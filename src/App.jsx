import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import SidebarComponent from "./components/SideBar";
import QuestionnaireView from "./components/QuestionnaireView";
import ManageProjectsView from "./components/ManageProjectsView";
import DownloadSnapshotView from "./components/download/DownloadSnapshotView";
import PreviewValidationView from "./components/PreviewValidationView";
import InitForm from "./components/InitForm";
import { AppContainer, MainContent } from "./components/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
    success: { main: "#2e7d32" },
    background: {
      default: "#121212",
      paper: "#282828",
    },
  },
});

export default function App() {
  const [currentView, setCurrentView] = useState("questionnaire");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [downloadedFilePath, setDownloadedFilePath] = useState(null);
  const [pendingView, setPendingView] = useState(null);
  const [rocratePath, setRocratePath] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 6000);
  };

  const handleViewChange = (view) => {
    if (
      !selectedProject &&
      (view === "download" ||
        view === "preview" ||
        view === "deidentify" ||
        view === "upload")
    ) {
      setPendingView(view);
      showNotification("Please select a project first", "warning");
      setCurrentView("add-project");
    } else {
      setCurrentView(view);
    }
  };

  const handleProjectSelect = (project, isExisting = false) => {
    setSelectedProject(project);
    // If it's an existing project, go to download, otherwise go to init-crate
    setCurrentView(isExisting ? "download" : "init-crate");
  };

  const handleDataSelect = (data) => {
    setSelectedData(data);
    setCurrentView("preview");
  };

  const handleDownloadComplete = (filePath) => {
    setDownloadedFilePath(filePath);
    setCurrentView("preview");
    showNotification(
      "File downloaded successfully! Proceeding to preview.",
      "success"
    );
  };

  const handleInitCrateSuccess = () => {
    showNotification("RO-Crate initialized successfully!", "success");
    setCurrentView("download");
  };

  const renderContent = () => {
    switch (currentView) {
      case "questionnaire":
        return (
          <QuestionnaireView
            setCurrentView={setCurrentView}
            showNotification={showNotification}
          />
        );
      case "add-project":
        return (
          <ManageProjectsView
            setCurrentView={setCurrentView}
            onProjectSelect={handleProjectSelect}
          />
        );
      case "init-crate":
        return (
          <InitForm
            rocratePath={rocratePath}
            setRocratePath={setRocratePath}
            onSuccess={handleInitCrateSuccess}
            selectedProject={selectedProject}
          />
        );
      case "download":
        return (
          <DownloadSnapshotView
            setCurrentView={setCurrentView}
            project={selectedProject}
            onDataSelect={handleDataSelect}
            onDownloadComplete={handleDownloadComplete}
          />
        );
      case "preview":
        return (
          <PreviewValidationView
            project={selectedProject}
            selectedData={selectedData}
            downloadedFilePath={downloadedFilePath}
            onValidated={() => setCurrentView("deidentify")}
            setDownloadedFilePath={setDownloadedFilePath}
          />
        );
      case "deidentify":
        return <div>TO-DO</div>;
      case "upload":
        return <div>TO-DO</div>;
      default:
        return <div>Content for {currentView}</div>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <SidebarComponent
          currentView={currentView}
          setCurrentView={handleViewChange}
        />
        <MainContent>
          {renderContent()}
          <Snackbar
            open={notification.open}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert severity={notification.severity}>
              {notification.message}
            </Alert>
          </Snackbar>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
}
