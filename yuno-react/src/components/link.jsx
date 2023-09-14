import styled from '@emotion/styled'
import { Link } from 'react-router-dom'

export const Links = () => {
  return <LinkContent>
    <Link to="/secure-fields"> Secure fields</Link>
    <Link to="/apm-lite-list"> Payment methods lite list </Link>
    <Link to='/apm-lite-list/custom-loader'>Payment methods lite list custom loader</Link>
  </LinkContent>
}

const LinkContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`