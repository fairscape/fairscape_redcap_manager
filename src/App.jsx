import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import { AppContainer, MainContent } from "./components/styles";
import SidebarComponent from "./components/SideBar";
import QuestionnaireView from "./components/QuestionnaireView";
import ManageProjectsView from "./components/ManageProjectsView";
import ViewProject from "./components/ViewProject";
import DownloadSnapshotView from "./components/DownloadSnapshotView";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
    success: { main: "#2e7d32" },
  },
});

export default function App() {
  const [currentView, setCurrentView] = useState("questionnaire");
  const [selectedProject, setSelectedProject] = useState(null);
  const [pendingView, setPendingView] = useState(null);
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
      (view === "download" || view === "deidentify" || view === "upload")
    ) {
      setPendingView(view);
      showNotification("Please select a project first", "warning");
      setCurrentView("add-project");
    } else {
      setCurrentView(view);
    }
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
            onProjectSelect={(project) => {
              setSelectedProject(project);
              if (pendingView) {
                setCurrentView(pendingView);
                setPendingView(null);
              } else {
                setCurrentView("download");
              }
            }}
          />
        );
      case "download":
        return (
          <DownloadSnapshotView
            setCurrentView={setCurrentView}
            project={selectedProject}
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
        <MainContent>{renderContent()}</MainContent>
        <Snackbar
          open={notification.open}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity={notification.severity}>{notification.message}</Alert>
        </Snackbar>
      </AppContainer>
    </ThemeProvider>
  );
}
