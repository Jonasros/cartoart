import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from('maps')
    .select('id, title, config')
    .eq('is_featured', true)
    .limit(50);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Featured maps in database:\n');

  // Count border styles
  const borderCounts: Record<string, number> = {};

  data.forEach(m => {
    const config = m.config as Record<string, unknown>;
    const format = config?.format as Record<string, unknown> | undefined;
    const border = (format?.borderStyle as string) || 'none';
    const margin = (format?.margin as number) || 0;
    borderCounts[border] = (borderCounts[border] || 0) + 1;
    console.log(`  ${m.title}: border=${border}, margin=${margin}`);
  });

  console.log('\nBorder style distribution:');
  Object.entries(borderCounts).forEach(([style, count]) => {
    console.log(`  ${style}: ${count}`);
  });

  console.log(`Total: ${data.length} featured maps`);
}

main();
