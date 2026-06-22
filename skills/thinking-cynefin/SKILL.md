---
name: thinking-cynefin
description: Use when unsure how to approach a problem—plan, analyze, experiment, or stabilize first. Classify it by cause-effect (clear/complicated/complex/chaotic) and match the approach to the domain.
---

# Cynefin Framework

## Overview

Cynefin (Dave Snowden) classifies a problem by the relationship between cause and effect, then prescribes the matching approach. Using the wrong approach for the domain is the failure mode: detailed planning is useless in chaos, and experimentation is reckless when a best practice already exists.

**Core Principle:** The nature of the problem determines the approach. Classify first, then act.

## The Classifier

| Cause–effect is… | Domain | Approach | Do this |
|------------------|--------|----------|---------|
| Obvious to anyone | **Clear** | Sense → Categorize → Respond | Apply the known best practice / runbook; don't over-engineer |
| Knowable with expertise/analysis | **Complicated** | Sense → Analyze → Respond | Investigate, profile, design; multiple valid solutions exist |
| Only visible in retrospect (emergent) | **Complex** | Probe → Sense → Respond | Run small safe-to-fail probes, amplify what works |
| Not perceivable; turbulent | **Chaotic** | Act → Sense → Respond | Act now to stabilize (rollback/failover), understand later |
| Unsure which domain | **Disorder** | Decompose | Split into parts and classify each part |

```
Can you see clear cause→effect?
  obvious to everyone        → CLEAR
  knowable with analysis     → COMPLICATED
  only clear in hindsight    → COMPLEX
  totally turbulent, no time → CHAOTIC
  can't tell                 → DISORDER (decompose)
```

## When to Use

- You're unsure whether to plan, analyze, experiment, or just act
- An approach isn't working and you suspect it's mismatched to the problem
- Triaging an incident (is this stabilize-first chaos, or analyzable?)

Decision flow:

```
Unsure how to approach?
  → Yes → Can you see cause→effect?
      obvious to everyone        → CLEAR (apply best practice)
      knowable with analysis     → COMPLICATED (analyze, design)
      only clear in hindsight    → COMPLEX (run safe-to-fail probes)
      totally turbulent, no time → CHAOTIC (act now, understand later)
      can't tell                 → DISORDER (decompose into parts)
  → No → You already know the approach; skip classification and execute
```

## When NOT to Use

- The domain is already obvious and the approach is uncontested → skip the ceremony and just do it.
- You've already classified and now need to execute → switch to the domain's actual method (debugging, a hypothesis differential, experiment design); Cynefin only routes, it doesn't solve.
- The question is "what is the cause," not "how should I approach this" → classification won't find the bug.

## The Common Mismatches (the whole point)

- **Complex treated as Complicated:** extensive planning, but outcomes keep surprising you. You can't analyze your way through emergence—probe instead.
- **Complicated treated as Clear:** "just do it like Company X" without understanding why. Context matters; analyze the specific case.
- **Chaotic treated as Complex:** running experiments during an active outage. Chaos needs immediate stability, not learning.
- **Clear treated as Complicated:** over-engineering a trivial problem. Apply the best practice and move on.

## Confidence Check

Before committing, test the classification:
- Clear? Do best practices reliably work here? If not → probably Complicated.
- Complicated? Can analysis predict the outcome? If not → probably Complex.
- Complex? Can you run a safe-to-fail probe? If it's too turbulent to probe → Chaotic.
- Re-check as the situation evolves; domains shift (chaos stabilizes into complex/complicated).

## Key Questions

- "What's the relationship between cause and effect here?"
- "Can experts reliably predict the outcome, or is it only clear in hindsight?"
- "Is this actually complex, or am I avoiding the analysis?"
- "Is this actually complicated, or am I over-planning a simple thing?"
- "Has the situation moved to a different domain since I last looked?"

## Procedure

### Step 1: State the Problem or Situation

Describe what you're trying to accomplish or resolve. Be specific enough that the classification is testable.

### Step 2: Classify by Cause-Effect Relationship

Ask: "Can experts reliably predict the outcome?" Walk the classifier table above.

### Step 3: Match the Approach to the Domain

Apply the prescribed approach (sense-categorize-respond for Clear, probe-sense-respond for Complex, etc.). If the approach feels wrong, re-check the classification.

### Step 4: Re-Check as the Situation Evolves

Domains shift — chaos stabilizes into complex/complicated, complicated systems become complex under novel conditions. Re-classify when the approach stops working.

## Examples

### Example: Production Outage Triage

```
Situation: API is returning 500s, error rate climbing, users reporting failures.

Classification:
  Can I see cause→effect? No — it's turbulent and getting worse.
  → CHAOTIC: Act first to stabilize.

Action: Roll back the last deploy. Observe. Error rate drops.
  → Situation stabilizes → reclassify as COMPLICATED.
  → Now analyze: what in the deploy caused it?
```

### Example: Flaky Test Suite

```
Situation: Tests pass locally but fail intermittently in CI.

Classification:
  Can I see cause→effect? Only in hindsight — sometimes it's timing,
  sometimes ordering, sometimes resource contention.
  → COMPLEX: Run safe-to-fail probes.

Action: Add timing instrumentation, randomize test order, isolate
  shared state. Amplify what reduces flakiness.
```

### Example: Adding a REST Endpoint

```
Situation: Need to add a standard CRUD endpoint following existing patterns.

Classification:
  Can I see cause→effect? Obvious — we have a pattern, it works reliably.
  → CLEAR: Apply the existing pattern.

Action: Follow the project's endpoint template. Don't over-engineer.
```

## Template

```markdown
# Cynefin Classification: [Situation]

## Problem/Situation
[What are you trying to accomplish or resolve?]

## Classification
- Cause-effect relationship: [obvious / knowable with analysis / only in hindsight / not perceivable]
- Domain: [Clear / Complicated / Complex / Chaotic / Disorder]
- Confidence in classification: [High / Medium / Low]

## Prescribed Approach
- [Approach matching the domain]

## Confidence Check
- [ ] Best practices reliably work here? (if yes → Clear)
- [ ] Analysis can predict the outcome? (if yes → Complicated)
- [ ] Can run a safe-to-fail probe? (if yes → Complex; if too turbulent → Chaotic)

## Actions
1. [Action matching the domain's approach]
2. [Re-check trigger: when will I re-classify?]
```

## Verification Checklist
- [ ] Classified the problem by cause-effect relationship, not by gut feel
- [ ] Matched the approach to the domain (not the approach I'm most comfortable with)
- [ ] Checked for common mismatches (Complex treated as Complicated, etc.)
- [ ] Set a trigger to re-classify if the situation changes
- [ ] If Disorder, decomposed into parts and classified each separately

## Snowden's Wisdom

"Complex systems are dispositional, not causal—you can't predict what will happen, only influence what might." The failure is rarely the methodology itself; it's applying the wrong methodology to the wrong domain.
