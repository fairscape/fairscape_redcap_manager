import React, { useState, useEffect } from "react";
const { ipcRenderer } = window.require("electron");
import {
  verifyREDCapExport,
  extractIdentifiedFields,
} from "../../services/deidentification-verifier";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// Import sub-components
import DeidentificationInstructions from "./DeidentificationInstructions";
import DeidentificationErrors from "./DeidentificationErrors";
import DeidentificationChecklist from "./DeidentificationChecklist";

import { ContentWrapper, Title, ActionButton } from "../styles";
import { VerificationContainer } from "./DeidentificationStyles";

const DeidentificationVerificationContainer = ({
  project,
  onVerificationComplete,
}) => {
  const [step, setStep] = useState("instructions"); // instructions, validating, success, errors, checklist
  const [fileValidationResults, setFileValidationResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [rocrateFiles, setRocrateFiles] = useState([]);
  const [currentFileBeingValidated, setCurrentFileBeingValidated] =
    useState("");
  const [validatedFileCount, setValidatedFileCount] = useState(0);
  const [totalFilesToValidate, setTotalFilesToValidate] = useState(0);
  const [requirementsMet, setRequirementsMet] = useState({
    confirmedDeidentified: false,
  });

  useEffect(() => {
    // Initially load the files in the RO-crate path
    const loadRocrateFiles = async () => {
      if (!project?.rocratePath) {
        console.warn("No RO-Crate path found in project");
        setErrorMessage("No RO-Crate path found in project");
        return;
      }

      try {
        const files = await ipcRenderer.invoke("list-directory", {
          path: project.rocratePath,
        });
        setRocrateFiles(files.filter((f) => f.toLowerCase().endsWith(".csv")));
      } catch (error) {
        console.error("Error listing RO-Crate directory:", error);
        setErrorMessage("Error checking RO-Crate contents");
      }
    };

    loadRocrateFiles();
  }, [project]);

  const startValidation = async () => {
    if (!project?.rocratePath) {
      console.warn("No RO-Crate path found in project");
      setErrorMessage("No RO-Crate path found in project");
      return;
    }

    try {
      setStep("validating");
      setIsLoading(true);
      setFileValidationResults([]);
      setValidatedFileCount(0);
      setErrorMessage(null);

      // Filter for CSV files only
      const csvFiles = rocrateFiles;
      setTotalFilesToValidate(csvFiles.length);

      if (csvFiles.length === 0) {
        // No CSV files to validate, we can consider this passed
        setStep("success");
        setIsLoading(false);
        return;
      }

      // Extract identified fields if form data exists
      const identifiedFields = project?.formData
        ? extractIdentifiedFields(project.formData)
        : [];

      // Store results for each file
      const results = [];
      let allPassed = true;
      let hasIdentifiedColumns = false;

      // Validate each CSV file
      for (let i = 0; i < csvFiles.length; i++) {
        const csvFile = csvFiles[i];
        setCurrentFileBeingValidated(csvFile);
        setValidatedFileCount(i);

        try {
          // Get the full path to the CSV file
          const csvPath = `${project.rocratePath}/${csvFile}`;

          // Run verification on the CSV file
          const result = await verifyREDCapExport(csvPath, identifiedFields);

          // Store the result with the filename
          results.push({
            filename: csvFile,
            ...result,
          });

          // Track if all files have passed validation
          if (!result.isDeidentified) {
            allPassed = false;
          }

          // Check if any identified columns are present
          if (result.presentIdentifiedColumns.length > 0) {
            hasIdentifiedColumns = true;
          }
        } catch (error) {
          console.error(`Error verifying file ${csvFile}:`, error);
          results.push({
            filename: csvFile,
            isDeidentified: false,
            error: error.message,
            findings: [],
            presentIdentifiedColumns: [],
          });
          allPassed = false;
        }

        // Small delay to make the UI more responsive and show progress
        await new Promise((r) => setTimeout(r, 100));
      }

      setValidatedFileCount(csvFiles.length);

      // Store the validation results
      setFileValidationResults(results);

      // Determine next step based on validation results
      if (allPassed) {
        setStep("success");
      } else {
        setStep("errors");
      }
    } catch (error) {
      console.error("Error during validation:", error);
      setErrorMessage(`Error during validation: ${error.message}`);
      setStep("instructions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    // Reset state and restart validation
    setFileValidationResults([]);

    // Return to instructions step to start fresh
    setStep("instructions");

    // Re-load the files in case they've changed
    try {
      const files = await ipcRenderer.invoke("list-directory", {
        path: project.rocratePath,
      });
      setRocrateFiles(files.filter((f) => f.toLowerCase().endsWith(".csv")));
    } catch (error) {
      console.error("Error listing RO-Crate directory:", error);
      setErrorMessage("Error checking RO-Crate contents");
    }
  };

  const handleContinue = () => {
    // Pass the validated RO-crate path
    onVerificationComplete(project.rocratePath);
  };

  const handleOverrideValidation = () => {
    // User is overriding the validation check
    setStep("checklist");
  };

  const handleConfirmationChange = (isChecked) => {
    setRequirementsMet({
      ...requirementsMet,
      confirmedDeidentified: isChecked,
    });
  };

  const hasOnlyPotentialPHI = () => {
    // Check if there are no identified columns present, only potential PHI findings
    const hasIdentifiedColumns = fileValidationResults.some(
      (result) =>
        result.presentIdentifiedColumns &&
        result.presentIdentifiedColumns.length > 0
    );

    return !hasIdentifiedColumns;
  };

  const renderCurrentStep = () => {
    switch (step) {
      case "instructions":
        return (
          <DeidentificationInstructions
            rocrateFiles={rocrateFiles}
            rocratePath={project?.rocratePath}
            onStartValidation={startValidation}
          />
        );
      case "validating":
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Checking Your Files</h2>

            <div className="flex flex-col items-center justify-center p-6 mb-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <RefreshCw className="animate-spin text-blue-500" size={28} />
                <span className="text-lg font-medium text-blue-700">
                  Scanning CSV files for identifiable information
                </span>
              </div>

              <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${
                      totalFilesToValidate > 0
                        ? Math.round(
                            (validatedFileCount / totalFilesToValidate) * 100
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>

              <div className="text-sm text-gray-600 mt-2">
                {validatedFileCount} of {totalFilesToValidate} files checked
              </div>

              {currentFileBeingValidated && (
                <div className="text-sm text-gray-600 mt-2">
                  Currently checking: {currentFileBeingValidated}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex items-start">
                <AlertTriangle
                  className="text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
                  size={18}
                />
                <div>
                  <p className="text-sm text-yellow-800">
                    Please don't close the application during this process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "success":
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                All Files Look Good
              </h2>
              <p className="text-gray-600 mb-6">
                No obvious identifiers were found in your files. You can now
                continue to the next step.
              </p>

              <ActionButton
                onClick={handleContinue}
                className="flex items-center gap-2 py-3 px-6 text-lg font-medium"
              >
                Continue to Next Step
                <ArrowRight size={20} />
              </ActionButton>
            </div>
          </div>
        );
      case "errors":
        return (
          <DeidentificationErrors
            validationResults={fileValidationResults}
            onRetry={handleRetry}
            onOverride={hasOnlyPotentialPHI() ? handleOverrideValidation : null}
          />
        );
      case "sucess":
        return (
          <DeidentificationChecklist
            requirementsMet={requirementsMet}
            onConfirmationChange={handleConfirmationChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ContentWrapper>
      <div className="mb-6">
        <Title>De-identification Check</Title>
      </div>

      <VerificationContainer>{renderCurrentStep()}</VerificationContainer>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-start gap-2">
            <AlertTriangle
              size={18}
              className="text-red-500 mt-0.5 flex-shrink-0"
            />
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {step === "checklist" && (
        <div className="mt-6 flex justify-center">
          <ActionButton
            onClick={handleContinue}
            disabled={!requirementsMet.confirmedDeidentified}
            className={`flex items-center gap-2 py-3 px-6 text-lg font-medium ${
              !requirementsMet.confirmedDeidentified
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Continue to Next Step
            <ArrowRight size={20} />
          </ActionButton>
        </div>
      )}

      {isLoading && step !== "validating" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </div>
        </div>
      )}
    </ContentWrapper>
  );
};

export default DeidentificationVerificationContainer;
