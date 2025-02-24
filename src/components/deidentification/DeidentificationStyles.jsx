import styled from "styled-components";
import { FormCard } from "../styles";

// Verification Container
export const VerificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

// Checklist Card
export const ChecklistCard = styled(FormCard)`
  margin-top: 1rem;
`;

// Checklist Items
export const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 0.75rem;

  &:last-child {
    border-bottom: none;
  }
`;

export const ChecklistText = styled.div`
  flex: 1;
`;

export const CheckIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: ${(props) => (props.$checked ? "#10b981" : "#f3f4f6")};
  color: ${(props) => (props.$checked ? "white" : "#9ca3af")};
`;

export const CrossIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: #ef4444;
  color: white;
`;

// File Upload
export const FileUploadContainer = styled.div`
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

export const HiddenInput = styled.input`
  display: none;
`;

// Loading
export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.5rem;
`;

// Progress Container
export const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f0f9ff;
  border-radius: 0.5rem;
  margin: 1rem 0;
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin: 1rem 0;
`;

export const ProgressBar = styled.div`
  height: 100%;
  border-radius: 9999px;
  background-color: #3b82f6;
  transition: width 0.3s ease;
`;

export const ProgressText = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

// Info Box
export const InfoBox = styled.div`
  padding: 1rem;
  border-radius: 0.375rem;
  margin: 1rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background-color: ${(props) =>
    props.$type === "success"
      ? "#ecfdf5"
      : props.$type === "warning"
      ? "#fffbeb"
      : props.$type === "error"
      ? "#fef2f2"
      : props.$type === "info"
      ? "#eff6ff"
      : "#f9fafb"};
  border: 1px solid
    ${(props) =>
      props.$type === "success"
        ? "#10b981"
        : props.$type === "warning"
        ? "#f59e0b"
        : props.$type === "error"
        ? "#ef4444"
        : props.$type === "info"
        ? "#3b82f6"
        : "#e5e7eb"};
  color: ${(props) =>
    props.$type === "success"
      ? "#065f46"
      : props.$type === "warning"
      ? "#92400e"
      : props.$type === "error"
      ? "#b91c1c"
      : props.$type === "info"
      ? "#1e40af"
      : "#374151"};
`;

// Results
export const FindingsContainer = styled.div`
  margin-top: 1rem;
`;

export const ResultBox = styled.div`
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

// Accordion
export const AccordionContainer = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  overflow: hidden;
`;

export const AccordionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: ${(props) => (props.$success ? "#f0fdf4" : "#fef2f2")};
  cursor: pointer;
  border-bottom: ${(props) => (props.$isOpen ? "1px solid #e5e7eb" : "none")};
`;

export const AccordionContent = styled.div`
  padding: ${(props) => (props.$isOpen ? "1rem" : "0")};
  max-height: ${(props) => (props.$isOpen ? "100%" : "0")};
  overflow: hidden;
  transition: all 0.3s ease;
`;

// Confirmation
export const ConfirmationCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
`;

// Step Indicator
export const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

export const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

export const StepDot = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: ${(props) =>
    props.$active ? "#3b82f6" : props.$completed ? "#10b981" : "#e5e7eb"};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

export const StepConnector = styled.div`
  flex: 1;
  height: 2px;
  background-color: ${(props) => (props.$completed ? "#10b981" : "#e5e7eb")};
  margin-top: 1rem;
`;

export const StepLabel = styled.div`
  font-size: 0.875rem;
  color: ${(props) =>
    props.$active ? "#3b82f6" : props.$completed ? "#10b981" : "#6b7280"};
  font-weight: ${(props) => (props.$active ? "600" : "400")};
`;

// File List
export const FileList = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
  margin-top: 1rem;
`;

export const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 0.75rem;

  &:last-child {
    border-bottom: none;
  }
`;

export const FileIcon = styled.div`
  color: #6b7280;
`;

export const FileName = styled.div`
  flex: 1;
  font-size: 0.875rem;
`;

export const FileStatus = styled.div`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: ${(props) =>
    props.$status === "passed"
      ? "#ecfdf5"
      : props.$status === "failed"
      ? "#fef2f2"
      : props.$status === "pending"
      ? "#f3f4f6"
      : "#eff6ff"};
  color: ${(props) =>
    props.$status === "passed"
      ? "#065f46"
      : props.$status === "failed"
      ? "#b91c1c"
      : props.$status === "pending"
      ? "#6b7280"
      : "#1e40af"};
`;
