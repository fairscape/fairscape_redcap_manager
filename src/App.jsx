import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import SidebarComponent from "./components/SideBar";
import QuestionnaireView from "./components/QuestionnaireView";
import ManageProjectsView from "./components/ManageProjectsView";
import DownloadSnapshotView from "./components/download/DownloadSnapshotView";
import DatasetForm from "./components/dataset/DatasetForm";
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
  const [roCrateMetadata, setRoCrateMetadata] = useState(null);
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
        view === "upload" ||
        view === "dataset-form")
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
    setCurrentView(isExisting ? "download" : "init-crate");
  };

  const handleDataSelect = (data) => {
    setSelectedData(data);
    setCurrentView("preview");
  };

  const handleDownloadComplete = async (filePath) => {
    setDownloadedFilePath(filePath);
    try {
      const response = await fetch("ro-crate-metadata.json");
      const metadata = await response.json();
      setRoCrateMetadata(metadata["@graph"][1]); // Get the main dataset metadata
      setCurrentView("dataset-form");
      showNotification(
        "File downloaded successfully! Please complete the dataset form.",
        "success"
      );
    } catch (error) {
      console.error("Error reading RO-Crate metadata:", error);
      showNotification("Error reading metadata. Please try again.", "error");
    }
  };

  const handleDatasetSubmit = (formData) => {
    // Handle the dataset form submission
    console.log("Dataset form submitted:", formData);
    showNotification("Dataset registered successfully!", "success");
    setCurrentView("preview");
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
            project={selectedProject}
            onDownloadComplete={handleDownloadComplete}
            setRocratePath={setRocratePath}
          />
        );
      case "dataset-form":
        return (
          <DatasetForm
            downloadedFile={downloadedFilePath}
            metadata={roCrateMetadata}
            projectName={selectedProject?.name}
            onSubmit={handleDatasetSubmit}
            onBack={() => setCurrentView("download")}
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
