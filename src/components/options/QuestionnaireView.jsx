import React from "react";
import { ArrowRight, HelpCircle } from "lucide-react";
import { ContentWrapper, ActionButton, Title } from "../styles";
import {
  StepsContainer,
  StepCard,
  StepButton,
  StepContent,
  StepDescription,
  StepNumber,
  StepTitle,
  InstructionsBox,
  InstructionsTitle,
} from "./optionsStyles";

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
