import { defaultPerMin, getPerMinuteCentsForUser } from '../../src/lib/billing'

describe('billing helpers (unit)', () => {
  test('defaultPerMin returns number > 0', () => {
    const v = defaultPerMin()
    expect(typeof v).toBe('number')
    expect(v).toBeGreaterThan(0)
  })

  test('getPerMinuteCentsForUser returns a number (without DB)', async () => {
    // Without a Supabase client or user, the function falls back to default
    const v = await getPerMinuteCentsForUser(null)
    expect(typeof v).toBe('number')
    expect(v).toBeGreaterThan(0)
  })
})
