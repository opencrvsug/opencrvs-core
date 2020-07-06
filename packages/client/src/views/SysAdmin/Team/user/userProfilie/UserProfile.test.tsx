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
import { AppStore } from '@client/store'
import { createTestComponent, createTestStore } from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import * as React from 'react'
import {
  GET_USER,
  FETCH_TIME_LOGGED_METRICS_FOR_PRACTITIONER
} from '@client/user/queries'
import { UserProfile } from '@client/views/SysAdmin/Team/user/userProfilie/UserProfile'
import { USER_PROFILE } from '@client/navigation/routes'

describe('User audit list tests', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History<any>

  const graphqlMock = [
    {
      request: {
        query: GET_USER,
        variables: {
          userId: '5d08e102542c7a19fc55b790'
        }
      },
      result: {
        data: {
          getUser: {
            id: '5d08e102542c7a19fc55b790',
            name: [
              {
                use: 'bn',
                firstNames: '',
                familyName: 'মায়ের পারিবারিক নাম'
              },
              {
                use: 'en',
                firstNames: '',
                familyName: 'Shakib al Hasan'
              }
            ],
            username: 'shakib.alhasan',
            mobile: '+8801662132163',
            identifier: {
              system: 'NATIONAL_ID',
              value: '1014881922'
            },
            role: 'FIELD_AGENT',
            type: 'CHA',
            status: 'active',
            underInvestigation: false,
            practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
            primaryOffice: {
              id: '895cc945-94a9-4195-9a29-22e9310f3385',
              name: 'Narsingdi Paurasabha',
              alias: ['নরসিংদী পৌরসভা']
            },
            catchmentArea: [
              {
                id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
                name: 'Sample location',
                alias: 'স্যাম্পল লোকেশান'
              }
            ],
            signature: null,
            creationDate: '2019-03-31T18:00:00.000Z'
          }
        }
      }
    },
    {
      request: {
        query: FETCH_TIME_LOGGED_METRICS_FOR_PRACTITIONER,
        variables: {
          timeEnd: new Date(1487076708000).toISOString(),
          timeStart: new Date(1484398308000).toISOString(),
          practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
          locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
          count: 10
        }
      },
      result: {
        data: {
          fetchTimeLoggedMetricsByPractitioner: {
            totalItems: 1,
            results: [
              {
                status: 'REGISTERED',
                trackingId: 'B23S555',
                eventType: 'BIRTH',
                timeSpentEditing: 50,
                time: '2019-03-31T18:00:00.000Z'
              }
            ]
          }
        }
      }
    }
  ]

  beforeAll(async () => {
    Date.now = jest.fn(() => 1487076708000)
    const { store: testStore, history: testHistory } = await createTestStore()
    store = testStore
    history = testHistory
  })

  beforeEach(async () => {
    component = (await createTestComponent(
      // @ts-ignore
      <UserProfile
        match={{
          params: {
            userId: '5d08e102542c7a19fc55b790'
          },
          isExact: true,
          path: USER_PROFILE,
          url: ''
        }}
      />,
      store,
      graphqlMock
    )).component

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    component.update()
  })

  it('renders without crashing', async () => {
    expect(await waitForElement(component, '#user-profile')).toBeDefined()
    expect(await waitForElement(component, '#user-audit-list')).toBeDefined()
  })
  it('renders with a error toast for graphql error', async () => {
    const testComponent = (await createTestComponent(
      // @ts-ignore
      <UserProfile
        match={{
          params: {
            userId: '5d08e102542c7a19fc55b790'
          },
          isExact: true,
          path: USER_PROFILE,
          url: ''
        }}
      />,
      store
    )).component
    expect(await waitForElement(testComponent, '#error-toast')).toBeDefined()
  })
  it('redirects to edit user view on clicking edit details menu option', async () => {
    const menuLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonToggleButton'
    )
    menuLink.hostNodes().simulate('click')

    const editUserLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonItem0'
    )
    editUserLink.hostNodes().simulate('click')

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    expect(history.location.pathname).toBe(
      '/user/5d08e102542c7a19fc55b790/preview/'
    )
  })
  it('opens activation/deactivation modal on clicking deactivate menu option', async () => {
    const menuLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonToggleButton'
    )
    menuLink.hostNodes().simulate('click')

    const deactivationLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonItem1'
    )
    deactivationLink.hostNodes().simulate('click')

    expect(await waitForElement(component, '#modal-subtitle')).toBeDefined()
  })
})
