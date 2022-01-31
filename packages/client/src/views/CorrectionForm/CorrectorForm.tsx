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
import { modifyApplication, IApplication } from '@client/applications'
import { getCorrectorSection } from '@client/forms/correction/corrector'
import { connect } from 'react-redux'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { goBack } from '@client/navigation'
import {
  Event,
  IFormSection,
  IFormSectionData,
  IRadioGroupWithNestedFieldsFormField
} from '@client/forms'
import { get, isEqual } from 'lodash'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { FormFieldGenerator } from '@client/components/form'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/correction'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { sectionHasError } from './utils'

type IProps = {
  application: IApplication
}

type IDispatchProps = {
  goBack: typeof goBack
  modifyApplication: typeof modifyApplication
}

type IFullProps = IProps & IDispatchProps & IntlShapeProps

function getGroupWithVisibleFields(
  section: IFormSection,
  application: IApplication
) {
  const event = application.event
  const group = section.groups[0]
  const field = group.fields[0] as IRadioGroupWithNestedFieldsFormField
  if (event === Event.BIRTH) {
    const applicationData = application.data

    const isMotherDeceased = isEqual(
      get(applicationData, 'primaryCaregiver.motherIsDeceased'),
      ['deceased']
    )
    const isFatherDeceased = isEqual(
      get(applicationData, 'primaryCaregiver.fatherIsDeceased'),
      ['deceased']
    )

    const motherDataExists =
      applicationData && applicationData.mother && !isMotherDeceased

    const fatherDataExists =
      applicationData &&
      applicationData.father &&
      applicationData.father.fathersDetailsExist &&
      !isFatherDeceased

    if (!fatherDataExists) {
      field.options = field.options.filter(
        (option) => option.value !== 'FATHER'
      )
    }

    if (!motherDataExists) {
      field.options = field.options.filter(
        (option) => option.value !== 'MOTHER'
      )
    }
  }

  return {
    ...group,
    fields: replaceInitialValues(
      group.fields,
      application.data[section.id] || {},
      application.data
    )
  }
}

function CorrectorFormComponent(props: IFullProps) {
  const { application, intl, goBack } = props

  const section = getCorrectorSection(application.event)

  const group = getGroupWithVisibleFields(section, application)

  const modifyApplication = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    application: IApplication
  ) => {
    props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        [activeSection.id]: {
          ...application.data[activeSection.id],
          ...sectionData
        }
      }
    })
  }
  const continueButtonHandler = () => {}

  const continueButton = (
    <PrimaryButton
      id="confirm_form"
      onClick={continueButtonHandler}
      disabled={sectionHasError(group, section, application)}
    >
      {intl.formatMessage(buttonMessages.continueButton)}
    </PrimaryButton>
  )

  return (
    <>
      <ActionPageLight
        id="corrector_form"
        title={intl.formatMessage(section.title)}
        hideBackground
        goBack={goBack}
      >
        <Content
          title={group.title && intl.formatMessage(group.title)}
          subtitle={
            application.event === Event.BIRTH
              ? intl.formatMessage(messages.birthCorrectionNote)
              : undefined
          }
          bottomActionButtons={[continueButton]}
        >
          <FormFieldGenerator
            id={group.id}
            onChange={(values) => {
              modifyApplication(values, section, application)
            }}
            setAllFieldsDirty={false}
            fields={group.fields}
            draftData={application.data}
          />
        </Content>
      </ActionPageLight>
    </>
  )
}

export const CorrectorForm = connect(undefined, {
  goBack,
  modifyApplication
})(injectIntl(CorrectorFormComponent))
