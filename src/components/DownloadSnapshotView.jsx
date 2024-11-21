import React, { useState } from "react";
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

const DownloadSnapshotView = () => {
  // Simulated project data based on your REDCap structure
  const projectData = [
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
  ];

  const [expandedForms, setExpandedForms] = useState(new Set());
  const [selectedForms, setSelectedForms] = useState(new Set());
  const [selectedFields, setSelectedFields] = useState(new Set());

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
      // Remove all fields from this form
      const newSelectedFields = new Set(selectedFields);
      formFields.forEach((field) => {
        newSelectedFields.delete(`${formName}.${field.field_name}`);
      });
      setSelectedFields(newSelectedFields);
    } else {
      newSelectedForms.add(formName);
      // Add all fields from this form
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
      // Check if we need to unselect the form
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
      // If all fields are now selected, select the form too
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
    // Implement actual download logic here
  };

  return (
    <ContentWrapper>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <div className="mb-8">
            <Title>Project Forms and Fields</Title>
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
