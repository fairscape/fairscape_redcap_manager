// src/services/redcap-api.js

export const exportProjectInfo = async (apiUrl, token) => {
  if (!apiUrl || !token) {
    throw new Error("API URL and token are required");
  }

  const formData = new FormData();
  formData.append("token", token);
  formData.append("content", "project");
  formData.append("format", "json");
  formData.append("returnFormat", "json");

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch project information: ${error.message}`);
  }
};

export const exportMetadata = async (apiUrl, token) => {
  if (!apiUrl || !token) {
    throw new Error("API URL and token are required");
  }

  const formData = new FormData();
  formData.append("token", token);
  formData.append("content", "metadata");
  formData.append("format", "json");
  formData.append("returnFormat", "json");

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const metadata = await response.json();

    // Transform metadata into grouped form structure
    const formGroups = metadata.reduce((forms, field) => {
      const formName = field.form_name;

      // Initialize form group if it doesn't exist
      if (!forms[formName]) {
        forms[formName] = {
          form_name: formName,
          fields: [],
        };
      }

      // Function to extract clean text from HTML content
      const extractTextFromHtml = (html) => {
        try {
          // If it doesn't look like HTML, return as is
          if (!html.includes("<")) {
            return html;
          }

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // Get all text nodes recursively
          const walker = document.createTreeWalker(
            doc.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );

          let text = "";
          let node;

          while ((node = walker.nextNode())) {
            // Skip text in italics (usually supplementary info)
            if (
              !node.parentElement.closest("em") &&
              !node.parentElement.closest("i")
            ) {
              text += node.textContent.trim() + " ";
            }
          }

          return text.trim();
        } catch (e) {
          console.warn("Error parsing HTML content:", e);
          return html;
        }
      };

      // Transform field data to match expected format
      const processedField = {
        field_name: field.field_name,
        field_type: field.field_type,
        field_label: extractTextFromHtml(field.field_label),
        validation: field.text_validation_type_or_show_slider_number,
        validation_min: field.text_validation_min,
        validation_max: field.text_validation_max,
        required: field.required_field === "y",
        phi: field.identifier,
        field_note: field.field_note,
        choices: field.select_choices_or_calculations,
        html_content: field.field_label.includes("<")
          ? field.field_label
          : undefined,
      };

      // Only include properties that are not undefined
      const cleanedField = Object.fromEntries(
        Object.entries(processedField).filter(
          ([_, value]) => value !== undefined
        )
      );

      forms[formName].fields.push(cleanedField);
      return forms;
    }, {});

    // Convert to array format matching mock data
    const projectData = Object.values(formGroups);

    return projectData;
  } catch (error) {
    throw new Error(`Failed to fetch metadata: ${error.message}`);
  }
};

export const exportRecords = async (apiUrl, token, options = {}) => {
  // Validate required parameters
  if (!apiUrl || !token) {
    throw new Error("API URL and token are required");
  }

  // Create form data for the POST request
  const formData = new FormData();
  formData.append("token", token);
  formData.append("content", "record");
  formData.append("format", "json");
  formData.append("type", "flat");
  formData.append("returnFormat", "csv");

  // Add optional fields if provided
  if (options.fields && Array.isArray(options.fields)) {
    formData.append("fields", JSON.stringify(options.fields));
  }

  // Add optional forms if provided
  if (options.forms && Array.isArray(options.forms)) {
    formData.append("forms", JSON.stringify(options.forms));
  }

  // Add date range if provided
  if (options.dateRangeBegin) {
    formData.append("dateRangeBegin", options.dateRangeBegin);
  }
  if (options.dateRangeEnd) {
    formData.append("dateRangeEnd", options.dateRangeEnd);
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch records: ${error.message}`);
  }
};
