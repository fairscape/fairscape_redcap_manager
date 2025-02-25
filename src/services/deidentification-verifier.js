const { ipcRenderer } = window.require("electron");

export class PHIFinding {
  constructor({ row, column, value, phiType, confidence, context }) {
    this.row = row;
    this.column = column;
    this.value = value;
    this.phiType = phiType;
    this.confidence = confidence || "Medium";
    this.context = context || "Standalone";
  }
}

export class DeidentificationVerifier {
  constructor() {
    this.patterns = {
      SSN: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/,
      Phone: /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
      Email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      // More specific MRN pattern - avoid matching dates and zip codes
      MRN: /\b(?:[A-Z]{1,3}[-]?\d{6,9})\b/,
      MRN_WITH_DATE: new RegExp(
        "(?:" +
          "(?:\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}|\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}).{0,20}" +
          "(?:[A-Z]{1,3}[-]?\\d{6,9})" +
          "|" +
          "(?:[A-Z]{1,3}[-]?\\d{6,9})" +
          ".{0,20}" +
          "(?:\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}|\\d{4}[-/]\\d{1,2}[-/]\\d{1,2})" +
          ")"
      ),
    };

    this.datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
      /\b\d{1,2}-\d{1,2}-\d{2,4}\b/,
      /\b\d{4}\/\d{1,2}\/\d{1,2}\b/,
      /\b\d{4}-\d{1,2}-\d{1,2}\b/,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/i,
    ];
  }

  _isDate(value) {
    if (!value || typeof value !== "string") return false;

    // Ignore 4-digit years when they appear alone
    if (/^\d{4}$/.test(value)) {
      return false;
    }

    // Check if it might be a ZIP code (5 or 9 digit)
    if (/^\d{5}(-\d{4})?$/.test(value)) {
      return false;
    }

    return this.datePatterns.some((pattern) => pattern.test(value));
  }

  _isPotentialName(value) {
    if (!value || typeof value !== "string") return false;
    // More specific name pattern - at least 3 characters, exclude common short words
    const namePattern = /^[A-Z][a-z]{2,}(\s[A-Z][a-z]{2,})*$/;
    const commonWords = [
      "The",
      "And",
      "But",
      "For",
      "Not",
      "Yes",
      "Get",
      "Set",
      "New",
      "Old",
      "One",
      "Two",
    ];

    // Skip short names that might be abbreviations or common words
    if (value.length < 4) return false;

    // Check if it's a common word that's not likely a name
    if (commonWords.includes(value.trim())) return false;

    // City names are often flagged incorrectly
    const cityAbbreviations = [
      "Nyc",
      "Cville",
      "Phila",
      "Balt",
      "Atl",
      "Chi",
      "Sfo",
      "Stl",
      "Nola",
    ];
    if (cityAbbreviations.includes(value.trim())) return false;

    return namePattern.test(value.trim());
  }

  async verifyFile(filepath, identifiedColumns = []) {
    try {
      // Use IPC to read the file instead of directly accessing it
      const fileContent = await ipcRenderer.invoke("read-file", {
        path: filepath,
        encoding: "utf8",
      });

      // Parse CSV manually
      const rows = this._parseCSV(fileContent);
      const findings = [];
      const presentIdentifiedColumns = [];

      if (rows.length > 0 && identifiedColumns.length > 0) {
        const fileColumns = Object.keys(rows[0]);
        identifiedColumns.forEach((column) => {
          if (fileColumns.includes(column)) {
            presentIdentifiedColumns.push(column);
          }
        });
      }

      rows.forEach((row, rowIndex) => {
        Object.entries(row).forEach(([column, value]) => {
          if (value === null || value === undefined || value === "") {
            return;
          }

          const strValue = String(value);

          // Skip known common date fields to avoid false positives
          const dateFieldPatterns =
            /^(dob|birth|date|visit.*date|submission.*date|revision|birthyr)$/i;
          const isLikelyDateField = dateFieldPatterns.test(column);

          // Skip likely zip code fields
          const zipFieldPatterns = /^(zip|zipcode|postal)$/i;
          const isLikelyZipField = zipFieldPatterns.test(column);

          // Check for MRN only if it's not a date or zip code field
          if (!isLikelyDateField && !isLikelyZipField) {
            if (this.patterns.MRN_WITH_DATE.test(strValue)) {
              findings.push(
                new PHIFinding({
                  row: rowIndex,
                  column,
                  value: strValue,
                  phiType: "MRN",
                  confidence: "Very High",
                  context: "Near date",
                })
              );
            } else if (this.patterns.MRN.test(strValue)) {
              findings.push(
                new PHIFinding({
                  row: rowIndex,
                  column,
                  value: strValue,
                  phiType: "MRN",
                  confidence: "Medium",
                })
              );
            }
          }

          if (this.patterns.SSN.test(strValue)) {
            findings.push(
              new PHIFinding({
                row: rowIndex,
                column,
                value: strValue,
                phiType: "SSN",
                confidence: "High",
              })
            );
          }

          if (this.patterns.Phone.test(strValue)) {
            findings.push(
              new PHIFinding({
                row: rowIndex,
                column,
                value: strValue,
                phiType: "Phone Number",
                confidence: "High",
              })
            );
          }

          if (this.patterns.Email.test(strValue)) {
            findings.push(
              new PHIFinding({
                row: rowIndex,
                column,
                value: strValue,
                phiType: "Email Address",
                confidence: "High",
              })
            );
          }

          // Flag dates only if they're not in expected date fields
          if (!isLikelyDateField && this._isDate(strValue)) {
            findings.push(
              new PHIFinding({
                row: rowIndex,
                column,
                value: strValue,
                phiType: "Date",
                confidence: "High",
              })
            );
          }

          if (this._isPotentialName(strValue)) {
            findings.push(
              new PHIFinding({
                row: rowIndex,
                column,
                value: strValue,
                phiType: "Potential Name",
                confidence: "Medium",
              })
            );
          }
        });
      });

      return {
        findings,
        presentIdentifiedColumns,
        isDeidentified:
          findings.length === 0 && presentIdentifiedColumns.length === 0,
      };
    } catch (error) {
      throw new Error(`Failed to verify file: ${error.message}`);
    }
  }

  // Simple CSV parser
  _parseCSV(csvContent) {
    const lines = csvContent.split("\n");
    const headers = this._parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue;

      const values = this._parseCSVLine(lines[i]);
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      rows.push(row);
    }

    return rows;
  }

  _parseCSVLine(line) {
    const result = [];
    let currentValue = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quotes (double quotes)
          currentValue += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }

    // Add the last field
    result.push(currentValue.trim());

    return result;
  }
}

export const verifyREDCapExport = async (filepath, identifiedFields = []) => {
  const verifier = new DeidentificationVerifier();
  return await verifier.verifyFile(filepath, identifiedFields);
};

export const extractIdentifiedFields = (metadata) => {
  const identifiedFields = [];

  metadata.forEach((form) => {
    form.fields.forEach((field) => {
      if (field.phi === "y") {
        identifiedFields.push(field.field_name);
      }
    });
  });

  return identifiedFields;
};
