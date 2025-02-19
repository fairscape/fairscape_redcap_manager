import React, { useState, useEffect } from "react";
import {
  Check,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  Minimize2,
  Upload,
} from "lucide-react";
const { ipcRenderer } = window.require("electron");
import Papa from "papaparse";
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
} from "./styles";

import styled from "styled-components";

const SplitViewContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
  height: calc(100vh - 200px);
  position: relative;
  margin-bottom: 2rem;
`;

const SplitViewPanel = styled.div`
  flex: ${(props) => (props.$expanded ? "1" : props.$hidden ? "0" : "1")};
  min-width: ${(props) => (props.$hidden ? "0" : "0")};
  overflow: hidden;
  transition: flex 0.3s ease;
  position: relative;
  display: ${(props) => (props.$hidden ? "none" : "block")};
`;

const MetadataCard = styled(FormCard)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const MetadataContent = styled.div`
  padding: 1rem;
  font-family: monospace;
  font-size: 0.875rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 350px);
`;

const ExpandButton = styled(ActionButton)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DataCard = styled(FormCard)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const DataContent = styled(FormTableContainer)`
  flex: 1;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #ccc;
  border-radius: 0.5rem;
  margin: 1rem;
  cursor: pointer;

  &:hover {
    border-color: #666;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #dc2626;
  gap: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.5rem;
`;

const PreviewValidationView = ({
  project,
  downloadedFilePath,
  setDownloadedFilePath,
  onValidated,
}) => {
  const [previewData, setPreviewData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        if (!project?.rocratePath) {
          console.warn("No RO-Crate path found in project");
          return;
        }

        const metadataPath = `${project.rocratePath}/ro-crate-metadata.json`;
        const response = await ipcRenderer.invoke("read-file", {
          path: metadataPath,
          encoding: "utf8",
        });
        const parsedMetadata = JSON.parse(response);
        setMetadata(parsedMetadata);
      } catch (error) {
        console.error("Error loading RO-Crate metadata:", error);
        setErrorMessage("Error loading metadata");
      }
    };

    const loadCSVData = async () => {
      if (!downloadedFilePath) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Check if the path is a URL (from file upload) or a file path
        if (
          downloadedFilePath.startsWith("blob:") ||
          downloadedFilePath.startsWith("data:")
        ) {
          // For uploaded files, fetch the blob URL
          const response = await fetch(downloadedFilePath);
          const text = await response.text();
          parseCSVContent(text);
        } else {
          // For file paths, use ipcRenderer
          const response = await ipcRenderer.invoke("read-file", {
            path: downloadedFilePath,
            encoding: "utf8",
          });
          parseCSVContent(response);
        }
      } catch (error) {
        console.error("Error reading file:", error);
        setErrorMessage("Error reading file");
        setIsLoading(false);
      }
    };

    // Separate the parsing logic into its own function since we use it in both cases
    const parseCSVContent = (content) => {
      Papa.parse(content, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setErrorMessage("Error parsing CSV file");
            console.error("Parse errors:", results.errors);
          } else {
            setPreviewData(results.data);
          }
          setIsLoading(false);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setErrorMessage("Error parsing CSV file");
          setIsLoading(false);
        },
      });
    };

    loadCSVData();
    loadMetadata();
  }, [downloadedFilePath, project]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        Papa.parse(content, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setErrorMessage("Error parsing CSV file");
              console.error("Parse errors:", results.errors);
            } else {
              setPreviewData(results.data);
              const blob = new Blob([content], { type: "text/csv" });
              const fileUrl = URL.createObjectURL(blob);
              setDownloadedFilePath(fileUrl);
            }
            setIsLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setErrorMessage("Error parsing CSV file");
            setIsLoading(false);
          },
        });
      };
      reader.readAsText(file);
    }
  };

  const togglePanel = (panel) => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  return (
    <ContentWrapper>
      <div className="mb-8">
        <Title>Data Preview & Validation</Title>
      </div>

      <SplitViewContainer>
        <SplitViewPanel
          $expanded={expandedPanel === "data"}
          $hidden={expandedPanel === "metadata"}
        >
          <DataCard>
            <FormHeader>
              <FormTitle>Data Preview</FormTitle>
              <ExpandButton onClick={() => togglePanel("data")}>
                {expandedPanel === "data" ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
                {expandedPanel === "data" ? "Show Both" : "Full Screen"}
              </ExpandButton>
            </FormHeader>
            <DataContent>
              {isLoading ? (
                <LoadingContainer>
                  <RefreshCw className="animate-spin" size={20} />
                  Loading data...
                </LoadingContainer>
              ) : errorMessage ? (
                <ErrorContainer>
                  <AlertTriangle size={20} />
                  {errorMessage}
                </ErrorContainer>
              ) : !downloadedFilePath ? (
                <FileUploadContainer
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} className="mb-4" />
                  <p>
                    No file selected. Click to upload a CSV file or download one
                    from the previous step.
                  </p>
                  <HiddenInput
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                  />
                </FileUploadContainer>
              ) : (
                <FormTable>
                  <FormTableHead>
                    <tr>
                      {previewData.length > 0 &&
                        Object.keys(previewData[0]).map((header) => (
                          <FormTableHeader key={header}>
                            {header.replace(/_/g, " ")}
                          </FormTableHeader>
                        ))}
                    </tr>
                  </FormTableHead>
                  <FormTableBody>
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, cellIndex) => (
                          <FormTableCell
                            key={cellIndex}
                            $primary={cellIndex === 0}
                          >
                            {value}
                          </FormTableCell>
                        ))}
                      </tr>
                    ))}
                  </FormTableBody>
                </FormTable>
              )}
            </DataContent>
          </DataCard>
        </SplitViewPanel>

        <SplitViewPanel
          $expanded={expandedPanel === "metadata"}
          $hidden={expandedPanel === "data"}
        >
          <MetadataCard>
            <FormHeader>
              <FormTitle>Metadata (RO-Crate)</FormTitle>
              <ExpandButton onClick={() => togglePanel("metadata")}>
                {expandedPanel === "metadata" ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
                {expandedPanel === "metadata" ? "Show Both" : "Full Screen"}
              </ExpandButton>
            </FormHeader>
            <MetadataContent>
              <pre>
                {metadata
                  ? JSON.stringify(metadata, null, 2)
                  : "Loading metadata..."}
              </pre>
            </MetadataContent>
          </MetadataCard>
        </SplitViewPanel>
      </SplitViewContainer>

      <div className="mt-4 mb-4 flex justify-end">
        <ActionButton
          onClick={onValidated}
          className="flex items-center gap-2"
          disabled={!downloadedFilePath || isLoading || errorMessage}
        >
          Proceed to De-identification
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

export default PreviewValidationView;
