import React, { useState } from "react";
import { Check, Shield, ArrowRight } from "lucide-react";
import { FormCard, ActionButton } from "../styles";
import {
  ChecklistItem,
  ChecklistText,
  CheckIcon,
  ConfirmationCheckbox,
  ResultBox,
} from "./DeidentificationStyles";

const DeidentificationChecklist = ({
  requirementsMet,
  onConfirmationChange,
  onContinue,
}) => {
  const [confirmationChecked, setConfirmationChecked] = useState(
    requirementsMet.confirmedDeidentified
  );

  const handleConfirmationChange = (e) => {
    setConfirmationChecked(e.target.checked);
    onConfirmationChange(e.target.checked);
  };

  return (
    <FormCard>
      <div className="p-4">
        <ResultBox $success={true} className="mb-3">
          <Shield size={20} />
          Validation Successful
        </ResultBox>

        <div className="space-y-2 mb-3">
          <ChecklistItem>
            <CheckIcon $checked={true}>
              <Check size={12} />
            </CheckIcon>
            <ChecklistText>
              <strong>Automated PHI detection passed</strong>
            </ChecklistText>
          </ChecklistItem>

          <ChecklistItem>
            <CheckIcon $checked={true}>
              <Check size={12} />
            </CheckIcon>
            <ChecklistText>
              <strong>All project files verified</strong>
            </ChecklistText>
          </ChecklistItem>

          <ChecklistItem>
            <CheckIcon $checked={confirmationChecked}>
              <Check size={12} />
            </CheckIcon>
            <ChecklistText>
              <strong>Institutional confirmation</strong>
            </ChecklistText>
          </ChecklistItem>
        </div>

        <div className="bg-green-50 p-2 rounded mb-3">
          <ConfirmationCheckbox>
            <input
              type="checkbox"
              id="confirmation"
              checked={confirmationChecked}
              onChange={handleConfirmationChange}
            />
            <label htmlFor="confirmation" className="text-sm">
              I confirm that this data has been certified de-identified by UVA
              HIT.
            </label>
          </ConfirmationCheckbox>
        </div>
      </div>
    </FormCard>
  );
};

export default DeidentificationChecklist;
