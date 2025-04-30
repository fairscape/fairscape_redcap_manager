import React, { useState, useRef } from "react";
import axios from "axios";
import { Button, Alert } from "@mui/material";
import { Upload, Package, RefreshCw } from "lucide-react";
import styled from "@emotion/styled";

const Container = styled.div`
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  color: #333;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 30px;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  justify-content: center;
`;

const ActionButton = styled(Button)`
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #ebf5ff;
  color: #1e40af;
  &:hover {
    background-color: #dbeafe;
  }
  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
  }
`;

const StatusContainer = styled.div`
  margin-top: 20px;
  background-color: #f9fafb;
  border-radius: 10px;
  padding: 20px;
  color: #333;
  border: 1px solid #e5e7eb;
`;

const StatusTitle = styled.h3`
  margin-bottom: 15px;
  color: #111827;
`;

const ProgressBarContainer = styled.div`
  background-color: #f3f4f6;
  border-radius: 25px;
  height: 50px;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
`;

const ProgressBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: ${(props) =>
    props.failed ? "#dc3545" : "linear-gradient(to right, #007bff, #28a745)"};
  width: ${(props) => props.progress}%;
  transition: width 0.5s ease-in-out, background-color 0.5s ease-in-out;
`;

const StepContainer = styled.div`
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
`;

const Step = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${(props) => (props.active ? "#111827" : "#9ca3af")};
  z-index: 2;
`;

const OutputContainer = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #f9fafb;
  border-radius: 5px;
  color: #333;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  border: 1px solid #e5e7eb;
`;

const StatusDetails = styled.div`
  margin-top: 15px;
`;

const Link = styled.a`
  color: #1e40af;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const PackageUploadView = ({ project, onComplete }) => {
  const [output, setOutput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [zipPath, setZipPath] = useState("");
  const [submissionUUID, setSubmissionUUID] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadDetails, setUploadDetails] = useState(null);
  const [success, setSuccess] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);

  const { ipcRenderer } = window.require("electron");
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
  const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5713";

  const steps = ["Packaging", "Uploading", "Minting IDs", "Complete"];

  const packageAndUpload = async () => {
    if (!project || !project.rocratePath) {
      setError("No RO-Crate path available");
      return;
    }

    // Reset states
    setIsProcessing(true);
    setCurrentStep(0);
    setOutput("Starting to process RO-Crate...");
    setError(null);
    setUploadError(null);
    setZipPath("");
    setUploadStatus(null);
    setUploadDetails(null);
    setSuccess(false);
    setCompleted(false);

    try {
      // Create a target path for the zip file
      const fileName = `${project.name.replace(/\s+/g, "_")}_rocrate.zip`;
      const targetPath = `${project.rocratePath}.zip`;

      // Step 1: Package RO-Crate
      setOutput((prevOutput) => prevOutput + `\nCreating zip file...`);
      const zipResult = await ipcRenderer.invoke("zip-rocrate", {
        sourcePath: project.rocratePath,
        targetPath: targetPath,
      });

      if (!zipResult.success) {
        throw new Error(zipResult.error || "Failed to create zip file");
      }

      setZipPath(zipResult.zipPath);
      setOutput(
        (prevOutput) =>
          prevOutput + `\nRO-Crate successfully zipped at: ${zipResult.zipPath}`
      );
      setCurrentStep(1);

      // Step 2: Upload the package
      // Check if user is logged in
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please log in before uploading");
      }

      setOutput((prevOutput) => prevOutput + `\nStarting upload...`);
      setUploadStatus("In Queue");

      // Read the zip file and create a File object
      const zipBlob = await ipcRenderer.invoke(
        "read-file-as-buffer",
        zipResult.zipPath
      );
      const fileNameForUpload = zipResult.zipPath.split(/[\\\/]/).pop();

      const formData = new FormData();
      const file = new File([zipBlob], fileNameForUpload, {
        type: "application/zip",
      });
      formData.append("crate", file);

      // Upload the file
      const response = await axios.post(
        `${apiUrl}/rocrate/upload-async`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissionUUID(response.data.transactionFolder);
      setOutput(
        (prevOutput) =>
          prevOutput +
          `\nUpload initiated. Transaction ID: ${response.data.transactionFolder}`
      );

      // Step 3 & 4: Check upload status until complete
      await monitorUploadStatus(response.data.transactionFolder);
    } catch (error) {
      console.error("Package and upload error:", error);
      setError(error.message);
      setOutput((prevOutput) => prevOutput + `\nError: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const monitorUploadStatus = async (uuid) => {
    if (!uuid) return;

    let completed = false;
    let attempts = 0;
    const maxAttempts = 30; // Prevent infinite loops

    while (!completed && attempts < maxAttempts) {
      try {
        attempts++;
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${apiUrl}/rocrate/upload/status/${uuid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUploadStatus(response.data.status);
        setUploadDetails(response.data);

        if (response.data.status === "in progress") {
          setCurrentStep(1);
        } else if (response.data.status === "minting identifiers") {
          setCurrentStep(2);
        } else if (response.data.completed) {
          setCurrentStep(3);
          setSuccess(response.data.success);
          setCompleted(true);
          completed = true;

          if (response.data.success) {
            setOutput(
              (prevOutput) => prevOutput + `\nUpload completed successfully!`
            );
            if (onComplete) onComplete();
          } else {
            if (response.data.error) {
              setUploadError(response.data.error);
              setOutput(
                (prevOutput) =>
                  prevOutput + `\nUpload error: ${response.data.error}`
              );
            } else {
              setUploadError("Upload failed");
              setOutput(
                (prevOutput) =>
                  prevOutput + `\nUpload failed for unknown reason`
              );
            }
          }
        }

        // Wait before checking again
        if (!completed) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error("Status check error:", error);
        setUploadError(`Failed to check upload status: ${error.message}`);
        setUploadStatus("Failed");
        setSuccess(false);
        setCompleted(true);
        completed = true;
      }
    }

    if (attempts >= maxAttempts && !completed) {
      setUploadError("Upload status check timed out");
      setUploadStatus("Failed");
      setSuccess(false);
      setCompleted(true);
    }
  };

  const getProgressPercentage = () => {
    if (!isProcessing && !uploadStatus) return 0;

    return (currentStep / (steps.length - 1)) * 100;
  };

  // Determine if the operation has failed
  const hasFailed = () => {
    return error || uploadError || (completed && !success);
  };

  const displayStep = currentStep;

  return (
    <Container>
      <Title>{project?.name || "Project"} - Package & Upload</Title>

      <Section>
        <ButtonContainer>
          <ActionButton
            variant="contained"
            color="primary"
            startIcon={isProcessing ? <RefreshCw /> : <Package />}
            onClick={packageAndUpload}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Package & Upload RO-Crate"}
          </ActionButton>
        </ButtonContainer>
      </Section>

      <StatusContainer>
        <StatusTitle>Progress</StatusTitle>
        <ProgressBarContainer>
          <ProgressBar
            progress={getProgressPercentage()}
            failed={hasFailed()}
          />
          <StepContainer>
            {steps.map((step, index) => (
              <Step key={index} active={index === displayStep}>
                {index + 1}. {step}
              </Step>
            ))}
          </StepContainer>
        </ProgressBarContainer>

        {error && (
          <Alert severity="error" style={{ marginTop: "10px" }}>
            {error}
          </Alert>
        )}

        {uploadError && (
          <Alert severity="error" style={{ marginTop: "10px" }}>
            {typeof uploadError === "object"
              ? uploadError.message
              : uploadError}
          </Alert>
        )}

        {uploadDetails && completed && success && (
          <StatusDetails>
            <Alert severity="success" style={{ marginBottom: "10px" }}>
              RO-Crate uploaded successfully!
            </Alert>

            {uploadDetails.identifiersMinted &&
              uploadDetails.identifiersMinted.length > 0 && (
                <div>
                  <p>
                    Identifiers Minted: {uploadDetails.identifiersMinted.length}
                  </p>
                  <p>
                    View Result:{" "}
                    <Link
                      href={`${baseUrl}/${
                        uploadDetails.identifiersMinted[
                          uploadDetails.identifiersMinted.length - 1
                        ]
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in Fairscape
                    </Link>
                  </p>
                </div>
              )}
          </StatusDetails>
        )}
      </StatusContainer>

      {output && <OutputContainer>{output}</OutputContainer>}
    </Container>
  );
};

export default PackageUploadView;
