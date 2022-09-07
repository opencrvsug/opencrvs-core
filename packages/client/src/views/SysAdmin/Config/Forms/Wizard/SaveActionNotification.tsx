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
import { SaveActionContext } from './SaveActionModal'
import {
  ActionStatus,
  NOTIFICATION_TYPE_MAP,
  isNotifiable
} from '@client/views/SysAdmin/Config/Forms/utils'
import { Toast, NOTIFICATION_TYPE } from '@opencrvs/components/lib/Toast'
import { useIntl } from 'react-intl'
import { saveActionMessages } from '@client/i18n/messages/views/formConfig'

export function SaveActionNotification() {
  const intl = useIntl()
  const { status, setStatus } = React.useContext(SaveActionContext)

  return (
    <Toast
      type={
        isNotifiable(status)
          ? NOTIFICATION_TYPE_MAP[status]
          : NOTIFICATION_TYPE.ERROR
      }
      show={isNotifiable(status)}
      callback={
        status !== ActionStatus.PROCESSING
          ? () => setStatus(ActionStatus.IDLE)
          : undefined
      }
    >
      {isNotifiable(status) && intl.formatMessage(saveActionMessages[status])}
    </Toast>
  )
}
