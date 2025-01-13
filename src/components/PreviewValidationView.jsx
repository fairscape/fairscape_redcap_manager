import React, { useState, useEffect } from "react";
import {
  Check,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  Minimize2,
} from "lucide-react";
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
  height: calc(100vh - 300px);
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

const PreviewValidationView = () => {
  const [previewData, setPreviewData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [expandedPanel, setExpandedPanel] = useState(null);

  useEffect(() => {
    // Generate fake preview data
    const generatePreviewData = () => {
      const forms = ["demographics", "vitals", "lab_results"];
      const fields = {
        demographics: ["age", "gender", "ethnicity"],
        vitals: ["height", "weight", "blood_pressure"],
        lab_results: ["glucose", "cholesterol", "hemoglobin"],
      };

      const rows = [];
      for (let i = 1; i <= 5; i++) {
        const row = {
          record_id: `SUBJ_${String(i).padStart(3, "0")}`,
          redcap_event_name: "baseline_arm_1",
          redcap_repeat_instrument: "",
          redcap_repeat_instance: "",
        };

        forms.forEach((form) => {
          fields[form].forEach((field) => {
            let value = "";
            switch (field) {
              case "age":
                value = Math.floor(Math.random() * 50) + 20;
                break;
              case "gender":
                value = Math.random() > 0.5 ? "M" : "F";
                break;
              case "ethnicity":
                value = ["Hispanic", "Non-Hispanic"][
                  Math.floor(Math.random() * 2)
                ];
                break;
              case "height":
                value = (Math.random() * 30 + 150).toFixed(1);
                break;
              case "weight":
                value = (Math.random() * 50 + 50).toFixed(1);
                break;
              case "blood_pressure":
                value = `${Math.floor(Math.random() * 40 + 100)}/${Math.floor(
                  Math.random() * 20 + 60
                )}`;
                break;
              case "glucose":
                value = (Math.random() * 100 + 70).toFixed(1);
                break;
              case "cholesterol":
                value = (Math.random() * 150 + 150).toFixed(1);
                break;
              case "hemoglobin":
                value = (Math.random() * 5 + 12).toFixed(1);
                break;
              default:
                value = `Value ${i}`;
            }
            row[`${form}_${field}`] = value;
          });
        });
        rows.push(row);
      }
      return rows;
    };

    const generateMetadata = () => ({
      "@context": "https://w3id.org/ro/crate/1.1/context",
      "@graph": [
        {
          "@type": "Dataset",
          "@id": "./",
          name: "Clinical Trial XYZ-123",
          datePublished: new Date().toISOString(),
          description: "Clinical trial data export from REDCap",
          hasPart: [
            {
              "@type": "Dataset",
              "@id": "#demographics",
              name: "Demographics Form",
              fields: [
                {
                  name: "age",
                  type: "number",
                  required: true,
                  validation: "integer, >18",
                },
                {
                  name: "gender",
                  type: "radio",
                  required: true,
                  choices: "M,Male | F,Female",
                },
                {
                  name: "ethnicity",
                  type: "dropdown",
                  required: true,
                },
              ],
            },
            {
              "@type": "Dataset",
              "@id": "#vitals",
              name: "Vital Signs",
              fields: [
                {
                  name: "height",
                  type: "number",
                  units: "cm",
                },
                {
                  name: "weight",
                  type: "number",
                  units: "kg",
                },
                {
                  name: "blood_pressure",
                  type: "text",
                  format: "systolic/diastolic",
                },
              ],
            },
            {
              "@type": "Dataset",
              "@id": "#lab_results",
              name: "Laboratory Results",
              fields: [
                {
                  name: "glucose",
                  type: "number",
                  units: "mg/dL",
                },
                {
                  name: "cholesterol",
                  type: "number",
                  units: "mg/dL",
                },
                {
                  name: "hemoglobin",
                  type: "number",
                  units: "g/dL",
                },
              ],
            },
          ],
        },
      ],
    });

    setPreviewData(generatePreviewData());
    setMetadata(generateMetadata());
  }, []);

  const togglePanel = (panel) => {
    if (expandedPanel === panel) {
      setExpandedPanel(null);
    } else {
      setExpandedPanel(panel);
    }
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
          onClick={() => console.log("Navigate to de-identification")}
          className="flex items-center gap-2"
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
