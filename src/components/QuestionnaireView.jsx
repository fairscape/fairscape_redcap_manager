import React from "react";
import { ContentWrapper, StyledCard, CardContent, TextContent } from "./styles";

const steps = [
  {
    text: "Manage REDCap Projects",
    description: "Connect to new/edit REDCap projects with your API token",
    action: "add-project",
  },
  // {
  //   text: "View Project Data",
  //   description: "Browse and analyze data from your connected projects",
  //   action: "view-project",
  // },
  {
    text: "View/Export Project Data",
    description:
      "View project metadata and download snapshots of your project data",
    action: "download",
  },
  {
    text: "De-Identify Project Data",
    description:
      "De-Identify project data by running your de-identification software",
    action: "deidentify",
  },
  {
    text: "Package & Upload REDCap Data",
    description: "Upload de-identified data to FAIRSCAPE/Dataverse",
    action: "upload",
  },
];

const QuestionnaireView = ({ setCurrentView }) => {
  return (
    <ContentWrapper>
      <h2>REDCap Data Management</h2>
      <p>Select any of the following options:</p>
      {steps.map((step, index) => (
        <StyledCard key={index}>
          <StyledCard.Body>
            <CardContent>
              <TextContent>
                <h3>{step.text}</h3>
                {step.description && <p>{step.description}</p>}
              </TextContent>
              <button onClick={() => setCurrentView(step.action)}>
                Select
              </button>
            </CardContent>
          </StyledCard.Body>
        </StyledCard>
      ))}
    </ContentWrapper>
  );
};

export default QuestionnaireView;
