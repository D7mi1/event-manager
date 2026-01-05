import { handleApiError } from '../api-error-handler';

// Mock Sentry
jest.mock('../sentry', () => ({
  captureError: jest.fn()
}));

describe('API Error Handler', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('✅ يجب أن يُخفي التفاصيل في Production', () => {
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Database connection failed');
    const response = handleApiError(error, 'test_context');
    
    const json = response.json();
    
    expect(json).toHaveProperty('error');
    expect(json.error).not.toContain('Database');
    expect(json).not.toHaveProperty('details');
    expect(json).not.toHaveProperty('stack');
  });

  test('✅ يجب أن يُظهر التفاصيل في Development', () => {
    process.env.NODE_ENV = 'development';
    
    const error = new Error('Test error');
    const response = handleApiError(error, 'test_context');
    
    const json = response.json();
    
    expect(json).toHaveProperty('details');
    expect(json.details).toBe('Test error');
    expect(json).toHaveProperty('stack');
  });

  test('✅ يجب أن يستدعي Sentry', () => {
    const { captureError } = require('../sentry');
    const error = new Error('Sentry test');
    
    handleApiError(error, 'sentry_test');
    
    expect(captureError).toHaveBeenCalledWith(error, { context: 'sentry_test' });
  });
});
