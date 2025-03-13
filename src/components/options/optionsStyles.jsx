import styled from "styled-components";
import { ActionButton } from "../styles";

export const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

export const StepCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

export const StepNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #ebf5ff;
  color: #1e40af;
  border-radius: 50%;
  font-weight: 600;
  margin-right: 1rem;
  flex-shrink: 0;
`;

export const StepContent = styled.div`
  flex: 1;
`;

export const StepTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

export const StepDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

export const StepButton = styled(ActionButton)`
  padding: 0.75rem 1rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const InstructionsBox = styled.div`
  background: #eff6ff;
  padding: 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid #bfdbfe;
  margin-top: 2rem;
`;

export const InstructionsTitle = styled.h3`
  font-weight: 500;
  color: #1e40af;
  margin: 0 0 0rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
`;
