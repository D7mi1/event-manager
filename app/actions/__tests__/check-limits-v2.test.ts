import { checkGuestsLimit, incrementGuestsUsed } from '../check-limits-v2';

// Mock Supabase
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    })),
    rpc: jest.fn()
  }))
}));

describe('Subscription Limits', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ يجب أن يسمح عندما يكون هناك رصيد متبقي', async () => {
    const { createClient } = require('@/app/utils/supabase/server');
    const mockSupabase = createClient();
    
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { guests_limit: 200, guests_used: 50 },
      error: null
    });

    const result = await checkGuestsLimit(mockUserId);
    
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(150);
    expect(result.limit).toBe(200);
  });

  test('❌ يجب أن يمنع عند الوصول للحد الأقصى', async () => {
    const { createClient } = require('@/app/utils/supabase/server');
    const mockSupabase = createClient();
    
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { guests_limit: 50, guests_used: 50 },
      error: null
    });

    const result = await checkGuestsLimit(mockUserId);
    
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.message).toContain('50 ضيف');
  });

  test('❌ يجب أن يعطي Free Plan عند عدم وجود subscription', async () => {
    const { createClient } = require('@/app/utils/supabase/server');
    const mockSupabase = createClient();
    
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' }
    });

    const result = await checkGuestsLimit(mockUserId);
    
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(50);
    expect(result.message).toContain('باقة مدفوعة');
  });

  test('✅ incrementGuestsUsed يجب أن ينجح', async () => {
    const { createClient } = require('@/app/utils/supabase/server');
    const mockSupabase = createClient();
    
    mockSupabase.rpc.mockResolvedValueOnce({ error: null });

    const result = await incrementGuestsUsed(mockUserId, 5);
    
    expect(result).toBe(true);
    expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_guests_used', {
      p_user_id: mockUserId,
      p_count: 5
    });
  });
});
