import React from "react";
import styled from "styled-components";
import { ArrowLeft } from "lucide-react";
import apiImage1 from "../assets/images/redcap-api-1.png";
import apiImage2 from "../assets/images/redcap-api-2.png";
import apiImage3 from "../assets/images/redcap-api-3.png";

const ContentWrapper = styled.div`
  max-width: 880px;
  margin: 0 auto;
  padding: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
`;

const FormCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04), 0 12px 24px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #1f2937;
  font-weight: 500;
  padding: 0.5rem 0.875rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #e5e7eb;
    color: #111827;
  }

  &:active {
    background: #d1d5db;
    transform: translateY(1px);
  }
`;

const styles = {
  backButton: {
    marginBottom: "1.25rem",
  },
  stepContainer: {
    marginBottom: "2rem",
  },
  stepTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: "0.75rem",
  },
  stepDescription: {
    fontSize: "1rem",
    color: "#374151",
    marginBottom: "0.75rem",
    lineHeight: "1.65",
  },
  imageContainer: {
    border: "none",
    borderRadius: "12px",
    overflow: "hidden",
    marginTop: "0.75rem",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  image: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  noteBox: {
    background: "#fff7ed",
    border: "1px solid #fdba74",
    borderRadius: "10px",
    padding: "0.75rem",
    marginTop: "0.75rem",
    fontSize: "0.9rem",
    color: "#9a3412",
  },
  warningBox: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: "10px",
    padding: "0.75rem",
    marginTop: "0.9rem",
    fontSize: "0.9rem",
    color: "#7f1d1d",
  },
};

const ApiInstructionsView = ({ setCurrentView }) => {
  return (
    <ContentWrapper>
      <div style={styles.backButton}>
        <BackButton onClick={() => setCurrentView("add-project")}>
          <ArrowLeft size={18} />
          Back
        </BackButton>
      </div>

      <Title>How to Find Your REDCap API Token</Title>

      <FormCard>
        <div style={styles.stepContainer}>
          <h2 style={styles.stepTitle}>
            Step 1: Login and Select Your Project
          </h2>
          <p style={styles.stepDescription}>
            Login to your REDCap account and navigate to the "My Projects" page.
            Click on the project title that you want to connect to this
            application.
          </p>
          <div style={styles.imageContainer}>
            <img
              src={apiImage1}
              alt="REDCap My Projects page showing list of projects"
              style={styles.image}
            />
          </div>
          <div style={styles.noteBox}>
            In this example, we're selecting the "Example PreMo Light" project
            (PID 4447).
          </div>
        </div>

        <div style={styles.stepContainer}>
          <h2 style={styles.stepTitle}>Step 2: Navigate to the API Section</h2>
          <p style={styles.stepDescription}>
            Once inside your project, look at the left sidebar under the
            "Applications" section. Click on "API" to access the API token
            management page.
          </p>
          <div style={styles.imageContainer}>
            <img
              src={apiImage2}
              alt="REDCap project home page with API option highlighted in left sidebar"
              style={styles.image}
            />
          </div>
          <div style={styles.noteBox}>
            If you don't see the "API" option in the Applications menu, you may
            need to request API access from your REDCap administrator.
          </div>
        </div>

        <div style={styles.stepContainer}>
          <h2 style={styles.stepTitle}>Step 3: Copy Your API Token</h2>
          <p style={styles.stepDescription}>
            On the API page, you'll see your unique API token displayed. Click
            the copy button next to the token to copy it to your clipboard.
            You'll also see the API URL at the top of the page.
          </p>
          <div style={styles.imageContainer}>
            <img
              src={apiImage3}
              alt="REDCap API page showing the API token and URL"
              style={styles.image}
            />
          </div>
          <div style={styles.warningBox}>
            <strong>Important:</strong> Your API token provides full access to
            your REDCap project data. Never share it with others or commit it to
            version control systems. If you believe your token has been
            compromised, use the "Regenerate token" button on this page
            immediately.
          </div>
        </div>

        <div style={styles.stepContainer}>
          <h2 style={styles.stepTitle}>Step 4: Add to Application</h2>
          <p style={styles.stepDescription}>
            Return to the Project Management page and enter:
          </p>
          <ul style={{ paddingLeft: "1.5rem", color: "#374151" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Project Name:</strong> A friendly name for your project
              (e.g., "Example PreMo Light")
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>REDCap URL:</strong> The API URL shown at the top of the
              API page
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>API Token:</strong> The token you copied in Step 3
            </li>
          </ul>
        </div>
      </FormCard>
    </ContentWrapper>
  );
};

export default ApiInstructionsView;
