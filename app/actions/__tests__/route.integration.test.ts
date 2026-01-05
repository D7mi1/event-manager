import { POST } from '../route';
import { NextRequest } from 'next/server';

jest.mock('@/app/utils/supabase/server');
jest.mock('@/app/utils/check-limits-v2');

describe('POST /api/guests - Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ يجب أن يضيف ضيف بنجاح', async () => {
    // Setup mocks
    const { createClient } = require('@/app/utils/supabase/server');
    const { checkGuestsLimit, incrementGuestsUsed } = require('@/app/utils/check-limits-v2');
    
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } }
        })
      },
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'guest-123', name: 'أحمد' },
              error: null
            })
          }))
        }))
      }))
    };

    createClient.mockResolvedValue(mockSupabase);
    checkGuestsLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      limit: 200
    });
    incrementGuestsUsed.mockResolvedValue(true);

    // Create request
    const request = new NextRequest('http://localhost/api/guests', {
      method: 'POST',
      body: JSON.stringify({
        name: 'أحمد',
        email: 'ahmed@example.com',
        phone: '0501234567',
        event_id: 'event-123'
      })
    });

    // Execute
    const response = await POST(request);
    const json = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe('أحمد');
    expect(checkGuestsLimit).toHaveBeenCalledWith('user-123');
    expect(incrementGuestsUsed).toHaveBeenCalledWith('user-123');
  });

  test('❌ يجب أن يرفض عند الوصول للحد الأقصى', async () => {
    const { createClient } = require('@/app/utils/supabase/server');
    const { checkGuestsLimit } = require('@/app/utils/check-limits-v2');
    
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } }
        })
      }
    };

    createClient.mockResolvedValue(mockSupabase);
    checkGuestsLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 50,
      message: 'لقد وصلت للحد الأقصى'
    });

    const request = new NextRequest('http://localhost/api/guests', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', event_id: 'event-123' })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.upgrade_required).toBe(true);
  });
});
