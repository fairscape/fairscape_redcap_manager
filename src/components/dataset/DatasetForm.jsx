import React, { useState, useEffect } from "react";
import { register_dataset } from "@fairscape/utils";
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

const initialFormState = {
  name: "",
  author: "",
  version: "",
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
    if (metadata) {
      setFormData((prev) => ({
        ...prev,
        name: metadata.name || `REDCap export of: ${projectName}`,
        author: metadata.author || "",
        version: metadata.version || "1.0",
        datePublished:
          metadata.datePublished || new Date().toISOString().split("T")[0],
        description: metadata.description || "",
        keywords: Array.isArray(metadata.keywords)
          ? metadata.keywords.join(", ")
          : metadata.keywords || "",
        dataFormat: "CSV",
        schema: schemaID || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        name: `REDCap export of: ${projectName}`,
        datePublished: new Date().toISOString().split("T")[0],
        dataFormat: "CSV",
        schema: schemaID || null,
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
    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const rocratePath = project.rocratePath;
      const filepath = downloadedFile;
      let finalSchemaId = formData.schema;

      // Generate schema from CSV headers if no schema is provided
      if (!finalSchemaId) {
        try {
          finalSchemaId = await generateAndRegisterSchemaFromCSV(
            rocratePath,
            filepath,
            project.formData,
            projectName
          );
        } catch (schemaError) {
          console.error("Error generating schema:", schemaError);
          setRegistrationError(
            "Failed to generate schema: " + schemaError.message
          );
          setIsRegistering(false);
          return;
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
        finalSchemaId,
        null,
        null
      );

      onSubmit({
        ...formData,
        schema: finalSchemaId,
        datasetId: datasetId,
      });
    } catch (error) {
      console.error("Error registering dataset:", error);
      setRegistrationError(error.message || "Failed to register dataset");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <InitFormContainer>
      <FormCard>
        <FormHeader>
          <FormTitle>Register Dataset</FormTitle>
          <span>File: {downloadedFile}</span>
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
                      required
                      placeholder="Separate multiple authors with commas"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Version</TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="version"
                      value={formData.version}
                      onChange={handleChange}
                      required
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
                      onChange={handleChange}
                      required
                      disabled
                    />
                  </TableCell>
                </TableRow>

                {schemaID && (
                  <TableRow>
                    <TableCell>Schema ID</TableCell>
                    <TableCell>
                      <input type="text" value={schemaID} disabled />
                    </TableCell>
                  </TableRow>
                )}
                {!schemaID && (
                  <TableRow>
                    <TableCell>Schema</TableCell>
                    <TableCell>
                      <div className="text-gray-600 italic">
                        A schema will be automatically generated from CSV
                        headers
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </FormTableContainer>

        {registrationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-start gap-2">
              <div>{registrationError}</div>
            </div>
          </div>
        )}

        <FormActions>
          <ActionButton onClick={onBack} disabled={isRegistering}>
            Back
          </ActionButton>
          <ActionButton onClick={handleSubmit} disabled={isRegistering}>
            {isRegistering ? "Registering..." : "Register Dataset"}
          </ActionButton>
        </FormActions>
      </FormCard>
    </InitFormContainer>
  );
};

export default DatasetForm;
