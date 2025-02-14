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
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;

export const DownloadButton = styled(ActionButton)`
  background-color: #ebf5ff;
  color: #1e40af;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 200px;
  height: auto;

  &:hover:not(:disabled) {
    background-color: #dbeafe;
  }

  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:focus,
  &:focus-visible {
    outline: 2px solid #1e40af;
    outline-offset: 2px;
  }

  span {
    font-size: inherit;
    color: inherit;
  }
`;

export const ModeSelectorContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const ModeButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.active
      ? `
    background-color: #1e40af;
    color: white;
  `
      : `
    background-color: #f3f4f6;
    color: #374151;
    &:hover {
      background-color: #e5e7eb;
    }
  `}
`;

export const DateRangeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 32rem;
  margin-top: 1rem;
`;

export const DateInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const DateLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

export const DateInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #1e40af;
    ring: 2px solid rgba(30, 64, 175, 0.2);
  }
`;
