import React, { useState, useEffect } from "react";
import { Download, HelpCircle, X } from "lucide-react";
import { exportRecords } from "../../services/redcap-api";
const { ipcRenderer } = window.require("electron");

import { FormCard } from "./components/FormCard";
import { DateRangeSelector } from "./components/DateRangeSelector";

import {
  PageContainer,
  HeaderSection,
  ButtonContainer,
  SelectAllButton,
  ScrollContent,
  FormContainer,
  Footer,
  DownloadButton,
  ModeSelectorContainer,
  ModeButton,
} from "./download_styles";
import { Title } from "../styles";

const styles = {
  helpIcon: {
    cursor: "pointer",
    color: "#3b82f6",
    marginLeft: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    maxWidth: "500px",
    width: "90%",
    position: "relative",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  closeButton: {
    position: "absolute",
    top: "0.75rem",
    right: "0.75rem",
    cursor: "pointer",
    color: "#6b7280",
  },
  popupTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "1rem",
    color: "#1e40af",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  instructionsBox: {
    background: "#eff6ff",
    padding: "1rem",
    borderRadius: "4px",
    border: "1px solid #bfdbfe",
  },
  instructionsList: {
    paddingLeft: "1.25rem",
    color: "#1e40af",
    margin: "0.5rem 0",
  },
  instructionsItem: {
    marginBottom: "0.5rem",
  },
  warningText: {
    color: "#b91c1c",
    fontWeight: "500",
    marginTop: "1rem",
    padding: "0.5rem",
    backgroundColor: "#fee2e2",
    borderRadius: "0.25rem",
  },
};

const HelpPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.popupOverlay} onClick={onClose}>
      <div style={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        <X style={styles.closeButton} size={20} onClick={onClose} />
        <div style={styles.popupTitle}>
          <HelpCircle size={20} />
          How to Download Your Data
        </div>
        <div style={styles.instructionsBox}>
          <ol style={styles.instructionsList}>
            <li style={styles.instructionsItem}>
              <strong>Select Fields</strong>: Choose specific forms and fields
              you would like to include in your export.
            </li>
            <li style={styles.instructionsItem}>
              <strong>Date Range</strong>: Alternatively, select a date range to
              download all data created or updated within that period.
            </li>
            <li style={styles.instructionsItem}>
              Click "Download Latest Snapshot" when ready and save the file to
              your desired location.
            </li>
          </ol>
        </div>
        <div style={styles.warningText}>
          <strong>Important:</strong> Do not save this data directly to your
          RO-Crate folder. Only de-identified data should be stored in your
          RO-Crate.
        </div>
      </div>
    </div>
  );
};

const DownloadSnapshotView = ({ project, onDownloadComplete }) => {
  const [projectData, setProjectData] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [expandedForms, setExpandedForms] = useState(new Set());
  const [selectedFields, setSelectedFields] = useState(new Set());
  const [downloadMode, setDownloadMode] = useState("fields");
  const [dateRange, setDateRange] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (project) {
      if (!project.formData) {
        setError("No form data available in project");
        return;
      }
      setProjectData(project.formData);
      setProjectName(project.name || "Unnamed Project");
      setError(null);
    } else {
      setError("No project data received");
    }
  }, [project]);

  const toggleForm = (formName) => {
    const newExpanded = new Set(expandedForms);
    if (newExpanded.has(formName)) {
      newExpanded.delete(formName);
    } else {
      newExpanded.add(formName);
    }
    setExpandedForms(newExpanded);
  };

  const toggleFormSelection = (formName) => {
    const form = projectData.find((f) => f.form_name === formName);
    if (!form) return;

    const newSelectedFields = new Set(selectedFields);
    const formFieldKeys = form.fields.map(
      (field) => `${formName}.${field.field_name}`
    );
    const allFieldsSelected = formFieldKeys.every((key) =>
      selectedFields.has(key)
    );

    if (allFieldsSelected) {
      formFieldKeys.forEach((key) => newSelectedFields.delete(key));
    } else {
      formFieldKeys.forEach((key) => newSelectedFields.add(key));
    }

    setSelectedFields(newSelectedFields);
  };

  const toggleFieldSelection = (formName, fieldName) => {
    const newSelectedFields = new Set(selectedFields);
    const fieldKey = `${formName}.${fieldName}`;

    if (newSelectedFields.has(fieldKey)) {
      newSelectedFields.delete(fieldKey);
    } else {
      newSelectedFields.add(fieldKey);
    }

    setSelectedFields(newSelectedFields);
  };

  const generateFilename = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const dateRangeStr =
      dateRange.dateRangeBegin && dateRange.dateRangeEnd
        ? `_${dateRange.dateRangeBegin}_to_${dateRange.dateRangeEnd}`
        : "";
    return `${projectName}_export${dateRangeStr}_${timestamp}.csv`;
  };

  const downloadFile = async (data, suggestedFilename) => {
    try {
      const result = await ipcRenderer.invoke("show-save-dialog", {
        defaultPath: suggestedFilename,
        filters: [
          { name: "CSV Files", extensions: ["csv"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (result.canceled) {
        throw new Error("File save was canceled");
      }

      await ipcRenderer.invoke("save-file", {
        filePath: result.filePath,
        data: data,
      });

      return result.filePath;
    } catch (error) {
      console.error("Error saving file:", error);
      throw error;
    }
  };

  const selectAllForms = () => {
    if (!projectData.length) {
      console.warn("No project data available for selecting forms");
      return;
    }
    const allFields = new Set();
    projectData.forEach((form) => {
      form.fields.forEach((field) => {
        allFields.add(`${form.form_name}.${field.field_name}`);
      });
    });
    setSelectedFields(allFields);
  };

  const selectAllNonPhi = () => {
    if (!projectData.length) {
      console.warn("No project data available for selecting fields");
      return;
    }
    const nonPhiFields = new Set();

    projectData.forEach((form) => {
      form.fields.forEach((field) => {
        if (field.phi !== "y") {
          nonPhiFields.add(`${form.form_name}.${field.field_name}`);
        }
      });
    });

    setSelectedFields(nonPhiFields);
  };

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const options = {};

      if (downloadMode === "date") {
        options.dateRangeBegin = dateRange.dateRangeBegin;
        options.dateRangeEnd = dateRange.dateRangeEnd;
      } else {
        const totalFields = projectData.reduce(
          (sum, form) => sum + form.fields.length,
          0
        );
        const allFieldsSelected = selectedFields.size === totalFields;

        if (!allFieldsSelected) {
          options.fields = Array.from(selectedFields).map((field) => {
            const [formName, fieldName] = field.split(".");
            return fieldName;
          });
        }
      }

      const data = await exportRecords(project.url, project.token, options);
      const filename = generateFilename();
      const savedPath = await downloadFile(data, filename);

      if (onDownloadComplete) {
        onDownloadComplete(savedPath);
      }
    } catch (error) {
      console.error("Error downloading data:", error);
      setError(`Failed to download data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <PageContainer>
        <div>Error: {error}</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <div style={styles.titleContainer}>
          <Title>Download Snapshot</Title>
          <HelpCircle
            size={20}
            style={styles.helpIcon}
            onClick={() => setShowHelp(true)}
          />
        </div>
        <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />

        <ModeSelectorContainer>
          <ModeButton
            active={downloadMode === "fields"}
            onClick={() => setDownloadMode("fields")}
          >
            Select Fields
          </ModeButton>
          <ModeButton
            active={downloadMode === "date"}
            onClick={() => setDownloadMode("date")}
          >
            Date Range
          </ModeButton>
        </ModeSelectorContainer>

        {downloadMode === "fields" && (
          <ButtonContainer>
            <SelectAllButton onClick={selectAllForms}>
              Select All Forms
            </SelectAllButton>
            <SelectAllButton onClick={selectAllNonPhi}>
              Select All Non-PHI
            </SelectAllButton>
          </ButtonContainer>
        )}

        {downloadMode === "date" && (
          <DateRangeSelector
            dateRange={dateRange}
            onDateChange={handleDateChange}
          />
        )}
      </HeaderSection>

      {downloadMode === "fields" && (
        <ScrollContent>
          <FormContainer>
            {projectData.map((form) => {
              const formFieldKeys = form.fields.map(
                (field) => `${form.form_name}.${field.field_name}`
              );
              const isSelected = formFieldKeys.every((key) =>
                selectedFields.has(key)
              );

              return (
                <FormCard
                  key={form.form_name}
                  form={form}
                  isExpanded={expandedForms.has(form.form_name)}
                  isSelected={isSelected}
                  selectedFields={selectedFields}
                  onToggleExpand={() => toggleForm(form.form_name)}
                  onToggleSelect={() => toggleFormSelection(form.form_name)}
                  onFieldSelect={toggleFieldSelection}
                />
              );
            })}
          </FormContainer>
        </ScrollContent>
      )}

      <Footer>
        <DownloadButton onClick={handleDownload} disabled={isLoading}>
          <Download size={16} />
          <span>
            {isLoading ? "Downloading..." : "Download Latest Snapshot"}
          </span>
        </DownloadButton>
      </Footer>
    </PageContainer>
  );
};

export default DownloadSnapshotView;
