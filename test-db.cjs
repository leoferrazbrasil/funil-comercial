const url = "https://juvwfxnlusrnvcarkrmc.supabase.co/rest/v1/inbox_messages?select=*&order=created_at.desc&limit=20";
const key = "sb_publishable_yHgMqSz5KFAAPpWUht81vA_Rrjy36VF";

fetch(url, {
  headers: {
    "apikey": key,
    "Authorization": `Bearer ${key}`
  }
})
.then(res => res.json())
.then(data => {
  data.forEach(m => {
    console.log(`[${m.created_at}] ${m.remetente_nome} | tel: '${m.telefone}' | dir: ${m.direction} | msg: ${m.mensagem.substring(0,20)}... | id: ${m.id}`);
  });
})
.catch(console.error);
