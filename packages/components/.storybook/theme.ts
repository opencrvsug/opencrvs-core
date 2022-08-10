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
import { create } from '@storybook/theming'
import { getTheme } from '@opencrvs/components/lib/theme'

export const BRAND_BLUE = '#0058E0'

const theme = getTheme()

export default create({
  base: 'light',
  colorPrimary: BRAND_BLUE,
  colorSecondary: BRAND_BLUE,
  brandTitle: 'OpenCRVS Design System',
  brandUrl: 'https://opencrvs.org',
  brandImage: 'logo.png',
  brandTarget: '_self',
  fontBase: theme.fonts.fontFamily
})
