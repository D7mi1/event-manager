-- ============================================
-- فحص شامل لقاعدة البيانات - Schema Inspector
-- شغّل هذا في Supabase SQL Editor
-- وانسخ النتيجة كاملة
-- ============================================

-- 1. جميع الجداول وأعمدتها
SELECT
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  (
    SELECT tc.constraint_type
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE kcu.table_name = c.table_name AND kcu.column_name = c.column_name
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
    LIMIT 1
  ) as constraint_type,
  (
    SELECT ccu.table_name
    FROM information_schema.referential_constraints rc
    JOIN information_schema.key_column_usage kcu ON rc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name
    WHERE kcu.table_name = c.table_name AND kcu.column_name = c.column_name
    LIMIT 1
  ) as references_table
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;
