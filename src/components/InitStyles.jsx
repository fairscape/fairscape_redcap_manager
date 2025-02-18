import styled from "styled-components";

export const FormCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  margin-top: 1rem;
`;

export const FormHeader = styled.div`
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  transition: background-color 0.2s;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
`;

export const FormTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  text-transform: capitalize;
  margin: 0;
`;

export const FormTableContainer = styled.div`
  border-top: 1px solid #e5e7eb;
  max-height: 24rem;
  overflow-y: auto;
  width: 100%;
`;

export const TableContainer = styled.div`
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
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

  input,
  textarea,
  select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #333;

    &:focus {
      outline: none;
      border-color: #007bff;
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }

  select {
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23333333' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 32px;
    appearance: none;
  }
`;

export const ActionButton = styled.button`
  background-color: #ebf5ff;
  color: #1e40af;
  border: none;
  padding: 8px 16px;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 100px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;

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

export const BrowseButton = styled(ActionButton)`
  margin-left: 8px;
  min-width: auto;
  padding: 8px 12px;
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

export const FormActions = styled.div`
  padding: 1rem;
  text-align: right;
  background: white;
  border-top: 1px solid #e5e7eb;

  ${ActionButton} + ${ActionButton} {
    margin-left: 8px;
  }
`;

// Modal styles
export const ModalContainer = styled.div`
  .modal-content {
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;

    .modal-title {
      color: #111827;
      font-weight: 600;
      font-size: 1.125rem;
    }

    .btn-close {
      opacity: 0.5;

      &:hover {
        opacity: 0.75;
      }
    }
  }

  .modal-body {
    padding: 1.5rem;
    color: #6b7280;
  }

  .modal-footer {
    border-top: 1px solid #e5e7eb;
    padding: 1rem;
    background: #f9fafb;
  }
`;
