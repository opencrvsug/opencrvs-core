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
import { Meta, Story } from '@storybook/react'
import { Pagination, IPaginationCustomProps } from './Pagination'
import React from 'react'

export default {
  title: 'Components/Interface/DataTable/Pagination',
  component: Pagination
} as Meta

const Template: Story<IPaginationCustomProps> = (args) => (
  <Pagination {...args} />
)
export const PaginationView = Template.bind({})
PaginationView.args = {
  initialPage: 1,
  totalPages: 10,
  onPageChange: (pageNo: number) => alert(`${pageNo}`)
}
