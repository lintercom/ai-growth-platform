# @aig/web-toolkit

AI-First Web Toolkit - náhrada klasického webového stacku

## Přehled

Tento balíček obsahuje 12 AI-powered modulů, které nahrazují konvenční webové technologie:

1. **Intent-Based Router** - navigace podle záměru, ne URL
2. **AI State Reasoner** - pravděpodobnostní stav místo booleanů
3. **AI Content Orchestrator** - generování obsahu podle kontextu
4. **AI SEO Reasoning Engine** - SEO založené na porozumění intentu
5. **Conversational Data Collector** - formuláře jako rozhovor
6. **AI Product Reasoner** - produkty jako řešení problémů
7. **Contextual Personalization Engine** - emergentní segmentace
8. **AI Event Interpreter** - eventy jako signály chování
9. **Hypothesis-Driven Optimizer** - AI generuje a testuje hypotézy
10. **AI Decision Engine** - adaptivní business logika
11. **AI Recovery Layer** - chyby jako konverzace
12. **AI System Operator** - administrace přes chat

## Instalace

```bash
pnpm add @aig/web-toolkit
```

## Použití

### Intent-Based Router

```typescript
import { IntentBasedRouter } from '@aig/web-toolkit';
import { OpenAIClient } from '@aig/core';

const router = new IntentBasedRouter(client, {
  routes: [
    {
      path: '/products/pumps',
      intent: 'find_pump',
      description: 'Hledání čerpadel',
    },
    {
      path: '/contact',
      intent: 'get_help',
      description: 'Kontakt a pomoc',
    },
  ],
});

const route = await router.resolveIntent('potřebuju čerpadlo na studnu');
console.log(route.path); // '/products/pumps'
```

### AI Content Orchestrator

```typescript
import { AIContentOrchestrator } from '@aig/web-toolkit';

const orchestrator = new AIContentOrchestrator(client);

const content = await orchestrator.generateContent(
  {
    type: 'structured_data',
    data: { productName: 'Pump X', features: ['...'] },
    rules: ['Emphasize reliability', 'Use simple language'],
  },
  { userType: 'B2B', market: 'CZ' }
);
```

### AI Product Reasoner

```typescript
import { AIProductReasoner } from '@aig/web-toolkit';

const reasoner = new AIProductReasoner(client, products);

const recommendation = await reasoner.recommendProducts(
  'potřebuju čerpadlo na hlubokou studnu, 30m'
);

console.log(recommendation.products);
console.log(recommendation.tradeOffs);
```

### AI System Operator

```typescript
import { AISystemOperator } from '@aig/web-toolkit';

const operator = new AISystemOperator(client);
operator.setSystemData({
  conversions: 1250,
  visitors: 10000,
  revenue: 50000,
});

const response = await operator.query({
  question: 'proč klesly konverze?',
});

console.log(response.answer);
console.log(response.recommendations);
```

## Paradigm Shift

Tradiční web → AI-First web:

- **Routing**: URL → Intent
- **State**: Boolean → Probabilistic
- **Content**: Static → Contextual
- **SEO**: Keywords → Intent understanding
- **Forms**: Fields → Conversation
- **Products**: List → Solutions
- **Personalization**: Rules → Emergent
- **Analytics**: Numbers → Signals
- **Testing**: Manual → AI-driven
- **Logic**: Fixed → Adaptive
- **Errors**: Pages → Conversations
- **Admin**: UI → Chat

## Dokumentace

Každý modul má vlastní rozhraní a schémata. Viz TypeScript typy pro detailní API.
