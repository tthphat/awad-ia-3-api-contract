# NOTES — IA#3 API contract

## 1. Predictions (written before the agent ran)

1. **CONTRACT.md §4.2, steps 1–4 — "The server checks, **in this order**, and stops at the first step that fails"**, especially step 3: "**The key has been used before** (see *Idempotency* below): replay, or `422 idempotency-key-reused`, or `409 idempotency-key-in-flight`."
   **Why I expect the agent to get it wrong:** the usual habit is to parse and validate the body first and only then look up the key. The contract puts the key lookup (step 3) *before* field validation (step 4), and the missing-key check (step 1) *before* the JSON parse (step 2). So the same key with a different body must give `422 idempotency-key-reused` even when the new body is also invalid, and a replay must return the stored `201` without re-validating. The agent is likely to return `400 validation` in those cases.


2. **CONTRACT.md §4.4 — "`nextCursor` is `null` **if and only if** there are no more orders after this page. A client never receives a cursor that leads to an empty page."**
   **Why I expect the agent to get it wrong:** the common implementation returns a cursor whenever the page is full (`items.length === limit`). When the total number of orders is an exact multiple of `limit`, the last page then carries a cursor that leads to an empty page. The correct way is to fetch `limit + 1` rows and drop the extra one, and agents often skip that.


3. **CONTRACT.md §2, `not-found` row — "no resource with that id (also when the id is not a positive integer), or no such `/v1` path"**, together with the sentence that every 4xx/5xx under `/v1` "including a request for a `/v1` path that does not exist" is a problem details object.
   **Why I expect the agent to get it wrong:** the natural reflex is `400` for `GET /v1/orders/abc` or `GET /v1/menu/0`, because the id is invalid. The contract says `404 not-found`. The agent will also probably wire the problem+json 404 only for the routes it defined, so an unknown path such as `/v1/nothing` falls through to the framework's default plain 404 without `Content-Type: application/problem+json`.


4. **CONTRACT.md §4.2, Idempotency — "Two bodies are *the same* when they are equal as JSON values: key order and whitespace do not matter, any other difference does."**
   **Why I expect the agent to get it wrong:** the simple fingerprint is a hash of the raw request body or of `JSON.stringify(body)`. Both treat `{"tableId":7,"items":[...]}` and the same object with keys reordered or extra whitespace as different bodies, so a legitimate retry gets `422 idempotency-key-reused` instead of the stored `201`. Nested keys inside `items[i]` need canonicalising too.


## 2. First-run failures

_To fill in after `contract-run-1.txt` is committed. One line per failing test:_

- `<test name>` — CONTRACT §<section>: "<sentence>". Agent did: <what it did instead>. Suggested rewording: "<new sentence>" (only if the sentence can be read two ways).

## 3. Prediction outcomes

_To fill in after the final run:_

1. §4.2 order of checks: <came true / did not come true> — <what the agent actually did>.
2. §4.4 `nextCursor` rule: <came true / did not come true> — <what the agent actually did>.
3. §2 `not-found` (non-integer id, unknown `/v1` path): <came true / did not come true> — <...>.
4. §4.2 "equal as JSON values": <came true / did not come true> — <...>.

## 4. Sentences that could be read two ways

_To fill in after asking the agent: "Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?" At least one point must be found by me and not listed by the agent._

### A1 — CONTRACT §<section>
- Reading A: <...>
- Reading B: <...>
- Agent chose: <A or B>
- My decision: <A or B> — because <...>
- Sentence I would add to CONTRACT.md: "<...>"

### A2 — CONTRACT §<section> _(found by me)_
- Reading A: <...>
- Reading B: <...>
- My decision: <...> — because <...>
- Sentence I would add to CONTRACT.md: "<...>"

## 5. Findings about tests or the contract

_If a test or the contract looks wrong, write it here. Do not edit `test/` or `CONTRACT.md`._
