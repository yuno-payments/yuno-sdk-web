import styled from "@emotion/styled";

export const Content = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  border: 1px solid #e6dfdf;
  border-radius: 12px;
  padding: 0 16px;
  border-color: ${({checked})=> checked ? '#6400FF' : '#e6dfdf'};
`

export const Image = styled.img`
  width: 16px;
`