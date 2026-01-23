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
  data.forEach(m => {
    const config = m.config as Record<string, unknown>;
    const route = config?.route as Record<string, unknown> | undefined;
    const routeId = route?.id || 'none';
    const style = (config?.style as Record<string, string>)?.id || 'unknown';
    console.log(`  ${m.title}`);
    console.log(`    ID: ${m.id}`);
    console.log(`    Style: ${style}`);
    console.log(`    Route in config: ${routeId ? 'yes' : 'no'}`);
    console.log();
  });

  console.log(`Total: ${data.length} featured maps`);
}

main();
