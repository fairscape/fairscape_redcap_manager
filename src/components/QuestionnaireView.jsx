import React from "react";
import { ContentWrapper, StyledCard, CardContent, TextContent } from "./styles";

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
      "De-Identify project data by running your de-identification software",
    action: "deidentify",
    requiresProject: true,
  },
  {
    text: "Package & Upload REDCap Data",
    description: "Upload de-identified data to FAIRSCAPE/Dataverse",
    action: "upload",
    requiresProject: true,
  },
];

const QuestionnaireView = ({ setCurrentView, showNotification }) => {
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
      <h2>FAIRSCAPE: REDCap Data Manager</h2>
      <p>Select any of the following options:</p>
      {steps.map((step, index) => (
        <StyledCard key={index}>
          <StyledCard.Body>
            <CardContent>
              <TextContent>
                <h3>{step.text}</h3>
                {step.description && <p>{step.description}</p>}
              </TextContent>
              <button onClick={() => handleAction(step)}>Select</button>
            </CardContent>
          </StyledCard.Body>
        </StyledCard>
      ))}
    </ContentWrapper>
  );
};

export default QuestionnaireView;
