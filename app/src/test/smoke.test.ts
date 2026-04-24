import { describe, it, expect } from 'vitest'

describe('scaffold smoke test', () => {
  it('passes', () => {
    expect(true).toBe(true)
  })

  it('MSW server is set up', async () => {
    const response = await fetch('/api/categories')
    expect(response.ok).toBe(true)
  })
})
