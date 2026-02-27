import { hashPin } from '../verifyPin';
import bcrypt from 'bcryptjs';

describe('PIN Verification - Basic Tests', () => {
  test('✅ hashPin يجب أن ينتج hash صالح', async () => {
    const pin = '1234';
    const hash = await hashPin(pin);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(pin); // Hash مختلف عن PIN الأصلي
    expect(hash.length).toBeGreaterThan(20); // bcrypt hash طويل
  });

  test('✅ bcrypt يجب أن يتحقق من PIN بشكل صحيح', async () => {
    const pin = '5678';
    const hash = await hashPin(pin);
    
    const isValid = await bcrypt.compare(pin, hash);
    const isInvalid = await bcrypt.compare('0000', hash);
    
    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  test('✅ كل hash فريد (حتى لنفس PIN)', async () => {
    const pin = '1234';
    const hash1 = await hashPin(pin);
    const hash2 = await hashPin(pin);
    
    // Hashes مختلفة (بسبب salt)
    expect(hash1).not.toBe(hash2);
    
    // لكن كلاهما صالح لنفس PIN
    expect(await bcrypt.compare(pin, hash1)).toBe(true);
    expect(await bcrypt.compare(pin, hash2)).toBe(true);
  });
});
