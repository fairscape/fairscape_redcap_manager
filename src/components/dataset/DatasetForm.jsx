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

const SOFTWARE_GUID = "ark:59853/software-fairscape-redcap-gui";
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
  format: "CSV",
  "evi:Schema": null,
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
    const baseName = `REDCap export for project: ${projectName || "Unknown"}`;
    const baseDescription = `Dataset exported from REDCap project '${
      projectName || "Unknown"
    }' via Fairscape REDCap GUI.`;
    const baseKeywords = "REDCap, Export";

    if (metadata) {
      setFormData((prev) => ({
        ...prev,
        name: metadata.name || baseName,
        author: metadata.author || "",
        version: metadata.version || "1.0",
        datePublished: metadata.datePublished || today,
        description: metadata.description || baseDescription,
        keywords: Array.isArray(metadata.keywords)
          ? metadata.keywords.join(", ")
          : metadata.keywords || baseKeywords,
        format: "CSV",
        "evi:Schema": schemaID
          ? { "@id": schemaID }
          : prev["evi:Schema"] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        name: baseName,
        author: "",
        datePublished: today,
        description: baseDescription,
        keywords: baseKeywords,
        format: "CSV",
        "evi:Schema": schemaID
          ? { "@id": schemaID }
          : prev["evi:Schema"] || null,
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
      setRegistrationError(
        "Downloaded file path (dataset filepath) is missing."
      );
      return;
    }

    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const rocratePath = project.rocratePath;
      const datasetFilepath = downloadedFile;

      const softwareParams = {
        "@id": SOFTWARE_GUID,
        name: SOFTWARE_NAME,
        author: SOFTWARE_AUTHOR,
        version: SOFTWARE_VERSION,
        description: SOFTWARE_DESCRIPTION,
        keywords: SOFTWARE_KEYWORDS,
        url: SOFTWARE_URL,
        format: "Electron",
        dateModified: new Date().toISOString().split("T")[0],
      };

      await register_software(rocratePath, softwareParams);

      const embargoedDatasetParams = {
        name: `REDCap Database - ${projectName || "Unknown Project"}`,
        author: formData.author,
        version: "1.0",
        datePublished: formData.datePublished,
        description: `Source REDCap database for project '${
          projectName || "Unknown Project"
        }' - data access embargoed`,
        keywords: ["REDCap", "Database", "Source Data"],
        format: "REDCap Database",
      };

      const embargoedDatasetId = await register_dataset(
        rocratePath,
        embargoedDatasetParams,
        "Embargoed"
      );

      const computationParams = {
        name: `REDCap Data Export for ${projectName || "Unknown Project"}`,
        runBy: SOFTWARE_URL,
        dateCreated: new Date().toISOString().split("T")[0],
        description: `Execution of data export from REDCap project '${
          projectName || "Unknown Project"
        }' using the ${SOFTWARE_NAME}.`,
        keywords: ["REDCap", "Data Export", "FAIRSCAPE"],
        usedSoftware: [{ "@id": SOFTWARE_GUID }],
        usedDataset: [{ "@id": embargoedDatasetId }],
      };

      const computationId = await register_computation(
        rocratePath,
        computationParams
      );

      let finalSchemaObject = formData["evi:Schema"];

      if (!finalSchemaObject || !finalSchemaObject["@id"]) {
        try {
          const generatedSchemaIdString =
            await generateAndRegisterSchemaFromCSV(
              rocratePath,
              datasetFilepath,
              projectName || "DefaultSchema",
              `Schema auto-generated from CSV headers for ${
                projectName || "Unknown Project"
              }`
            );
          finalSchemaObject = { "@id": generatedSchemaIdString };
          setFormData((prev) => ({ ...prev, "evi:Schema": finalSchemaObject }));
        } catch (schemaError) {
          console.error("Error generating schema:", schemaError);
          throw new Error(`Failed to generate schema: ${schemaError.message}`);
        }
      }

      const keywordsArray = formData.keywords
        ? formData.keywords.split(",").map((keyword) => keyword.trim())
        : [];

      let datasetAuthor = formData.author;

      const datasetParams = {
        name: formData.name,
        author: datasetAuthor,
        version: formData.version,
        datePublished: formData.datePublished,
        description: formData.description,
        keywords: keywordsArray,
        format: formData.format,
        "evi:Schema": finalSchemaObject,
        generatedBy: [{ "@id": computationId }],
      };

      const datasetId = await register_dataset(
        rocratePath,
        datasetParams,
        datasetFilepath
      );

      onSubmit({
        ...formData,
        "evi:Schema": finalSchemaObject,
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
                      name="format"
                      value={formData.format}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none sm:text-sm text-gray-500"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Schema</TableCell>
                  <TableCell>
                    {formData["evi:Schema"] && formData["evi:Schema"]["@id"] ? (
                      <input
                        type="text"
                        value={formData["evi:Schema"]["@id"]}
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
