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

    const formGroups = metadata.reduce((forms, field) => {
      const formName = field.form_name;

      if (!forms[formName]) {
        forms[formName] = {
          form_name: formName,
          fields: [],
        };
      }

      const extractTextFromHtml = (html) => {
        try {
          if (!html.includes("<")) {
            return html;
          }

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const walker = document.createTreeWalker(
            doc.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );

          let text = "";
          let node;

          while ((node = walker.nextNode())) {
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
  if (!apiUrl || !token) {
    throw new Error("API URL and token are required");
  }

  const formData = new FormData();
  formData.append("token", token);
  formData.append("content", "record");
  formData.append("format", "csv");
  formData.append("type", "flat");
  formData.append("returnFormat", "json");

  if (options.fields && Array.isArray(options.fields)) {
    options.fields.forEach((field, index) => {
      formData.append(`fields[${index}]`, field);
    });
  }

  if (options.forms && Array.isArray(options.forms)) {
    options.forms.forEach((form, index) => {
      formData.append(`forms[${index}]`, form);
    });
  }

  if (options.dateRangeBegin) {
    formData.append("dateRangeBegin", `${options.dateRangeBegin} 00:00:00`);
  }
  if (options.dateRangeEnd) {
    formData.append("dateRangeEnd", `${options.dateRangeEnd} 23:59:59`);
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch records: ${error.message}`);
  }
};
