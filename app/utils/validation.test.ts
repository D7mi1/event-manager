import { validateEmail, validatePhone, validateRequired, cleanPhoneNumber, formatPhoneNumber } from './validation';

describe('Validation Functions', () => {
  
  // ... (Email Tests - كما هي)
  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });
  });

  // ... (Phone Tests - كما هي صحيحة الآن)
  describe('validatePhone', () => {
    it('should validate phone with correct digit count', () => {
      expect(validatePhone('0501234567', 10)).toBe(true);
      expect(validatePhone('966501234567', 12)).toBe(true);
    });

    it('should reject phone with wrong digit count', () => {
      expect(validatePhone('050123456', 10)).toBe(false);
      expect(validatePhone('05012345678', 10)).toBe(false);
    });

    it('should reject phone with non-digit characters', () => {
      expect(validatePhone('050-123456', 10)).toBe(false);
      expect(validatePhone('abc1234567', 10)).toBe(false);
    });
  });

  // 🔴 التعديل هنا (Required Field Tests)
  describe('validateRequired', () => {
    it('should accept non-empty values', () => {
      // نتوقع null لأن الدالة تعيد null عند عدم وجود أخطاء
      expect(validateRequired('some value', 'Field')).toBeNull();
      expect(validateRequired(123, 'Field')).toBeNull();
    });

    it('should reject empty values', () => {
      // نتوقع أن لا تكون null (أي تعيد رسالة خطأ نصية)
      expect(validateRequired('', 'Field')).not.toBeNull();
      expect(validateRequired('   ', 'Field')).not.toBeNull(); 
      expect(validateRequired(null, 'Field')).not.toBeNull();
      expect(validateRequired(undefined, 'Field')).not.toBeNull();
      
      // يمكنك أيضاً التحقق من نص الرسالة إذا أردت دقة أكثر:
      // expect(validateRequired('', 'الاسم')).toContain('مطلوب');
    });
  });

  // ... (باقي الاختبارات كما هي)
  describe('cleanPhoneNumber', () => {
    it('should remove all non-digit characters', () => {
      expect(cleanPhoneNumber('+966-50-123-4567')).toBe('966501234567');
      expect(cleanPhoneNumber('(050) 123 4567')).toBe('0501234567');
    });

    it('should handle already clean numbers', () => {
      expect(cleanPhoneNumber('0501234567')).toBe('0501234567');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should add country code to number starting with 0', () => {
      expect(formatPhoneNumber('0501234567', '966')).toBe('966501234567');
    });

    it('should not duplicate country code', () => {
      expect(formatPhoneNumber('966501234567', '966')).toBe('966501234567');
    });
    
    it('should handle numbers without leading zero', () => {
       expect(formatPhoneNumber('501234567', '966')).toBe('966501234567');
    });
  });
});