import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
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

  const renderContent = () => {
    switch (currentView) {
      case "questionnaire":
        return <QuestionnaireView setCurrentView={setCurrentView} />;
      case "add-project":
        return (
          <ManageProjectsView
            setCurrentView={setCurrentView}
            onProjectSelect={(project) => {
              setSelectedProject(project);
              setCurrentView("download");
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
          setCurrentView={setCurrentView}
        />
        <MainContent>{renderContent()}</MainContent>
      </AppContainer>
    </ThemeProvider>
  );
}
