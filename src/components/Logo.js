import React from 'react'
import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import mq from 'mediaQuery'

import EWLogo from '../assets/ewIconLogo.svg'

const IconLogo = styled('img')``

const LogoContainer = styled(Link)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding-left: 20px;
  align-items: center;
  width: auto;

  ${mq.medium`
    width: 200px;
  `}
`

const Logo = ({ color, className, to = '' }) => (
  <LogoContainer className={className} to={to}>
    <IconLogo src={EWLogo} />
  </LogoContainer>
)

export default Logo
