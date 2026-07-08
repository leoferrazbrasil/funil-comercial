const crypto = require('crypto');
const secret = '367f57cfc3449112e350c97fc8b22752';
const payload = {
  object: 'whatsapp_business_account',
  entry: [{
    id: '384965084708801',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: { display_phone_number: '15551015288', phone_number_id: '384965084708801' },
        contacts: [{ profile: { name: 'Leonardo Brasil' }, wa_id: '5551992568861' }],
        messages: [{
          from: '5551992568861',
          id: 'wamid.HBgLNTU1MTk5MjU2ODg2MRUCABEYEjkyQkU4QjcxNDBGQTZEQUJEAA==',
          timestamp: '1720120000',
          type: 'text',
          text: { body: 'Oi de teste do script' }
        }]
      },
      field: 'messages'
    }]
  }]
};
const body = JSON.stringify(payload);
const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

fetch('https://juvwfxnlusrnvcarkrmc.supabase.co/functions/v1/whatsapp-inbound', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Hub-Signature-256': 'sha256=' + signature
  },
  body: body
}).then(res => res.json().then(data => console.log(res.status, data))).catch(console.error);
