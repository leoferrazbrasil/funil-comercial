const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('inbox_messages')
    .select('id, telefone, remetente_nome, direction, mensagem, created_at, contact_id')
    .order('created_at', { ascending: false })
    .limit(30);
  
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}

check();
