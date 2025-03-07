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
import { Snackbar, Alert } from "@mui/material";

import DeidentificationInstructions from "./DeidentificationInstructions";
import DeidentificationErrors from "./DeidentificationErrors";
import DeidentificationChecklist from "./DeidentificationChecklist";
import DatasetForm from "../dataset/DatasetForm";

import { ContentWrapper, Title, ActionButton } from "../styles";
import { VerificationContainer } from "./DeidentificationStyles";

const DeidentificationVerificationContainer = ({
  project,
  onVerificationComplete,
}) => {
  const [step, setStep] = useState("instructions");
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
  const [currentFileToRegister, setCurrentFileToRegister] = useState(null);
  const [registeredFiles, setRegisteredFiles] = useState([]);
  const [csvFiles, setCsvFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 6000);
  };

  useEffect(() => {
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
        const csvFilesFound = files.filter((f) =>
          f.toLowerCase().endsWith(".csv")
        );
        setRocrateFiles(csvFilesFound);
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
      setRegisteredFiles([]);
      setCurrentFileIndex(0);

      const csvFilesFound = rocrateFiles;
      setCsvFiles(csvFilesFound);
      setTotalFilesToValidate(csvFilesFound.length);

      if (csvFilesFound.length === 0) {
        setStep("checklist");
        setIsLoading(false);
        return;
      }

      const identifiedFields = project?.formData
        ? extractIdentifiedFields(project.formData)
        : [];

      await validateNextFile(csvFilesFound, identifiedFields, 0, []);
    } catch (error) {
      console.error("Error during validation:", error);
      setErrorMessage(`Error during validation: ${error.message}`);
      setStep("instructions");
      setIsLoading(false);
    }
  };

  const validateNextFile = async (files, identifiedFields, index, results) => {
    if (index >= files.length) {
      setFileValidationResults(results);
      setValidatedFileCount(files.length);

      const allPassed = results.every((result) => result.isDeidentified);
      if (allPassed) {
        setStep("checklist");
      } else {
        setStep("errors");
      }

      setIsLoading(false);
      return;
    }

    const csvFile = files[index];
    setCurrentFileBeingValidated(csvFile);
    setValidatedFileCount(index);
    setCurrentFileIndex(index);

    try {
      const csvPath = `${project.rocratePath}/${csvFile}`;

      const result = await verifyREDCapExport(csvPath, identifiedFields);

      const fileResult = {
        filename: csvFile,
        filePath: csvPath,
        ...result,
      };

      const updatedResults = [...results, fileResult];
      setFileValidationResults(updatedResults);

      if (result.isDeidentified) {
        setCurrentFileToRegister({
          filename: csvFile,
          filePath: csvPath,
        });
        setIsLoading(false);
        setStep("dataset-form");
      } else {
        await new Promise((r) => setTimeout(r, 100));
        validateNextFile(files, identifiedFields, index + 1, updatedResults);
      }
    } catch (error) {
      console.error(`Error verifying file ${csvFile}:`, error);
      const fileResult = {
        filename: csvFile,
        isDeidentified: false,
        error: error.message,
        findings: [],
        presentIdentifiedColumns: [],
      };

      const updatedResults = [...results, fileResult];
      setFileValidationResults(updatedResults);

      await new Promise((r) => setTimeout(r, 100));
      validateNextFile(files, identifiedFields, index + 1, updatedResults);
    }
  };

  const handleDatasetRegistered = (formData) => {
    const updatedRegisteredFiles = [
      ...registeredFiles,
      {
        ...currentFileToRegister,
        metadata: formData,
      },
    ];
    setRegisteredFiles(updatedRegisteredFiles);

    showNotification(
      `${currentFileToRegister.filename} registered successfully! Register next file.`,
      "success"
    );

    const identifiedFields = project?.formData
      ? extractIdentifiedFields(project.formData)
      : [];

    setIsLoading(true);
    validateNextFile(
      csvFiles,
      identifiedFields,
      currentFileIndex + 1,
      fileValidationResults
    );
  };

  const handleSkipRegistration = () => {
    const identifiedFields = project?.formData
      ? extractIdentifiedFields(project.formData)
      : [];

    setIsLoading(true);
    validateNextFile(
      csvFiles,
      identifiedFields,
      currentFileIndex + 1,
      fileValidationResults
    );
  };

  const handleRetry = async () => {
    setFileValidationResults([]);
    setRegisteredFiles([]);

    setStep("instructions");

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
    onVerificationComplete(project.rocratePath);
  };

  const handleOverrideValidation = () => {
    setStep("checklist");
  };

  const handleConfirmationChange = (isChecked) => {
    setRequirementsMet({
      ...requirementsMet,
      confirmedDeidentified: isChecked,
    });
  };

  const hasOnlyPotentialPHI = () => {
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
      case "dataset-form":
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Register Dataset</h2>

            <DatasetForm
              downloadedFile={currentFileToRegister?.filePath}
              metadata={project?.rocrateMetadata}
              projectName={project?.name}
              schemaID={null}
              onSubmit={handleDatasetRegistered}
              onBack={handleSkipRegistration}
              project={project}
            />
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
      case "checklist":
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

      <Snackbar
        open={notification.open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </ContentWrapper>
  );
};

export default DeidentificationVerificationContainer;
