import { v4 as uuid } from 'uuid'
import {
  createPersonSection,
  createPersonEntryTemplate,
  createEncounterSection,
  createEncounter,
  createLocationResource,
  createObservationEntryTemplate,
  createSupportingDocumentsSection,
  createDocRefTemplate,
  createTaskRefTemplate,
  createRelatedPersonTemplate,
  createPaymentReconciliationTemplate,
  CERTIFICATE_DOCS_CODE,
  CERTIFICATE_DOCS_TITLE,
  CERTIFICATE_CONTEXT_KEY
} from 'src/features/fhir/templates'
import {
  ITemplatedBundle,
  ITemplatedComposition
} from '../registration/fhir-builders'
import fetch from 'node-fetch'
import { FHIR_URL } from 'src/constants'
import { IAuthHeader } from 'src/common-types'
import {
  FHIR_OBSERVATION_CATEGORY_URL,
  OPENCRVS_SPECIFICATION_URL
} from './constants'

export function findCompositionSectionInBundle(
  code: string,
  fhirBundle: ITemplatedBundle
) {
  return findCompositionSection(code, fhirBundle.entry[0].resource)
}

export function findCompositionSection(
  code: string,
  composition: ITemplatedComposition
) {
  return composition.section.find((section: fhir.CompositionSection) => {
    if (!section.code || !section.code.coding || !section.code.coding.some) {
      return false
    }
    return section.code.coding.some(coding => coding.code === code)
  })
}

export function selectOrCreatePersonResource(
  sectionCode: string,
  sectionTitle: string,
  fhirBundle: ITemplatedBundle
): fhir.Patient {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  let personEntry
  if (!section) {
    // create person
    const ref = uuid()
    const personSection = createPersonSection(ref, sectionCode, sectionTitle)
    const composition = fhirBundle.entry[0].resource
    composition.section.push(personSection)
    personEntry = createPersonEntryTemplate(ref)
    fhirBundle.entry.push(personEntry)
  } else {
    if (!section.entry || !section.entry[0]) {
      throw new Error('Expected person section ot have an entry')
    }
    const personSectionEntry = section.entry[0]
    personEntry = fhirBundle.entry.find(
      entry => entry.fullUrl === personSectionEntry.reference
    )
  }

  if (!personEntry) {
    throw new Error(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  }

  return personEntry.resource as fhir.Patient
}

export function selectOrCreateEncounterResource(
  sectionCode: string,
  fhirBundle: ITemplatedBundle
): fhir.Encounter {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)
  let encounterEntry

  if (!section) {
    const ref = uuid()
    let encounterSection
    if (sectionCode === 'birth-encounter') {
      encounterSection = createEncounterSection(ref)
    } else {
      throw new Error(`Unknown section code ${sectionCode}`)
    }
    fhirBundle.entry[0].resource.section.push(encounterSection)
    encounterEntry = createEncounter(ref)
    fhirBundle.entry.push(encounterEntry)
  } else {
    if (!section.entry || !section.entry[0]) {
      throw new Error('Expected encounter section to have an entry')
    }
    const encounterSectionEntry = section.entry[0]
    encounterEntry = fhirBundle.entry.find(
      entry => entry.fullUrl === encounterSectionEntry.reference
    )
  }

  if (!encounterEntry) {
    throw new Error(
      'Encounter referenced from composition section not found in FHIR bundle'
    )
  }

  return encounterEntry.resource as fhir.Encounter
}

export function selectOrCreateObservationResource(
  sectionCode: string,
  categoryCode: string,
  categoryDescription: string,
  observationCode: string,
  observationDescription: string,
  fhirBundle: ITemplatedBundle,
  context: any
): fhir.Observation {
  let observation = fhirBundle.entry.find(entry => {
    if (
      !entry ||
      !entry.resource ||
      entry.resource.resourceType !== 'Observation'
    ) {
      return false
    }
    const observationEntry = entry.resource as fhir.Observation
    const obCoding =
      observationEntry.code &&
      observationEntry.code.coding &&
      observationEntry.code.coding.find(
        obCode => obCode.code === observationCode
      )
    if (obCoding) {
      return true
    }
    return false
  })

  if (observation) {
    return observation.resource as fhir.Observation
  }
  /* Existing obseration not found for given type */
  observation = createObservationResource(sectionCode, fhirBundle, context)
  return updateObservationInfo(
    observation as fhir.Observation,
    categoryCode,
    categoryDescription,
    observationCode,
    observationDescription
  )
}

export function updateObservationInfo(
  observation: fhir.Observation,
  categoryCode: string,
  categoryDescription: string,
  observationCode: string,
  observationDescription: string
): fhir.Observation {
  const categoryCoding = {
    coding: [
      {
        system: FHIR_OBSERVATION_CATEGORY_URL,
        code: categoryCode,
        display: categoryDescription
      }
    ]
  }

  if (!observation.category) {
    observation.category = []
  }
  observation.category.push(categoryCoding)

  const coding = [
    {
      system: 'http://loinc.org',
      code: observationCode,
      display: observationDescription
    }
  ]
  setArrayPropInResourceObject(observation, 'code', coding, 'coding')
  return observation
}

export function createObservationResource(
  sectionCode: string,
  fhirBundle: ITemplatedBundle,
  context: any
): fhir.Observation {
  const encounter = selectOrCreateEncounterResource(sectionCode, fhirBundle)
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  const ref = uuid()
  const observationEntry = createObservationEntryTemplate(ref)

  if (!section || !section.entry || !section.entry[0]) {
    throw new Error('Expected encounter section to exist and have an entry')
  }
  const encounterSectionEntry = section.entry[0]
  const encounterEntry = fhirBundle.entry.find(
    entry => entry.fullUrl === encounterSectionEntry.reference
  )
  if (encounterEntry && encounter) {
    observationEntry.resource.context = {
      reference: `${encounterEntry.fullUrl}`
    }
  }
  fhirBundle.entry.push(observationEntry)

  return observationEntry.resource
}

export function selectOrCreateLocationRefResource(
  sectionCode: string,
  fhirBundle: ITemplatedBundle,
  context: any
): fhir.Location {
  let locationEntry

  const encounter = selectOrCreateEncounterResource(sectionCode, fhirBundle)

  if (!encounter.location) {
    // create location
    const locationRef = uuid()
    locationEntry = createLocationResource(locationRef)
    fhirBundle.entry.push(locationEntry)
    encounter.location = []
    encounter.location.push({
      location: { reference: `urn:uuid:${locationRef}` }
    })
  } else {
    if (!encounter.location || !encounter.location[0]) {
      throw new Error('Encounter is expected to have a location property')
    }
    const locationElement = encounter.location[0]
    locationEntry = fhirBundle.entry.find(
      entry => entry.fullUrl === locationElement.location.reference
    )
  }

  if (!locationEntry) {
    throw new Error(
      'Location referenced from encounter section not found in FHIR bundle'
    )
  }

  return locationEntry.resource as fhir.Location
}

export function selectOrCreateDocRefResource(
  sectionCode: string,
  sectionTitle: string,
  fhirBundle: ITemplatedBundle,
  context: any,
  indexKey: string
): fhir.DocumentReference {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  let docRef
  if (!section) {
    const ref = uuid()
    const docSection = createSupportingDocumentsSection(
      sectionCode,
      sectionTitle
    )
    docSection.entry[context._index[indexKey]] = {
      reference: `urn:uuid:${ref}`
    }
    fhirBundle.entry[0].resource.section.push(docSection)
    docRef = createDocRefTemplate(ref)
    fhirBundle.entry.push(docRef)
  } else {
    if (!section.entry) {
      throw new Error(
        'Expected supporting documents section to have an entry property'
      )
    }
    const docSectionEntry = section.entry[context._index[indexKey]]
    if (!docSectionEntry) {
      const ref = uuid()
      section.entry[context._index[indexKey]] = {
        reference: `urn:uuid:${ref}`
      }
      docRef = createDocRefTemplate(ref)
      fhirBundle.entry.push(docRef)
    } else {
      docRef = fhirBundle.entry.find(
        entry => entry.fullUrl === docSectionEntry.reference
      )
      if (!docRef) {
        const ref = uuid()
        docRef = createDocRefTemplate(ref)
        fhirBundle.entry.push(docRef)
        section.entry[context._index[indexKey]] = {
          reference: `urn:uuid:${ref}`
        }
      }
    }
  }

  return docRef.resource as fhir.DocumentReference
}

export function selectOrCreateCertificateDocRefResource(
  fhirBundle: ITemplatedBundle,
  context: any,
  eventType: string
): fhir.DocumentReference {
  const docRef = selectOrCreateDocRefResource(
    CERTIFICATE_DOCS_CODE,
    CERTIFICATE_DOCS_TITLE,
    fhirBundle,
    context,
    CERTIFICATE_CONTEXT_KEY
  )
  if (!docRef.type) {
    docRef.type = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}certificate-type`,
          code: eventType
        }
      ]
    }
  }
  return docRef
}

export function selectOrCreateRelatedPersonResource(
  fhirBundle: ITemplatedBundle,
  context: any,
  eventType: string
): fhir.RelatedPerson {
  const docRef = selectOrCreateCertificateDocRefResource(
    fhirBundle,
    context,
    eventType
  )
  if (!docRef.extension) {
    docRef.extension = []
  }
  const relatedPersonExt = docRef.extension.find(
    extention =>
      extention.url === `${OPENCRVS_SPECIFICATION_URL}extension/collector`
  )
  if (!relatedPersonExt) {
    const relatedPersonEntry = createRelatedPersonTemplate(uuid())
    fhirBundle.entry.push(relatedPersonEntry)
    docRef.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/collector`,
      valueReference: {
        reference: relatedPersonEntry.fullUrl
      }
    })
    return relatedPersonEntry.resource
  } else {
    const relatedPersonEntry = fhirBundle.entry.find(entry => {
      if (!relatedPersonExt.valueReference) {
        return false
      }
      return entry.fullUrl === relatedPersonExt.valueReference.reference
    })
    if (!relatedPersonEntry) {
      throw new Error('No related person entry found on bundle')
    }
    return relatedPersonEntry.resource as fhir.RelatedPerson
  }
}

export function selectOrCreateCollectorPersonResource(
  fhirBundle: ITemplatedBundle,
  context: any,
  eventType: string
): fhir.Patient {
  const relatedPersonResource = selectOrCreateRelatedPersonResource(
    fhirBundle,
    context,
    eventType
  )
  const patientRef =
    relatedPersonResource.patient && relatedPersonResource.patient.reference
  if (!patientRef) {
    const personEntry = createPersonEntryTemplate(uuid())
    fhirBundle.entry.push(personEntry)
    relatedPersonResource.patient = {
      reference: personEntry.fullUrl
    }
    return personEntry.resource as fhir.Patient
  } else {
    const personEntry = fhirBundle.entry.find(
      entry => entry.fullUrl === patientRef
    )
    if (!personEntry) {
      throw new Error(
        'No related collector person entry not found on fhir bundle'
      )
    }
    return personEntry.resource as fhir.Patient
  }
}

export async function setCertificateCollectorReference(
  sectionCode: string,
  relatedPerson: fhir.RelatedPerson,
  fhirBundle: ITemplatedBundle,
  context: any
) {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)
  if (section && section.entry) {
    const personSectionEntry = section.entry[0]
    const personEntry = fhirBundle.entry.find(
      entry => entry.fullUrl === personSectionEntry.reference
    )
    if (!personEntry) {
      throw new Error('Expected person entry not found on the bundle')
    }
    relatedPerson.patient = {
      reference: personEntry.fullUrl
    }
  } else {
    const composition = await fetchFHIR(
      `/Composition/${fhirBundle.entry[0].resource.id}`,
      context.authHeader
    )

    const sec = findCompositionSection(sectionCode, composition)
    if (sec && sec.entry) {
      relatedPerson.patient = {
        reference: sec.entry[0].reference
      }
    }
  }
}

export function selectOrCreatePaymentReconciliationResource(
  fhirBundle: ITemplatedBundle,
  context: any,
  eventType: string
): fhir.PaymentReconciliation {
  const docRef = selectOrCreateCertificateDocRefResource(
    fhirBundle,
    context,
    eventType
  )
  if (!docRef.extension) {
    docRef.extension = []
  }
  const paymentExt = docRef.extension.find(
    extention =>
      extention.url === `${OPENCRVS_SPECIFICATION_URL}extension/payment`
  )
  if (!paymentExt) {
    const paymentEntry = createPaymentReconciliationTemplate(uuid())
    fhirBundle.entry.push(paymentEntry)
    docRef.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/payment`,
      valueReference: {
        reference: paymentEntry.fullUrl
      }
    })
    return paymentEntry.resource
  } else {
    const paymentEntry = fhirBundle.entry.find(entry => {
      if (!paymentExt.valueReference) {
        return false
      }
      return entry.fullUrl === paymentExt.valueReference.reference
    })
    if (!paymentEntry) {
      throw new Error('No related payment entry found on bundle')
    }
    return paymentEntry.resource as fhir.PaymentReconciliation
  }
}

export function selectOrCreateTaskRefResource(
  fhirBundle: ITemplatedBundle,
  context: any
): fhir.Task {
  let taskEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find(entry => {
      if (entry.resource && entry.resource.resourceType === 'Task') {
        return true
      }
      return false
    })
  if (!taskEntry) {
    taskEntry = createTaskRefTemplate(uuid())
    const taskResource = taskEntry.resource as fhir.Task
    if (!taskResource.focus) {
      taskResource.focus = { reference: '' }
    }
    taskResource.focus.reference = fhirBundle.entry[0].fullUrl
    fhirBundle.entry.push(taskEntry)
  }
  return taskEntry.resource as fhir.Task
}
export function setObjectPropInResourceArray(
  resource: fhir.Resource,
  label: string,
  value: string | string[],
  propName: string,
  context: any
) {
  if (!resource[label]) {
    resource[label] = []
  }
  if (!resource[label][context._index[label]]) {
    resource[label][context._index[label]] = {}
  }
  resource[label][context._index[label]][propName] = value
}

export function setArrayPropInResourceObject(
  resource: fhir.Resource,
  label: string,
  value: Array<{}>,
  propName: string
) {
  if (!resource[label]) {
    resource[label] = {}
  }
  resource[label][propName] = value
}

export function findExtension(
  url: string,
  extensions: fhir.Extension[]
): fhir.Extension | undefined {
  const extension = extensions.find((obj: fhir.Extension) => {
    return obj.url === url
  })
  return extension
}

export function getMaritalStatusCode(fieldValue: string) {
  switch (fieldValue) {
    case 'SINGLE':
      return 'S'
    case 'WIDOWED':
      return 'W'
    case 'DIVORCED':
      return 'D'
    case 'NOT_STATED':
      return 'UNK'
    case 'MARRIED':
      return 'M'
    default:
      return 'UNK'
  }
}

export const fetchFHIR = (
  suffix: string,
  authHeader: IAuthHeader,
  method: string = 'GET',
  body: string | undefined = undefined
) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      ...authHeader
    },
    body
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export async function getTrackingIdFromResponse(
  resBody: fhir.Bundle,
  authHeader: IAuthHeader
) {
  const compositionBundle = await fetchFHIR(
    `/Composition/${getIDFromResponse(resBody)}`,
    authHeader
  )
  if (!compositionBundle || !compositionBundle.identifier) {
    throw new Error(
      'getTrackingIdFromResponse: Invalid composition or composition has no identifier'
    )
  }
  return compositionBundle.identifier.value
}

export async function getBRNFromResponse(
  resBody: fhir.Bundle,
  authHeader: IAuthHeader
) {
  let path
  if (isTaskResponse(resBody)) {
    path = `/Task/${getIDFromResponse(resBody)}`
  } else {
    path = `/Task?focus=Composition/${getIDFromResponse(resBody)}`
  }
  const taskBundle = await fetchFHIR(path, authHeader)

  let taskResource
  if (taskBundle && taskBundle.entry && taskBundle.entry[0].resource) {
    taskResource = taskBundle.entry[0].resource
  } else if (taskBundle.resourceType === 'Task') {
    taskResource = taskBundle
  } else {
    throw new Error('getBRNFromResponse: Invalid task found')
  }
  const brnIdentifier =
    taskResource.identifier &&
    taskResource.identifier.find(
      (identifier: fhir.Identifier) =>
        identifier.system ===
        `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
    )
  if (!brnIdentifier || !brnIdentifier.value) {
    throw new Error('getBRNFromResponse: Task does not have any brn identifier')
  }
  return brnIdentifier.value
}

export function getIDFromResponse(resBody: fhir.Bundle): string {
  if (
    !resBody ||
    !resBody.entry ||
    !resBody.entry[0] ||
    !resBody.entry[0].response ||
    !resBody.entry[0].response.location
  ) {
    throw new Error(`FHIR did not send a valid response`)
  }
  // return the Composition's id
  return resBody.entry[0].response.location.split('/')[3]
}

export function isTaskResponse(resBody: fhir.Bundle): boolean {
  if (
    !resBody ||
    !resBody.entry ||
    !resBody.entry[0] ||
    !resBody.entry[0].response ||
    !resBody.entry[0].response.location
  ) {
    throw new Error(`FHIR did not send a valid response`)
  }
  return resBody.entry[0].response.location.indexOf('Task') > -1
}
