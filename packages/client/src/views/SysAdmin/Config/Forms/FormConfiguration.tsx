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
import { IStoreState } from '@client/store'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Content } from '@opencrvs/components/lib/interface/Content'
import {
  messages,
  draftStatusMessages
} from '@client/i18n/messages/views/formConfig'
import { DraftStatus } from '@client/forms/configuration/formDrafts/reducer'
import { DraftsTab } from './DraftsTab'
import {
  selectFormDraftLoaded,
  selectFormDraft
} from '@client/forms/configuration/formDrafts/selectors'
import { useLoadFormDraft } from './hooks'
import { PreviewTab } from './PreviewTab'
import { PublishedTab } from './PublishedTab'
import styled from '@client/styledComponents'
import { Warning } from '@opencrvs/components/lib/interface'
import { Event } from '@client/forms'
import { constantsMessages } from '@client/i18n/messages'

const StyledWarning = styled(Warning)`
  margin: 0 auto 16px;
  max-width: 778px;
`

function UnbuplishedWarning() {
  const intl = useIntl()
  const { status: birthStatus } = useSelector((store: IStoreState) =>
    selectFormDraft(store, Event.BIRTH)
  )
  const { status: deathStatus } = useSelector((store: IStoreState) =>
    selectFormDraft(store, Event.DEATH)
  )
  const events: string[] = []
  if (birthStatus !== DraftStatus.PUBLISHED) {
    events.push(intl.formatMessage(constantsMessages[Event.BIRTH]))
  }
  if (deathStatus !== DraftStatus.PUBLISHED) {
    events.push(intl.formatMessage(constantsMessages[Event.DEATH]))
  }

  return (
    <>
      {events.length > 0 && (
        <StyledWarning
          label={intl.formatMessage(messages.publishedWarning, {
            events: events.join(', ')
          })}
        />
      )}
    </>
  )
}

export function FormConfiguration() {
  useLoadFormDraft()
  const intl = useIntl()
  const formDraftLoaded = useSelector((store: IStoreState) =>
    selectFormDraftLoaded(store)
  )
  const [selectedTab, setSelectedTab] = React.useState<string>(
    DraftStatus.DRAFT
  )

  return (
    <SysAdminContentWrapper isCertificatesConfigPage>
      {formDraftLoaded && <UnbuplishedWarning />}
      <Content
        title={intl.formatMessage(messages.title)}
        subtitle={
          selectedTab === DraftStatus.PREVIEW
            ? intl.formatMessage(messages.previewDescription)
            : selectedTab === DraftStatus.PUBLISHED
            ? intl.formatMessage(messages.publishedDescription)
            : undefined
        }
        tabs={{
          sections: [
            {
              id: DraftStatus.DRAFT,
              title: intl.formatMessage(draftStatusMessages.DRAFT)
            },
            {
              id: DraftStatus.PREVIEW,
              title: intl.formatMessage(draftStatusMessages.PREVIEW)
            },
            {
              id: DraftStatus.PUBLISHED,
              title: intl.formatMessage(draftStatusMessages.PUBLISHED)
            }
          ],
          activeTabId: selectedTab,
          onTabClick: (tabId) => setSelectedTab(tabId)
        }}
      >
        {formDraftLoaded && selectedTab === DraftStatus.DRAFT ? (
          <DraftsTab />
        ) : selectedTab === DraftStatus.PREVIEW ? (
          <PreviewTab />
        ) : selectedTab === DraftStatus.PUBLISHED ? (
          <PublishedTab />
        ) : (
          <></>
        )}
      </Content>
    </SysAdminContentWrapper>
  )
}
