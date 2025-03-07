import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import SidebarComponent from "./components/SideBar";
import QuestionnaireView from "./components/QuestionnaireView";
import ManageProjectsView from "./components/ManageProjectsView";
import DownloadSnapshotView from "./components/download/DownloadSnapshotView";
import DatasetForm from "./components/dataset/DatasetForm";
import PreviewValidationView from "./components/PreviewValidationView";
import DeidentificationVerificationView from "./components/deidentification/DeidentificationVerificationView";
import PackageUploadView from "./components/PackageUploadView";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    // Check for existing auth token on component mount
    const token = localStorage.getItem("authToken");
    if (token) {
      // You might want to validate the token here
      setIsLoggedIn(true);
      // You might want to fetch user data here based on the token
    }
  }, []);

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
        view === "dataset-form" ||
        view === "package")
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
      handleViewChange("preview");
      showNotification(
        "File downloaded successfully! Please preview the download.",
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
    handleViewChange("package");
  };

  const updateProject = async (updatedProject) => {
    setSelectedProject(updatedProject);
  };

  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setUserData(data);
    localStorage.setItem("authToken", data.token);
    showNotification("Login successful!", "success");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem("authToken");
    setCurrentView("questionnaire"); // Reset to initial view
    showNotification("Logged out successfully", "info");
  };

  const handlePackageUploadComplete = () => {
    showNotification(
      "RO-Crate has been packaged and uploaded successfully!",
      "success"
    );
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
      case "package":
        return (
          <PackageUploadView
            project={selectedProject}
            onComplete={handlePackageUploadComplete}
          />
        );
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
          isLoggedIn={isLoggedIn}
          userData={userData}
          onLogin={handleLogin}
          onLogout={handleLogout}
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
