import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Download, Calendar } from "lucide-react";
import { exportRecords } from "../../services/redcap-api";
import DateRangeModal from "./DateRangeModal";

import {
  FormTableContainer,
  Title,
  FormCard,
  FormHeader,
  FormTitleWrapper,
  FormTitle,
  ExpandIcon,
  FormTable,
  FormTableHead,
  FormTableHeader,
  FormTableBody,
  FormTableCell,
  ValidationInfo,
} from "../styles";

import {
  PageContainer,
  HeaderSection,
  ButtonContainer,
  SelectAllButton,
  DateRangeButton,
  ScrollContent,
  FormContainer,
  Footer,
  DownloadButton,
} from "./download_styles";

const DownloadSnapshotView = ({ project }) => {
  const [projectData, setProjectData] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [expandedForms, setExpandedForms] = useState(new Set());
  const [selectedForms, setSelectedForms] = useState(new Set());
  const [selectedFields, setSelectedFields] = useState(new Set());
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setProjectData(project.formData || []);
      setProjectName(project.name);
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

  const toggleFieldSelection = (formName, fieldName) => {
    const fullFieldName = `${formName}.${fieldName}`;
    const newSelectedFields = new Set(selectedFields);

    if (newSelectedFields.has(fullFieldName)) {
      newSelectedFields.delete(fullFieldName);
      const formFields = projectData.find(
        (form) => form.form_name === formName
      ).fields;
      const noFieldsSelected = formFields.every(
        (field) => !newSelectedFields.has(`${formName}.${field.field_name}`)
      );
      if (noFieldsSelected) {
        const newSelectedForms = new Set(selectedForms);
        newSelectedForms.delete(formName);
        setSelectedForms(newSelectedForms);
      }
    } else {
      newSelectedFields.add(fullFieldName);
      const formFields = projectData.find(
        (form) => form.form_name === formName
      ).fields;
      const allFieldsSelected = formFields.every(
        (field) =>
          newSelectedFields.has(`${formName}.${field.field_name}`) ||
          field.field_name === fieldName
      );
      if (allFieldsSelected) {
        const newSelectedForms = new Set(selectedForms);
        newSelectedForms.add(formName);
        setSelectedForms(newSelectedForms);
      }
    }
    setSelectedFields(newSelectedFields);
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

  const handleDateRangeConfirm = (range) => {
    setDateRange(range);
  };

  const downloadFile = (data, filename) => {
    const blob = new Blob([data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Only include forms/fields if not all are selected
      const allFormsSelected = selectedForms.size === projectData.length;
      const options = {
        ...dateRange,
      };

      if (!allFormsSelected) {
        options.forms = Array.from(selectedForms);
        options.fields = Array.from(selectedFields).map((field) => {
          const [formName, fieldName] = field.split(".");
          return fieldName;
        });
      }

      const data = await exportRecords(project.url, project.token, options);

      // Generate filename with date range if specified
      const timestamp = new Date().toISOString().slice(0, 10);
      const dateRangeStr =
        dateRange.dateRangeBegin && dateRange.dateRangeEnd
          ? `_${dateRange.dateRangeBegin}_to_${dateRange.dateRangeEnd}`
          : "";
      const filename = `${projectName}_export${dateRangeStr}_${timestamp}.csv`;

      downloadFile(data, filename);
    } catch (error) {
      console.error("Download failed:", error);
      // You might want to add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <HeaderSection>
        <Title>{projectName} - Project Forms and Fields</Title>
        <ButtonContainer>
          <SelectAllButton onClick={selectAllForms}>
            Select All Forms
          </SelectAllButton>
          <DateRangeButton onClick={() => setIsDateModalOpen(true)}>
            <Calendar size={16} />
            <span>
              {dateRange.dateRangeBegin
                ? `${dateRange.dateRangeBegin} - ${dateRange.dateRangeEnd}`
                : "Select Date Range"}
            </span>
          </DateRangeButton>
        </ButtonContainer>
      </HeaderSection>

      <ScrollContent>
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
                        <tr
                          key={field.field_name}
                          style={{
                            backgroundColor:
                              field.phi === "y" ? "#FEE2E2" : "inherit",
                          }}
                        >
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
      </ScrollContent>

      <Footer>
        <DownloadButton
          onClick={handleDownload}
          disabled={selectedForms.size === 0 || isLoading}
        >
          {isLoading ? (
            <span>Downloading...</span>
          ) : (
            <>
              <Download size={16} />
              <span>Download Latest Snapshot</span>
            </>
          )}
        </DownloadButton>
      </Footer>

      <DateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onConfirm={handleDateRangeConfirm}
      />
    </PageContainer>
  );
};

export default DownloadSnapshotView;
