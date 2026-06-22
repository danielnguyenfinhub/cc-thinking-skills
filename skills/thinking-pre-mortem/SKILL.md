---
name: thinking-pre-mortem
description: Before committing to a plan or launch, assume it has already failed and reason backward through why — prospective hindsight surfaces risks that "what could go wrong?" misses.
---

# Pre-Mortem Analysis

## Overview
The pre-mortem, developed by psychologist Gary Klein, uses "prospective hindsight": instead of asking "What could go wrong?", assume the plan HAS failed and reason backward through why. Stating failure as already-happened surfaces concrete risks that forward-looking risk assessment glosses over.

**Core Principle:** It's easier to explain a failure that "already happened" than to predict one. Use that asymmetry productively in a single reasoning pass.

## When to Use
- Project kickoff (before work begins)
- Before committing to a major technical decision
- Sprint planning for high-risk work
- Before launch or major release
- When team seems overconfident
- After a plan is formed but before execution

Decision flow:
```
Starting significant work? → yes → Plan looks solid / on track? → yes → PRE-MORTEM ESSENTIAL
                                                              ↘ no → Pre-mortem still valuable
                         ↘ no → Standard risk assessment may suffice
```

## When NOT to Use
- The work is small, local, and reversible — failure is cheap to undo, so skip the ceremony.
- You're mid-incident under time pressure — act on the likely cause now (ooda/occams-razor); pre-mortem belongs *before* execution, not during firefighting.
- You'd only generate generic risks ("requirements unclear", "scope creep") that don't bind to this specific plan — stop if nothing concrete surfaces.
- The risks are already enforced by automated gates (CI, canary, rollback) — don't re-list what the system already catches.

## Trigger Card

Before committing to a plan or launch where optimism may be hiding risks:

1. **Assume it has already failed** — "It's six months later. The project was a disaster. What happened?"
2. **List concrete failure reasons** — specific to THIS plan, not generic. Why did it actually fail?
3. **Mitigate the top 3-5** — for each top failure reason, add a concrete safeguard or change the plan.

Skip if you'd only generate generic risks that don't bind to this specific plan. If risks are already enforced by automated gates (CI, canary, rollback), don't re-list what the system already catches. For a full launch risk review, run the full procedure.

## The Process

### Step 1: Set the Failure Frame
Adopt the stance that the plan has already failed, stated in past tense:
> "It is [future date, post-deadline]. This plan didn't just slip — it failed. The launch was rolled back / the migration corrupted data / adoption never happened."

Past tense is what makes this work: you are *explaining* a failure, not *predicting* one.

### Step 2: Generate Failure Reasons (one prospective-hindsight pass)
Reason through *why* it failed across every angle. Push for breadth, not comfort — aim for 15+ distinct reasons before filtering:
- **Technical:** wrong architecture, integration/contract breaks, scale limits, data loss
- **Process:** untested paths, no rollback, deploy timing, missing migration step
- **Assumptions:** which load-bearing assumption turned out false?
- **Dependencies/external:** upstream API, vendor, rate limits, config drift
- Force a second sweep: "What did I, the author of this plan, most want to be true that wasn't?"

Generate the full list first; do not prune or rank while generating (premature filtering anchors on the obvious risks).

### Step 3: Categorize and Prioritize
Group by theme and assess:

| Category | Risk | Likelihood | Impact | Priority |
|----------|------|------------|--------|----------|
| Technical | API integration fails | High | Critical | P0 |
| Process | Requirements unclear | Medium | High | P1 |
| People | Key person leaves | Low | Critical | P1 |
| External | Vendor delays | Medium | Medium | P2 |

### Step 4: Develop Mitigations
For top risks, define:
```
Risk: API integration fails
Mitigation:
- Spike on integration first, before depending on it
- Identify fallback vendor / degrade path
- Build abstraction layer for swap-ability
Verification: integration smoke test passes before downstream work begins
```

### Step 5: Update the Plan
Incorporate mitigations into the plan:
- Add spike/investigation tasks ahead of dependent work
- Build in contingency for the highest P×S risks
- Add a concrete verification/checkpoint for each top risk

## Pre-Mortem Template

```markdown
# Pre-Mortem: [Project Name]
Date: [Date]

## The Scenario
It is [Future Date]. [Project] has failed. 

## Failure Reasons Identified

### Technical
- [Reason 1]
- [Reason 2]

### Process  
- [Reason 1]
- [Reason 2]

### People/Team
- [Reason 1]
- [Reason 2]

### External/Dependencies
- [Reason 1]
- [Reason 2]

## Priority Risks and Mitigations

### P0: [Risk Name]
- **Description**: [What went wrong]
- **Mitigation**: [How to prevent]
- **Owner**: [Who]
- **Checkpoint**: [When to verify]

### P1: [Risk Name]
...

## Plan Updates
- [ ] [Action item from pre-mortem]
- [ ] [Action item from pre-mortem]
```

## Examples

### Example: Database Migration Pre-Mortem

```
Plan: Migrate 50M-row user table from MySQL to PostgreSQL over a weekend.

Failure frame: "It's Monday morning. The migration failed. Users can't log in."

Failure reasons generated:
- Schema differences caused silent data truncation on VARCHAR→TEXT fields
- Migration ran longer than the weekend window; partial state on Monday
- Application code assumed MySQL-specific query syntax
- Rollback plan didn't account for writes during the migration window
- Connection pool config differences caused cascading timeouts

Top risks + mitigations:
- P0: Partial migration state → run on read-replica first; cutover only on verified completion
- P0: Silent data truncation → dry-run migration on staging with row-count + checksum verification
- P1: MySQL-specific syntax → grep codebase for MySQL-isms; integration test suite against PG
```

### Example: API Versioning Launch Pre-Mortem

```
Plan: Ship v2 API alongside v1, deprecate v1 in 90 days.

Failure frame: "It's 90 days later. v1 is still carrying 80% of traffic. v2 adoption failed."

Failure reasons generated:
- v2 breaking changes were undocumented; clients didn't know what to change
- Migration guide assumed client architectures that didn't match reality
- v1 deprecation warnings were in response headers nobody read
- Internal services still pinned to v1, signaling it was safe to stay
- No client-by-client outreach; relied on docs alone

Top risks + mitigations:
- P0: Undocumented breaking changes → diff v1/v2 contracts, publish migration guide before launch
- P1: Internal services on v1 → migrate internal consumers first as proof of concept
- P1: No outreach → identify top-10 consumers by traffic, contact directly with timeline
```

## Why Pre-Mortems Work

1. **Reframes prediction as explanation**: Explaining an "already-happened" failure is concrete; predicting one stays vague.
2. **Defeats first-plausible-answer lock-in**: Generating the full failure list before ranking stops anchoring on the obvious risk.
3. **Surfaces buried assumptions**: Asking "what did the plan need to be true that wasn't?" exposes load-bearing assumptions the forward plan hid.
4. **Counters optimism**: The forced-failure stance overrides the natural bias toward "this will work."

## Common Failure Categories to Prompt

| Category | Example Failures |
|----------|-----------------|
| Requirements | Scope creep, unclear success criteria, missing stakeholder |
| Technical | Wrong architecture, integration failures, scale issues |
| Timeline | Underestimation, dependencies delayed, parallel work blocked |
| Team | Key person unavailable, skill gaps, communication breakdown |
| External | Vendor issues, regulatory changes, market shift |
| Process | Insufficient testing, deployment problems, no rollback |

## Execution Tips
- **Use past tense** consistently ("failed" not "might fail") — it's what triggers the hindsight effect.
- **Generate before filtering** — collect the full list, then rank; don't prune mid-sweep.
- **Interrogate the plan's own optimism** — what did the author most want to be true?
- **Convert to action** — a pre-mortem with no plan change is wasted; each top risk needs a mitigation + verification.

## Verification Checklist
- [ ] Run before significant work begins (not mid-incident)
- [ ] Failure frame stated in past tense
- [ ] 15+ distinct failure reasons generated before ranking
- [ ] Risks prioritized by likelihood × impact
- [ ] Top 3-5 risks have explicit mitigations
- [ ] Each mitigation has a concrete verification/checkpoint
- [ ] Plan updated to incorporate findings

## Key Questions
- "The plan failed. Why?"
- "What was obvious in retrospect that the plan missed?"
- "What warning signs would have shown up first?"
- "Which load-bearing assumption turned out to be false?"
- "What did the plan most need to be true that wasn't?"
