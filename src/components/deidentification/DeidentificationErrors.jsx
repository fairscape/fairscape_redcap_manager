import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
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
  ContentWrapper,
} from "../styles";

import { ResultBox } from "./DeidentificationStyles";

const styles = {
  container: {
    padding: "1.5rem",
  },
  alertBox: {
    marginBottom: "1.5rem",
  },
  errorMessage: {
    color: "#dc2626",
    fontWeight: "500",
    marginTop: "1.5rem",
    marginBottom: "1rem",
  },
  instructionsBox: {
    background: "#eff6ff",
    padding: "1rem",
    borderRadius: "4px",
    border: "1px solid #bfdbfe",
    marginBottom: "1.5rem",
  },
  instructionsTitle: {
    fontWeight: "500",
    color: "#1e40af",
    marginBottom: "0.5rem",
  },
  instructionsList: {
    paddingLeft: "1.25rem",
    color: "#1e40af",
  },
  instructionsItem: {
    marginBottom: "0.25rem",
  },
  resultsTitle: {
    fontWeight: "600",
    marginBottom: "0.75rem",
  },
  fileItem: {
    marginBottom: "1rem",
    border: "1px solid #e5e7eb",
    borderRadius: "0.375rem",
    overflow: "hidden",
  },
  fileHeader: {
    padding: "0.75rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  fileHeaderSuccess: {
    backgroundColor: "#f0fdf4",
  },
  fileHeaderError: {
    backgroundColor: "#fef2f2",
  },
  fileIcon: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  fileIconSuccess: {
    color: "#16a34a",
  },
  fileIconError: {
    color: "#dc2626",
  },
  fileNameSuccess: {
    color: "#166534",
  },
  fileNameError: {
    color: "#b91c1c",
  },
  fileDetails: {
    padding: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  validationError: {
    backgroundColor: "#fef2f2",
    padding: "0.75rem",
    borderRadius: "0.375rem",
    marginBottom: "1rem",
  },
  validationErrorTitle: {
    color: "#b91c1c",
    fontWeight: "500",
  },
  validationErrorMessage: {
    color: "#dc2626",
  },
  columnSection: {
    marginBottom: "1rem",
  },
  columnTitle: {
    fontWeight: "500",
    marginBottom: "0.5rem",
  },
  columnList: {
    paddingLeft: "1.25rem",
  },
  columnItem: {
    color: "#dc2626",
  },
  warningNote: {
    backgroundColor: "#fffbeb",
    padding: "0.75rem",
    borderRadius: "0.375rem",
    color: "#92400e",
    fontSize: "0.875rem",
    marginTop: "0.75rem",
  },
  buttonContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1.5rem",
    gap: "1rem",
  },
  warningBox: {
    backgroundColor: "#fef9c3",
    padding: "1rem",
    borderRadius: "0.375rem",
    marginTop: "1.5rem",
    marginBottom: "1rem",
  },
};

const FileValidationDetails = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isValid = result.isDeidentified;

  return (
    <div style={styles.fileItem}>
      <div
        style={{
          ...styles.fileHeader,
          ...(isValid ? styles.fileHeaderSuccess : styles.fileHeaderError),
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={styles.fileIcon}>
          {isValid ? (
            <div
              style={{
                backgroundColor: "#dcfce7",
                padding: "0.25rem",
                borderRadius: "9999px",
                display: "flex",
                ...styles.fileIconSuccess,
              }}
            >
              <CheckCircle size={16} />
            </div>
          ) : (
            <AlertTriangle size={16} style={styles.fileIconError} />
          )}
          <span style={isValid ? styles.fileNameSuccess : styles.fileNameError}>
            {result.filename}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {isExpanded && !isValid && (
        <div style={styles.fileDetails}>
          {result.error && (
            <div style={styles.validationError}>
              <p style={styles.validationErrorTitle}>
                Error during validation:
              </p>
              <p style={styles.validationErrorMessage}>{result.error}</p>
            </div>
          )}

          {result.presentIdentifiedColumns &&
            result.presentIdentifiedColumns.length > 0 && (
              <div style={styles.columnSection}>
                <h4 style={styles.columnTitle}>Identified columns present:</h4>
                <ul style={styles.columnList}>
                  {result.presentIdentifiedColumns.map((column, i) => (
                    <li key={i} style={styles.columnItem}>
                      {column}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {result.findings && result.findings.length > 0 && (
            <div>
              <h4 style={styles.columnTitle}>Potential PHI detected:</h4>
              <FormTableContainer>
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
                    {result.findings.map((finding, i) => (
                      <tr key={i}>
                        <FormTableCell>{finding.row}</FormTableCell>
                        <FormTableCell>{finding.column}</FormTableCell>
                        <FormTableCell>{finding.phiType}</FormTableCell>
                        <FormTableCell>{finding.value}</FormTableCell>
                        <FormTableCell>{finding.confidence}</FormTableCell>
                      </tr>
                    ))}
                  </FormTableBody>
                </FormTable>
              </FormTableContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DeidentificationErrors = ({ validationResults, onRetry, onOverride }) => {
  if (!validationResults || validationResults.length === 0) return null;

  const hasIdentifiedColumns = validationResults.some(
    (result) =>
      result.presentIdentifiedColumns &&
      result.presentIdentifiedColumns.length > 0
  );

  const failedFiles = validationResults.filter(
    (result) => !result.isDeidentified
  );

  return (
    <FormCard>
      <ContentWrapper>
        <div style={styles.container}>
          <ResultBox $success={false} style={styles.alertBox}>
            <AlertTriangle size={20} />
            {hasIdentifiedColumns
              ? "PHI detected in project files"
              : "Potential PHI detected in project files"}
          </ResultBox>

          <p style={styles.errorMessage}>
            {hasIdentifiedColumns
              ? "Some CSV files in your project folder contain PHI or identifiable information. Please review the issues below and remove all identifying information."
              : "Our automated scan has detected potential PHI in your files. Review the findings below to determine if any action is needed."}
          </p>

          <div style={styles.instructionsBox}>
            <h3 style={styles.instructionsTitle}>Action required:</h3>
            <ol style={styles.instructionsList}>
              <li style={styles.instructionsItem}>
                Review each file marked with issues below
              </li>
              <li style={styles.instructionsItem}>
                {hasIdentifiedColumns
                  ? "Remove or transform any identified columns and PHI"
                  : "Verify if detected items are actually PHI or false positives"}
              </li>
              <li style={styles.instructionsItem}>
                {hasIdentifiedColumns
                  ? "Replace the problematic files in your project folder"
                  : "If needed, replace the problematic files in your project folder"}
              </li>
              <li style={styles.instructionsItem}>
                {hasIdentifiedColumns
                  ? "Click 'Retry Validation' when complete"
                  : "Click 'Retry Validation' or 'Override and Continue' when complete"}
              </li>
            </ol>
          </div>

          <h3 style={styles.resultsTitle}>File Validation Results:</h3>

          <div>
            {validationResults.map((result, index) => (
              <FileValidationDetails key={index} result={result} />
            ))}
          </div>

          {!hasIdentifiedColumns && (
            <div style={styles.warningBox}>
              <div className="flex items-start gap-2">
                <ShieldAlert
                  size={20}
                  className="text-yellow-600 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="font-medium text-yellow-800 mb-1">
                    No identified columns detected
                  </p>
                  <p className="text-yellow-700 text-sm">
                    While our system has detected potential PHI, no known
                    identified columns are present. Some of these findings may
                    be false positives. You can either fix the issues or
                    override and continue if you're certain the data is properly
                    de-identified.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div style={styles.warningNote}>
            All CSV files in your project folder must be properly de-identified
            before continuing. The system scans for potential PHI and known
            identifiable columns.
          </div>

          <div style={styles.buttonContainer}>
            <ActionButton onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw size={16} />
              Retry Validation
            </ActionButton>

            {onOverride && (
              <ActionButton
                onClick={onOverride}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700"
              >
                <ArrowRight size={16} />
                Override and Continue
              </ActionButton>
            )}
          </div>
        </div>
      </ContentWrapper>
    </FormCard>
  );
};

export default DeidentificationErrors;
