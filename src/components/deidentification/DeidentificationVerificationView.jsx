import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  AlertTriangle,
  RefreshCw,
  Upload,
  FileCheck,
  Shield,
  X,
} from "lucide-react";
const { ipcRenderer } = window.require("electron");
import {
  verifyREDCapExport,
  extractIdentifiedFields,
} from "../../services/deidentification-verifier";

import {
  ContentWrapper,
  FormCard,
  FormHeader,
  FormTitle,
  FormTableContainer,
  FormTable,
  FormTableHead,
  FormTableHeader,
  FormTableBody,
  FormTableCell,
  ActionButton,
  Title,
  ValidationInfo,
} from "../styles";

import styled from "styled-components";

const VerificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ChecklistCard = styled(FormCard)`
  margin-top: 1rem;
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 0.75rem;

  &:last-child {
    border-bottom: none;
  }
`;

const ChecklistText = styled.div`
  flex: 1;
`;

const CheckIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: ${(props) => (props.$checked ? "#10b981" : "#f3f4f6")};
  color: ${(props) => (props.$checked ? "white" : "#9ca3af")};
`;

const CrossIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: #ef4444;
  color: white;
`;

const FindingsContainer = styled.div`
  margin-top: 1rem;
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #ccc;
  border-radius: 0.5rem;
  margin: 1rem 0;
  cursor: pointer;

  &:hover {
    border-color: #666;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.5rem;
`;

const ResultBox = styled.div`
  background-color: ${(props) => (props.$success ? "#ecfdf5" : "#fef2f2")};
  border: 1px solid ${(props) => (props.$success ? "#10b981" : "#ef4444")};
  color: ${(props) => (props.$success ? "#065f46" : "#b91c1c")};
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ConfirmationCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
`;

const DeidentificationVerificationView = ({
  project,
  onVerificationComplete,
}) => {
  const [deidentifiedFilePath, setDeidentifiedFilePath] = useState(null);
  const [verificationResults, setVerificationResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [rocrateFiles, setRocrateFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Requirements status
  const [requirementsMet, setRequirementsMet] = useState({
    validationPassed: false,
    noIdentifiedCSV: false,
    confirmedDeidentified: false,
  });

  useEffect(() => {
    const checkRocrateContents = async () => {
      if (!project?.rocratePath) {
        console.warn("No RO-Crate path found in project");
        return;
      }

      try {
        const files = await ipcRenderer.invoke("list-directory", {
          path: project.rocratePath,
        });
        setRocrateFiles(files);
      } catch (error) {
        console.error("Error listing RO-Crate directory:", error);
        setErrorMessage("Error checking RO-Crate contents");
      }
    };

    checkRocrateContents();
  }, [project]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setDeidentifiedFilePath(file.name);
    setIsLoading(true);
    setErrorMessage(null);
    setVerificationResults(null);

    try {
      // If we have form data, extract identified fields
      const identifiedFields = project?.formData
        ? extractIdentifiedFields(project.formData)
        : [];

      // Verify the file
      const results = await verifyREDCapExport(file.name, identifiedFields);
      setVerificationResults(results);

      // Update requirement status
      setRequirementsMet((prev) => ({
        ...prev,
        validationPassed: results.isDeidentified,
        // Check if we can find an identified file with the same name in the RO-crate
        noIdentifiedCSV: !rocrateFiles.some(
          (f) =>
            f.toLowerCase().includes("identified") &&
            f.toLowerCase().endsWith(".csv")
        ),
      }));
    } catch (error) {
      console.error("Error verifying file:", error);
      setErrorMessage(`Error verifying file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationChange = (e) => {
    setConfirmationChecked(e.target.checked);
    setRequirementsMet((prev) => ({
      ...prev,
      confirmedDeidentified: e.target.checked,
    }));
  };

  const allRequirementsMet =
    requirementsMet.validationPassed &&
    requirementsMet.noIdentifiedCSV &&
    requirementsMet.confirmedDeidentified;

  return (
    <ContentWrapper>
      <div className="mb-8">
        <Title>De-identification Verification</Title>
      </div>

      <VerificationContainer>
        <FormCard>
          <FormHeader>
            <FormTitle>Upload De-identified CSV</FormTitle>
          </FormHeader>

          <div className="p-4">
            <p className="mb-4">
              Upload your de-identified data file for verification. The system
              will check for potential PHI and ensure identified columns have
              been removed.
            </p>

            {!deidentifiedFilePath ? (
              <FileUploadContainer
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} className="mb-4" />
                <p>Click to upload your de-identified data file</p>
                <HiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </FileUploadContainer>
            ) : (
              <div className="p-2">
                <div className="flex items-center gap-2">
                  <FileCheck size={20} />
                  <span>
                    Selected file: {deidentifiedFilePath.split(/[/\\]/).pop()}
                  </span>
                </div>
                <ActionButton
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Change File
                </ActionButton>
                <HiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {isLoading && (
              <LoadingContainer>
                <RefreshCw className="animate-spin" size={20} />
                Verifying de-identification...
              </LoadingContainer>
            )}

            {errorMessage && (
              <ResultBox $success={false}>
                <AlertTriangle size={20} />
                {errorMessage}
              </ResultBox>
            )}

            {verificationResults && !isLoading && (
              <FindingsContainer>
                <ResultBox $success={verificationResults.isDeidentified}>
                  {verificationResults.isDeidentified ? (
                    <>
                      <Check size={20} />
                      No PHI or identified columns detected
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={20} />
                      Potential PHI or identified columns detected
                    </>
                  )}
                </ResultBox>

                {verificationResults.presentIdentifiedColumns.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold">
                      Identified columns present:
                    </h3>
                    <ul className="list-disc pl-5 mt-2">
                      {verificationResults.presentIdentifiedColumns.map(
                        (column, i) => (
                          <li key={i} className="text-red-600">
                            {column}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {verificationResults.findings.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Potential PHI detected:</h3>
                    <FormTableContainer className="mt-2">
                      <FormTable>
                        <FormTableHead>
                          <tr>
                            <FormTableHeader>Row</FormTableHeader>
                            <FormTableHeader>Column</FormTableHeader>
                            <FormTableHeader>Type</FormTableHeader>
                            <FormTableHeader>Value</FormTableHeader>
                            <FormTableHeader>Confidence</FormTableHeader>
                          </tr>
                        </FormTableHead>
                        <FormTableBody>
                          {verificationResults.findings.map((finding, i) => (
                            <tr key={i}>
                              <FormTableCell>{finding.row}</FormTableCell>
                              <FormTableCell>{finding.column}</FormTableCell>
                              <FormTableCell>{finding.phiType}</FormTableCell>
                              <FormTableCell>{finding.value}</FormTableCell>
                              <FormTableCell>
                                {finding.confidence}
                              </FormTableCell>
                            </tr>
                          ))}
                        </FormTableBody>
                      </FormTable>
                    </FormTableContainer>
                  </div>
                )}
              </FindingsContainer>
            )}
          </div>
        </FormCard>

        <ChecklistCard>
          <FormHeader>
            <FormTitle>Verification Checklist</FormTitle>
          </FormHeader>

          <div>
            <ChecklistItem>
              {requirementsMet.validationPassed ? (
                <CheckIcon $checked={true}>
                  <Check size={12} />
                </CheckIcon>
              ) : verificationResults ? (
                <CrossIcon>
                  <X size={12} />
                </CrossIcon>
              ) : (
                <CheckIcon $checked={false}>
                  <Check size={12} />
                </CheckIcon>
              )}
              <ChecklistText>
                <strong>Automated validation passed</strong>
                <p className="text-sm text-gray-500">
                  Data file passed PHI and identifiable column check
                </p>
              </ChecklistText>
            </ChecklistItem>

            <ChecklistItem>
              {requirementsMet.noIdentifiedCSV ? (
                <CheckIcon $checked={true}>
                  <Check size={12} />
                </CheckIcon>
              ) : (
                <CrossIcon>
                  <X size={12} />
                </CrossIcon>
              )}
              <ChecklistText>
                <strong>No identified data in project folder</strong>
                <p className="text-sm text-gray-500">
                  No identified CSV files have been found in the project folder
                </p>
              </ChecklistText>
            </ChecklistItem>

            <ChecklistItem>
              <CheckIcon $checked={requirementsMet.confirmedDeidentified}>
                <Check size={12} />
              </CheckIcon>
              <ChecklistText>
                <strong>Institutional confirmation</strong>
                <p className="text-sm text-gray-500">
                  This data has been verified as safe for use according to
                  institutional policy
                </p>
              </ChecklistText>
            </ChecklistItem>

            <ConfirmationCheckbox>
              <input
                type="checkbox"
                id="confirmation"
                checked={confirmationChecked}
                onChange={handleConfirmationChange}
              />
              <label htmlFor="confirmation">
                I confirm that this data has been properly de-identified
                according to UVA Health standards and policies
              </label>
            </ConfirmationCheckbox>
          </div>
        </ChecklistCard>
      </VerificationContainer>

      <div className="mt-4 mb-4 flex justify-end">
        <ActionButton
          onClick={() => onVerificationComplete(deidentifiedFilePath)}
          className="flex items-center gap-2"
          disabled={!allRequirementsMet}
        >
          Continue to Next Step
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </ActionButton>
      </div>
    </ContentWrapper>
  );
};

export default DeidentificationVerificationView;
