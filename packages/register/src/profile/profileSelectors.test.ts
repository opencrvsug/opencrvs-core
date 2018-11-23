import { getAuthenticated, getScope } from './profileSelectors'
import { getInitialState } from '../tests/util'

describe('profileSelectors', () => {
  describe('selectors', () => {
    it('should return authenticated boolean', () => {
      const authenticated = false
      expect(getAuthenticated(getInitialState())).toEqual(authenticated)
    })
    it('should return scope', () => {
      const scope = null
      expect(getScope(getInitialState())).toEqual(scope)
    })
  })
})
