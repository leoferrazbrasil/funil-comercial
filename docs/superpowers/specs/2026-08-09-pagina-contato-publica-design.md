# Página de Contato Pública

## Objetivo

Criar uma página pública `/contato` para que visitantes encontrem os canais institucionais do Funil Comercial e enviem uma solicitação registrada no CRM.

## Escopo aprovado

- Nova rota pública `/contato`.
- Layout responsivo alinhado às páginas públicas existentes.
- Formulário com nome, WhatsApp, e-mail, motivo do contato e mensagem.
- Envio para a Edge Function pública `lead-intake`.
- Registro do envio como lead com origem `Página de contato`.
- Estados de envio, sucesso e erro.
- Honeypot anti-spam e eventos de conversão reaproveitados do componente existente.
- Bloco institucional com CNPJ, e-mail, telefone e endereço do MEI.
- Dados estruturados de endereço atualizados no HTML base e no componente de SEO.
- Testes de contrato para a rota, o formulário e a aceitação dos novos campos no intake.

## Dados institucionais aprovados

- Marca: Funil Comercial.
- Razão social: LEONARDO FERRAZ DA SILVA BRASIL.
- CNPJ: 65.993.728/0001-07.
- E-mail: funil@funilcomercial.com.
- Endereço: Rua Liberal, 1329, 12, Tristeza, Porto Alegre, RS, CEP 91920-680.

## Arquitetura

O componente da página ficará em `src/pages/Contact.tsx` e será registrado em `src/App.tsx` tanto no array `PUBLIC_PATHS` quanto no bloco de rotas públicas. O formulário poderá reutilizar o comportamento de rastreamento e anti-spam de `LeadCaptureForm`, mas enviará os campos adicionais necessários ao intake.

A Edge Function `lead-intake` continuará sendo o ponto público de entrada. Ela validará nome e telefone, normalizará o telefone e gravará o lead com `origem = "Página de contato"`. O motivo selecionado e a mensagem serão combinados no campo existente `interesse`, evitando uma nova tabela e uma migração sem necessidade para este primeiro fluxo.

## Experiência

Em desktop, a página terá uma composição em duas colunas: formulário em destaque e painel institucional. Em telas menores, o formulário aparecerá primeiro, seguido pelos canais e endereço. O formulário deve usar linguagem direta, indicar claramente o que acontecerá após o envio e manter foco visível e navegação por teclado.

## Segurança e privacidade

- Não expor chaves privadas no navegador.
- Enviar apenas para a Edge Function já preparada para intake público.
- Preservar o honeypot existente.
- Exibir link para `/privacidade` junto ao formulário.
- Não inventar horário de atendimento, promessa de retorno ou outros dados não confirmados.

## Critérios de aceite

1. `https://funilcomercial.com/contato` é acessível sem autenticação.
2. Um envio válido registra um lead com nome, telefone, e-mail quando informado, origem e interesse/mensagem.
3. Nome ou telefone inválido bloqueia o envio e mostra erro compreensível.
4. O estado de sucesso impede duplicação acidental e confirma o recebimento.
5. Falha do endpoint mostra uma orientação para tentar novamente.
6. A página funciona em desktop e celular sem overflow horizontal.
7. O endereço completo aparece no bloco institucional e no schema `PostalAddress`.
8. Typecheck, testes e build passam.
