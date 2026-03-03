import { generatePin } from '../verifyPin';

describe('PIN Verification - Basic Tests', () => {
  test('✅ generatePin ينتج PIN من 4 أرقام', async () => {
    const pin = await generatePin();

    expect(pin).toBeDefined();
    expect(pin.length).toBe(4);
    expect(/^\d{4}$/.test(pin)).toBe(true);
  });

  test('✅ generatePin ينتج أرقام بين 1000 و 9999', async () => {
    const pin = await generatePin();
    const num = parseInt(pin, 10);

    expect(num).toBeGreaterThanOrEqual(1000);
    expect(num).toBeLessThanOrEqual(9999);
  });

  test('✅ كل PIN فريد (عشوائي)', async () => {
    const pins = new Set<string>();
    for (let i = 0; i < 10; i++) {
      pins.add(await generatePin());
    }
    // من 10 محاولات، على الأقل 2 مختلفين (احتمال التطابق ضعيف جداً)
    expect(pins.size).toBeGreaterThan(1);
  });
});
