import { open } from "frictionless.js";

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
      MRN: /\b(?:(?:[A-Z]{1,3}[-]?)?\d{6,9}|(?:[A-Z]{1,3}[-]?)?\d{4,8})\b/,
      MRN_WITH_DATE: new RegExp(
        "(?:" +
          "(?:\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}|\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}).{0,50}" +
          "(?:(?:[A-Z]{1,3}[-]?)?\\d{6,9}|(?:[A-Z]{1,3}[-]?)?\\d{4,8})" +
          "|" +
          "(?:(?:[A-Z]{1,3}[-]?)?\\d{6,9}|(?:[A-Z]{1,3}[-]?)?\\d{4,8})" +
          ".{0,50}" +
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
    return this.datePatterns.some((pattern) => pattern.test(value));
  }

  _isPotentialName(value) {
    if (!value || typeof value !== "string") return false;
    const namePattern = /^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/;
    return namePattern.test(value.trim());
  }

  async verifyFile(filepath, identifiedColumns = []) {
    try {
      const file = await open(filepath);
      const rows = await file.rows({ keyed: true });
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

          if (this._isDate(strValue)) {
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
