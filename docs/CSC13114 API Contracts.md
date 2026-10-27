→ ← slide · o index · f fullscreen · d dark · ? keys

CSC13114 · Session 05 · Oct 22, 2026

# AWAD05 - API Contracts - HK1 2627

CSC13114 — Advanced Web Application Development · CQ2023/3 · Oct 22, 2026 · cs2:G202

## Advanced Web Application Development

- Session 5 of 15 · Thursday, periods 2–5 · cs2:G202
- Today: API contracts — the part of your system that other people build on
- Nguyễn Huy Khánh — nhkhanh@fit.hcmus.edu.vn
- Classroom `2609-AWAD-23/3` — join code **i63ft334**

AWAD05 - API Contracts - HK1 2627§12 / 34

## Today

- Why the contract comes before the code — more so when an agent writes the code
- One error model: problem details, RFC 9457
- Pagination that neither repeats nor skips
- Idempotency: a retry must not place a second order
- Versioning: changing an API that people already call
- In the room: the contract is written, the agent implements it, the tests judge

AWAD05 - API Contracts - HK1 2627§23 / 34

## Where we are

- `IA#2` closed Wednesday, October 14 at 22:00. We may check out your tags and replay them
- `PA#1` is marked. Your mark and written feedback arrive on Classroom as a private comment
- **Turn in from your `<StudentID>@student.hcmus.edu.vn` Google account** — the deadline to switch was Sunday, October 18. Check the avatar before every *Turn in*

AWAD05 - API Contracts - HK1 2627§34 / 34

## The Facebook proposal contest

- Reactions closed Wednesday, October 14 at 22:00, as announced on October 8
- The proposal with the most reactions — announced now, in the room
- It earns bonus points on the project mark; tied proposals each earn them
- The amount is announced in the room and posted on Classroom
- Read the three proposals with the most reactions — and ask what made a stranger care

AWAD05 - API Contracts - HK1 2627§45 / 34

## Project checkpoints

| Checkpoint | Taught in session | Due, 22:00 |
| --- | --- | --- |
| `PA#2` harness and quality gate | 7 · Nov 5 | Wed Nov 11 |
| `PA#3` prototype with the LLM feature running | 9 · Nov 19 | Wed Nov 25 |
| `PA#4` eval, guardrail, human gate, red-team | 10 · Nov 26 | Wed Dec 2 |
| `PA#5` final build, running and observed | 11 · Dec 3 | Wed Dec 16 |
| `SEMINAR` | 12–13 · Dec 10, Dec 17 | in session |
| `PA#6` individual oral | 14–15 · Dec 24, Dec 31 | in session |

Each checkpoint is due the Wednesday after its session; `PA#5` gets two weeks.

The October 15 session was cancelled, so every topic moved one week. In `PA#1`,

the weakest criterion across teams was the plan against this calendar — most often

the LLM feature arriving after `PA#3`.

AWAD05 - API Contracts - HK1 2627§56 / 34

## Part 1: the contract

- What other people build on

AWAD05 - API Contracts - HK1 26277 / 34

## The contract is what other people build on

- Your frontend, a mobile app, another team, a script, an agent — they read the contract, not your code
- With enough users, **everything observable** becomes part of it: status codes, field names, error shapes, the order of a list (Hyrum's law)
- So write down what you promise. Whatever you leave out, someone will depend on anyway — and you will not know until you change it

AWAD05 - API Contracts - HK1 2627§68 / 34

## Contract first, then the agent

- Contract → review by a human → **freeze** → the agent implements → contract tests judge
- The contract is the spec the agent works from **and** the test it must pass
- A test fails? Fix the code. The agent wants to change the contract? That is a pull request a human reviews — a gate, as in session 3
- Code first, contract after: you document whatever the agent happened to do

AWAD05 - API Contracts - HK1 2627§79 / 34

## What a contract pins down, per endpoint

```
Request      method, path, headers, body — a rule for every field
Responses    every status, with its body and headers
Errors       condition → status → type
Lists        order, page size, how to get the next page
Retries      what happens when the same request arrives twice
Versions     what may change without notice, and how the old one ends
```

- Session 2 gave you the *Contract* section of a spec. This is that section, done properly
- Machine-readable form: **OpenAPI**. Today it is Markdown, so that you read every line

AWAD05 - API Contracts - HK1 2627§810 / 34

## Part 2: one error model

- Clients branch on errors. Give them one thing to branch on

AWAD05 - API Contracts - HK1 262711 / 34

## One codebase, four error shapes

```
404  {"error": "not_found", "message": "menu item 9 not found"}
400  {"message": "qty must be positive"}
409  "Conflict"
500  <pre>TypeError: Cannot read properties of null (reading 'tableId')
         at placeOrder (/app/src/orders.js:41:18)</pre>
```

- Every client now writes four parsers. Ask an agent for a new endpoint and it writes a fifth
- Each endpoint was written on a different day — or by a different prompt

AWAD05 - API Contracts - HK1 2627§912 / 34

## Problem details: RFC 9457

```
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{ "type":   "https://menu.example/problems/unknown-menu-item",
  "title":  "Unknown menu item",
  "status": 422,
  "detail": "1 line names an unknown menu item",
  "errors": [ { "pointer": "/items/1/menuItemId",
                "detail":  "menu item 99999 does not exist" } ] }
```

- **`type` is the contract**: clients branch on it — never on `title` or `detail`
- `status` repeats the HTTP status, so the body still makes sense in a log
- Extra members such as `errors` are allowed. Write them into the contract, and list **every** broken field, not just the first

AWAD05 - API Contracts - HK1 2627§1013 / 34

## Status says what to do; type says why

| Status | Means | The client should |
| --- | --- | --- |
| 400 | malformed: bad JSON, a broken field rule | fix the request |
| 404 | no such resource | stop |
| 409 | conflicts with the current state — e.g. the same request still running | wait, retry |
| 422 | well-formed, but cannot be done — unknown item, key reused | fix the request |
| 429 | too many requests — read `Retry-After` | wait that long |
| 500 / 503 | our fault / not now | retry later, with backoff |

401 and 403 are next week. Two different 422s are told apart by `type`, not by status.

AWAD05 - API Contracts - HK1 2627§1114 / 34

## What a 500 must not say

```
"detail": "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email"
"detail": "connect ECONNREFUSED 10.0.3.7:5432"
```

- A table name, a column, an internal address, a file path: a map for an attacker
- The client gets a fixed sentence and `type …/internal`. The log gets the stack, tied together by a request id
- An uncaught exception in Express prints a stack trace whenever `NODE_ENV` is not `production`. Check what yours returns today

AWAD05 - API Contracts - HK1 2627§1215 / 34

## Part 3: pagination

- Pages that stay still while the data moves

AWAD05 - API Contracts - HK1 262716 / 34

## Offset pages move under the client

Run on today's starter: with `OFFSET`, one order placed between two requests and page 2 shows order 8 a second time. Delete one instead and an order is skipped, silently.

AWAD05 - API Contracts - HK1 2627§1317 / 34

## Cursor pagination

```
GET /v1/orders?tableId=7&limit=5
200 { "items": [ {"id": 12, …}, …, {"id": 8, …} ], "nextCursor": "eyJ2IjoxLCJpZCI6OH0" }

GET /v1/orders?tableId=7&limit=5&cursor=eyJ2IjoxLCJpZCI6OH0
     … WHERE table_id = 7 AND id < 8 ORDER BY id DESC LIMIT 6
```

- The cursor is a **position**, not a page number — and opaque: clients never build one
- Fetch `limit + 1` rows: `nextCursor` is `null` **exactly** when nothing is left
- The sort key must be unique and indexed: `(created_at, id)`, never `created_at` alone
- The price: no "jump to page 37". A feed or an order history never needed it

AWAD05 - API Contracts - HK1 2627§1418 / 34

## Write the paging rules down

- Default page size, maximum page size — and what happens above it: **an error, or clamped?** Either is fine. Not saying is not
- The order, in words: "newest first, by id"
- A cursor the server cannot read: `400`, which `type`, which `parameter`
- How long a cursor stays valid, and whether it carries the filter with it
- What a client sees when rows are added or removed while it walks the pages

AWAD05 - API Contracts - HK1 2627§1519 / 34

## Part 4: idempotency

- The retry that orders twice

AWAD05 - API Contracts - HK1 262720 / 34

## The retry that orders twice

| Time | Client (phone, 3G) | Server |
| --- | --- | --- |
| 1 | `POST /orders` |  |
| 2 |  | creates order 41, commits |
| 3 |  | sends `201` — the connection drops |
| 4 | timeout: "did it work?" — sends again |  |
| 5 |  | creates order 42 |

- Nobody did anything wrong. Two dishes come out of the kitchen; a card is charged twice
- The same shape as session 4's lost update: two requests, each correct alone

AWAD05 - API Contracts - HK1 2627§1621 / 34

## `Idempotency-Key`

```
POST /v1/orders
Idempotency-Key: 6f1c2e0a-8d9b-4c55-a3f1-2b7e9c1d0e44     one key per intended order
```

| The server sees | It answers |
| --- | --- |
| same key, same body | the **stored** response: same status, same body, `Idempotent-Replayed: true` |
| same key, different body | `422 …/idempotency-key-reused` — nothing created |
| same key, first one still running | `409` — wait and retry |
| no key | `400` — on this endpoint the key is required |

From the IETF draft *The Idempotency-Key HTTP Header Field*; Stripe has worked this way for a decade. On the starter: two `POST`s without a key, two orders; with one key, one order and a replay.

AWAD05 - API Contracts - HK1 2627§1722 / 34

## Where the key lives

```
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY, fingerprint TEXT NOT NULL,
  status INTEGER NOT NULL, location TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
-- one transaction: insert the order AND its key
```

- In the **database**, not in a `Map` — the retry may land on the other instance
- The `PRIMARY KEY` is the last guard: two instances racing on one key cannot both win
- Store **only a success**: after a `400`, the client fixes the body and retries with the same key
- "Same body" means the same JSON value — key order and whitespace do not count
- `GET`, `PUT` and `DELETE` are idempotent by definition. `POST` and `PATCH` are not, unless you make them

AWAD05 - API Contracts - HK1 2627§1823 / 34

## Part 5: versioning

- Changing an API that people already call

AWAD05 - API Contracts - HK1 262724 / 34

## What breaks a client

| Change | Safe? |
| --- | --- |
| add a response field · add an optional request field · add an endpoint | yes |
| add a value to an enum the client `switch`es on | **often not** |
| rename or remove a field · change its type or **unit** | no — `IA#2`: `price` in thousands → `priceVnd` |
| make an optional field required · tighten a rule | no |
| change an error's shape, or the default order or page size | no |

Clients must ignore fields they do not know. Write that into the contract too — it is what makes "add a field" safe.

AWAD05 - API Contracts - HK1 2627§1925 / 34

## Versions, and how an old one ends

```
GET /menu/1                              the legacy API, unchanged until it is gone
200 {"id": 1, "name": "Phở bò", "price": 45.5}
Deprecation: @1792022400                 RFC 9745 — deprecated since 15 Oct 2026
Sunset: Thu, 31 Dec 2026 23:59:59 GMT    RFC 8594 — gone after this
Link: </v1/menu/1>; rel="successor-version"
```

- `/v1` in the path. Within a version, only additive changes. A breaking change is `/v2`
- The old version keeps **its own** behaviour to the end — **including its errors**
- "Make every error problem+json" must not reach the legacy routes: old clients parse `error`

AWAD05 - API Contracts - HK1 2627§2026 / 34

## Contract tests: the contract, executable

- One test per promise, named after the sentence it checks: `§4.2 the same key with a different body is 422`
- Over HTTP, from the outside — they do not care how the code is written
- Written **from the contract, not from the code**, and not by the agent that writes the code
- A test suite earns trust only when it fails on wrong code. We broke the reference solution 28 ways, one agent mistake each; the suite caught all 28

AWAD05 - API Contracts - HK1 2627§2127 / 34

## Part 6: today's work

- The contract is written. The agent implements it. The tests judge

AWAD05 - API Contracts - HK1 262728 / 34

## In the room: the starter

1. Clone **github.com/fithcmus/awad-api-contract-starter** — Node 22.5+, no dependencies
2. `npm run migrate && npm run seed && npm test && npm run contract` — legacy green, contract 0 of 29
3. Read `CONTRACT.md` for ten minutes, **without the agent**
4. Start `NOTES.md`: the two sentences you expect the agent to get wrong, and why — **commit it before the agent runs**

AWAD05 - API Contracts - HK1 2627§2229 / 34

## In the room: hand it over

1. Prompt your agent with the paragraph in the README: implement `/v1` from `CONTRACT.md`, do not read `test/`, do not edit the contract
2. Before fixing anything: `npm run contract 2>&1 | tee contract-run-1.txt`
3. Get to green by giving the agent **test names and contract sections**, not test code. Save `contract-run-final.txt`
4. Ask it which sentences could be read two ways, and what it chose. Decide each one in `NOTES.md`

AWAD05 - API Contracts - HK1 2627§2330 / 34

## What our rehearsal found

| Given to the agent | First attempt, before any fix |
| --- | --- |
| today's `CONTRACT.md` — 205 lines, a larger model | **29 of 29** — and it listed 7 sentences it had to guess at |
| the same contract, a small, fast model | **27 of 29** — it reported "all 8 error types working, no ambiguities" |
| a 14-line brief — "problem details, cursor pagination, idempotent `POST`…" — the larger model | **11 of 29** |

- Small model, full contract: a `500` that said `no such table: orders` (slide 15, live), and bodies compared as text, so a retry with its keys reordered was refused. Its own report missed both
- The brief: invented error `type`s, an `{field, message}` shape, `Deprecation: true` instead of a date, no `Link` — a client written to the real contract breaks on every error
- Same starter, same prompt, same afternoon. The contract moved the score most; the tests caught what the agent's own report did not

AWAD05 - API Contracts - HK1 2627§2431 / 34

## What you turn in: `IA#3`

- Individual, 100 points, 2% of the course. On Classroom by **Wednesday, October 28, 22:00** — the rubric is in the assignment
- One zip of your starter repository **with `.git`**, named `<StudentID>_<total>.zip`
- Inside: your `/v1` code, `contract-run-1.txt`, `contract-run-final.txt`, `NOTES.md`, `AI-LOG.md`, `SELF_ASSESSMENT_REPORT.md`
- Scored: tests pass 30 · rules kept 10 · predictions 10 · first run explained 20 · two-way sentences 20 · `AI-LOG.md` 10
- We re-run the tests ourselves. An edited `test/` or `CONTRACT.md` scores 0 on both of the first two

AWAD05 - API Contracts - HK1 2627§2632 / 34

## Before next week

- `IA#3` on Classroom, from your student account — **Wednesday, October 28, 22:00**
- Next session: **security** — ownership checks and roles, secrets, the supply chain, and prompt injection
- For every endpoint we will ask *who is allowed to do this, on whose data?*

AWAD05 - API Contracts - HK1 2627§2733 / 34

## Questions

- Google Classroom — join code: **i63ft334**
- nhkhanh@fit.hcmus.edu.vn
- Ask now, or on the Classroom Stream

AWAD05 - API Contracts - HK1 2627§2834 / 34

### AWAD05 - API Contracts - HK1 2627 — slide index

1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 
9. 
10. 
11. 
12. 
13. 
14. 
15. 
16. 
17. 
18. 
19. 
20. 
21. 
22. 
23. 
24. 
25. 
26. 
27. 
28. 
29. 
30. 
31. 
32. 
33.