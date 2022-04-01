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
import React from 'react'
import styled from 'styled-components'
import { IButtonSize, dimensionsMap } from '../../buttons'

const Grid = styled.div<{ bottomBorder: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-auto-rows: minmax(56px, auto);
  row-gap: 1px;
  ${({ bottomBorder }) => bottomBorder && 'border-bottom: 1px solid'};
  border-color: ${({ theme }) => theme.colors.grey200};
  > div:not(:nth-last-child(-n + 4)) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    grid-template-columns: auto;
  }
`

const LabelValueContainer = styled.div`
  display: flex;
  padding: 8px 0;
  grid-column-start: 2;
  gap: 8px;
  padding-right: 8px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const ValueContainer = styled.div`
  display: flex;
  flex: 0 1 50%;
  color: ${({ theme }) => theme.colors.grey500};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex: 1;
    grid-row-start: 2;
    grid-column: 2;
    align-items: center;
  }
`

const LabelContainer = styled.div`
  display: flex;
  flex: 1 0 50%;
  button > div {
    padding: 0;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: block;
    grid-column-start: 2;
    align-self: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`

const ActionsContainer = styled.div`
  display: flex;
  padding: 8px 0;
  justify-content: right;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  padding-right: 8px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const MobileAvatarContainer = styled.div`
  display: flex;
  align-items: center;
  padding-right: 8px;
`

const MobileContainer = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: grid;
    padding: 8px 0;
    grid-template-rows: auto auto;
    grid-template-columns: auto 1fr auto;
  }
`

const MobileActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
`

interface IListViewItemSimplifiedProps {
  image?: React.ReactNode
  label: React.ReactNode
  value?: React.ReactNode
  contentSize?: IButtonSize
  actions?: React.ReactNode[]
}

/* The content needs to be given a fixed height to keep it
 * aligned with the actions column
 */
const FixedHeightContent = styled.div<{ size: IButtonSize }>`
  display: flex;
  align-items: center;
  height: ${({ size }) => dimensionsMap[size]};
`

export function ListViewItemSimplified({
  image,
  label,
  value,
  contentSize = 'medium',
  actions
}: IListViewItemSimplifiedProps) {
  return (
    <>
      {image && <AvatarContainer>{image}</AvatarContainer>}
      <LabelValueContainer>
        <LabelContainer>
          {typeof label === 'string' ? (
            <FixedHeightContent size={contentSize}>{label}</FixedHeightContent>
          ) : (
            label
          )}
        </LabelContainer>
        {value && (
          <ValueContainer>
            {typeof value === 'string' ? (
              <FixedHeightContent size={contentSize}>
                {value}
              </FixedHeightContent>
            ) : (
              value
            )}
          </ValueContainer>
        )}
      </LabelValueContainer>
      <ActionsContainer>{actions}</ActionsContainer>
      <MobileContainer>
        {image && <MobileAvatarContainer>{image}</MobileAvatarContainer>}
        <LabelContainer>{label}</LabelContainer>
        <MobileActionsContainer>{actions}</MobileActionsContainer>
        {value && <ValueContainer>{value}</ValueContainer>}
      </MobileContainer>
    </>
  )
}

export function ListViewSimplified({
  bottomBorder = false,
  children
}: {
  bottomBorder?: boolean
  children: React.ReactNode
}) {
  return <Grid bottomBorder={bottomBorder}>{children}</Grid>
}
