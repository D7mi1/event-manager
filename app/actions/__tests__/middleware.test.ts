import { middleware } from '../middleware';
import { NextRequest, NextResponse } from 'next/server';

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    }
  }))
}));

describe('Middleware', () => {
  const createMockRequest = (pathname: string, hasUser = false) => {
    const { createServerClient } = require('@supabase/ssr');
    const mockSupabase = createServerClient();
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: hasUser ? { id: 'user-123' } : null }
    });

    return new NextRequest(new URL(`http://localhost${pathname}`));
  };

  test('✅ يجب أن يسمح بالوصول للصفحات العامة', async () => {
    const request = createMockRequest('/');
    const response = await middleware(request);
    
    expect(response.status).not.toBe(307); // Not redirect
  });

  test('❌ يجب أن يمنع /dashboard بدون تسجيل دخول', async () => {
    const request = createMockRequest('/dashboard', false);
    const response = await middleware(request);
    
    expect(response.status).toBe(307); // Redirect
    expect(response.headers.get('location')).toContain('/login');
  });

  test('✅ يجب أن يسمح بـ /dashboard مع تسجيل دخول', async () => {
    const request = createMockRequest('/dashboard', true);
    const response = await middleware(request);
    
    expect(response.status).not.toBe(307);
  });

  test('❌ يجب أن يمنع /api/templates بدون تسجيل دخول', async () => {
    const request = createMockRequest('/api/templates', false);
    const response = await middleware(request);
    
    const json = await response.json();
    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  test('✅ يجب أن يسمح بـ /api/templates مع تسجيل دخول', async () => {
    const request = createMockRequest('/api/templates', true);
    const response = await middleware(request);
    
    expect(response.status).not.toBe(401);
  });
});
