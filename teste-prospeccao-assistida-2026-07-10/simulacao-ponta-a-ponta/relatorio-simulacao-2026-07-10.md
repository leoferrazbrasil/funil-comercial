# Simulacao ponta a ponta - 2026-07-10

Lead usado no teste controlado: Odontologia 24 horas / Dra. Danielly.

## Resultado por etapa

1. Planilha Google validada
   - Arquivo: TESTE - URL curta validada - 2026-07-10
   - Range validado: A1:Q2
   - Colunas finais confirmadas: Bloco 1 (Link), Bloco 2 (Proposta), Toque 1 (2 dias), Toque 2 (5 dias), Toque 3 (10 dias)
   - Bloco 1 confirmado com quebras de linha e link precedido por emoji: 👉 https://funilcomercial.com/danielly-odontologia/

2. Site publicado validado
   - URL publica: https://funilcomercial.com/danielly-odontologia/
   - Status HTTP: 200
   - Titulo: Dentista 24 Horas | Odontologia 24 Horas
   - WhatsApp encontrado no HTML: sim

3. Build validado
   - Comando: npm run build
   - Resultado: sucesso
   - Arquivo final confirmado: dist/danielly-odontologia/index.html

4. CRM / Inbox validado
   - Rota acessada: https://funilcomercial.com/contatos
   - Contato usado: Odontologia 24 horas
   - Telefone exibido pelo CRM: 551167441230
   - Botao WhatsApp abriu: https://funilcomercial.com/inbox
   - Conversa aberta: Odontologia 24 horas (551167441230)
   - Rascunho preenchido: Bloco 1 (Link)
   - Tamanho do rascunho: 971 caracteres
   - Link curto com emoji confirmado: sim
   - Botao de envio ficou habilitado: sim
   - Envio automatico realizado: nao

## Observacoes

- Esta foi uma simulacao controlada com 1 lead, nao uma execucao real para completar 10 leads.
- O fluxo de envio segue assistido: a mensagem fica preparada para conferencia humana antes do envio.
- A captura nativa de screenshot do navegador interno falhou por timeout de CDP. A validacao final do Inbox foi feita pelo estado do DOM.
- O Bloco 2 ainda contem o marcador assistido "(envie a imagem da proposta aqui)", portanto a imagem da proposta precisa ser gerada/anexada em uma etapa separada antes do envio desse bloco.
