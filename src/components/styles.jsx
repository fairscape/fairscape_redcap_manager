import styled from "styled-components";
import { Card } from "react-bootstrap";

export const accentColor = "#007bff";
export const accentColorHover = "#0056b3";

export const AppContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

export const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: white;
`;

export const Sidebar = styled.div`
  width: 250px;
  min-width: 250px;
  height: 100vh;
  background-color: #282828;
  padding: 20px;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-sizing: border-box;
  position: relative; /* Added */
`;

export const Logo = styled.div`
  margin-bottom: 20px;
  text-align: center;
  flex-shrink: 0; /* Prevent logo from shrinking */
  img {
    max-width: 100%;
    height: auto;
  }
`;

export const SidebarContent = styled.div`
  flex: 1; /* Allow content to take available space */
  overflow-y: auto; /* Allow content scrolling if needed */
  min-height: 0; /* Important for flex children with overflow */
  box-sizing: border-box;
`;

export const SidebarItem = styled.div`
  padding: 12px;
  margin: 4px 0;
  cursor: pointer;
  background-color: ${(props) => (props.active ? accentColor : "transparent")};
  border-radius: 4px;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${(props) => (props.active ? accentColor : "#3e3e3e")};
  }
`;

export const SidebarFooter = styled.div`
  margin-top: auto; /* Push footer to the bottom */
  flex-shrink: 0; /* Prevent footer from shrinking */
  box-sizing: border-box;
`;

// Other Components (Assuming these are okay, but added box-sizing for robustness)

export const ContentWrapper = styled.div`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

export const CardContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 2rem;
  box-sizing: border-box;
`;

export const TextContent = styled.div`
  flex: 1;
  text-align: left;
  box-sizing: border-box;
`;

export const TableContainer = styled.div`
  background: white;
  border-radius: 4px;
  border: 1px solid #444;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

export const TableHead = styled.thead`
  background-color: ${(props) => props.theme.accentColor || "#007bff"};
  color: white;
`;

export const TableBody = styled.tbody`
  tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.02);
  }

  tr:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export const TableRow = styled.tr``;

export const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;

  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    &:focus {
      outline: none;
      border-color: ${(props) => props.theme.accentColor || "#007bff"};
    }
  }
`;

export const TableHeaderCell = styled.th`
  padding: 16px;
  font-weight: bold;
  text-align: ${(props) => props.align || "left"};
  box-sizing: border-box;
`;

export const ActionButton = styled.button`
  background-color: #ebf5ff;
  color: #1e40af;
  border: none;
  padding: 8px;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 8px;
  min-width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  box-sizing: border-box;

  &:hover {
    background-color: #dbeafe;
  }

  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export const AddButton = styled(ActionButton)`
  padding: 8px 16px;
  svg {
    margin-right: 8px;
  }
`;
export const StyledCard = styled(Card)`
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid #444;
  width: 100%;
  box-sizing: border-box;

  .card-body {
    padding: 1.25rem;
    box-sizing: border-box;
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
    text-align: left;
  }

  p {
    color: #666;
    margin: 0.5rem 0 0;
    text-align: left;
  }

  button {
    background-color: #ebf5ff;
    color: #1e40af;
    border: none;
    padding: 8px 16px;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background-color 0.2s;
    min-width: 100px;
    font-weight: 500;
    box-sizing: border-box;

    &:hover {
      background-color: #dbeafe;
    }

    &:disabled {
      background-color: #f3f4f6;
      color: #9ca3af;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
`;

export const NotificationBox = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.severity === "error" ? "#f44336" : "#4caf50"};
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
`;

export const Title = styled.h2`
  margin-bottom: 24px;
  color: #333;
`;

export const FormCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  margin-top: 1rem;
`;

export const FormHeader = styled.button`
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #6b7280;

  &:hover {
    background-color: #f9fafb;
  }
`;

export const FormTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const FormTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  text-transform: capitalize;
`;

export const ExpandIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #f3f4f6;
  transition: background-color 0.2s;

  ${FormHeader}:hover & {
    background-color: #e5e7eb;
  }
`;

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-right: 0;
  min-width: 0;
  max-width: 100%;
`;

export const FormTableContainer = styled.div`
  border-top: 1px solid #e5e7eb;
  max-height: 24rem;
  overflow-y: auto;
  width: 100%;
`;

export const FormTable = styled.table`
  min-width: 800px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

export const FormTableHead = styled.thead`
  background-color: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;
`;

export const FormTableHeader = styled.th`
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
`;

export const FormTableBody = styled.tbody`
  background-color: white;

  tr {
    border-bottom: 1px solid #e5e7eb;

    &:hover {
      background-color: #f9fafb;
    }

    &:last-child {
      border-bottom: none;
    }
  }
`;

export const FormTableCell = styled.td`
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: ${(props) => (props.$primary ? "#111827" : "#6b7280")};
  white-space: nowrap;
`;

export const ValidationInfo = styled.div`
  div:first-child {
    margin-bottom: 0.25rem;
  }

  div:last-child {
    font-size: 0.75rem;
    color: #9ca3af;
  }
`;
