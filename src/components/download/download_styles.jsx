import styled from "styled-components";
import { ActionButton } from "../styles";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

export const HeaderSection = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, auto);
    justify-content: start;
  }
`;

export const SelectAllButton = styled.button`
  background-color: #ebf5ff;
  color: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;

  &:hover {
    background-color: #dbeafe;
  }

  @media (min-width: 640px) {
    width: auto;
  }
`;

export const DateRangeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;

  &:hover {
    background-color: #f9fafb;
  }

  @media (min-width: 640px) {
    width: auto;
  }
`;

export const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Footer = styled.div`
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
`;

export const DownloadButton = styled(ActionButton)`
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;
