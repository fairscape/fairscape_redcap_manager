import React, { useState } from "react";
import styled from "styled-components";
import { ChevronDown, ChevronUp } from "lucide-react";
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
} from "./styles";

const ViewProject = () => {
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
          validation_min: "",
          validation_max: "99999",
          required: false,
        },
        {
          field_name: "demograph_site_id",
          field_type: "text",
          field_label: "Site ID",
          field_note: "Vxxx",
          required: false,
        },
        {
          field_name: "demograph_birth_date",
          field_type: "text",
          field_label: "Birth Date",
          validation: "date_mdy",
          required: false,
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
        },
        {
          field_name: "delivery_apgar_1_min",
          field_type: "text",
          field_label: "1 Minute",
          validation: "number",
          validation_min: "0",
          validation_max: "9",
          required: false,
        },
      ],
    },
  ];

  const [expandedForms, setExpandedForms] = useState(new Set());

  const toggleForm = (formName) => {
    const newExpanded = new Set(expandedForms);
    if (newExpanded.has(formName)) {
      newExpanded.delete(formName);
    } else {
      newExpanded.add(formName);
    }
    setExpandedForms(newExpanded);
  };

  return (
    <ContentWrapper>
      <Title>Project Forms and Fields</Title>
      {projectData.map((form) => (
        <FormCard key={form.form_name}>
          <FormHeader onClick={() => toggleForm(form.form_name)}>
            <FormTitleWrapper>
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
                    <FormTableHeader>Field Name</FormTableHeader>
                    <FormTableHeader>Type</FormTableHeader>
                    <FormTableHeader>Label</FormTableHeader>
                    <FormTableHeader>Validation</FormTableHeader>
                    <FormTableHeader>Required</FormTableHeader>
                  </tr>
                </FormTableHead>
                <FormTableBody>
                  {form.fields.map((field) => (
                    <tr key={field.field_name}>
                      <FormTableCell $primary>{field.field_name}</FormTableCell>
                      <FormTableCell>{field.field_type}</FormTableCell>
                      <FormTableCell>{field.field_label}</FormTableCell>
                      <FormTableCell>
                        {field.validation && (
                          <ValidationInfo>
                            <div>{field.validation}</div>
                            {field.validation_min && field.validation_max && (
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
    </ContentWrapper>
  );
};

export default ViewProject;
