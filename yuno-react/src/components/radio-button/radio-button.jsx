/* eslint-disable react/prop-types */

import { Content } from "./radio-button-styled"

export const RadioButton = ({ text, onClick, checked }) => {
  return <Content checked={checked} onClick={onClick}>
    <p>{text}</p>
  </Content>
}
