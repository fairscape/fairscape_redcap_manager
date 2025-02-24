import React, { useState, useEffect } from "react";
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
}) => {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (metadata) {
      // Pre-populate form with RO-Crate metadata if available
      setFormData((prev) => ({
        ...prev,
        name: metadata.name || `REDCap export of: ${projectName}`,
        author: metadata.author || "",
        version: metadata.version || "1.0",
        datePublished:
          metadata.datePublished || new Date().toISOString().split("T")[0],
        description: metadata.description || "",
        // Check if metadata.keywords is an array before joining
        keywords: Array.isArray(metadata.keywords)
          ? metadata.keywords.join(", ")
          : metadata.keywords || "",
        dataFormat: "CSV",
        schema: schemaID || null, // Include schema ID from props
      }));
    } else {
      // Set defaults if no metadata
      setFormData((prev) => ({
        ...prev,
        name: `REDCap export of: ${projectName}`,
        datePublished: new Date().toISOString().split("T")[0],
        dataFormat: "CSV",
        schema: schemaID || null, // Include schema ID from props
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the complete form data including the schema ID to onSubmit
    onSubmit({
      ...formData,
      schema: schemaID, // Ensure schema ID is included in submission
    });
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
                      value={`REDCap Export of: ${projectName}`}
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
              </TableBody>
            </Table>
          </TableContainer>
        </FormTableContainer>

        <FormActions>
          <ActionButton onClick={onBack}>Back</ActionButton>
          <ActionButton onClick={handleSubmit}>Register Dataset</ActionButton>
        </FormActions>
      </FormCard>
    </InitFormContainer>
  );
};

export default DatasetForm;
