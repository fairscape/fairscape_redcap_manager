// DateRangeSelector.js
import React from "react";
import {
  DateRangeContainer,
  DateInputGroup,
  DateLabel,
  DateInput,
} from "../download_styles";

export const DateRangeSelector = ({ dateRange, onDateChange }) => (
  <DateRangeContainer>
    <DateInputGroup>
      <DateLabel>Start Date</DateLabel>
      <DateInput
        type="date"
        value={dateRange.dateRangeBegin || ""}
        onChange={(e) => onDateChange("dateRangeBegin", e.target.value)}
      />
    </DateInputGroup>
    <DateInputGroup>
      <DateLabel>End Date</DateLabel>
      <DateInput
        type="date"
        value={dateRange.dateRangeEnd || ""}
        onChange={(e) => onDateChange("dateRangeEnd", e.target.value)}
      />
    </DateInputGroup>
  </DateRangeContainer>
);

export default DateRangeSelector;
