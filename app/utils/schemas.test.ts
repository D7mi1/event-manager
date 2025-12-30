/**
 * Zod Schemas Tests
 * اختبارات schemas التحقق من البيانات
 */

import {
  phoneSchema,
  emailSchema,
  nameSchema,
  registrationSchema,
  memorySchema,
  validateData,
} from './schemas';

describe('Zod Schemas', () => {
  describe('phoneSchema', () => {
    it('should validate correct phone numbers', () => {
      expect(phoneSchema.safeParse('0501234567').success).toBe(true);
      expect(phoneSchema.safeParse('12345678').success).toBe(true);
    });

    it('should reject phone numbers with less than 8 digits', () => {
      expect(phoneSchema.safeParse('1234567').success).toBe(false);
    });

    it('should reject phone numbers with non-digit characters', () => {
      expect(phoneSchema.safeParse('050-123-4567').success).toBe(false);
      expect(phoneSchema.safeParse('050 123 4567').success).toBe(false);
    });

    it('should reject empty phone numbers', () => {
      expect(phoneSchema.safeParse('').success).toBe(false);
    });
  });

  describe('emailSchema', () => {
    it('should validate correct email formats', () => {
      expect(emailSchema.safeParse('user@example.com').success).toBe(true);
      expect(emailSchema.safeParse('test.user@domain.co.uk').success).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false);
      expect(emailSchema.safeParse('user@').success).toBe(false);
      expect(emailSchema.safeParse('user @example.com').success).toBe(false);
    });

    it('should reject empty email', () => {
      expect(emailSchema.safeParse('').success).toBe(false);
    });
  });

  describe('nameSchema', () => {
    it('should validate names with at least 3 characters', () => {
      expect(nameSchema.safeParse('أحمد محمد').success).toBe(true);
      expect(nameSchema.safeParse('Ali').success).toBe(true);
    });

    it('should reject names with less than 3 characters', () => {
      expect(nameSchema.safeParse('Ali').success).toBe(true); // 3 is valid
      expect(nameSchema.safeParse('Al').success).toBe(false);
    });

    it('should reject names exceeding 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(nameSchema.safeParse(longName).success).toBe(false);
    });
  });

  describe('registrationSchema', () => {
    it('should validate complete registration form', () => {
      const validData = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '0501234567',
        eventId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(registrationSchema.safeParse(validData).success).toBe(true);
    });

    it('should reject form with invalid email', () => {
      const invalidData = {
        name: 'أحمد محمد',
        email: 'invalid-email',
        phone: '0501234567',
        eventId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(registrationSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should reject form with invalid phone', () => {
      const invalidData = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '123',
        eventId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(registrationSchema.safeParse(invalidData).success).toBe(false);
    });
  });

  describe('memorySchema', () => {
    it('should validate memory with valid data', () => {
      const validData = {
        message: 'ذكرى جميلة من الحفل',
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        attendeeId: '550e8400-e29b-41d4-a716-446655440001',
      };
      expect(memorySchema.safeParse(validData).success).toBe(true);
    });

    it('should reject memory exceeding 500 characters', () => {
      const invalidData = {
        message: 'a'.repeat(501),
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        attendeeId: '550e8400-e29b-41d4-a716-446655440001',
      };
      expect(memorySchema.safeParse(invalidData).success).toBe(false);
    });

    it('should reject empty memory', () => {
      const invalidData = {
        message: '',
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        attendeeId: '550e8400-e29b-41d4-a716-446655440001',
      };
      expect(memorySchema.safeParse(invalidData).success).toBe(false);
    });
  });

  describe('validateData helper', () => {
    it('should return success with valid data', () => {
      const result = validateData(emailSchema, 'test@example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBe('test@example.com');
    });

    it('should return error with invalid data', () => {
      const result = validateData(emailSchema, 'invalid-email');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

export {};
