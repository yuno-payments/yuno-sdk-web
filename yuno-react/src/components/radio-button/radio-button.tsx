/* eslint-disable react/prop-types */

import { Content } from "./radio-button-styled"

interface RadioButtonProps {
  text: string
  onClick: () => void
  checked: boolean
}

export const RadioButton: React.FC<RadioButtonProps> = ({ text, onClick, checked }) => {
  return <Content checked={checked} onClick={onClick}>
    <p>{text}</p>
  </Content>
}
