import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // استخدم Service Role
);

async function migratePins() {
  // جلب جميع Events مع PIN
  const { data: events } = await supabase
    .from('events')
    .select('id, pin')
    .not('pin', 'is', null);

  if (!events) return;

  for (const event of events) {
    // تشفير PIN
    const hashedPin = await bcrypt.hash(event.pin, 10);
    
    // تحديث Database
    await supabase
      .from('events')
      .update({ pin_hash: hashedPin })
      .eq('id', event.id);
    
    console.log(`✅ Migrated PIN for event ${event.id}`);
  }

  console.log('✅ All PINs migrated!');
}

migratePins();
