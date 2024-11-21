import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import {
  ContentWrapper,
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
  ActionButton,
} from "./styles";

const DownloadSnapshotView = ({ project }) => {
  const [projectData, setProjectData] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [expandedForms, setExpandedForms] = useState(new Set());
  const [selectedForms, setSelectedForms] = useState(new Set());
  const [selectedFields, setSelectedFields] = useState(new Set());

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

  const handleDownload = () => {
    const selectedData = projectData
      .filter((form) => selectedForms.has(form.form_name))
      .map((form) => ({
        form_name: form.form_name,
        fields: form.fields.filter((field) =>
          selectedFields.has(`${form.form_name}.${field.field_name}`)
        ),
      }));

    console.log("Downloading:", selectedData);
  };

  return (
    <ContentWrapper>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <div className="mb-8">
            <Title>{projectName} - Project Forms and Fields</Title>
            <div className="mt-4">
              <button
                onClick={selectAllForms}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Select All Forms
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {projectData.map((form) => (
              <FormCard key={form.form_name}>
                <FormHeader onClick={() => toggleForm(form.form_name)}>
                  <FormTitleWrapper>
                    <input
                      type="checkbox"
                      checked={selectedForms.has(form.form_name)}
                      onChange={() => toggleFormSelection(form.form_name)}
                      onClick={(e) => e.stopPropagation()}
                      className="mr-2"
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
          </div>
        </div>

        <div className="mt-8 pb-8 flex justify-end">
          <ActionButton
            onClick={handleDownload}
            disabled={selectedForms.size === 0}
            className="flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Download Latest Snapshot</span>
          </ActionButton>
        </div>
      </div>
    </ContentWrapper>
  );
};

export default DownloadSnapshotView;
