const payload = {
  event: 'messages.upsert',
  instance: 'MyInstance123',
  data: {
    key: { remoteJid: '5511999999999@s.whatsapp.net', fromMe: false, id: 'BAE5' },
    pushName: 'Leonardo',
    message: { conversation: 'Hello Evolution' },
    messageType: 'conversation'
  }
};
console.log(payload);
