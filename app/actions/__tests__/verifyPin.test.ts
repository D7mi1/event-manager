import { verifyEventPin, hashPin } from '../verifyPin';
import bcrypt from 'bcryptjs';

// Mock Supabase
jest.mock('@/app/utils/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}));

describe('PIN Verification', () => {
  const mockEventId = 'test-event-123';
  const correctPin = '1234';
  let hashedPin: string;

  beforeAll(async () => {
    hashedPin = await hashPin(correctPin);
  });

  test('✅ يجب أن يقبل PIN صحيح', async () => {
    // Mock successful DB response
    const { supabase } = require('@/app/utils/supabase/client');
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: { pin_hash: hashedPin },
      error: null
    });

    const result = await verifyEventPin(mockEventId, correctPin);
    expect(result.success).toBe(true);
  });

  test('❌ يجب أن يرفض PIN خاطئ', async () => {
    const { supabase } = require('@/app/utils/supabase/client');
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: { pin_hash: hashedPin },
      error: null
    });

    const result = await verifyEventPin(mockEventId, '9999');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Incorrect PIN');
  });

  test('❌ يجب أن يرجع خطأ عند عدم وجود Event', async () => {
    const { supabase } = require('@/app/utils/supabase/client');
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' }
    });

    const result = await verifyEventPin('invalid-id', correctPin);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Event not found');
  });

  test('✅ hashPin يجب أن يُنتج hash مختلف في كل مرة', async () => {
    const hash1 = await hashPin('1234');
    const hash2 = await hashPin('1234');
    
    expect(hash1).not.toBe(hash2); // Different salts
    expect(await bcrypt.compare('1234', hash1)).toBe(true);
    expect(await bcrypt.compare('1234', hash2)).toBe(true);
  });
});
