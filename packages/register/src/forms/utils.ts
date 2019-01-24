import {
  IFormField,
  Ii18nFormField,
  ISelectOption,
  IConditionals,
  IFormSectionData,
  IConditional,
  SELECT_WITH_OPTIONS,
  RADIO_GROUP,
  CHECKBOX_GROUP,
  IRadioOption,
  ICheckboxOption,
  ISelectFormFieldWithDynamicOptions,
  INFORMATIVE_RADIO_GROUP,
  PARAGRAPH
} from './'
import { InjectedIntl } from 'react-intl'
import { getValidationErrorsForForm } from 'src/forms/validation'
import {
  IOfflineDataState,
  OFFLINE_LOCATIONS_KEY,
  OFFLINE_FACILITIES_KEY,
  ILocation
} from 'src/offline/reducer'
import { config } from 'src/config'

export const internationaliseFieldObject = (
  intl: InjectedIntl,
  field: IFormField
): Ii18nFormField => {
  const base = {
    ...field,
    label:
      field.type === PARAGRAPH ? field.label : intl.formatMessage(field.label),
    description: field.description && intl.formatMessage(field.description)
  }

  if (
    base.type === SELECT_WITH_OPTIONS ||
    base.type === RADIO_GROUP ||
    base.type === INFORMATIVE_RADIO_GROUP ||
    base.type === CHECKBOX_GROUP
  ) {
    ;(base as any).options = internationaliseOptions(intl, base.options)
  }
  return base as Ii18nFormField
}

export const internationaliseOptions = (
  intl: InjectedIntl,
  options: Array<ISelectOption | IRadioOption | ICheckboxOption>
) => {
  return options.map(opt => {
    return {
      ...opt,
      label: intl.formatMessage(opt.label)
    }
  })
}

export const generateOptions = (
  options: ILocation[],
  optionType: string
): ISelectOption[] => {
  const optionsArray: ISelectOption[] = []
  options.forEach((option: ILocation, index: number) => {
    optionsArray.push({
      value: option.id,
      label: {
        id: `${optionType}.${option.id}`,
        defaultMessage: option.name,
        description: `${optionType} select item for ${option.id}`
      }
    })
  })
  return optionsArray
}

export const getFieldOptions = (
  field: ISelectFormFieldWithDynamicOptions,
  values: IFormSectionData,
  resources?: IOfflineDataState
) => {
  const dependencyVal = values[field.dynamicOptions.dependency] as string
  if (!dependencyVal) {
    return []
  }
  if (resources && field.dynamicOptions.resource === OFFLINE_LOCATIONS_KEY) {
    const locations = resources[OFFLINE_LOCATIONS_KEY] as ILocation[]
    let partOf: string
    if (dependencyVal === config.COUNTRY.toUpperCase()) {
      partOf = 'Location/0'
    } else {
      partOf = `Location/${dependencyVal}`
    }
    return generateOptions(
      locations.filter((location: ILocation) => {
        return location.partOf === partOf
      }),
      'location'
    )
  } else if (
    resources &&
    field.dynamicOptions.resource === OFFLINE_FACILITIES_KEY
  ) {
    const facilities = resources[OFFLINE_FACILITIES_KEY] as ILocation[]
    return generateOptions(facilities, 'facility')
  } else {
    let options
    if (!field.dynamicOptions.options) {
      throw new Error(
        `Dependency '${dependencyVal}' has illegal value, the value should have an entry in the dynamic options object.`
      )
    } else {
      options = field.dynamicOptions.options[dependencyVal]
    }
    return options
  }
}

export const getConditionalActionsForField = (
  field: IFormField,
  values: IFormSectionData,
  offlineResources?: IOfflineDataState
): string[] => {
  if (!field.conditionals) {
    return []
  }
  return field.conditionals
    .filter(conditional =>
      /* tslint:disable-next-line: no-eval */
      eval(conditional.expression)
    )
    .map((conditional: IConditional) => conditional.action)
}

export const hasFormError = (
  fields: IFormField[],
  values: IFormSectionData
): boolean => {
  const errors = getValidationErrorsForForm(fields, values)

  const fieldListWithErrors = Object.keys(errors).filter(key => {
    return errors[key] && errors[key].length > 0
  })
  return fieldListWithErrors && fieldListWithErrors.length > 0
}

export const conditionals: IConditionals = {
  fathersDetailsExist: {
    action: 'hide',
    expression: '!values.fathersDetailsExist'
  },
  permanentAddressSameAsMother: {
    action: 'hide',
    expression: 'values.permanentAddressSameAsMother'
  },
  addressSameAsMother: {
    action: 'hide',
    expression: 'values.addressSameAsMother'
  },
  currentAddressSameAsPermanent: {
    action: 'hide',
    expression: 'values.currentAddressSameAsPermanent'
  },
  countryPermanent: {
    action: 'hide',
    expression: '!values.countryPermanent'
  },
  statePermanent: {
    action: 'hide',
    expression: '!values.statePermanent'
  },
  districtPermanent: {
    action: 'hide',
    expression: '!values.districtPermanent'
  },
  addressLine4Permanent: {
    action: 'hide',
    expression: '!values.addressLine4Permanent'
  },
  addressLine3Permanent: {
    action: 'hide',
    expression: '!values.addressLine3Permanent'
  },
  country: {
    action: 'hide',
    expression: '!values.country'
  },
  state: {
    action: 'hide',
    expression: '!values.state'
  },
  district: {
    action: 'hide',
    expression: '!values.district'
  },
  addressLine4: {
    action: 'hide',
    expression: '!values.addressLine4'
  },
  addressLine3: {
    action: 'hide',
    expression: '!values.addressLine3'
  },
  uploadDocForWhom: {
    action: 'hide',
    expression: '!values.uploadDocForWhom'
  },
  motherCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="MOTHER"'
  },
  fatherCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="FATHER"'
  },
  otherPersonCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="OTHER"'
  },
  certificateCollectorNotVerified: {
    action: 'hide',
    expression:
      '!(values.personCollectingCertificate=="MOTHER" && values.motherDetails===false) && !(values.personCollectingCertificate=="FATHER" && values.fatherDetails===false) && !(values.personCollectingCertificate =="OTHER" && values.otherPersonSignedAffidavit===false)'
  },
  placeOfBirthHospital: {
    action: 'hide',
    expression:
      'values.placeOfBirth!="HOSPITAL" && values.placeOfBirth!="OTHER_HEALTH_INSTITUTION"'
  },
  otherPlaceOfBirth: {
    action: 'hide',
    expression:
      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
  }
}
