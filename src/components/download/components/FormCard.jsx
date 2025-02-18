// FormCard.js
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FormFieldsTable } from "./FormFieldsTable";

import {
  FormCard as FormCardStyled,
  FormHeader,
  FormTitleWrapper,
  FormTitle,
  ExpandIcon,
} from "../../styles";

export const FormCard = ({
  form,
  isExpanded,
  isSelected,
  selectedFields,
  onToggleExpand,
  onToggleSelect,
  onFieldSelect,
}) => (
  <FormCardStyled key={form.form_name}>
    <FormHeader onClick={onToggleExpand}>
      <FormTitleWrapper>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
        />
        <ExpandIcon>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </ExpandIcon>
        <FormTitle>{form.form_name.replace(/_/g, " ")}</FormTitle>
      </FormTitleWrapper>
      <div>{form.fields.length} fields</div>
    </FormHeader>

    {isExpanded && (
      <FormFieldsTable
        form={form}
        selectedFields={selectedFields}
        onFieldSelect={onFieldSelect}
      />
    )}
  </FormCardStyled>
);
