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
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import * as React from 'react'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect } from 'react-redux'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import {
  DataSection,
  FloatingNotification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { messages } from '@client/i18n/messages/views/config'
import moment from 'moment'
import { buttonMessages } from '@client/i18n/messages'
import { DynamicModal } from '@client/views/SysAdmin/Config/DynamicModal'
import { EMPTY_STRING } from '@client/utils/constants'

type Props = IntlShapeProps & {
  userDetails: IUserDetails | null
  offlineResources: IOfflineData
  offlineCountryConfiguration: IOfflineData
}
interface State {
  activeTabId: string
  changeModalName: string
  showNotification: boolean
  notificationStatus: NOTIFICATION_TYPE
  notificationMessages: string
}

export enum TabId {
  GENERAL = 'general',
  BIRTH = 'birth',
  DEATH = 'death'
}

export enum GeneralActionId {
  APPLICATION_NAME = 'changeAppName',
  GOVT_LOGO = 'changeGovtLogo',
  USER_TIMEOUT = 'changeUsrTimeOut',
  Currency = 'changeCurrency',
  PHONE_NUMBER = 'changePhnNum',
  LOG_ROCKET = 'changeLogrocket',
  SENTRY = 'changeSentry'
}

const millisecondsToMinutes = (ms: number): string => {
  const duration = moment.duration(ms, 'milliseconds')
  const minutes = Math.floor(duration.asMinutes())
  return `${minutes} minutes`
}

function GeneralTabContent({
  offlineCountryConfiguration,
  intl,
  callBack
}: {
  offlineCountryConfiguration: IOfflineData
  intl: IntlShape
  callBack: (modalName: string) => void
}) {
  return (
    <DataSection
      title={''}
      items={[
        {
          label: intl.formatMessage(messages.applicationNameLabel),
          value: offlineCountryConfiguration.config.APPLICATION_NAME,
          action: {
            id: GeneralActionId.APPLICATION_NAME,
            label: intl.formatMessage(buttonMessages.change),
            handler: () => {
              callBack(GeneralActionId.APPLICATION_NAME)
            }
          }
        },
        {
          label: intl.formatMessage(messages.govermentLogoLabel),
          value: (
            <img
              src={offlineCountryConfiguration.assets.logo}
              width={
                offlineCountryConfiguration.config.COUNTRY_LOGO_RENDER_HEIGHT
              }
              height={
                offlineCountryConfiguration.config.COUNTRY_LOGO_RENDER_WIDTH
              }
            />
          ),
          action: {
            id: GeneralActionId.GOVT_LOGO,
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.currencyLable),
          value: '',
          action: {
            id: GeneralActionId.Currency,
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.phoneNumberLabel),
          value:
            offlineCountryConfiguration.config.PHONE_NUMBER_PATTERN.pattern,
          action: {
            id: GeneralActionId.PHONE_NUMBER,
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.uniqueIdentificationNumberLabel),
          value: offlineCountryConfiguration.config.NID_NUMBER_PATTERN.pattern,
          action: {
            id: 'btnChangeUIN',
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        }
      ]}
    />
  )
}

function BirthTabContent({
  offlineCountryConfiguration,
  intl
}: {
  offlineCountryConfiguration: IOfflineData
  intl: IntlShape
}) {
  return (
    <DataSection
      title={''}
      items={[
        {
          label: intl.formatMessage(messages.legallySpecifiedLabel),
          value: 'Within 30 days',
          action: {
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.lateRegistrationLabel),
          value: 'Between 30 days and 365 days',
          action: {
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.delayedRegistrationLabel),
          value: 'After 365 days',
          action: {
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.withinLegallySpecifiedTimeLabel),
          value: '',
          action: {
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.lateRegistrationLabel),
          value: '',
          action: {
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.delayedRegistrationLabel),
          value: '',
          action: {
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        }
      ]}
    />
  )
}

function DeathTabContent({
  offlineCountryConfiguration,
  intl
}: {
  offlineCountryConfiguration: IOfflineData
  intl: IntlShape
}) {
  return (
    <DataSection
      title={''}
      items={[
        {
          label: intl.formatMessage(messages.legallySpecifiedLabel),
          value: 'Within 30 days',
          action: {
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.delayedRegistrationLabel),
          value: 'After 30 days',
          action: {
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.lateRegistrationLabel),
          value: '',
          action: {
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        },
        {
          label: intl.formatMessage(messages.delayedRegistrationLabel),
          value: '',
          action: {
            label: intl.formatMessage(buttonMessages.change),
            disabled: true
          }
        }
      ]}
    />
  )
}

class ApplicationConfigComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activeTabId: TabId.GENERAL,
      changeModalName: EMPTY_STRING,
      showNotification: false,
      notificationStatus: NOTIFICATION_TYPE.IN_PROGRESS,
      notificationMessages: EMPTY_STRING
    }
  }

  changeValue = (notificationStatus: NOTIFICATION_TYPE, messages: string) => {
    this.hideModal()
    this.setState({
      showNotification: true,
      notificationStatus: notificationStatus,
      notificationMessages: messages
    })
  }

  changeTab(id: string) {
    this.setState({ activeTabId: id })
  }

  hideModal = () => {
    this.setState({ changeModalName: '' })
  }

  showModal = () => {
    return !!!this.state.changeModalName ? false : true
  }

  render() {
    const { intl, offlineCountryConfiguration } = this.props

    return (
      <SysAdminContentWrapper isCertificatesConfigPage={true}>
        <Content
          title={intl.formatMessage(messages.applicationTitle)}
          titleColor={'copy'}
          tabs={{
            sections: [
              {
                id: 'general',
                title: intl.formatMessage(messages.generalTabTitle)
              },
              {
                id: 'birth',
                title: intl.formatMessage(messages.birthTabTitle)
              },
              {
                id: 'death',
                title: intl.formatMessage(messages.deathTabTitle)
              }
            ],
            activeTabId: this.state.activeTabId,
            onTabClick: (id: string) => this.changeTab(id)
          }}
        >
          {this.state.activeTabId && this.state.activeTabId === TabId.GENERAL && (
            <GeneralTabContent
              offlineCountryConfiguration={offlineCountryConfiguration}
              intl={intl}
              callBack={(modalName: string) =>
                this.setState({
                  changeModalName: modalName
                })
              }
            />
          )}
          {this.state.activeTabId && this.state.activeTabId === TabId.BIRTH && (
            <BirthTabContent
              offlineCountryConfiguration={offlineCountryConfiguration}
              intl={intl}
            />
          )}
          {this.state.activeTabId && this.state.activeTabId === TabId.DEATH && (
            <DeathTabContent
              offlineCountryConfiguration={offlineCountryConfiguration}
              intl={intl}
            />
          )}
        </Content>
        {this.showModal() && (
          <DynamicModal
            hideModal={this.hideModal}
            changeModalName={this.state.changeModalName}
            showNotification={this.state.showNotification}
            valueChanged={this.changeValue}
          />
        )}
        <FloatingNotification
          id="print-cert-notification"
          type={this.state.notificationStatus}
          show={this.state.showNotification}
          callback={() => {
            this.setState({ showNotification: false })
          }}
        >
          {this.state.notificationMessages}
        </FloatingNotification>
      </SysAdminContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineResources: getOfflineData(state),
    userDetails: getUserDetails(state),
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const ApplicationConfig = connect(mapStateToProps)(
  injectIntl(ApplicationConfigComponent)
)
