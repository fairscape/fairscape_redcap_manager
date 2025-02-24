import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import SidebarComponent from "./components/SideBar";
import QuestionnaireView from "./components/QuestionnaireView";
import ManageProjectsView from "./components/ManageProjectsView";
import DownloadSnapshotView from "./components/download/DownloadSnapshotView";
import DatasetForm from "./components/dataset/DatasetForm";
import PreviewValidationView from "./components/PreviewValidationView";
import DeidentificationVerificationView from "./components/deidentification/DeidentificationVerificationView";
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
  const [downloadedschemaID, setDownloadedschemaID] = useState(null);
  const [deidentifiedFilePath, setDeidentifiedFilePath] = useState(null);
  const [pendingView, setPendingView] = useState(null);
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

  const handleViewChange = (view, projectOverride = null) => {
    const projectToUse = projectOverride || selectedProject;
    if (
      !projectToUse &&
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
      if (projectOverride) {
        setSelectedProject(projectOverride);
      }
    }
  };

  const handleProjectSelect = (project, isExisting = false) => {
    setSelectedProject(project);
    if (isExisting) {
      handleViewChange("download", project);
    } else {
      handleViewChange("init-crate", project);
    }
  };

  const handleDownloadComplete = async (filePath, schemaID) => {
    setDownloadedFilePath(filePath);
    if (schemaID) {
      setDownloadedschemaID(schemaID);
    }
    if (selectedProject?.rocrateMetadata) {
      setRoCrateMetadata(selectedProject.rocrateMetadata);
      handleViewChange("dataset-form");
      showNotification(
        "File downloaded successfully! Please complete the dataset form.",
        "success"
      );
    } else {
      console.error("No RO-Crate metadata found in project");
      showNotification("Error: Project metadata not found", "error");
      handleViewChange("init-crate");
    }
  };

  const handleDatasetSubmit = (formData) => {
    showNotification("Dataset registered successfully!", "success");
    handleViewChange("preview");
  };

  const handleInitCrateSuccess = (updatedProject) => {
    setSelectedProject(updatedProject);
    showNotification("RO-Crate initialized successfully!", "success");
    handleViewChange("download", updatedProject);
  };

  const handleDeidentificationComplete = (filePath) => {
    setDeidentifiedFilePath(filePath);
    showNotification(
      "De-identification verification completed successfully!",
      "success"
    );
    handleViewChange("upload");
  };

  const updateProject = async (updatedProject) => {
    setSelectedProject(updatedProject);
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
            onSuccess={handleInitCrateSuccess}
            selectedProject={selectedProject}
            updateProject={updateProject}
          />
        );
      case "download":
        return (
          <DownloadSnapshotView
            project={selectedProject}
            onDownloadComplete={handleDownloadComplete}
          />
        );
      case "dataset-form":
        return (
          <DatasetForm
            downloadedFile={downloadedFilePath}
            metadata={roCrateMetadata}
            projectName={selectedProject?.name}
            schemaID={downloadedschemaID}
            onSubmit={handleDatasetSubmit}
            onBack={() => handleViewChange("download")}
          />
        );
      case "preview":
        return (
          <PreviewValidationView
            project={selectedProject}
            downloadedFilePath={downloadedFilePath}
            onValidated={() => handleViewChange("deidentify")}
            setDownloadedFilePath={setDownloadedFilePath}
          />
        );
      case "deidentify":
        return (
          <DeidentificationVerificationView
            project={selectedProject}
            onVerificationComplete={handleDeidentificationComplete}
          />
        );
      case "upload":
        return <div>Upload view - to be implemented</div>;
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
