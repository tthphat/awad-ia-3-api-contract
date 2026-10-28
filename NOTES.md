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

`contract-run-1.txt`: 29 tests, 27 pass, 0 fail, 2 cancelled. Both cancelled tests are in the suite `§4 two instances, one database`, whose `before` hook failed (`npm run migrate failed: undefined`, `null !== 0`, test/contract.test.js:333,362) before they ran. The agent's behaviour on these two tests is therefore unknown from this run.

- `§4.2 a retry that lands on the other instance is still a replay` — CONTRACT §4.2: "That retry must not place a second order." Agent did: unknown, the test was cancelled by the suite before hook prior to execution. Hook failure cause: `test/contract.test.js:333` defines `const ROOT = new URL('..', import.meta.url).pathname;` which produces `/D:/...` on Windows, causing `spawnSync(process.execPath, ['scripts/migrate.js', 'up'], { cwd: ROOT, ... })` at line 362 to fail with an invalid working directory. Suggested rewording: the contract never explicitly says the service may run as several instances, so add: "The server may run as several instances sharing one database. Idempotency keys must be stored in the database, never in process memory."

- `§4.4 a cursor from one instance works on the other` — CONTRACT §4.4: "A cursor is opaque: the client stores it and sends it back unchanged, and never builds one." Agent did: unknown, cancelled by the before hook prior to execution for the same reason. Suggested rewording: "A cursor must work on any instance sharing the database and must not depend on state held in one process."

## 3. Prediction outcomes

1. §4.2 order of checks: did not come true — test "the key is checked before the body" passed on the first run.
2. §4.4 nextCursor rule: did not come true — test "nextCursor is null exactly when there is nothing more" passed on the first run.
3. §2 not-found (non-integer id, unknown `/v1` path): did not come true — tests "an unknown /v1 path is a 404 problem" and "unknown or malformed id is 404 not-found" passed on the first run.
4. §4.2 equal as JSON values: did not come true — test "the same body means the same JSON value" passed on the first run.

## 4. Sentences that could be read two ways

_To fill in after asking the agent: "Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?" At least one point must be found by me and not listed by the agent._

### A1 — CONTRACT §<section>
- Reading A: <...>
- Reading B: <...>
- Agent chose: <A or B>
- My decision: <A or B> — because <...>
- Sentence I would add to CONTRACT.md: "<...>"

## 5. Findings about tests or the contract

1. **POSIX path assumption in `test/contract.test.js`**:
   In `test/contract.test.js:333`, `const ROOT = new URL('..', import.meta.url).pathname;` evaluates to `/D:/...` on Windows. When passed to `spawnSync` at line 362 (`cwd: ROOT`), Windows rejects the path because of the leading slash, causing `m.status` to be `null` and failing `assert.equal(m.status, 0)` with `null !== 0`. Standard Node ESM code should use `fileURLToPath(new URL('..', import.meta.url))` from `node:url` for cross-platform compatibility.

2. **Omission of multi-instance deployment in `CONTRACT.md`**:
   `CONTRACT.md` never explicitly states that the service may run as multiple concurrent instances sharing one database. This requirement was taught in lecture slides (Sessions 4 & 5), but was omitted from the formal specification document.
