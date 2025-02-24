import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import {
  Pencil,
  Trash2,
  Save,
  X,
  Plus,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { exportMetadata } from "../services/redcap-api";
import {
  ContentWrapper,
  FormCard,
  FormTable,
  FormTableHead,
  FormTableBody,
  FormTableHeader,
  FormTableCell,
  ActionButton,
  AddButton,
  NotificationBox,
  Title,
  FormTableContainer,
} from "./styles";

const styles = {
  instructionsBox: {
    background: "#eff6ff",
    padding: "1rem",
    borderRadius: "4px",
    border: "1px solid #bfdbfe",
    marginTop: "1.5rem",
  },
  instructionsTitle: {
    fontWeight: "500",
    color: "#1e40af",
    marginBottom: "0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  instructionsList: {
    paddingLeft: "1.25rem",
    color: "#1e40af",
  },
  instructionsItem: {
    marginBottom: "0.5rem",
  },
};

const ManageProjectsView = ({ setCurrentView, onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const emptyProject = {
    name: "",
    url: "",
    token: "",
    formData: null,
    rocratePath: "", // Added for RO-Crate integration
    rocrateMetadata: null, // Added for RO-Crate integration
  };

  const [newProject, setNewProject] = useState(emptyProject);

  useEffect(() => {
    loadProjects();
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

  const loadProjects = async () => {
    try {
      const response = await ipcRenderer.invoke("load-projects");
      if (Array.isArray(response)) {
        setProjects(response);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      showNotification("Failed to load projects", "error");
    }
  };

  const saveProjects = async (updatedProjects) => {
    try {
      await ipcRenderer.invoke("save-projects", updatedProjects);
      setProjects(updatedProjects);
      await loadProjects(); // Reload projects after save
    } catch (error) {
      console.error("Error saving projects:", error);
      showNotification("Failed to save projects", "error");
    }
  };

  const startEditing = (project) => {
    setEditingId(project.id);
    setEditProject({ ...project });
  };

  const handleAdd = async () => {
    try {
      if (!newProject.name || !newProject.url || !newProject.token) {
        showNotification("Please fill in all fields", "error");
        return;
      }

      const formData = await exportMetadata(newProject.url, newProject.token);

      const projectId = Date.now().toString();
      const projectWithData = {
        ...newProject,
        id: projectId,
        formData: formData,
        rocratePath: "", // Initialize empty
        rocrateMetadata: null, // Initialize empty
      };

      const updatedProjects = [...projects, projectWithData];
      await saveProjects(updatedProjects);
      setNewProject(emptyProject);
      showNotification("Project added successfully");

      // For new projects, go to init-crate
      onProjectSelect(projectWithData, false);
    } catch (error) {
      showNotification(`Failed to add project: ${error.message}`, "error");
    }
  };

  const handleUpdate = async (projectId, updatedProject) => {
    try {
      // Preserve existing RO-Crate data if not modified in edit
      const existingProject = projects.find((p) => p.id === projectId);
      const projectToUpdate = {
        ...updatedProject,
        rocratePath: updatedProject.rocratePath || existingProject.rocratePath,
        rocrateMetadata:
          updatedProject.rocrateMetadata || existingProject.rocrateMetadata,
      };

      const updatedProjects = projects.map((project) =>
        project.id === projectId
          ? { ...projectToUpdate, id: projectId }
          : project
      );

      await saveProjects(updatedProjects);
      setEditingId(null);
      setEditProject(null);
      showNotification("Project updated successfully");
    } catch (error) {
      showNotification("Failed to update project", "error");
    }
  };

  const handleDelete = async (projectId) => {
    try {
      const updatedProjects = projects.filter(
        (project) => project.id !== projectId
      );
      await saveProjects(updatedProjects);
      showNotification("Project deleted successfully");
    } catch (error) {
      showNotification("Failed to delete project", "error");
    }
  };

  const selectProject = (project) => {
    // If project has RO-Crate path, go to download, otherwise init-crate
    const isExisting = Boolean(project.rocratePath);
    onProjectSelect(project, isExisting);
  };

  return (
    <ContentWrapper>
      <Title>REDCap Project Management</Title>
      <FormCard>
        <FormTableContainer>
          <FormTable>
            <FormTableHead>
              <tr>
                <FormTableHeader>Project Name</FormTableHeader>
                <FormTableHeader>REDCap URL</FormTableHeader>
                <FormTableHeader>API Token</FormTableHeader>
                <FormTableHeader style={{ width: "200px", textAlign: "right" }}>
                  Actions
                </FormTableHeader>
              </tr>
            </FormTableHead>
            <FormTableBody>
              {projects.map((project) => (
                <tr key={project.id}>
                  {editingId === project.id ? (
                    <>
                      <FormTableCell>
                        <input
                          value={editProject.name}
                          onChange={(e) =>
                            setEditProject({
                              ...editProject,
                              name: e.target.value,
                            })
                          }
                        />
                      </FormTableCell>
                      <FormTableCell>
                        <input
                          value={editProject.url}
                          onChange={(e) =>
                            setEditProject({
                              ...editProject,
                              url: e.target.value,
                            })
                          }
                        />
                      </FormTableCell>
                      <FormTableCell>
                        <input
                          type="password"
                          value={editProject.token}
                          onChange={(e) =>
                            setEditProject({
                              ...editProject,
                              token: e.target.value,
                            })
                          }
                        />
                      </FormTableCell>
                      <FormTableCell style={{ textAlign: "right" }}>
                        <ActionButton
                          onClick={() => handleUpdate(project.id, editProject)}
                        >
                          <Save size={20} />
                        </ActionButton>
                        <ActionButton
                          variant="secondary"
                          onClick={() => {
                            setEditingId(null);
                            setEditProject(null);
                          }}
                        >
                          <X size={20} />
                        </ActionButton>
                      </FormTableCell>
                    </>
                  ) : (
                    <>
                      <FormTableCell $primary>{project.name}</FormTableCell>
                      <FormTableCell>{project.url}</FormTableCell>
                      <FormTableCell>••••••••••••</FormTableCell>
                      <FormTableCell style={{ textAlign: "right" }}>
                        <ActionButton
                          variant="success"
                          onClick={() => selectProject(project)}
                        >
                          <ExternalLink size={20} />
                        </ActionButton>
                        <ActionButton onClick={() => startEditing(project)}>
                          <Pencil size={20} />
                        </ActionButton>
                        <ActionButton
                          variant="secondary"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 size={20} />
                        </ActionButton>
                      </FormTableCell>
                    </>
                  )}
                </tr>
              ))}
              <tr>
                <FormTableCell>
                  <input
                    placeholder="Project Name"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                  />
                </FormTableCell>
                <FormTableCell>
                  <input
                    placeholder="REDCap URL"
                    value={newProject.url}
                    onChange={(e) =>
                      setNewProject({ ...newProject, url: e.target.value })
                    }
                  />
                </FormTableCell>
                <FormTableCell>
                  <input
                    type="password"
                    placeholder="API Token"
                    value={newProject.token}
                    onChange={(e) =>
                      setNewProject({ ...newProject, token: e.target.value })
                    }
                  />
                </FormTableCell>
                <FormTableCell style={{ textAlign: "right" }}>
                  <AddButton onClick={handleAdd}>
                    <Plus size={20} />
                    Add Project
                  </AddButton>
                </FormTableCell>
              </tr>
            </FormTableBody>
          </FormTable>
        </FormTableContainer>

        <div style={styles.instructionsBox}>
          <h3 style={styles.instructionsTitle}>
            <HelpCircle size={16} />
            How to Connect Your REDCap Database:
          </h3>
          <ol style={styles.instructionsList}>
            <li style={styles.instructionsItem}>
              Login into your REDCap and select the database you'd like to
              connect to.
            </li>
            <li style={styles.instructionsItem}>
              Navigate to API under the Applications submenu on the left side of
              the page.
              <div
                style={{
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  marginTop: "0.25rem",
                }}
              >
                Note: If you do not see API on the menu options, work with your
                administrator to get the proper permissions.
              </div>
            </li>
            <li style={styles.instructionsItem}>
              Copy your token and API url into the above boxes to connect.
            </li>
          </ol>
        </div>
      </FormCard>
      {notification.open && (
        <NotificationBox severity={notification.severity}>
          {notification.message}
        </NotificationBox>
      )}
    </ContentWrapper>
  );
};

export default ManageProjectsView;
