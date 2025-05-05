import React, { useState, useEffect } from "react";
import {
  register_dataset,
  register_software,
  register_computation,
} from "@fairscape/utils";
import { generateAndRegisterSchemaFromCSV } from "../../services/schema-generation";
import {
  InitFormContainer,
  FormCard,
  FormHeader,
  FormTitle,
  FormTableContainer,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  FormActions,
  ActionButton,
} from "../FormStyles";

const SOFTWARE_GUID = "ark:59852/software-fairscape-redcap-gui";
const SOFTWARE_URL = "https://github.com/fairscape/fairscape_redcap_manager";
const SOFTWARE_NAME = "Fairscape REDCap GUI";
const SOFTWARE_AUTHOR = "Fairscape";
const SOFTWARE_VERSION = "1.0.0";
const SOFTWARE_DESCRIPTION =
  "A graphical user interface application for managing REDCap data export, validation, de-identification, and packaging into RO-Crates for FAIRscape.";
const SOFTWARE_KEYWORDS = [
  "REDCap",
  "FAIR",
  "RO-Crate",
  "GUI",
  "Data Management",
];

const initialFormState = {
  name: "",
  author: "",
  version: "1.0",
  datePublished: "",
  description: "",
  keywords: "",
  dataFormat: "CSV",
  schema: null,
};

const DatasetForm = ({
  downloadedFile,
  metadata,
  projectName,
  onSubmit,
  onBack,
  schemaID,
  project,
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (metadata) {
      setFormData((prev) => ({
        ...prev,
        name:
          metadata.name ||
          `REDCap export for project: ${projectName || "Unknown"}`,
        author: metadata.author || "",
        version: metadata.version || "1.0",
        datePublished: metadata.datePublished || today,
        description:
          metadata.description ||
          `Dataset exported from REDCap project '${
            projectName || "Unknown"
          }' via Fairscape REDCap GUI.`,
        keywords: Array.isArray(metadata.keywords)
          ? metadata.keywords.join(", ")
          : metadata.keywords || "REDCap, Export",
        dataFormat: "CSV",
        schema: schemaID || prev.schema || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        name: `REDCap export for project: ${projectName || "Unknown"}`,
        author: "",
        datePublished: today,
        description: `Dataset exported from REDCap project '${
          projectName || "Unknown"
        }' via Fairscape REDCap GUI.`,
        keywords: "REDCap, Export",
        dataFormat: "CSV",
        schema: schemaID || prev.schema || null,
      }));
    }
  }, [metadata, projectName, schemaID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project || !project.rocratePath) {
      setRegistrationError("Project RO-Crate path is missing.");
      return;
    }
    if (!downloadedFile) {
      setRegistrationError("Downloaded file path is missing.");
      return;
    }

    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const rocratePath = project.rocratePath;
      const filepath = downloadedFile;
      let finalSchemaId = formData.schema;

      await register_software(
        rocratePath,
        SOFTWARE_NAME,
        SOFTWARE_AUTHOR,
        SOFTWARE_VERSION,
        SOFTWARE_DESCRIPTION,
        SOFTWARE_KEYWORDS,
        null,
        SOFTWARE_GUID,
        SOFTWARE_URL,
        new Date().toISOString()
      );

      if (!finalSchemaId) {
        console.log("No schema ID provided, attempting to generate...");
        try {
          finalSchemaId = await generateAndRegisterSchemaFromCSV(
            rocratePath,
            filepath,
            projectName || "DefaultSchema",
            `Schema auto-generated from CSV headers for ${projectName}`
          );
          console.log("Generated Schema ID:", finalSchemaId);
          setFormData((prev) => ({ ...prev, schema: finalSchemaId }));
        } catch (schemaError) {
          console.error("Error generating schema:", schemaError);
          throw new Error(`Failed to generate schema: ${schemaError.message}`);
        }
      }

      const keywordsArray = formData.keywords
        ? formData.keywords.split(",").map((keyword) => keyword.trim())
        : [];

      const datasetId = await register_dataset(
        rocratePath,
        formData.name,
        formData.author,
        formData.version,
        formData.datePublished,
        formData.description,
        keywordsArray,
        formData.dataFormat,
        filepath,
        null,
        null,
        [],
        [],
        finalSchemaId
      );
      console.log("Registered Dataset ID:", datasetId);

      const computationName = `REDCap Data Export for ${
        projectName || "Unknown Project"
      }`;
      const computationDescription = `Execution of data export from REDCap project '${
        projectName || "Unknown Project"
      }' using the ${SOFTWARE_NAME}.`;
      const computationDate = new Date().toISOString();

      const computationId = await register_computation(
        rocratePath,
        computationName,
        SOFTWARE_URL,
        computationDate,
        computationDescription,
        ["REDCap", "Data Export", "FAIRscape"],
        null,
        null,
        [{ "@id": SOFTWARE_GUID }],
        [],
        [{ "@id": datasetId }]
      );
      console.log("Registered Computation ID:", computationId);

      onSubmit({
        ...formData,
        schema: finalSchemaId,
        datasetId: datasetId,
        computationId: computationId,
        softwareId: SOFTWARE_GUID,
      });
    } catch (error) {
      console.error("Error during registration process:", error);
      setRegistrationError(error.message || "Failed to register entities");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <InitFormContainer>
      <FormCard>
        <FormHeader>
          <FormTitle>Register Exported Dataset</FormTitle>
          {downloadedFile && (
            <span>
              File: {downloadedFile.split(/[\\/]/).pop() || downloadedFile}
            </span>
          )}
        </FormHeader>

        <FormTableContainer>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Dataset Name</TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Author(s)</TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="Creator(s) of the dataset instance"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Dataset Version</TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="version"
                      value={formData.version}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Date Published</TableCell>
                  <TableCell>
                    <input
                      type="date"
                      name="datePublished"
                      value={formData.datePublished}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Keywords</TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleChange}
                      placeholder="Separate keywords with commas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Data Format</TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="dataFormat"
                      value={formData.dataFormat}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none sm:text-sm text-gray-500"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Schema</TableCell>
                  <TableCell>
                    {formData.schema ? (
                      <input
                        type="text"
                        value={formData.schema}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none sm:text-sm text-gray-500"
                        title="Schema ID used for this dataset"
                      />
                    ) : (
                      <div className="text-gray-600 italic py-2">
                        No schema provided; will be auto-generated from CSV
                        headers.
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </FormTableContainer>

        {registrationError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm">
            <strong>Error:</strong> {registrationError}
          </div>
        )}

        <FormActions>
          <ActionButton
            type="button"
            onClick={onBack}
            disabled={isRegistering}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Back
          </ActionButton>
          <ActionButton
            type="submit"
            onClick={handleSubmit}
            disabled={isRegistering || !downloadedFile || !project?.rocratePath}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? "Registering..." : "Register Dataset & Provenance"}
          </ActionButton>
        </FormActions>
      </FormCard>
    </InitFormContainer>
  );
};

export default DatasetForm;
