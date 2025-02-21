import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { exportRecords } from "../../services/redcap-api";
const { ipcRenderer } = window.require("electron");

// Components
import { FormCard } from "./components/FormCard";
import { DateRangeSelector } from "./components/DateRangeSelector";

//utils
import { generateSchemaFromFormData } from "../../services/schema-generation";
import { register_schema } from "@fairscape/utils";

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
      if (!selectedForms.has(formName)) {
        const newSelectedForms = new Set(selectedForms);
        newSelectedForms.add(formName);
        setSelectedForms(newSelectedForms);
      }
    }
    setSelectedFields(newSelectedFields);
  };

  const createAndRegisterSchema = async () => {
    // Filter the project data to only include selected forms and fields
    const filteredFormData = projectData
      .filter((form) => selectedForms.has(form.form_name))
      .map((form) => ({
        ...form,
        fields: form.fields.filter((field) =>
          selectedFields.has(`${form.form_name}.${field.field_name}`)
        ),
      }));

    // Generate the schema
    const schema = generateSchemaFromFormData(
      filteredFormData,
      `${projectName} Export Schema`,
      `Schema for selected fields from ${projectName} export`
    );

    try {
      // Register the schema with the RO-crate
      const schemaId = await register_schema(
        project.rocratePath,
        schema.name,
        schema.description,
        schema.properties,
        schema.required,
        schema.separator,
        schema.header
      );

      return schemaId;
    } catch (error) {
      console.error("Error registering schema with RO-crate:", error);
      throw new Error(`Failed to register schema: ${error.message}`);
    }
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
      let schemaID = null;
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
        // Create and register schema for selected fields
        schemaID = await createAndRegisterSchema();
      }

      const data = await exportRecords(project.url, project.token, options);
      const filename = generateFilename();
      const filePath = await downloadFile(data, filename);

      onDownloadComplete(filePath, schemaID);
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
