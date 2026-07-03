---
name: funil-crm-intelligence
description: Use this skill whenever the task involves CRM intelligence for Funil Imobiliario: inbox triage, lead qualification, contatos, leads, oportunidades, funil parceiros, imoveis, atendimentos, SLA, next best action, suggested WhatsApp replies, pipeline stage recommendations, or operational diagnosis across the real estate sales funnel. This skill turns CRM context into structured, actionable guidance for the user or product UI.
---

# Funil CRM Intelligence

Use this skill as the operational intelligence layer for the Funil Imobiliario CRM. The goal is not to write generic advice; it is to convert CRM context into a clear next action that a broker, SDR, sales manager, or partner operator can execute immediately.

The skill should help the product feel like an intelligent command center: every module should answer three questions quickly:

1. What is happening with this lead, opportunity, property, partner, or conversation?
2. What matters most right now?
3. What should the user do next?

## Core behavior

When given CRM context, produce a structured operational recommendation with:

- concise summary
- priority level
- reason for priority
- next best action
- suggested message when relevant
- recommended pipeline stage
- missing fields or risks
- follow-up tasks
- UI placement suggestions when the request is product/design oriented

Prefer decisions that reduce lead loss, speed up first response, and keep every captured lead visible in the CRM.

## When to use

Use this skill for:

- inbox triage and conversation summarization
- WhatsApp or atendimento response suggestions
- lead qualification and lead enrichment
- contact deduplication or incomplete data diagnosis
- opportunity stage recommendations
- sales pipeline hygiene
- partner funnel qualification
- property-to-lead matching
- SLA and urgency prioritization
- dashboard assistant responses
- CRM product improvements involving intelligence or automation

Do not use this skill for:

- pure visual redesign without CRM decision logic
- low-level database migrations without operational interpretation
- creative ad image generation
- generic marketing copy unrelated to CRM operations

## Required approach

1. Identify the module:
   - `inbox`
   - `contatos`
   - `leads`
   - `oportunidades`
   - `funil_parceiros`
   - `imoveis`
   - `atendimentos`
   - `dashboard`

2. Normalize context:
   - lead identity
   - source channel
   - conversation/message history
   - current status
   - current pipeline stage
   - time since capture or last interaction
   - property interest
   - commercial intent
   - missing data

3. Decide priority:
   - `critica`: lead hot, SLA breached, direct WhatsApp intent, visit/payment/budget signal, or high-value opportunity stalled
   - `alta`: new inbound lead, strong buying intent, visit interest, or partner with clear commercial fit
   - `media`: lead needs qualification, incomplete profile, unclear timing, or early-stage opportunity
   - `baixa`: cold, duplicated, low intent, archived, or waiting on external information

4. Recommend the next action:
   - keep it concrete
   - start with a verb
   - make it executable in the CRM
   - avoid vague advice such as "follow up later" without a time, reason, or message

5. If suggesting a message:
   - write in Brazilian Portuguese
   - keep a professional, direct, human tone
   - do not overpromise availability, price, financing, or approval
   - avoid exact commercial claims unless present in the provided context
   - make the message useful for WhatsApp

6. If the request is for product implementation:
   - define the shape of the data the frontend needs
   - suggest where the intelligence should appear in the UI
   - keep the MVP simple before proposing automation-heavy flows

## Output format

For product or API work, return this JSON-like structure:

```json
{
  "module": "atendimentos",
  "summary": "Lead capturado via WhatsApp demonstrou interesse em visitar um empreendimento.",
  "priority": "alta",
  "priorityReason": "Lead veio de canal conversacional e ainda precisa de primeira resposta.",
  "nextBestAction": "Responder agora, confirmar interesse e coletar bairro, faixa de investimento e prazo de compra.",
  "suggestedMessage": "Ola, tudo bem? Vi seu interesse pelo empreendimento. Para eu te direcionar melhor, voce procura terreno para morar ou investir?",
  "recommendedStage": "qualificacao",
  "missingFields": ["faixa de investimento", "prazo de compra", "preferencia de bairro"],
  "risks": ["Lead pode esfriar se nao receber resposta rapida."],
  "tasks": [
    "Assumir atendimento",
    "Registrar origem e interesse",
    "Mover oportunidade para qualificacao"
  ]
}
```

For strategic analysis, use short sections:

- Diagnosis
- Priority
- Recommended Action
- Suggested Implementation
- Risks
- Next Step

## Reference files

Read these only when needed:

- `references/context-schema.md`: use when implementing payloads, services, RPC output, or frontend state.
- `references/module-playbooks.md`: use when deciding behavior for a specific CRM module.

