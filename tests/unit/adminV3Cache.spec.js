import {
  getCachedAdminV3Info,
  getCachedAdminV3Routers,
  ADMIN_V3_GET_INFO_CACHE_KEY,
  ADMIN_V3_GET_ROUTERS_CACHE_KEY
} from '../../src/utils/adminV3Cache'

describe('adminV3Cache', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns getInfo cache when token matches', () => {
    const response = { user: { userId: 1 }, roles: ['admin'], permissions: ['*:*:*'] }
    localStorage.setItem(
      ADMIN_V3_GET_INFO_CACHE_KEY,
      JSON.stringify({ token: 'token-1', response })
    )

    expect(getCachedAdminV3Info('token-1')).toEqual(response)
  })

  it('ignores getInfo cache when token does not match', () => {
    localStorage.setItem(
      ADMIN_V3_GET_INFO_CACHE_KEY,
      JSON.stringify({ token: 'token-1', response: { user: { userId: 1 } } })
    )

    expect(getCachedAdminV3Info('token-2')).toBeNull()
  })

  it('returns getRouters cache when token matches', () => {
    const response = { data: [{ path: '/dashboard' }] }
    localStorage.setItem(
      ADMIN_V3_GET_ROUTERS_CACHE_KEY,
      JSON.stringify({ token: 'token-1', response })
    )

    expect(getCachedAdminV3Routers('token-1')).toEqual(response)
  })
})
