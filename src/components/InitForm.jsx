import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { rocrate_create } from "@fairscape/utils";
import { ipcRenderer } from "electron";
import { exportProjectInfo } from "../services/redcap-api";
import {
  FormCard,
  FormHeader,
  FormTitle,
  FormTableContainer,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  ActionButton,
  BrowseButton,
  NotificationBox,
  ModalContainer,
  FormActions,
  InitFormContainer,
} from "./FormStyles";

const LICENSE_OPTIONS = [
  { label: "MIT License", value: "https://opensource.org/licenses/MIT" },
  {
    label: "Apache License 2.0",
    value: "https://opensource.org/licenses/Apache-2.0",
  },
  { label: "CC BY 4.0", value: "https://creativecommons.org/licenses/by/4.0/" },
  {
    label: "CC BY-SA 4.0",
    value: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    label: "CC BY-NC 4.0",
    value: "https://creativecommons.org/licenses/by-nc/4.0/",
  },
  {
    label: "CC0 1.0",
    value: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
];

const organizations = [
  { name: "UVA", guid: "ark:59852/organization-uva" },
  { name: "UCSD", guid: "ark:59852/organization-ucsd" },
  { name: "Stanford", guid: "ark:59852/organization-stanford" },
  { name: "USF", guid: "ark:59852/organization-usf" },
  { name: "UCSF", guid: "ark:59852/organization-ucsf" },
  { name: "Yale", guid: "ark:59852/organization-yale" },
  { name: "SFU", guid: "ark:59852/organization-sfu" },
  { name: "Texas", guid: "ark:59852/organization-texas" },
  { name: "UA", guid: "ark:59852/organization-ua" },
  {
    name: "Université de Montréal",
    guid: "ark:59852/organization-universite-de-montreal",
  },
];

const projects = [
  { name: "CM4AI", guid: "ark:59852/project-cm4ai" },
  { name: "CHORUS", guid: "ark:59852/project-chorus" },
  { name: "PreMo", guid: "ark:59852/project-premo" },
];

function InitForm({ rocratePath, setRocratePath, onSuccess, selectedProject }) {
  const [formData, setFormData] = useState({
    name: "",
    organization_name: "",
    project_name: "",
    description: "",
    author: "",
    license: LICENSE_OPTIONS[0].value,
    keywords: "",
  });

  const [showOverwriteConfirmation, setShowOverwriteConfirmation] =
    useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchProjectInfo = async () => {
      if (selectedProject?.url && selectedProject?.token) {
        try {
          const projectInfo = await exportProjectInfo(
            selectedProject.url,
            selectedProject.token
          );
          setFormData((prevData) => ({
            ...prevData,
            name: projectInfo.project_title || "",
          }));
        } catch (error) {
          setNotification({
            message: `Failed to fetch project info: ${error.message}`,
            severity: "error",
          });
        }
      }
    };

    fetchProjectInfo();
  }, [selectedProject]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateGuid = (name) => {
    const NAAN = "59852";
    const sq = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace("T", "")
      .slice(0, 14);
    return `ark:${NAAN}/rocrate-${name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${sq}/`;
  };

  const checkForExistingMetadata = async () => {
    try {
      const fileList = await window.fs.readdir(rocratePath);
      return fileList.includes("ro-crate-metadata.json");
    } catch (error) {
      console.error("Failed to check for existing metadata:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const metadataExists = await checkForExistingMetadata();

    if (metadataExists) {
      setShowOverwriteConfirmation(true);
    } else {
      createROCrate();
    }
  };

  const createROCrate = async () => {
    const guid = generateGuid(formData.name);
    try {
      const organization = organizations.find(
        (org) => org.name === formData.organization_name
      );
      const project = projects.find(
        (proj) => proj.name === formData.project_name
      );

      await rocrate_create(
        rocratePath,
        formData.name,
        organization?.guid || null,
        project?.guid || null,
        formData.description,
        formData.author,
        formData.keywords,
        "pipeline",
        guid,
        formData.license
      );

      setNotification({
        message: "RO-Crate created successfully!",
        severity: "success",
      });
      onSuccess();
    } catch (error) {
      setNotification({
        message: "Failed to create RO-Crate",
        severity: "error",
      });
      console.error("Failed to create RO-Crate:", error);
    }
  };

  const handleBrowse = async () => {
    try {
      const result = await ipcRenderer.invoke("open-directory-dialog");
      if (result.filePaths && result.filePaths.length > 0) {
        setRocratePath(result.filePaths[0]);
      }
    } catch (error) {
      console.error("Failed to open directory dialog:", error);
    }
  };

  return (
    <InitFormContainer>
      <FormCard>
        <FormHeader>
          <FormTitle>Initialize Pipeline RO-Crate</FormTitle>
        </FormHeader>
        <form onSubmit={handleSubmit}>
          <FormTableContainer>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>RO-Crate Path</TableCell>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="text"
                          value={rocratePath}
                          onChange={(e) => setRocratePath(e.target.value)}
                          required
                        />
                        <BrowseButton type="button" onClick={handleBrowse}>
                          Browse
                        </BrowseButton>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>
                      <select
                        name="organization_name"
                        value={formData.organization_name}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select an organization</option>
                        {organizations.map((org) => (
                          <option key={org.guid} value={org.name}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>
                      <select
                        name="project_name"
                        value={formData.project_name}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option key={project.guid} value={project.name}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Author</TableCell>
                    <TableCell>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        required
                        placeholder="1st Author First Last, 2nd Author First Last, ..."
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>License</TableCell>
                    <TableCell>
                      <select
                        name="license"
                        value={formData.license}
                        onChange={handleChange}
                        required
                      >
                        {LICENSE_OPTIONS.map((license) => (
                          <option key={license.value} value={license.value}>
                            {license.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Keywords</TableCell>
                    <TableCell>
                      <input
                        type="text"
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleChange}
                        placeholder="Enter keywords separated by commas"
                        required
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </FormTableContainer>
          <FormActions>
            <ActionButton type="submit">Initialize RO-Crate</ActionButton>
          </FormActions>
        </form>
      </FormCard>

      <ModalContainer>
        <Modal
          show={showOverwriteConfirmation}
          onHide={() => setShowOverwriteConfirmation(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Existing RO-Crate Metadata Found</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            An ro-crate-metadata.json file already exists in the selected
            directory. Do you want to overwrite it or continue to the
            registration page?
          </Modal.Body>
          <Modal.Footer>
            <ActionButton
              onClick={() => {
                setShowOverwriteConfirmation(false);
                onSuccess();
              }}
            >
              Continue to Register
            </ActionButton>
            <ActionButton
              onClick={() => {
                setShowOverwriteConfirmation(false);
                createROCrate();
              }}
            >
              Overwrite
            </ActionButton>
          </Modal.Footer>
        </Modal>
      </ModalContainer>

      {notification && (
        <NotificationBox severity={notification.severity}>
          {notification.message}
        </NotificationBox>
      )}
    </InitFormContainer>
  );
}

export default InitForm;
