class DataProperty {
  constructor({
    type,
    description,
    index,
    pattern = null,
    minimum = null,
    maximum = null,
  }) {
    this.type = type;
    this.description = description;
    this.index = index;
    if (pattern) this.pattern = pattern;
    if (minimum !== null) this.minimum = minimum;
    if (maximum !== null) this.maximum = maximum;
  }
}

class REDCapSchema {
  constructor({ name, description }) {
    this["@context"] = {
      "@vocab": "https://schema.org/",
      evi: "https://w3id.org/EVI#",
    };
    this["@type"] = "EVI:Schema";
    this.name = name;
    this.description = description;
    this.type = "object";
    this.properties = {};
    this.additionalProperties = true;
    this.required = [];
  }

  static generateRegexFromString(inputString) {
    if (!inputString) return null;

    const options = inputString.split("|").map((option) => option.trim());
    const textOptions = options.map((option) => {
      const parts = option.split(",");
      return parts[1]
        ? parts[1].trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        : "";
    });
    return `^(${textOptions.join("|")})$`;
  }

  determineFieldTypeAndPattern(
    fieldType,
    validation,
    choices,
    useNumericValues = false
  ) {
    let pattern = null;
    let type;

    switch (fieldType) {
      case "yesno":
        type = "boolean";
        break;
      case "text":
        switch (validation) {
          case "number":
          case "integer":
            type = "integer";
            break;
          case "date_mdy":
          case "time":
          default:
            type = "string";
        }
        break;
      case "radio":
      case "dropdown":
        type = useNumericValues ? "integer" : "string";
        if (!useNumericValues && choices) {
          pattern = this.constructor.generateRegexFromString(choices);
        }
        break;
      default:
        type = "string";
    }

    return { type, pattern };
  }

  createDataProperty(field, index, useNumericValues = false) {
    const description =
      field.field_label || `${field.field_name} ${field.form_name}`;
    const { type, pattern } = this.determineFieldTypeAndPattern(
      field.field_type,
      field.validation,
      field.choices,
      useNumericValues
    );

    const property = {
      type,
      description,
      index,
    };

    if (pattern) property.pattern = pattern;
    if (field.validation_min)
      property.minimum = parseFloat(field.validation_min);
    if (field.validation_max)
      property.maximum = parseFloat(field.validation_max);

    return new DataProperty(property);
  }

  parseFormData(formData) {
    let index = 0;
    formData.forEach((form) => {
      form.fields.forEach((field) => {
        this.properties[field.field_name] = this.createDataProperty(
          field,
          index
        );
        if (field.required) {
          this.required.push(field.field_name);
        }
        index++;
      });
    });
  }
}

export function generateSchemaFromFormData(
  formData,
  schemaName,
  schemaDescription
) {
  const schema = new REDCapSchema({
    name: schemaName,
    description: schemaDescription,
  });

  schema.parseFormData(formData);
  return schema;
}

import Papa from "papaparse";

function findFieldInFormData(fieldName, formData) {
  if (!formData || !Array.isArray(formData)) {
    return null;
  }

  for (const form of formData) {
    if (!form.fields || !Array.isArray(form.fields)) {
      continue;
    }

    const field = form.fields.find((f) => f.field_name === fieldName);
    if (field) {
      return field;
    }
  }

  return null;
}

export async function buildSchemaFromCSV(
  filePath,
  projectFormData,
  projectName
) {
  try {
    const { ipcRenderer } = window.require("electron");

    const fileContent = await ipcRenderer.invoke("read-file", {
      path: filePath,
      encoding: "utf8",
    });

    const parsedCSV = Papa.parse(fileContent, {
      header: true,
      preview: 1,
      skipEmptyLines: true,
    });

    const headers = parsedCSV.meta.fields || [];

    const formData = [
      {
        form_name: "csv_import",
        fields: headers.map((header) => {
          const fieldInfo = findFieldInFormData(header, projectFormData);

          if (fieldInfo) {
            return fieldInfo;
          } else {
            return {
              field_name: header,
              form_name: "csv_import",
              field_type: "text",
              field_label: header,
              required_field: "",
              validation: "",
            };
          }
        }),
      },
    ];

    const schema = generateSchemaFromFormData(
      formData,
      `${projectName} CSV Schema`,
      `Auto-generated schema for ${projectName} CSV data`
    );

    return schema;
  } catch (error) {
    console.error("Error building schema from CSV:", error);
    throw error;
  }
}

export async function generateAndRegisterSchemaFromCSV(
  rocratePath,
  filePath,
  projectFormData,
  projectName
) {
  try {
    const schema = await buildSchemaFromCSV(
      filePath,
      projectFormData,
      projectName
    );

    const { register_schema } = require("@fairscape/utils");

    const schemaId = await register_schema(
      rocratePath,
      schema.name,
      schema.description,
      schema.properties,
      schema.required,
      ",",
      true
    );

    return schemaId;
  } catch (error) {
    console.error("Error generating and registering schema:", error);
    throw error;
  }
}
