import React from "react";
import { CheckCircle, FileText } from "lucide-react";
import {
  FormCard,
  FormHeader,
  FormTitle,
  TableContainer,
  ContentWrapper,
  ActionButton,
  NotificationBox,
} from "../styles";

// Create a separate styles file for this component
const styles = {
  sectionContainer: {
    marginBottom: "0.75rem", // Reduced from 1.5rem
  },
  instructionsBox: {
    background: "#f9fafb",
    padding: "0.75rem", // Reduced from 1rem
    borderRadius: "4px",
    border: "1px solid #e5e7eb",
  },
  warningBox: {
    background: "#fffbeb",
    padding: "0.75rem", // Reduced from 1rem
    borderRadius: "4px",
    border: "1px solid #fcd34d",
  },
  fileListBox: {
    background: "#f9fafb",
    padding: "0.75rem", // Reduced from 1rem
    borderRadius: "4px",
    border: "1px solid #e5e7eb",
  },
  folderPath: {
    background: "#eff6ff",
    padding: "0.5rem", // Reduced from 0.75rem
    margin: "0.25rem 0", // Reduced from 0.5rem 0
    borderRadius: "4px",
    border: "1px solid #dbeafe",
    fontFamily: "monospace",
    fontSize: "0.875rem",
  },
  warningText: {
    color: "#92400e",
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: "0.25rem", // Reduced from 0.5rem
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%", // Take full height of available space
    marginTop: "0", // Remove top margin
    padding: "1rem 0", // Add some padding instead
  },
};

const DeidentificationInstructions = ({
  rocrateFiles,
  onStartValidation,
  rocratePath,
}) => {
  const hasCSVFiles = rocrateFiles && rocrateFiles.length > 0;

  return (
    <FormCard>
      <FormHeader>
        <FormTitle>Instructions</FormTitle>
      </FormHeader>

      <ContentWrapper>
        {/* Instructions Section */}
        <div style={{ ...styles.sectionContainer, ...styles.instructionsBox }}>
          <ol
            style={{
              marginLeft: "1.5rem",
              marginTop: "0.25rem",
              marginBottom: "0.25rem",
            }}
          >
            <li style={{ marginBottom: "0.5rem" }}>
              {" "}
              {/* Reduced from 1rem */}
              <strong>De-identify your REDCap data export</strong> by removing
              any patient identifiers
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              {" "}
              {/* Reduced from 1rem */}
              <strong>Save your de-identified CSVs</strong> to this folder:
              <div style={styles.folderPath}>
                {rocratePath || "/Users/example/path/to/folder"}
              </div>
            </li>
            <li>
              <strong>Remove any identified CSV files</strong> from the folder
            </li>
          </ol>
        </div>

        {/* Warning Section */}
        <div style={{ ...styles.sectionContainer, ...styles.warningBox }}>
          <p style={styles.warningText}>
            This tool will check for obvious identifiers, but it's not 100%
            comprehensive. You're responsible for ensuring all PHI is properly
            removed.
          </p>
        </div>

        {/* Files Section */}
        <div style={styles.sectionContainer}>
          <h4 style={styles.sectionTitle}>Current files in folder:</h4>

          {hasCSVFiles ? (
            <div style={styles.fileListBox}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.25rem", // Reduced from 0.5rem
                }}
              >
                <FileText
                  size={16}
                  style={{ marginRight: "0.5rem", color: "#6b7280" }}
                />
                <span style={{ fontWeight: "500" }}>CSV files found:</span>
              </div>
              <ul
                style={{
                  marginLeft: "1.5rem",
                  marginTop: "0.25rem",
                  marginBottom: "0.25rem",
                }}
              >
                {rocrateFiles.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={styles.warningBox}>
              <p style={styles.warningText}>
                No CSV files found in the folder. Please add your de-identified
                data files.
              </p>
            </div>
          )}
        </div>

        {/* Action Button - Now Centered Vertically */}
        <div
          style={{
            ...styles.buttonContainer,
            flex: 1, // Take remaining space
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActionButton onClick={onStartValidation} disabled={!hasCSVFiles}>
            <CheckCircle size={18} style={{ marginRight: "0.5rem" }} />
            Check De-identification
          </ActionButton>
        </div>
      </ContentWrapper>
    </FormCard>
  );
};

export default DeidentificationInstructions;
