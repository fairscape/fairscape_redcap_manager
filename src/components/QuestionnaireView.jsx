import React from "react";
import { ArrowRight, HelpCircle } from "lucide-react";
import { ContentWrapper, FormCard, ActionButton, Title } from "./styles";
import styled from "styled-components";

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const StepCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const StepNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #ebf5ff;
  color: #1e40af;
  border-radius: 50%;
  font-weight: 600;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const StepDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const IntroText = styled.p`
  color: #4b5563;
  margin-bottom: 2rem;
`;

const StepButton = styled(ActionButton)`
  padding: 0.75rem 1rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InstructionsBox = styled.div`
  background: #eff6ff;
  padding: 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid #bfdbfe;
  margin-top: 2rem;
`;

const InstructionsTitle = styled.h3`
  font-weight: 500;
  color: #1e40af;
  margin: 0 0 0rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
`;

const QuestionnaireView = ({ setCurrentView, showNotification }) => {
  const steps = [
    {
      text: "Manage REDCap Projects",
      description: "Connect to new/edit REDCap projects with your API token",
      action: "add-project",
    },
    {
      text: "View/Export Project Data",
      description: "View project metadata and select data for export",
      action: "download",
      requiresProject: true,
    },
    {
      text: "Preview & Validate Data",
      description: "Review selected data and validate against schema",
      action: "preview",
      requiresProject: true,
    },
    {
      text: "De-Identify Project Data",
      description:
        "De-Identify project data and confirm before packaging and upload",
      action: "deidentify",
      requiresProject: true,
    },
    {
      text: "Package & Upload REDCap Data",
      description: "Upload de-identified data to FAIRSCAPE/Dataverse",
      action: "package",
      requiresProject: true,
    },
  ];

  const handleAction = (step) => {
    if (step.requiresProject) {
      showNotification("Please select a project first", "warning");
      setCurrentView("add-project");
    } else {
      setCurrentView(step.action);
    }
  };

  return (
    <ContentWrapper>
      <Title>FAIRSCAPE: REDCap Data Manager</Title>
      <InstructionsBox>
        <InstructionsTitle>
          <HelpCircle size={16} />
          Getting Started
        </InstructionsTitle>
        <p style={{ color: "#1e40af", margin: 0 }}>
          Begin by connecting to a REDCap project using your API token. Once
          connected, you can export, validate, de-identify, and share your data.
        </p>
      </InstructionsBox>
      <StepsContainer>
        {steps.map((step, index) => (
          <StepCard key={index}>
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <StepNumber>{index + 1}</StepNumber>
              <StepContent>
                <StepTitle>{step.text}</StepTitle>
                {step.description && (
                  <StepDescription>{step.description}</StepDescription>
                )}
              </StepContent>
            </div>
            <StepButton onClick={() => handleAction(step)}>
              Select
              <ArrowRight size={16} />
            </StepButton>
          </StepCard>
        ))}
      </StepsContainer>
    </ContentWrapper>
  );
};

export default QuestionnaireView;
