import React from "react";
import {
  FormTableContainer,
  FormTable,
  FormTableHead,
  FormTableHeader,
  FormTableBody,
  FormTableCell,
  ValidationInfo,
} from "../../styles";

export const FormFieldsTable = ({ form, selectedFields, onFieldSelect }) => (
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
                onChange={() => onFieldSelect(form.form_name, field.field_name)}
              />
            </FormTableCell>
            <FormTableCell $primary>{field.field_name}</FormTableCell>
            <FormTableCell>{field.field_type}</FormTableCell>
            <FormTableCell>{field.field_label}</FormTableCell>
            <FormTableCell>{field.phi}</FormTableCell>
            <FormTableCell>
              {field.validation && (
                <ValidationInfo>
                  <div>{field.validation}</div>
                  {field.validation_min && field.validation_max && (
                    <div>
                      Range: {field.validation_min} - {field.validation_max}
                    </div>
                  )}
                </ValidationInfo>
              )}
            </FormTableCell>
            <FormTableCell>{field.required ? "Yes" : "No"}</FormTableCell>
          </tr>
        ))}
      </FormTableBody>
    </FormTable>
  </FormTableContainer>
);
