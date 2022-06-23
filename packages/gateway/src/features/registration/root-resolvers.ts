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
import { IAuthHeader } from '@gateway/common-types'
import {
  EVENT_TYPE,
  DOWNLOADED_EXTENSION_URL,
  REINSTATED_EXTENSION_URL,
  ASSIGNED_EXTENSION_URL
} from '@gateway/features/fhir/constants'
import {
  fetchFHIR,
  getDeclarationIdsFromResponse,
  getIDFromResponse,
  getRegistrationIdsFromResponse,
  removeDuplicatesFromComposition,
  getRegistrationIds,
  getDeclarationIds,
  getStatusFromTask
} from '@gateway/features/fhir/utils'
import {
  buildFHIRBundle,
  updateFHIRTaskBundle,
  addOrUpdateExtension,
  ITaskBundle,
  checkUserAssignment,
  removeExtensionsFromTaskResourse
} from '@gateway/features/registration/fhir-builders'
import { hasScope } from '@gateway/features/user/utils'
import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLRegStatus,
  GQLResolver,
  GQLStatusWiseRegistrationCount
} from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { COUNTRY_CONFIG_URL, FHIR_URL, SEARCH_URL } from '@gateway/constants'
import { updateTaskTemplate } from '@gateway/features/fhir/templates'
import { UnassignError } from '@gateway/utils/unassignError'
import { UserInputError } from 'apollo-server-hapi'
import {
  validateBirthDeclarationAttachments,
  validateDeathDeclarationAttachments
} from '@gateway/utils/validators'

export const resolvers: GQLResolver = {
  Query: {
    async searchBirthRegistrations(_, { fromDate, toDate }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('User does not have a sysadmin scope')
        )
      }
      const res = await fetchFHIR(
        `/Composition?date=gt${fromDate.toISOString()}&date=lte${toDate.toISOString()}&_count=0`,
        authHeader
      )

      const compositions: fhir.Composition[] = res.entry.map(
        ({ resource }: { resource: fhir.Composition }) => resource
      )

      return compositions.filter(({ type }) =>
        type.coding?.some(({ code }) => code === 'birth-declaration')
      )
    },
    async searchDeathRegistrations(_, { fromDate, toDate }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('User does not have a sysadmin scope')
        )
      }
      const res = await fetchFHIR(
        `/Composition?date=gt${fromDate.toISOString()}&date=lte${toDate.toISOString()}&_count=0`,
        authHeader
      )

      const compositions: fhir.Composition[] = res.entry.map(
        ({ resource }: { resource: fhir.Composition }) => resource
      )

      return compositions.filter(({ type }) =>
        type.coding?.some(({ code }) => code === 'death-declaration')
      )
    },
    async fetchBirthRegistration(_, { id }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        return await markRecordAsDownloadedAndAssigned(id, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchDeathRegistration(_, { id }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        return await markRecordAsDownloadedAndAssigned(id, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async queryRegistrationByIdentifier(_, { identifier }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const taskBundle = await fetchFHIR(
          `/Task?identifier=${identifier}`,
          authHeader
        )

        if (!taskBundle || !taskBundle.entry || !taskBundle.entry[0]) {
          throw new Error(`Task does not exist for identifer ${identifier}`)
        }
        const task = taskBundle.entry[0].resource as fhir.Task

        if (!task.focus || !task.focus.reference) {
          throw new Error(`Composition reference not found`)
        }

        return await fetchFHIR(`/${task.focus.reference}`, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchRegistration(_, { id }, authHeader) {
      return await fetchFHIR(`/Composition/${id}`, authHeader)
    },
    async queryPersonByIdentifier(_, { identifier }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        const personBundle = await fetchFHIR(
          `/Patient?identifier=${identifier}`,
          authHeader
        )
        if (!personBundle || !personBundle.entry || !personBundle.entry[0]) {
          throw new Error(`Person does not exist for identifer ${identifier}`)
        }
        const person = personBundle.entry[0].resource as fhir.Person

        return person
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
        )
      }
    },
    async queryPersonByNidIdentifier(_, { dob, nid, country }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        const response = await fetch(
          `${COUNTRY_CONFIG_URL}/verify/nid/${country}`,
          {
            method: 'POST',
            body: JSON.stringify({ dob, nid }),
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        ).then((data) => data.json())

        if (!response.operationResult.success) {
          throw new Error(response.operationResult.error.errorMessage)
        } else {
          return response.data
        }
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
        )
      }
    },
    async fetchRegistrationCountByStatus(
      _,
      { locationId, status, event },
      authHeader
    ) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare') ||
        hasScope(authHeader, 'sysadmin') ||
        hasScope(authHeader, 'performance')
      ) {
        const payload: {
          declarationLocationHirarchyId?: string
          status: string[]
          event?: string
        } = {
          declarationLocationHirarchyId: locationId,
          status: status as string[],
          event
        }

        const results: GQLStatusWiseRegistrationCount[] = await fetch(
          `${SEARCH_URL}statusWiseRegistrationCount`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        ).then((data) => data.json())

        let total = 0
        if (results && results.length > 0) {
          total = results.reduce(
            (totalCount, statusCount) => ({
              count: totalCount.count + statusCount.count
            }),
            {
              count: total
            }
          ).count
        }
        return {
          results,
          total
        }
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
        )
      }
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }, authHeader) {
      try {
        await validateBirthDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      return createEventRegistration(details, authHeader, EVENT_TYPE.BIRTH)
    },
    async createDeathRegistration(_, { details }, authHeader) {
      try {
        await validateDeathDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      return createEventRegistration(details, authHeader, EVENT_TYPE.DEATH)
    },
    async updateBirthRegistration(_, { details }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const doc = await buildFHIRBundle(details, EVENT_TYPE.BIRTH, authHeader)

        const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
        // return composition-id
        return getIDFromResponse(res)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async markBirthAsValidated(_, { id, details }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        return await Promise.reject(
          new Error('User does not have a validate scope')
        )
      } else {
        return await markEventAsValidated(
          id,
          authHeader,
          EVENT_TYPE.BIRTH,
          details
        )
      }
    },
    async markDeathAsValidated(_, { id, details }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        return await Promise.reject(
          new Error('User does not have a validate scope')
        )
      }
      return await markEventAsValidated(
        id,
        authHeader,
        EVENT_TYPE.DEATH,
        details
      )
    },
    async markBirthAsRegistered(_, { id, details }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'register')) {
        return markEventAsRegistered(id, authHeader, EVENT_TYPE.BIRTH, details)
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markDeathAsRegistered(_, { id, details }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'register')) {
        return await markEventAsRegistered(
          id,
          authHeader,
          EVENT_TYPE.DEATH,
          details
        )
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markEventAsVoided(_, { id, reason, comment }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const taskBundle = await fetchFHIR(
          `/Task?focus=Composition/${id}`,
          authHeader
        )
        const taskEntry = taskBundle.entry[0]
        if (!taskEntry) {
          throw new Error('Task does not exist')
        }
        const status = 'REJECTED'
        const newTaskBundle = await updateFHIRTaskBundle(
          taskEntry,
          status,
          reason,
          comment
        )
        const taskResource = newTaskBundle.entry[0].resource
        // remove assigned extension when reject
        removeExtensionsFromTaskResourse(taskResource, [ASSIGNED_EXTENSION_URL])

        await fetchFHIR(
          '/Task',
          authHeader,
          'PUT',
          JSON.stringify(newTaskBundle)
        )
        // return the taskId
        return taskEntry.resource.id
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async markEventAsArchived(_, { id }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const taskBundle = await fetchFHIR(
          `/Task?focus=Composition/${id}`,
          authHeader
        )
        const taskEntry = taskBundle.entry[0]
        if (!taskEntry) {
          throw new Error('Task does not exist')
        }
        const status = 'ARCHIVED'
        const newTaskBundle = await updateFHIRTaskBundle(taskEntry, status)
        const taskResource = newTaskBundle.entry[0].resource
        // remove downloaded and assigned extension while archiving
        removeExtensionsFromTaskResourse(taskResource, [
          DOWNLOADED_EXTENSION_URL,
          ASSIGNED_EXTENSION_URL
        ])
        await fetchFHIR(
          '/Task',
          authHeader,
          'PUT',
          JSON.stringify(newTaskBundle)
        )
        // return the taskId
        return taskEntry.resource.id
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async markEventAsReinstated(_, { id }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const taskBundle: ITaskBundle = await fetchFHIR(
          `/Task?focus=Composition/${id}`,
          authHeader
        )

        const taskEntryData = taskBundle.entry[0]
        if (!taskEntryData) {
          throw new Error('Task does not exist')
        }

        const taskEntryResourceID = taskEntryData.resource.id

        const taskHistoryBundle: fhir.Bundle = await fetchFHIR(
          `/Task/${taskEntryResourceID}/_history`,
          authHeader
        )

        const taskHistory =
          taskHistoryBundle.entry &&
          taskHistoryBundle.entry.map((taskEntry: fhir.BundleEntry) => {
            const historicalTask = taskEntry.resource
            // all these tasks will have the same id, make it more specific to keep apollo-client's cache happy
            if (historicalTask && historicalTask.meta) {
              historicalTask.id = `${historicalTask.id}/_history/${historicalTask.meta.versionId}`
            }
            return historicalTask as fhir.Task
          })

        const taskHistoryEntry = taskHistory && taskHistory.length > 1
        if (!taskHistoryEntry) {
          throw new Error('Task has no history')
        }

        const filteredTaskHistory = taskHistory?.filter((task) => {
          return (
            task.businessStatus?.coding &&
            task.businessStatus?.coding[0].code !== 'ARCHIVED'
          )
        })
        const regStatusCode =
          filteredTaskHistory &&
          filteredTaskHistory.length > 0 &&
          getStatusFromTask(filteredTaskHistory[0])

        if (!regStatusCode) {
          return await Promise.reject(new Error('Task has no reg-status code'))
        }

        const newTaskBundle = addOrUpdateExtension(
          taskEntryData,
          [
            {
              url: REINSTATED_EXTENSION_URL,
              valueString: regStatusCode
            }
          ],
          'reinstated'
        )

        newTaskBundle.entry[0].resource = updateTaskTemplate(
          newTaskBundle.entry[0].resource,
          regStatusCode
        )

        await fetchFHIR(
          '/Task',
          authHeader,
          'PUT',
          JSON.stringify(newTaskBundle)
        )

        return { taskEntryResourceID, registrationStatus: regStatusCode }
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async markBirthAsCertified(_, { id, details }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsCertified(details, authHeader, EVENT_TYPE.BIRTH)
      } else {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
    },
    async markDeathAsCertified(_, { id, details }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsCertified(details, authHeader, EVENT_TYPE.DEATH)
      } else {
        return await Promise.reject(
          new Error('User does not have a certify scope')
        )
      }
    },
    async notADuplicate(_, { id, duplicateId }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const composition = await fetchFHIR(
          `/Composition/${id}`,
          authHeader,
          'GET'
        )
        removeDuplicatesFromComposition(composition, id, duplicateId)

        await fetch(`${SEARCH_URL}/events/not-duplicate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/fhir+json',
            ...authHeader
          },
          body: JSON.stringify(composition)
        }).catch((error) => {
          return Promise.reject(
            new Error(`Search request failed: ${error.message}`)
          )
        })

        await fetch(`${FHIR_URL}/Composition/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/fhir+json',
            ...authHeader
          },
          body: JSON.stringify(composition)
        }).catch((error) => {
          return Promise.reject(
            new Error(`FHIR request failed: ${error.message}`)
          )
        })

        return composition.id
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markEventAsUnassigned(_, { id }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const taskBundle = (await fetchFHIR(
          `/Task?focus=Composition/${id}`,
          authHeader
        )) as ITaskBundle
        const taskEntry = taskBundle.entry[0]
        if (!taskEntry) {
          throw new Error('Task does not exist')
        }
        const taskResource = taskBundle.entry[0].resource
        // remove assigned extension when unassigned
        removeExtensionsFromTaskResourse(taskResource, [ASSIGNED_EXTENSION_URL])
        taskEntry.request = {
          method: 'PUT',
          url: `Task/${taskEntry.resource.id}`
        } as fhir.BundleEntryRequest

        const fhirBundle: ITaskBundle = {
          resourceType: 'Bundle',
          type: 'document',
          entry: [taskEntry],
          signature: {
            type: [
              {
                code: 'unassigned'
              }
            ],
            when: Date().toString()
          }
        }
        await fetchFHIR('', authHeader, 'POST', JSON.stringify(fhirBundle))
        // return the taskId
        return taskEntry.resource.id
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    }
  }
}

async function createEventRegistration(
  details: GQLBirthRegistrationInput | GQLDeathRegistrationInput,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  const doc = await buildFHIRBundle(details, event, authHeader)
  const draftId =
    details && details.registration && details.registration.draftId

  const duplicateCompostion =
    draftId && (await lookForDuplicate(draftId, authHeader))

  if (duplicateCompostion) {
    if (hasScope(authHeader, 'register')) {
      return await getRegistrationIds(
        duplicateCompostion,
        event,
        false,
        authHeader
      )
    } else {
      // return tracking-id
      return await getDeclarationIds(duplicateCompostion, authHeader)
    }
  }

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  if (hasScope(authHeader, 'register')) {
    // return the registrationNumber
    return await getRegistrationIdsFromResponse(res, event, authHeader)
  } else {
    // return tracking-id
    return await getDeclarationIdsFromResponse(res, authHeader)
  }
}

export async function lookForDuplicate(
  identifier: string,
  authHeader: IAuthHeader
) {
  const taskBundle = await fetchFHIR<fhir.Bundle>(
    `/Task?identifier=${identifier}`,
    authHeader
  )

  const task =
    taskBundle &&
    taskBundle.entry &&
    taskBundle.entry[0] &&
    (taskBundle.entry[0].resource as fhir.Task)

  return (
    task &&
    task.focus &&
    task.focus.reference &&
    task.focus.reference.split('/')[1]
  )
}

async function markEventAsValidated(
  id: string,
  authHeader: IAuthHeader,
  event: EVENT_TYPE,
  details?: any
) {
  let doc
  if (!details) {
    const taskBundle = (await fetchFHIR(
      `/Task?focus=Composition/${id}`,
      authHeader
    )) as ITaskBundle
    if (!taskBundle || !taskBundle.entry || !taskBundle.entry[0]) {
      throw new Error('Task does not exist')
    }

    const taskResource = taskBundle.entry[0].resource
    // remove assigned extension when reject
    removeExtensionsFromTaskResourse(taskResource, [ASSIGNED_EXTENSION_URL])

    doc = {
      resourceType: 'Bundle',
      type: 'document',
      entry: taskBundle.entry
    }
  } else {
    doc = await buildFHIRBundle(details, event, authHeader)
  }

  await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
}

async function markEventAsRegistered(
  id: string,
  authHeader: IAuthHeader,
  event: EVENT_TYPE,
  details: GQLBirthRegistrationInput | GQLDeathRegistrationInput
) {
  const doc = await buildFHIRBundle(details, event, authHeader)

  await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))

  // return the full composition
  const res = await fetchFHIR(`/Composition/${id}`, authHeader)

  return res
}

async function markEventAsCertified(
  details: any,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  const doc = await buildFHIRBundle(details, event, authHeader)

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  // return composition-id
  return getIDFromResponse(res)
}

async function markRecordAsDownloadedAndAssigned(
  id: string,
  authHeader: IAuthHeader
) {
  const taskBundle: ITaskBundle = await fetchFHIR(
    `/Task?focus=Composition/${id}`,
    authHeader
  )
  if (!taskBundle || !taskBundle.entry || !taskBundle.entry[0]) {
    throw new Error('Task does not exist')
  }

  let extensions: fhir.Extension[]
  const businessStatus = getStatusFromTask(
    taskBundle.entry[0].resource
  ) as GQLRegStatus

  const isFieldAgentValidatedDeclaration =
    hasScope(authHeader, 'validate') &&
    businessStatus === GQLRegStatus.VALIDATED

  if (
    hasScope(authHeader, 'register') ||
    (hasScope(authHeader, 'validate') && !isFieldAgentValidatedDeclaration)
  ) {
    extensions = [
      {
        url: ASSIGNED_EXTENSION_URL,
        valueString: getStatusFromTask(taskBundle.entry[0].resource)
      },
      {
        url: DOWNLOADED_EXTENSION_URL,
        valueString: getStatusFromTask(taskBundle.entry[0].resource)
      }
    ]
  } else {
    extensions = [
      {
        url: DOWNLOADED_EXTENSION_URL,
        valueString: getStatusFromTask(taskBundle.entry[0].resource)
      }
    ]
  }

  const doc = addOrUpdateExtension(
    taskBundle.entry[0],
    extensions,
    'downloaded'
  )

  await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))

  // return the full composition
  return fetchFHIR(`/Composition/${id}`, authHeader)
}
