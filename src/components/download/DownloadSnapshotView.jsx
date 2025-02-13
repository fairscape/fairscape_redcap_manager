import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Download, Calendar } from "lucide-react";
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
  DateRangeContainer,
  DateInputGroup,
  DateLabel,
  DateInput,
} from "./download_styles";

import {
  FormCard,
  FormHeader,
  FormTitleWrapper,
  FormTitle,
  ExpandIcon,
  FormTableContainer,
  FormTable,
  FormTableHead,
  FormTableHeader,
  FormTableBody,
  FormTableCell,
  ValidationInfo,
  Title,
} from "../styles";

const DownloadSnapshotView = ({ project }) => {
  const [projectData, setProjectData] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [expandedForms, setExpandedForms] = useState(new Set());
  const [selectedForms, setSelectedForms] = useState(new Set());
  const [selectedFields, setSelectedFields] = useState(new Set());
  const [downloadMode, setDownloadMode] = useState("fields");
  const [dateRange, setDateRange] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setProjectData(project.formData || []);
      setProjectName(project.name);
    }
  }, [project]);

  // Keeping existing toggle and selection functions...
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
    const formFields = projectData.find(
      (form) => form.form_name === formName
    ).fields;

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

  const selectAllForms = () => {
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
      const timestamp = new Date().toISOString().slice(0, 10);
      const dateRangeStr =
        dateRange.dateRangeBegin && dateRange.dateRangeEnd
          ? `_${dateRange.dateRangeBegin}_to_${dateRange.dateRangeEnd}`
          : "";
      const filename = `${projectName}_export${dateRangeStr}_${timestamp}.csv`;

      downloadFile(data, filename);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <HeaderSection>
        <Title>{projectName} - Project Export</Title>

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
          <DateRangeContainer>
            <DateInputGroup>
              <DateLabel>Start Date</DateLabel>
              <DateInput
                type="date"
                value={dateRange.dateRangeBegin || ""}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    dateRangeBegin: e.target.value,
                  }))
                }
              />
            </DateInputGroup>
            <DateInputGroup>
              <DateLabel>End Date</DateLabel>
              <DateInput
                type="date"
                value={dateRange.dateRangeEnd || ""}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    dateRangeEnd: e.target.value,
                  }))
                }
              />
            </DateInputGroup>
          </DateRangeContainer>
        )}
      </HeaderSection>

      <ScrollContent>
        {downloadMode === "fields" && (
          <FormContainer>
            {projectData.map((form) => (
              <FormCard key={form.form_name}>
                <FormHeader onClick={() => toggleForm(form.form_name)}>
                  <FormTitleWrapper>
                    <input
                      type="checkbox"
                      checked={selectedForms.has(form.form_name)}
                      onChange={() => toggleFormSelection(form.form_name)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ExpandIcon>
                      {expandedForms.has(form.form_name) ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </ExpandIcon>
                    <FormTitle>{form.form_name.replace(/_/g, " ")}</FormTitle>
                  </FormTitleWrapper>
                  <div>{form.fields.length} fields</div>
                </FormHeader>

                {expandedForms.has(form.form_name) && (
                  <FormTableContainer>
                    <FormTable>
                      <FormTableHead>
                        <tr>
                          <FormTableHeader>Select</FormTableHeader>
                          <FormTableHeader>Field Name</FormTableHeader>
                          <FormTableHeader>Type</FormTableHeader>
                          <FormTableHeader>Label</FormTableHeader>
                          <FormTableHeader>PHI</FormTableHeader>
                          <FormTableHeader>Validation</FormTableHeader>
                          <FormTableHeader>Required</FormTableHeader>
                        </tr>
                      </FormTableHead>
                      <FormTableBody>
                        {form.fields.map((field) => (
                          <tr key={field.field_name}>
                            <FormTableCell>
                              <input
                                type="checkbox"
                                checked={selectedFields.has(
                                  `${form.form_name}.${field.field_name}`
                                )}
                                onChange={() =>
                                  toggleFieldSelection(
                                    form.form_name,
                                    field.field_name
                                  )
                                }
                              />
                            </FormTableCell>
                            <FormTableCell $primary>
                              {field.field_name}
                            </FormTableCell>
                            <FormTableCell>{field.field_type}</FormTableCell>
                            <FormTableCell>{field.field_label}</FormTableCell>
                            <FormTableCell>{field.phi}</FormTableCell>
                            <FormTableCell>
                              {field.validation && (
                                <ValidationInfo>
                                  <div>{field.validation}</div>
                                  {field.validation_min &&
                                    field.validation_max && (
                                      <div>
                                        Range: {field.validation_min} -{" "}
                                        {field.validation_max}
                                      </div>
                                    )}
                                </ValidationInfo>
                              )}
                            </FormTableCell>
                            <FormTableCell>
                              {field.required ? "Yes" : "No"}
                            </FormTableCell>
                          </tr>
                        ))}
                      </FormTableBody>
                    </FormTable>
                  </FormTableContainer>
                )}
              </FormCard>
            ))}
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
            isLoading
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
