# Module Playbooks

Use these playbooks to keep CRM intelligence consistent across Funil Imobiliario.

## Dashboard

Purpose: act as the command center.

Recommend:

- top operational risk of the day
- leads waiting for response
- SLA breaches
- channels generating leads
- pipeline bottlenecks
- next module to open

Avoid:

- generic motivation
- long reports before the user asks

## Inbox

Purpose: decide how to respond and what to do with the conversation.

Recommend:

- short conversation summary
- reply suggestion
- qualification question
- whether to create or update opportunity
- whether to move to atendimento, qualificacao, visita, or proposta

Important signals:

- asked for price
- asked for visit
- asked for location
- sent WhatsApp first
- mentioned urgency
- mentioned family, investment, financing, or cash

## Atendimentos

Purpose: protect speed-to-lead.

Recommend:

- who should be answered first
- SLA status
- response urgency
- action button text
- reason for priority

Rules:

- WhatsApp and landing page leads should be answered quickly.
- A lead over 15 minutes without first response is critical.
- If the lead already has a conversation, suggest continuity instead of a cold greeting.

## Leads

Purpose: turn raw captured records into qualified commercial opportunities.

Recommend:

- qualification completeness
- missing fields
- likely intent
- next qualification question
- conversion to opportunity when minimum data exists

Minimum useful fields:

- phone
- source/channel
- interest
- budget or payment condition
- location preference
- purchase timing

## Contatos

Purpose: keep the CRM clean and avoid duplicates.

Recommend:

- duplicate risk
- incomplete profile fields
- whether this contact should be merged, enriched, or contacted
- canonical phone format

Phone rule:

- Use country code and digits only, for example `5551999999999`.

## Oportunidades / Funil

Purpose: keep commercial pipeline truthful.

Recommend:

- stage movement
- lost-risk signal
- follow-up task
- whether opportunity needs value, property, or next date

Rules:

- Do not advance an opportunity without evidence in the context.
- If the lead asks for visit, recommend `visita`.
- If price/payment is being discussed, recommend `negociacao` or `proposta`.
- If no recent interaction exists, recommend a follow-up before moving.

## Funil Parceiros

Purpose: qualify B2B opportunities with builders/developers.

Recommend:

- whether the partner fits the Funil Imobiliario model
- diagnostic questions
- next commercial step
- pipeline stage

Important partner data:

- company name
- region
- active developments
- current sales challenge
- expected volume
- commission or revenue-share model
- decision maker

## Imoveis

Purpose: connect inventory to lead demand.

Recommend:

- best matching leads
- missing property data
- commercial arguments
- whether property is usable in campaigns

Important property data:

- title
- type
- price or range
- city/neighborhood
- availability
- key differentials
- landing page or media assets

## Message style

When writing WhatsApp suggestions:

- Use short paragraphs.
- Ask one or two questions at a time.
- Avoid robotic greetings when the lead already started the conversation.
- Do not mention internal CRM terms.
- Do not promise approval, stock, or prices unless provided.

Example:

```text
Ola, tudo bem? Vi seu interesse pelo empreendimento. Para te orientar melhor, voce procura terreno para morar ou investir?
```

