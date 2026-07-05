const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dtdtewojmyhiegwmgmte.supabase.co', 'sb_publishable_DR9s-yTjB16plrnQamQPXg_MYiO5gDr');
supabase.from('inbox_messages').select('*').order('created_at', { ascending: false }).limit(5).then(res => console.log(JSON.stringify(res.data, null, 2))).catch(console.error);
