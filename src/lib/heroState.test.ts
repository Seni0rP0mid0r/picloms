import { describe, expect, it } from 'vitest'
import { resolveHeroReadiness } from './heroState'

describe('resolveHeroReadiness', () => {
  it('waits for every frame to settle, then keeps the first successful frame', () => {
    expect(resolveHeroReadiness(['loaded', 'pending'])).toEqual({ ready: false, allFailed: false, activeIndex: 0 })
    expect(resolveHeroReadiness(['loaded', 'error'])).toEqual({ ready: true, allFailed: false, activeIndex: 0 })
    expect(resolveHeroReadiness(['error', 'loaded'])).toEqual({ ready: true, allFailed: false, activeIndex: 1 })
  })

  it('never declares an all-error canvas ready', () => {
    expect(resolveHeroReadiness(['error', 'error'])).toEqual({ ready: false, allFailed: true, activeIndex: null })
  })
})
