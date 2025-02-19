import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { exportRecords } from "../../services/redcap-api";

// Components
import { FormCard } from "./components/FormCard";
import { DateRangeSelector } from "./components/DateRangeSelector";

// Styled Components
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

const DownloadSnapshotView = ({ project, onDownloadComplete }) => {
  const [projectData, setProjectData] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [expandedForms, setExpandedForms] = useState(new Set());
  const [selectedForms, setSelectedForms] = useState(new Set());
  const [selectedFields, setSelectedFields] = useState(new Set());
  const [downloadMode, setDownloadMode] = useState("fields");
  const [dateRange, setDateRange] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Project received:", project); // Debug log
    if (project) {
      console.log("Project formData:", project.formData); // Debug log
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

  // Rest of the component code remains the same...
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
    const newSelectedForms = new Set(selectedForms);
    const formFields =
      projectData.find((form) => form.form_name === formName)?.fields || [];

    if (newSelectedForms.has(formName)) {
      newSelectedForms.delete(formName);
      const newSelectedFields = new Set(selectedFields);
      formFields.forEach((field) => {
        newSelectedFields.delete(`${formName}.${field.field_name}`);
      });
      setSelectedFields(newSelectedFields);
    } else {
      newSelectedForms.add(formName);
      const newSelectedFields = new Set(selectedFields);
      formFields.forEach((field) => {
        newSelectedFields.add(`${formName}.${field.field_name}`);
      });
      setSelectedFields(newSelectedFields);
    }
    setSelectedForms(newSelectedForms);
  };

  const toggleFieldSelection = (formName, fieldName) => {
    const newSelectedFields = new Set(selectedFields);
    const fieldKey = `${formName}.${fieldName}`;

    if (newSelectedFields.has(fieldKey)) {
      newSelectedFields.delete(fieldKey);
      // If no fields from this form are selected, unselect the form
      const formFields =
        projectData
          .find((form) => form.form_name === formName)
          ?.fields.map((field) => `${formName}.${field.field_name}`) || [];
      const hasSelectedFields = formFields.some((field) =>
        newSelectedFields.has(field)
      );
      if (!hasSelectedFields) {
        const newSelectedForms = new Set(selectedForms);
        newSelectedForms.delete(formName);
        setSelectedForms(newSelectedForms);
      }
    } else {
      newSelectedFields.add(fieldKey);
      // If this is the first field selected from this form, select the form
      if (!selectedForms.has(formName)) {
        const newSelectedForms = new Set(selectedForms);
        newSelectedForms.add(formName);
        setSelectedForms(newSelectedForms);
      }
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

  const downloadFile = async (data, filename) => {
    const blob = new Blob([data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    return filename;
  };

  const selectAllForms = () => {
    if (!projectData.length) {
      console.warn("No project data available for selecting forms");
      return;
    }
    const allForms = new Set(projectData.map((form) => form.form_name));
    const allFields = new Set();
    projectData.forEach((form) => {
      form.fields.forEach((field) => {
        allFields.add(`${form.form_name}.${field.field_name}`);
      });
    });
    setSelectedForms(allForms);
    setSelectedFields(allFields);
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
        const allFormsSelected = selectedForms.size === projectData.length;
        if (!allFormsSelected) {
          options.forms = Array.from(selectedForms);
          options.fields = Array.from(selectedFields).map((field) => {
            const [formName, fieldName] = field.split(".");
            return fieldName;
          });
        }
      }

      const data = await exportRecords(project.url, project.token, options);
      const filename = generateFilename();
      const filePath = await downloadFile(data, filename);
      onDownloadComplete(filePath);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Failed to download data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <HeaderSection>
        <Title>{projectName} - Project Export</Title>
        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>
            Error: {error}
          </div>
        )}

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
          </ButtonContainer>
        )}

        {downloadMode === "date" && (
          <DateRangeSelector
            dateRange={dateRange}
            onDateChange={handleDateChange}
          />
        )}
      </HeaderSection>

      <ScrollContent>
        {downloadMode === "fields" && (
          <FormContainer>
            {projectData && projectData.length > 0 ? (
              projectData.map((form) => (
                <FormCard
                  key={form.form_name}
                  form={form}
                  isExpanded={expandedForms.has(form.form_name)}
                  isSelected={selectedForms.has(form.form_name)}
                  selectedFields={selectedFields}
                  onToggleExpand={() => toggleForm(form.form_name)}
                  onToggleSelect={() => toggleFormSelection(form.form_name)}
                  onFieldSelect={toggleFieldSelection}
                />
              ))
            ) : (
              <div>No form data available</div>
            )}
          </FormContainer>
        )}
      </ScrollContent>

      <Footer>
        <DownloadButton
          onClick={handleDownload}
          disabled={
            (downloadMode === "fields" && selectedForms.size === 0) ||
            (downloadMode === "date" &&
              (!dateRange.dateRangeBegin || !dateRange.dateRangeEnd)) ||
            isLoading ||
            !projectData.length
          }
        >
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
