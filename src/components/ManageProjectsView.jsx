import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Save, X, Plus, ExternalLink } from "lucide-react";
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

// Mock API call - in real app, replace with actual API call
const fetchProjectData = () => {
  return Promise.resolve({
    projectData: [
      {
        form_name: "demographics",
        fields: [
          {
            field_name: "subject_number",
            field_type: "text",
            field_label: "Subject Number",
            validation: "number",
            validation_max: "99999",
            required: false,
            phi: "n",
          },
          {
            field_name: "demograph_site_id",
            field_type: "text",
            field_label: "Site ID",
            field_note: "Vxxx",
            required: false,
            phi: "n",
          },
          {
            field_name: "demograph_site_num",
            field_type: "text",
            field_label: "Site Number",
            field_note: "UVA = 1, WU = 2, CU = 3, UAB = 4",
            required: false,
            phi: "y",
          },
          {
            field_name: "vsdata_yn",
            field_type: "yesno",
            field_label:
              "Does this patient have a vital sign data file available for analysis?",
            required: false,
            phi: "n",
          },
          {
            field_name: "demograph_birth_date",
            field_type: "text",
            field_label: "Birth Date",
            validation: "date_mdy",
            required: false,
            phi: "y",
          },
          {
            field_name: "demograph_birthtime",
            field_type: "text",
            field_label: "Birth Time",
            validation: "time",
            required: false,
            phi: "n",
          },
          {
            field_name: "demograph_birth_ga_weeks",
            field_type: "text",
            field_label: "GA Weeks at Birth",
            field_note: "weeks",
            validation: "number",
            validation_min: "22",
            validation_max: "39",
            required: false,
            phi: "n",
          },
          {
            field_name: "demograph_birth_ga_days",
            field_type: "text",
            field_label: "GA Days at Birth",
            field_note: "out of 7 days",
            validation: "number",
            validation_min: "0",
            validation_max: "6",
            required: false,
            phi: "n",
          },
          {
            field_name: "demograph_gender",
            field_type: "radio",
            field_label: "Gender",
            choices: "0, Female | 1, Male",
            required: false,
            phi: "n",
          },
          {
            field_name: "demograph_race",
            field_type: "dropdown",
            field_label: "Race",
            choices:
              "1, White or Caucasian | 2, Black or African American | 3, Asian | 4, American Indian or Alaska Native | 5, Native Hawaiian or Other Pacific Islander | 99, Unknown/Not Reported",
            required: false,
            phi: "n",
          },
        ],
      },
      {
        form_name: "perinatal_data",
        fields: [
          {
            field_name: "delivery_birth_weight",
            field_type: "text",
            field_label: "Birth Weight (grams)",
            field_note: "grams",
            validation: "number",
            validation_min: "200",
            validation_max: "5000",
            required: false,
            phi: "n",
          },
          {
            field_name: "delivery_apgar_1_min",
            field_type: "text",
            field_label: "1 Minute",
            validation: "number",
            validation_min: "0",
            validation_max: "9",
            required: false,
            phi: "n",
          },
          {
            field_name: "delivery_apgar_5_min",
            field_type: "text",
            field_label: "5 Minutes",
            validation: "number",
            required: false,
            phi: "n",
          },
          {
            field_name: "delivery_apgar_10_min",
            field_type: "text",
            field_label: "10 Minutes",
            field_note: "leave blank if not assigned",
            validation: "number",
            required: false,
            phi: "n",
          },
          {
            field_name: "delivery_steroid_dose",
            field_type: "yesno",
            field_label:
              "Did mother receive at least one dose of steroids prior to delivery?",
            required: false,
            phi: "n",
          },
          {
            field_name: "delivery_mode",
            field_type: "radio",
            field_label: "Mode of Delivery",
            choices: "1, C-section | 2, Vaginal Delivery | 3, Unknown",
            required: false,
            phi: "n",
          },
        ],
      },
      {
        form_name: "outcomes_data",
        fields: [
          {
            field_name: "ivh_grade",
            field_type: "radio",
            field_label: "Highest grade IVH on any HUS, any side:",
            choices: "0, 0 | 1, 1 | 2, 2 | 3, 3 | 4, 4",
            required: false,
            phi: "n",
          },
          {
            field_name: "bpd_36_weeks",
            field_type: "radio",
            field_label:
              "Did the infant require supplemental oxygen at 36 weeks PMA?",
            choices: "1, Yes | 0, No | 99, Unknown",
            required: false,
            phi: "n",
          },
          {
            field_name: "rop_laser_avastin",
            field_type: "radio",
            field_label: "Was the infant treated with laser and/or Avastin?",
            choices: "1, Yes | 0, No | 99, Unknown",
            required: false,
            phi: "n",
          },
        ],
      },
    ],
  });
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
  };

  const [newProject, setNewProject] = useState(emptyProject);

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
    setTimeout(() => {
      setNotification({ ...notification, open: false });
    }, 6000);
  };

  const loadProjects = () => {
    const savedProjects = localStorage.getItem("redcapProjects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const saveProjects = (updatedProjects) => {
    localStorage.setItem("redcapProjects", JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  const handleUpdate = async (projectId, updatedProject) => {
    try {
      const updatedProjects = projects.map((project) =>
        project.id === projectId
          ? { ...updatedProject, id: projectId }
          : project
      );
      saveProjects(updatedProjects);
      setEditingId(null);
      setEditProject(null);
      showNotification("Project updated successfully");
    } catch (error) {
      showNotification("Failed to update project", "error");
    }
  };

  const handleDelete = (projectId) => {
    try {
      const updatedProjects = projects.filter(
        (project) => project.id !== projectId
      );
      saveProjects(updatedProjects);
      showNotification("Project deleted successfully");
    } catch (error) {
      showNotification("Failed to delete project", "error");
    }
  };

  const handleAdd = async () => {
    try {
      if (!newProject.name || !newProject.url || !newProject.token) {
        showNotification("Please fill in all fields", "error");
        return;
      }

      // Fetch form data when adding new project
      const response = await fetchProjectData();
      const projectId = Date.now().toString();
      const projectWithData = {
        ...newProject,
        id: projectId,
        formData: response.projectData,
      };

      const updatedProjects = [...projects, projectWithData];
      saveProjects(updatedProjects);
      setNewProject(emptyProject);
      showNotification("Project added successfully");
    } catch (error) {
      showNotification("Failed to add project", "error");
    }
  };

  const startEditing = (project) => {
    setEditingId(project.id);
    setEditProject({ ...project });
  };

  const selectProject = (project) => {
    localStorage.setItem("selectedProject", JSON.stringify(project));
    onProjectSelect(project);
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
