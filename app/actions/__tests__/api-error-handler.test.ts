import { handleApiError, ApiError } from '@/lib/utils/api-error-handler';

describe('API Error Handler', () => {
  // استخدام env override بدلاً من تعديل المتغير مباشرة
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test('✅ يجب أن يُخفي التفاصيل في Production', async () => {
    // تعديل آمن للـ NODE_ENV باستخدام Object.defineProperty
    const originalValue = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
      configurable: true,
    });

    try {
      const error = new Error('Database connection failed');
      const response = handleApiError(error, 'test_context');
      
      const json = await response.json();
      
      expect(json).toHaveProperty('error');
      expect(json.error).not.toContain('Database');
      expect(json).not.toHaveProperty('details');
      expect(json).not.toHaveProperty('stack');
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalValue,
        writable: true,
        configurable: true,
      });
    }
  });

  test('✅ يجب أن يُظهر التفاصيل في Development', async () => {
    const originalValue = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true,
    });

    try {
      const error = new Error('Test error');
      const response = handleApiError(error, 'test_context');
      
      const json = await response.json();
      
      expect(json).toHaveProperty('details');
      expect(json.details).toBe('Test error');
      expect(json).toHaveProperty('stack');
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalValue,
        writable: true,
        configurable: true,
      });
    }
  });

  test('✅ يجب أن يعود 400 للـ Validation Error', async () => {
    const error = new ApiError('بيانات غير صحيحة', 400, 'VALIDATION_ERROR');
    const response = handleApiError(error);
    
    const json = await response.json();
    
    expect(response.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
  });

  test('✅ يجب أن يعود 500 للأخطاء غير المتوقعة', async () => {
    const error = new Error('Unknown error');
    const response = handleApiError(error);
    
    const json = await response.json();
    
    expect(response.status).toBe(500);
  });
});
