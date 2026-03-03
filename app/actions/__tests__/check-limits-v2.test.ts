import { checkGuestsLimit, incrementGuestsUsed } from '@/lib/utils/check-limits';

// Mock Supabase - matches the actual code flow:
// 1. subscriptions.select().eq('user_id').eq('status','active').single()
// 2. events.select('id').eq('user_id')
// 3. attendees.select('*', count).in('event_id', ids)

const mockSingle = jest.fn();
const mockIn = jest.fn();
const mockEqChain = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    from: mockFrom,
  }))
}));

describe('Subscription Limits', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();

    // Default chain setup for subscriptions query
    mockFrom.mockImplementation((table: string) => {
      if (table === 'subscriptions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: mockSingle
              })
            })
          })
        };
      }
      if (table === 'events') {
        return {
          select: jest.fn().mockReturnValue({
            eq: mockEqChain
          })
        };
      }
      if (table === 'attendees') {
        return {
          select: jest.fn().mockReturnValue({
            in: mockIn
          })
        };
      }
      return { select: jest.fn() };
    });
  });

  test('✅ يجب أن يسمح عندما يكون هناك رصيد متبقي (اشتراك نشط)', async () => {
    // subscription with limit 200
    mockSingle.mockResolvedValueOnce({
      data: { guests_limit: 200, guests_used: 0, plan_tier: 'pro', status: 'active' },
      error: null
    });
    // user has 2 events
    mockEqChain.mockResolvedValueOnce({
      data: [{ id: 'evt-1' }, { id: 'evt-2' }],
      error: null
    });
    // total 50 attendees
    mockIn.mockResolvedValueOnce({ count: 50, error: null });

    const result = await checkGuestsLimit(mockUserId);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(150);
    expect(result.limit).toBe(200);
  });

  test('❌ يجب أن يمنع عند الوصول للحد الأقصى', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { guests_limit: 50, guests_used: 0, plan_tier: 'starter', status: 'active' },
      error: null
    });
    mockEqChain.mockResolvedValueOnce({
      data: [{ id: 'evt-1' }],
      error: null
    });
    mockIn.mockResolvedValueOnce({ count: 50, error: null });

    const result = await checkGuestsLimit(mockUserId);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.message).toContain('50 ضيف');
  });

  test('🆓 يجب أن يعطي Free Plan عند عدم وجود subscription', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' }
    });
    mockEqChain.mockResolvedValueOnce({
      data: [{ id: 'evt-1' }],
      error: null
    });
    mockIn.mockResolvedValueOnce({ count: 60, error: null });

    const result = await checkGuestsLimit(mockUserId);

    // Free plan limit from PLANS.free
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('ضيف');
  });

  test('✅ incrementGuestsUsed دائماً true (العدد يُحسب ديناميكياً)', async () => {
    const result = await incrementGuestsUsed(mockUserId, 5);
    expect(result).toBe(true);
  });
});
