---
name: thinking-kepner-tregoe
description: Use when a defect is selective (some endpoints/regions/users/times affected, not all) and the cause is unclear — map what IS vs IS-NOT affected; the boundary contrast points at the root cause.
---

# Kepner-Tregoe Problem Analysis

## Overview

Kepner-Tregoe (KT) is a structured root-cause method. **This skill focuses on Problem Analysis (PA) — the IS/IS-NOT boundary contrast — which is the high-value KT process for debugging.** When a defect is *selective* (some cases affected, others not), the boundary between IS and IS-NOT reveals the distinction that points at the root cause.

Decision Analysis (DA) and Potential Problem Analysis (PPA) are de-emphasized here. For pure decision-making among alternatives, use `thinking-opportunity-cost`. For risk anticipation before a change, use `thinking-pre-mortem`. Those skills are purpose-built for those tasks; KT's DA/PPA add overhead without unique mechanism.

Situation Analysis (SA) is retained as a lightweight triage step when facing multiple concerns, but it is not a required preamble — jump directly to PA when the problem is already clear.

**Core Principle:** The boundary between what IS affected and what IS NOT affected encodes the root cause. Find the distinction, find the cause.

## When to Use

- A defect is **selective**: affects some endpoints/regions/users/times but NOT others — there is an IS-vs-IS-NOT boundary to contrast
- The cause is unclear and not obvious from a stack trace, error message, or a single recent change
- Multiple possible causes exist and you need a systematic way to narrow them
- A complex situation has multiple concerns that need triage before diving in

Decision flow:

```
Defect is selective (not 100%)? → No → IS/IS-NOT has no signal; use direct debugging or thinking-systems
                                → Yes → Cause obvious from stack trace/recent change? → Yes → Just fix it
                                                                                      → No → APPLY KT PROBLEM ANALYSIS
```

## When NOT to Use

- **The failure is uniform** (affects 100% of requests/everything) — there is no IS-vs-IS-NOT boundary to contrast; PA gives no signal. Use `thinking-systems` or direct debugging.
- **The cause is already obvious** from a stack trace, error message, or a single recent change — just fix it; IS/IS-NOT is overhead here.
- **A quick hypothesis is cheaply testable** — test it (`thinking-occams-razor`) before building a full specification matrix.
- **Pure decision-making with no deviation to diagnose** — use `thinking-opportunity-cost`, not KT's Decision Analysis.
- **Risk assessment for a planned change** — use `thinking-pre-mortem`, not KT's Potential Problem Analysis.

## Trigger Card

When a defect is selective (some cases affected, others not) and the cause is unclear:

1. **State the problem precisely** — what is the deviation? In what object? Where/when does it occur?
2. **Map IS vs IS-NOT** — what IS affected vs what IS NOT, side by side. The boundary is the signal.
3. **Find the distinction** — what is different about the IS cases vs the IS-NOT cases? That distinction IS the cause.

Skip if the failure is uniform (100%) — there's no boundary to contrast; use direct debugging. If the cause is obvious from a stack trace or recent change, just fix it. For a single cheaply-testable hypothesis, test it first.

## Procedure

### Step 1 (optional): Situation Analysis — Triage Multiple Concerns

Only when facing several problems at once. List all concerns, separate them if compound, and prioritize by Timing/Impact/Trend:

| Concern | Timing | Impact | Trend | Priority |
|---------|--------|--------|-------|----------|
| API latency spike | Urgent | High | Worsening | P0 |
| Checkout errors | Soon | High | Stable | P1 |

For each concern, decide: Problem Analysis (PA), or delegate to another skill.

### Step 2: State the Problem Precisely

Describe the deviation from expected behavior with specificity:

```
"API response time increased from 200ms to 800ms for /checkout endpoint,
US-East only, starting Monday 9 AM, affecting ~30% of requests."
```

### Step 3: Build the IS/IS-NOT Matrix

Specify the problem across four dimensions. The power is in the **distinction** column — what's unique about the IS side?

| Dimension | IS (affected) | IS NOT (not affected) | Distinction |
|-----------|---------------|----------------------|-------------|
| **WHAT** — object | /checkout endpoint | /cart, /product, /user | Payment processing |
| **WHAT** — defect | 4x latency increase | Errors, timeouts, data corruption | Performance only |
| **WHERE** — location | Production US-East | EU, US-West, staging | Single region |
| **WHERE** — on object | Database query phase | Auth, validation, serialization | DB layer |
| **WHEN** — first seen | Monday 9:00 AM | Before Monday, after 6 PM | Business hours |
| **WHEN** — pattern | During checkout submit | During browsing, cart add | Write operations |
| **EXTENT** — how many | ~30% of requests | 100% of requests | Intermittent |
| **EXTENT** — trend | Stable since Tuesday | Getting worse | Plateaued |

### Step 4: Extract Distinctions

For each row, ask: "What's unique or distinctive about the IS side compared to the IS-NOT side?"

```
Distinctions:
- Only /checkout (payment processing) — not other endpoints
- Only US-East (specific DB replica) — not other regions
- Only during business hours (load-related?) — not off-peak
- Only ~30% of requests (specific query pattern?) — not all
- Started Monday 9 AM — what changed?
```

### Step 5: Identify Changes

What changed in, on, around, or about the distinctions near the first observation time?

```
Changes near Monday 9 AM:
- Payment provider SDK updated (Sunday night deploy)
- Database index rebuild scheduled (Sunday maintenance)
- New fraud detection rules enabled (Monday 8:45 AM)
```

### Step 6: Generate and Test Possible Causes

Each candidate cause must explain BOTH the IS and the IS-NOT:

| Possible Cause | Explains IS? | Explains IS-NOT? | Verdict |
|----------------|-------------|------------------|---------|
| Fraud rules adding DB queries | ✓ Only checkout, only write ops | ✓ Not other endpoints | **Pursue** |
| Payment SDK change | ✓ Only checkout | ✗ Would affect all regions | Ruled out |
| Index rebuild | ✓ DB layer | ✗ Would affect all queries | Ruled out |

### Step 7: Verify the True Cause

Design a test to confirm or rule out the leading candidate:

```
Verification for "Fraud detection rules":
1. Check: Rules enabled 8:45 AM (matches timeline)
2. Check: Rules only on checkout (matches scope)
3. Test: Disable rules in canary, measure latency
4. Examine: Query logs for fraud check queries
```

## Output Contract

A completed KT Problem Analysis produces:

1. **Problem Statement** — specific, measurable deviation
2. **IS/IS-NOT Matrix** — all four dimensions with distinctions extracted
3. **Changes List** — what changed near the distinctions around the first observation
4. **Cause Test Table** — each candidate tested against IS and IS-NOT
5. **Confirmed Root Cause** — with verification evidence
6. **If used, SA Triage** — prioritized concern list with assigned processes

## Examples

### Example: Regional API Latency

```
Problem: /checkout latency 4x in US-East only, started Monday 9 AM.

IS/IS-NOT:
  WHAT:  /checkout IS affected; /cart, /product IS NOT → payment processing
  WHERE: US-East IS; EU, US-West IS NOT → single region
  WHEN:  Monday 9 AM IS; before Monday IS NOT → recent change

Distinction: payment processing + single region + Monday morning
Change: fraud detection rules enabled Monday 8:45 AM
Cause test: rules add DB queries → explains /checkout only + write ops
Verification: disable rules in canary → latency normalizes ✓
```

### Example: Intermittent Test Failures

```
Problem: test_user_auth fails ~20% of CI runs, never locally.

IS/IS-NOT:
  WHAT:  test_user_auth IS; all other tests IS NOT → auth-specific
  WHERE: CI IS; local IS NOT → environment difference
  WHEN:  ~20% of runs IS; 80% IS NOT → intermittent/timing
  EXTENT: only when run after test_session_cleanup IS → ordering dependency

Distinction: auth + CI-only + after session cleanup
Change: test_session_cleanup added last sprint, clears shared session store
Verification: run tests in isolation → passes 100% ✓
Root cause: shared session state between tests
```

## Template

```markdown
# KT Problem Analysis: [Problem Name]

## Problem Statement
[Specific, measurable deviation from expected behavior]

## IS / IS-NOT Matrix

| Dimension | IS (affected) | IS NOT (not affected) | Distinction |
|-----------|---------------|----------------------|-------------|
| WHAT — object | | | |
| WHAT — defect | | | |
| WHERE — location | | | |
| WHERE — on object | | | |
| WHEN — first seen | | | |
| WHEN — pattern | | | |
| EXTENT — how many | | | |
| EXTENT — trend | | | |

## Distinctions
- [What's unique about the IS side?]

## Changes Near First Observation
- [What changed in/on/around the distinctions?]

## Cause Testing

| Possible Cause | Explains IS? | Explains IS-NOT? | Verdict |
|----------------|-------------|------------------|---------|
| | | | |

## Confirmed Root Cause
[Cause + verification evidence]
```

## Verification Checklist
- [ ] Problem is selective (not 100% failure) — IS/IS-NOT has a boundary to contrast
- [ ] IS/IS-NOT matrix filled across at least WHAT, WHERE, WHEN dimensions
- [ ] Distinctions extracted — what's unique about the IS side is explicitly stated
- [ ] Changes near the first observation time are identified
- [ ] Each candidate cause tested against BOTH IS and IS-NOT
- [ ] Root cause confirmed with verification evidence, not just plausibility

## Key Questions

- "What IS affected vs what IS NOT affected?"
- "What is different about the IS cases — what distinction exists that the IS-NOT cases lack?"
- "When did this first appear, and what changed near that time?"
- "Does the candidate cause explain BOTH the IS and IS-NOT sides?"
- "Is this 100% failure (no boundary to contrast) or selective?"
- "Have I tested my cause against the IS-NOT column, not just the IS column?"

## Anti-Patterns

| Anti-Pattern | Symptom | Correction |
|---|---|---|
| **KT on uniform failure** | Running PA when 100% of requests fail | No boundary to contrast; use direct debugging or `thinking-systems` |
| **Over-specifying the matrix** | Filling every IS/IS-NOT cell for a simple bug | Stop when the distinction is clear; don't ritualize |
| **DA/PPA sprawl** | Running full Decision Analysis or Potential Problem Analysis for routine tasks | Redirect to `thinking-opportunity-cost` (decisions) or `thinking-pre-mortem` (risks) |
| **Skipping cause testing** | Pursuing the first plausible cause without testing against IS-NOT | Every cause must explain BOTH IS and IS-NOT |
| **SA as mandatory preamble** | Running full Situation Analysis before every PA | Jump directly to PA when the problem is already clear |
| **Ignoring the distinction** | Building the matrix but not extracting what's unique about IS | The distinction IS the signal; without it, the matrix is just a table |
