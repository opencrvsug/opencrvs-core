import {
  IFormField,
  Ii18nFormField,
  Ii18nSelectOption,
  ISelectOption
} from './'
import { InjectedIntl } from 'react-intl'

export const internationaliseFieldObject = (
  intl: InjectedIntl,
  field: IFormField
): Ii18nFormField => {
  return {
    ...field,
    label: intl.formatMessage(field.label),
    options: field.options
      ? field.options.map(opt => {
          return {
            ...opt,
            label: intl.formatMessage(opt.label)
          } as Ii18nSelectOption
        })
      : undefined
  } as Ii18nFormField
}

export const internationaliseOptions = (
  intl: InjectedIntl,
  options: ISelectOption[]
): Ii18nSelectOption[] => {
  return options.map(opt => {
    return {
      ...opt,
      label: intl.formatMessage(opt.label)
    } as Ii18nSelectOption
  })
}
