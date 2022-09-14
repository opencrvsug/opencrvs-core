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
import {
  filterProcessingDeclarationsFromQuery,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import {
  updateRegistrarWorkqueue,
  updateWorkqueuePagination,
  selectWorkqueuePagination
} from '@client/workqueue'
import { Header } from '@client/components/interface/Header/Header'
import { messages as certificateMessage } from '@client/i18n/messages/views/certificate'
import {
  goToEvents,
  goToPage,
  goToPrintCertificate,
  goToHomeTab,
  getDefaultPerformanceLocationId
} from '@client/navigation'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import NotificationToast from '@client/views/OfficeHome/NotificationToast'
import { FloatingActionButton } from '@opencrvs/components/lib/buttons'
import { PlusTransparentWhite } from '@opencrvs/components/lib/icons'
import {
  PAGE_TRANSITIONS_ENTER_TIME,
  FIELD_AGENT_ROLES,
  NATL_ADMIN_ROLES,
  SYS_ADMIN_ROLES,
  PERFORMANCE_MANAGEMENT_ROLES
} from '@client/utils/constants'
import {
  FloatingNotification,
  NOTIFICATION_TYPE,
  Spinner
} from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, Redirect } from 'react-router'
import { SentForReview } from './sentForReview/SentForReview'
import { InProgress, SELECTOR_ID } from './inProgress/InProgress'
import { ReadyToPrint } from './readyToPrint/ReadyToPrint'
import { RequiresUpdate } from './requiresUpdate/RequiresUpdate'
import { ReadyForReview } from './readyForReview/ReadyForReview'
import { InExternalValidationTab } from './inExternalValidation/InExternalValidationTab'
import {
  Navigation,
  WORKQUEUE_TABS
} from '@client/components/interface/Navigation'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { PERFORMANCE_HOME } from '@client/navigation/routes'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { ArrayElement } from '@client/SubmissionController'

export const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
export const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
  margin-top: 100px;
`
const FABContainer = styled.div`
  position: fixed;
  right: 40px;
  bottom: 55px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const BodyContainer = styled.div`
  margin-left: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 250px;
    padding: 0px 24px;
  }
`

interface IDispatchProps {
  goToPage: typeof goToPage
  goToPrintCertificate: typeof goToPrintCertificate
  goToEvents: typeof goToEvents
  goToHomeTab: typeof goToHomeTab
  updateRegistrarWorkqueue: typeof updateRegistrarWorkqueue
  updateWorkqueuePagination: typeof updateWorkqueuePagination
}

type IBaseOfficeHomeStateProps = ReturnType<typeof mapStateToProps>

interface IOfficeHomeState {
  draftCurrentPage: number
  showCertificateToast: boolean
}

type IOfficeHomeProps = IntlShapeProps &
  IDispatchProps &
  IBaseOfficeHomeStateProps

const DECLARATION_WORKQUEUE_TABS = [
  WORKQUEUE_TABS.inProgress,
  WORKQUEUE_TABS.sentForApproval,
  WORKQUEUE_TABS.sentForReview,
  WORKQUEUE_TABS.readyForReview,
  WORKQUEUE_TABS.requiresUpdate,
  WORKQUEUE_TABS.readyToPrint,
  WORKQUEUE_TABS.externalValidation
] as const

const WORKQUEUE_TABS_PAGINATION = {
  [WORKQUEUE_TABS.inProgress]: 'inProgressTab',
  [WORKQUEUE_TABS.sentForApproval]: 'approvalTab',
  [WORKQUEUE_TABS.sentForReview]: 'reviewTab',
  [WORKQUEUE_TABS.readyForReview]: 'reviewTab',
  [WORKQUEUE_TABS.requiresUpdate]: 'rejectTab',
  [WORKQUEUE_TABS.readyToPrint]: 'printTab',
  [WORKQUEUE_TABS.externalValidation]: 'externalValidationTab'
} as const

function isDeclarationWorkqueueTab(
  tabId: string
): tabId is ArrayElement<typeof DECLARATION_WORKQUEUE_TABS> {
  return DECLARATION_WORKQUEUE_TABS.includes(
    tabId as ArrayElement<typeof DECLARATION_WORKQUEUE_TABS>
  )
}

class OfficeHomeView extends React.Component<
  IOfficeHomeProps,
  IOfficeHomeState
> {
  pageSize = 4
  showPaginated = false
  interval: any = undefined
  role = this.props.userDetails && this.props.userDetails.role
  isFieldAgent = this.role
    ? FIELD_AGENT_ROLES.includes(this.role)
      ? true
      : false
    : false

  constructor(props: IOfficeHomeProps) {
    super(props)
    this.state = {
      draftCurrentPage: 1,
      showCertificateToast: Boolean(
        this.props.declarations.filter(
          (item) => item.submissionStatus === SUBMISSION_STATUS.READY_TO_CERTIFY
        ).length
      )
    }
  }

  updateWorkqueue() {
    this.props.updateRegistrarWorkqueue(
      this.props.userDetails?.practitionerId,
      this.pageSize,
      this.isFieldAgent
    )
  }

  syncWorkqueue() {
    setTimeout(() => this.updateWorkqueue(), PAGE_TRANSITIONS_ENTER_TIME)
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.interval = setInterval(() => {
      this.updateWorkqueue()
    }, 300000)
  }

  syncPageId() {
    const { tabId, selectorId, pageId, inProgressTab, notificationTab } =
      this.props

    if (isDeclarationWorkqueueTab(tabId)) {
      if (tabId === WORKQUEUE_TABS.inProgress) {
        if (
          selectorId === SELECTOR_ID.fieldAgentDrafts &&
          pageId !== inProgressTab
        ) {
          this.props.updateWorkqueuePagination({ inProgressTab: pageId })
          this.syncWorkqueue()
        } else if (
          selectorId === SELECTOR_ID.hospitalDrafts &&
          pageId !== notificationTab
        ) {
          this.props.updateWorkqueuePagination({
            notificationTab: pageId
          })
          this.syncWorkqueue()
        } else if (
          selectorId === SELECTOR_ID.ownDrafts &&
          pageId !== this.state.draftCurrentPage
        ) {
          this.setState({ draftCurrentPage: pageId }, () => {
            this.syncWorkqueue()
          })
        }
      }
      if (pageId !== this.props[WORKQUEUE_TABS_PAGINATION[tabId]]) {
        this.props.updateWorkqueuePagination({
          [WORKQUEUE_TABS_PAGINATION[tabId]]: pageId
        })
        this.syncWorkqueue()
      }
    }
  }

  componentDidMount() {
    this.syncPageId()
    this.syncWorkqueue()
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  componentDidUpdate(prevProps: IOfficeHomeProps) {
    this.syncPageId()
    if (prevProps.tabId !== this.props.tabId) {
      this.updateWorkqueue()
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  userHasValidateScope() {
    return this.props.scope && this.props.scope.includes('validate')
  }

  subtractDeclarationsWithStatus(count: number, status: string[]) {
    const outboxCount = this.props.storedDeclarations.filter(
      (app) => app.submissionStatus && status.includes(app.submissionStatus)
    ).length
    return count - outboxCount
  }

  onPageChange = (newPageNumber: number) => {
    const { tabId, selectorId } = this.props

    if (isDeclarationWorkqueueTab(tabId)) {
      if (tabId === WORKQUEUE_TABS.inProgress) {
        if (Object.values(SELECTOR_ID).includes(selectorId)) {
          this.props.goToHomeTab(
            WORKQUEUE_TABS.inProgress,
            selectorId,
            newPageNumber
          )
        }
        return
      }
      this.props.goToHomeTab(tabId, '', newPageNumber)
    }
  }

  getData = (
    draftCurrentPage: number,
    healthSystemCurrentPage: number,
    progressCurrentPage: number,
    reviewCurrentPage: number,
    approvalCurrentPage: number,
    printCurrentPage: number,
    externalValidationCurrentPage: number,
    requireUpdateCurrentPage: number
  ) => {
    const {
      workqueue,
      tabId,
      drafts,
      selectorId,
      storedDeclarations,
      declarationsReadyToSend
    } = this.props
    const { loading, error, data } = workqueue
    const filteredData = filterProcessingDeclarationsFromQuery(
      data,
      storedDeclarations
    )

    return (
      <>
        {this.role &&
          (NATL_ADMIN_ROLES.includes(this.role) ||
            PERFORMANCE_MANAGEMENT_ROLES.includes(this.role)) && (
            <Redirect to={PERFORMANCE_HOME} />
          )}
        {this.role && SYS_ADMIN_ROLES.includes(this.role) && (
          <Redirect
            to={{
              pathname: PERFORMANCE_HOME,
              search: `?locationId=${getDefaultPerformanceLocationId(
                this.props.userDetails as IUserDetails
              )}`
            }}
          />
        )}
        <Navigation loadWorkqueueStatuses={false} />
        <BodyContainer>
          {tabId === WORKQUEUE_TABS.inProgress && (
            <InProgress
              drafts={drafts}
              selectorId={selectorId}
              isFieldAgent={this.isFieldAgent}
              queryData={{
                inProgressData: filteredData.inProgressTab,
                notificationData: filteredData.notificationTab
              }}
              paginationId={{
                draftId: draftCurrentPage,
                fieldAgentId: progressCurrentPage,
                healthSystemId: healthSystemCurrentPage
              }}
              pageSize={this.pageSize}
              onPageChange={this.onPageChange}
              loading={loading}
              error={error}
            />
          )}
          {!this.isFieldAgent ? (
            <>
              {tabId === WORKQUEUE_TABS.readyForReview && (
                <ReadyForReview
                  queryData={{
                    data: filteredData.reviewTab
                  }}
                  paginationId={reviewCurrentPage}
                  pageSize={this.pageSize}
                  onPageChange={this.onPageChange}
                  loading={loading}
                  error={error}
                />
              )}
              {tabId === WORKQUEUE_TABS.requiresUpdate && (
                <RequiresUpdate
                  queryData={{
                    data: filteredData.rejectTab
                  }}
                  paginationId={requireUpdateCurrentPage}
                  pageSize={this.pageSize}
                  onPageChange={this.onPageChange}
                  loading={loading}
                  error={error}
                />
              )}

              {tabId === WORKQUEUE_TABS.externalValidation &&
                window.config.EXTERNAL_VALIDATION_WORKQUEUE && (
                  <InExternalValidationTab
                    queryData={{
                      data: filteredData.externalValidationTab
                    }}
                    paginationId={externalValidationCurrentPage}
                    pageSize={this.pageSize}
                    onPageChange={this.onPageChange}
                    loading={loading}
                    error={error}
                  />
                )}
              {tabId === WORKQUEUE_TABS.sentForApproval && (
                <SentForReview
                  queryData={{
                    data: filteredData.approvalTab
                  }}
                  paginationId={approvalCurrentPage}
                  pageSize={this.pageSize}
                  onPageChange={this.onPageChange}
                  loading={loading}
                  error={error}
                />
              )}
              {tabId === WORKQUEUE_TABS.readyToPrint && (
                <ReadyToPrint
                  queryData={{
                    data: filteredData.printTab
                  }}
                  paginationId={printCurrentPage}
                  pageSize={this.pageSize}
                  onPageChange={this.onPageChange}
                  loading={loading}
                  error={error}
                />
              )}
            </>
          ) : (
            <>
              {tabId === WORKQUEUE_TABS.sentForReview && (
                <SentForReview
                  queryData={{
                    data: filteredData.reviewTab
                  }}
                  paginationId={reviewCurrentPage}
                  pageSize={this.pageSize}
                  onPageChange={this.onPageChange}
                  loading={loading}
                  error={error}
                />
              )}
              {tabId === WORKQUEUE_TABS.requiresUpdate && (
                <RequiresUpdate
                  queryData={{
                    data: filteredData.rejectTab
                  }}
                  paginationId={requireUpdateCurrentPage}
                  pageSize={this.pageSize}
                  onPageChange={this.onPageChange}
                  loading={loading}
                  error={error}
                />
              )}
            </>
          )}
        </BodyContainer>
      </>
    )
  }

  render() {
    const { intl } = this.props
    const { draftCurrentPage } = this.state

    const {
      notificationTab,
      inProgressTab,
      reviewTab,
      approvalTab,
      printTab,
      externalValidationTab,
      rejectTab
    } = this.props

    return (
      <>
        <Header
          title={intl.formatMessage(navigationMessages[this.props.tabId])}
        />
        {this.getData(
          draftCurrentPage,
          notificationTab,
          inProgressTab,
          reviewTab,
          approvalTab,
          printTab,
          externalValidationTab,
          rejectTab
        )}

        <FABContainer>
          <FloatingActionButton
            id="new_event_declaration"
            onClick={this.props.goToEvents}
            icon={() => <PlusTransparentWhite />}
          />
        </FABContainer>
        <NotificationToast showPaginated={this.showPaginated} />

        {this.state.showCertificateToast && (
          <FloatingNotification
            id="print-cert-notification"
            type={NOTIFICATION_TYPE.SUCCESS}
            show={this.state.showCertificateToast}
            callback={() => {
              this.setState({ showCertificateToast: false })
            }}
          >
            {intl.formatMessage(certificateMessage.toastMessage)}
          </FloatingNotification>
        )}
      </>
    )
  }
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{
    tabId: string
    selectorId?: string
    pageId?: string
  }>
) {
  const { match } = props
  const userDetails = getUserDetails(state)
  const userLocationId = (userDetails && getUserLocation(userDetails).id) || ''
  const scope = getScope(state)
  const pageId =
    (match.params.pageId && Number.parseInt(match.params.pageId)) ||
    (match.params.selectorId && Number.parseInt(match.params.selectorId)) ||
    1
  return {
    declarations: state.declarationsState.declarations,
    workqueue: state.workqueueState.workqueue,
    language: state.i18n.language,
    scope,
    userLocationId,
    tabId:
      (match && match.params && match.params.tabId) ||
      WORKQUEUE_TABS.inProgress,
    selectorId: (match && match.params && match.params.selectorId) || '',
    pageId,
    storedDeclarations: state.declarationsState.declarations,
    drafts:
      (
        state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            declaration.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )
      ).reverse() || [],
    declarationsReadyToSend: (
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            isDeclarationInReadyToReviewStatus(declaration.submissionStatus)
        )) ||
      []
    ).reverse(),
    userDetails,
    ...selectWorkqueuePagination(state)
  }
}

export const OfficeHome = connect(mapStateToProps, {
  goToEvents,
  goToPage,
  goToPrintCertificate,
  goToHomeTab,
  updateRegistrarWorkqueue,
  updateWorkqueuePagination
})(injectIntl(OfficeHomeView))
