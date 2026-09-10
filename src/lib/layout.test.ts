import { describe, expect, it } from 'vitest'
import { buildLayout, columnsForWidth } from './layout'

describe('buildLayout', () => {
  it('places ten media indices once using the specified four-column rhythm', () => {
    expect(buildLayout(10, 4)).toEqual([
      [0, -1, 1, -1],
      [-1, -1, -1, 2],
      [3, -1, -1, -1],
      [-1, 5, -1, 4],
      [6, -1, -1, -1],
      [-1, -1, -1, 7],
      [8, -1, 9, -1],
    ])
  })

  it('selects the three responsive column counts at contract boundaries', () => {
    expect([columnsForWidth(390), columnsForWidth(640), columnsForWidth(1024)]).toEqual([2, 3, 4])
  })
})
