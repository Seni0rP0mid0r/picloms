export function columnsForWidth(width: number): 2 | 3 | 4 {
  if (width < 640) return 2
  if (width < 1024) return 3
  return 4
}

export function buildLayout(count: number, cols: number): number[][] {
  if (!Number.isInteger(count) || count < 0) throw new RangeError('count must be a non-negative integer')
  if (!Number.isInteger(cols) || cols < 1) throw new RangeError('cols must be a positive integer')

  const rows: number[][] = []
  let index = 0
  let row = 0

  while (index < count) {
    const cells = Array<number>(cols).fill(-1)
    const a = (row * 2 + (row % 2)) % cols
    cells[a] = index++

    if (row % 3 === 0 && index < count) {
      let b = (a + 2) % cols
      if (b === a) b = (a + 1) % cols
      cells[b] = index++
    }

    rows.push(cells)
    row += 1
  }

  return rows
}
