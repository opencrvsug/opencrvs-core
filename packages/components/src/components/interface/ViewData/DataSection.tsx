/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import styled from 'styled-components'
import { IDataProps, DataRow } from './DataRow'
import { LinkButton } from '../../buttons'

const Container = styled.div`
  margin-top: 48px;
`
const Title = styled.div`
  display: flex;
  gap: 8px;
  ${({ theme }) => theme.fonts.h4Style};
  margin-bottom: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.h5Style};
    flex-direction: column;
    align-items: flex-start;
    gap: 0px;
  }
`

interface IAction {
  id?: string
  label: string
  disabled?: boolean
  handler: () => void
}

const ResponsiveContainer = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: block;
  }
`
interface IProps {
  id?: string
  title: string
  items: IDataProps[]
  responsiveContents?: React.ReactNode
  action?: IAction
}

export class DataSection extends React.Component<IProps> {
  render() {
    const { action, id, title, items, responsiveContents } = this.props

    return (
      <Container id={id}>
        <Title>
          {title}
          {action && (
            <LinkButton onClick={action.handler}>{action.label}</LinkButton>
          )}
        </Title>
        {responsiveContents && (
          <ResponsiveContainer>{responsiveContents}</ResponsiveContainer>
        )}
        {items.map((item: IDataProps, index: number) => (
          <DataRow id={item.label.split(' ').join('-')} key={index} {...item} />
        ))}
      </Container>
    )
  }
}
