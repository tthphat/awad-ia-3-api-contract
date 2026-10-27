# IA#3 — API contract: agent hiện thực, test phán xét

**Môn:** CSC13114 · **Hình thức:** cá nhân · **Tỉ lệ:** 2% môn học · **Tổng điểm:** 100
**Hạn nộp:** Thứ Tư, 28/10/2026, 22:00 · **Repo starter:** https://github.com/fithcmus/awad-api-contract-starter

---

## 1. Bài tập yêu cầu gì?

Bạn **không tự gõ code**. Bạn giao cho AI agent hiện thực API `/v1` theo đặc tả `CONTRACT.md`, rồi dùng test để kiểm tra agent làm đúng hay sai. Điểm không chỉ nằm ở việc test xanh, mà còn ở:

- bạn **dự đoán trước** chỗ agent sẽ sai,
- bạn **đọc kỹ lần chạy đầu tiên** (từng dòng fail),
- bạn **phát hiện những câu trong contract có thể hiểu theo hai cách**.

---

## 2. Thang điểm

| # | Tiêu chí | Điểm | Cần làm gì |
|---|---|---|---|
| 1 | Test contract pass | 30 | Legacy 3/3 và contract 29/29. Mỗi test fail trừ 1 điểm |
| 2 | Giữ luật | 10 | Không sửa `test/` hay `CONTRACT.md`. Bảng mới nằm trong `migrations/002_*.up.sql` kèm `.down.sql` |
| 3 | Dự đoán trước | 10 | 2 câu kèm lý do, commit trước khi sửa `src/`, cuối cùng ghi từng dự đoán đúng hay sai |
| 4 | Đọc lần chạy đầu | 20 | Mỗi test fail có 1 dòng: câu trong contract, agent làm gì khác, và nếu mơ hồ thì bạn sẽ sửa câu thành gì |
| 5 | Câu mơ hồ | 20 | Mỗi điểm: mục, hai cách hiểu, cách chọn và vì sao, câu bạn sẽ thêm vào contract. **Ít nhất 1 điểm do chính bạn tìm ra** |
| 6 | `AI-LOG.md` | 10 | Prompt đầu + mọi prompt sửa lỗi (nêu tên test và mục contract, không dán code test). Phần Rejected phải thật |

---

## 3. Các file cần nộp

Nộp **một file zip duy nhất** chứa toàn bộ repository (kèm `.git` để người chấm đọc được thứ tự commit).

| File | Nội dung | Tiêu chí liên quan |
|---|---|---|
| `src/v1.js` | Code `/v1` do agent viết, kèm các chỉnh sửa của bạn | 1 |
| `src/app.js` | Phần nối route `/v1` vào ứng dụng | 1 |
| `migrations/002_*.up.sql` | Mọi bảng mới phải tạo ở đây | 1, 2 |
| `migrations/002_*.down.sql` | Migration hoàn tác tương ứng với file `.up.sql` | 2 |
| `contract-run-1.txt` | Kết quả `npm run contract 2>&1 \| tee contract-run-1.txt`, lần chạy đầu của agent, **trước khi sửa** | 4 |
| `contract-run-final.txt` | Kết quả cùng lệnh đó sau lần sửa cuối, phải khớp với kết quả chạy lại của người chấm | 1 |
| `NOTES.md` | Dự đoán, các test fail lần đầu, các câu mơ hồ | 3, 4, 5 |
| `AI-LOG.md` | Prompt đầu, mọi prompt sửa lỗi, phần Changed và Rejected | 6 |
| `SELF_ASSESSMENT_REPORT.md` | Bảng một dòng mỗi tiêu chí (điểm tự chấm + bằng chứng) và đoạn "what I did not manage" | Điều chỉnh trung thực |
| `.git/` | Lịch sử commit, dùng để kiểm tra thứ tự | 2, 3, 4 |

**Không đưa vào zip:** `node_modules/` (repo vốn không có) và `data/`.

**Tên file zip:** `<MSSV>_<tổng điểm tự chấm>.zip`, ví dụ `23120001_82.zip`. Tổng trong tên phải bằng tổng ở bảng của `SELF_ASSESSMENT_REPORT.md`. Tên sai không bị trừ điểm nhưng làm chậm kết quả vì script chấm ghép bài theo tên file.

**Nộp từ:** tài khoản Google `<MSSV>@student.hcmus.edu.vn`, trước **22:00 ngày 28/10/2026**.

**Không được thay đổi:** mọi thứ trong `test/` và file `CONTRACT.md` (sửa là tiêu chí 1 và 2 về 0). `plan.md` này chỉ là ghi chú của bạn, không cần nằm trong zip.

---

## 4. Các bước làm (chi tiết)

> **Nguyên tắc xuyên suốt:** thứ tự commit được chấm. Hãy commit đúng thứ tự dưới đây, đừng gộp nhiều bước vào một commit.

### Bước 0 — Chuẩn bị môi trường

```bash
node -v        # cần >= 22.5 (đề nói 22.13+, nên dùng 22.13 trở lên cho chắc)
git clone https://github.com/fithcmus/awad-api-contract-starter
cd awad-api-contract-starter
git log --oneline -1      # ghi lại hash của starter commit, sẽ dùng để git diff ở bước 8
```

Ghi hash này vào một chỗ tạm (ví dụ `STARTER=abc1234`), vì tiêu chí 2 được chấm bằng `git diff` với starter commit.

### Bước 1 — Chạy baseline, chưa làm gì cả

```bash
npm run migrate && npm run seed && npm test && npm run contract
```

Kết quả mong đợi: **legacy 3/3 xanh, contract 0/29**. Nếu khác, dừng lại và kiểm tra phiên bản Node, README của repo.

Không có `node_modules/` (repo không có dependency), nên không cần `npm install`.

### Bước 2 — Tự đọc `CONTRACT.md` (10 phút, KHÔNG dùng agent)

Đọc chậm, và gạch chân những câu thuộc các dạng dễ làm agent sai:

- câu có từ như "should", "may", "usually", "when appropriate" (không rõ bắt buộc hay không),
- quy tắc về **thứ tự** (sort mặc định, tie-break khi bằng nhau),
- quy tắc về **status code** (400 hay 422? 404 hay 403?),
- quy tắc về **định dạng** (ISO 8601, làm tròn, null hay bỏ field),
- quy tắc về **phân trang** (offset bắt đầu từ 0 hay 1, giới hạn tối đa),
- quy tắc về **idempotency / chạy lặp / xóa mềm**,
- chỗ contract nói về trạng thái hiện có (legacy) mà `/v1` phải giữ nguyên.

Chọn ra **đúng 2 câu** bạn tin agent sẽ làm sai nhất, mỗi câu phải có **lý do** (ví dụ: "hai cách hiểu hợp lý", "dễ chọn mặc định phổ biến thay vì mặc định của contract", "câu nằm xa chỗ liên quan").

### Bước 3 — Viết `NOTES.md` và COMMIT NGAY (trước khi agent đụng `src/`)

Tạo `NOTES.md` với khung sau (điền nội dung của bạn):

```markdown
# NOTES

## Predictions (written before the agent ran)

1. **CONTRACT.md §<số mục> — "<trích nguyên câu>"**
   Why I expect the agent to get it wrong: <lý do cụ thể>.

2. **CONTRACT.md §<số mục> — "<trích nguyên câu>"**
   Why I expect the agent to get it wrong: <lý do cụ thể>.

## First-run failures
(điền ở bước 5)

## Ambiguous sentences
(điền ở bước 7)

## Prediction outcomes
(điền ở bước 6 — mỗi dự đoán một dòng: came true / did not come true + vì sao)
```

Rồi commit:

```bash
git add NOTES.md
git commit -m "docs: predictions before agent runs"
```

Kiểm tra: `git log --oneline` phải cho thấy commit này **chưa kèm bất kỳ thay đổi nào ở `src/`**.

### Bước 4 — Giao việc cho agent

1. Tạo `AI-LOG.md` (khung ở mục 5 bên dưới) và **chép nguyên văn prompt đầu tiên** vào đó.
2. Mở agent (Claude Code, Cursor, Copilot…) ở thư mục repo.
3. Dán **đúng đoạn prompt trong `README.md`** của repo. Không thêm hướng dẫn kiểu "hãy đọc test cho đúng".
4. Nhắc thêm một điều duy nhất mà luật yêu cầu: **không sửa `test/` và `CONTRACT.md`; bảng mới phải đặt trong `migrations/002_*.up.sql` + `migrations/002_*.down.sql`.** (Ghi câu này vào AI-LOG nếu bạn thêm.)
5. Để agent làm xong lượt đầu. **Chưa sửa gì tay, chưa chạy lại nhiều lần.**

Commit lượt làm đầu tiên của agent, chưa có chỉnh sửa của bạn:

```bash
git add src migrations AI-LOG.md
git commit -m "feat: agent first attempt at /v1"
```

### Bước 5 — Chạy contract lần đầu, lưu và COMMIT NGAY

Chạy **đúng một lần**, trước khi sửa bất cứ thứ gì:

```bash
npm run migrate && npm run seed
npm run contract 2>&1 | tee contract-run-1.txt
git add contract-run-1.txt
git commit -m "test: contract run 1 (agent first attempt, before fixes)"
```

> Đừng chạy lại rồi ghi đè `contract-run-1.txt` sau khi đã sửa. Nếu số lỗi trong file ít hơn so với lịch sử commit, tiêu chí 4 bị trừ điểm.

Sau đó **đọc từng dòng fail** trong `contract-run-1.txt` và viết vào mục *First-run failures* của `NOTES.md`, **mỗi test fail một dòng**:

```markdown
- `<tên test>` — CONTRACT §<mục>: "<câu trong contract>". Agent did: <agent làm gì, ví dụ trả 200 thay vì 201>. Suggested rewording: "<câu bạn muốn sửa thành>" (chỉ cần nếu câu có thể hiểu hai cách).
```

Lưu ý: dòng chỉ lặp lại tên test (không nói agent làm gì) sẽ chỉ được 11–16 điểm. Phải nói cụ thể **agent làm gì khác với contract**.

Commit:

```bash
git add NOTES.md
git commit -m "docs: explain first-run failures"
```

**Trường hợp đặc biệt:** nếu agent pass 29/29 ngay lần đầu, hãy ghi rõ điều đó trong `NOTES.md`; tiêu chí 4 sẽ được chấm trên danh sách của tiêu chí 5. Khi đó chọn **3 điểm mà agent nói là nó "đoán"** và giải thích mỗi điểm theo cùng khuôn mẫu như trên.

### Bước 6 — Sửa đến khi xanh (chỉ bằng tên test + mục contract)

Với mỗi nhóm test fail, gửi agent một prompt theo mẫu:

```text
Test "<tên test đầy đủ>" is failing. CONTRACT.md section <số mục> says: "<trích câu>".
Fix src/v1.js so it follows that section. Do not modify anything under test/ or CONTRACT.md.
```

Quy tắc:

- **Được:** tên test, số mục contract, trích câu contract, thông báo lỗi ngắn từ output.
- **Không được:** dán code của file test (bị trừ ở tiêu chí 6).
- Sau mỗi lần sửa, chạy lại `npm test && npm run contract` để xem còn gì fail.
- Mỗi prompt sửa lỗi đều **ghi vào `AI-LOG.md`** ngay lúc đó.
- Mỗi lượt sửa một commit riêng, ví dụ: `fix: pagination limit per CONTRACT §4.2`.

Khi đạt **legacy 3/3 và contract 29/29**:

```bash
npm run migrate && npm run seed && npm test
npm run contract 2>&1 | tee contract-run-final.txt
git add -A
git commit -m "test: contract run final (29/29)"
```

Rồi quay lại `NOTES.md`, mục *Prediction outcomes*, ghi mỗi dự đoán một dòng:

```markdown
1. §<mục>: came true — agent did <...>.
2. §<mục>: did not come true — agent handled it correctly by <...>.
```

### Bước 7 — Hỏi agent về các câu mơ hồ, rồi tự quyết định

Hỏi agent đúng câu này:

> Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?

Với **mỗi điểm** agent nêu, ghi vào `NOTES.md` mục *Ambiguous sentences*:

```markdown
### A1 — CONTRACT §<mục>
- Reading A: <cách hiểu 1>
- Reading B: <cách hiểu 2>
- Agent chose: <A hoặc B>
- My decision: <A hoặc B> — because <lý do>
- Sentence I would add to CONTRACT.md: "<câu đề xuất>"
```

**Bắt buộc có ít nhất một điểm do chính bạn tìm ra**, không nằm trong danh sách của agent (đánh dấu rõ `(found by me)`). Gợi ý cách tìm: quay lại những câu bạn đã gạch chân ở bước 2 mà agent không nhắc tới; thử nghĩ các trường hợp biên (rỗng, trùng, giá trị âm, chạy lặp lại, người dùng không có quyền).

Nếu agent trả lời "không có điểm mơ hồ nào" thì **đừng chấp nhận**. Tiêu chí 5 sẽ chấm 0–3 nếu bạn nhận câu trả lời đó mà không kiểm tra.

Nếu bạn cho rằng một test hoặc contract sai, **chỉ ghi vào `NOTES.md` như một phát hiện**, tuyệt đối không sửa file đó.

Commit:

```bash
git add NOTES.md AI-LOG.md
git commit -m "docs: ambiguous sentences and decisions"
```

### Bước 8 — Tự kiểm tra trước khi nộp

```bash
# 1. test/ và CONTRACT.md không bị đổi (kết quả phải rỗng)
git diff <STARTER_HASH> --stat -- test CONTRACT.md

# 2. Bảng mới chỉ nằm trong migration, và có cả up lẫn down
ls migrations/
#   002_<tên>.up.sql
#   002_<tên>.down.sql

# 3. Chạy lại từ đầu như người chấm sẽ chạy
rm -rf data
npm run migrate && npm run seed && npm test && npm run contract

# 4. Thứ tự commit hợp lý
git log --oneline --reverse
#   (1) NOTES.md predictions
#   (2) agent first attempt (src/, migrations/)
#   (3) contract-run-1.txt
#   (4...) các commit fix
#   (n) contract-run-final.txt
```

Xác nhận kết quả chạy lại **khớp** với `contract-run-final.txt`. Nếu hai bên lệch, người chấm sẽ lấy kết quả chạy của họ.

### Bước 9 — Viết `SELF_ASSESSMENT_REPORT.md`

Mỗi tiêu chí một dòng, có điểm tự chấm và **bằng chứng** (file, commit hash, tên test hoặc mục trong `NOTES.md`):

```markdown
# Self-assessment

Total I claim: 70 / 100

| # | Criterion | Max | Claimed | Evidence |
|---|---|---|---|---|
| 1 | Contract tests pass | 30 | 30 | contract-run-final.txt: legacy 3/3, contract 29/29 |
| 2 | Rules were kept | 10 | 10 | `git diff <hash> -- test CONTRACT.md` is empty; migrations/002_*.up.sql + .down.sql |
| 3 | Predictions before the agent ran | 10 | 10 | NOTES.md "Predictions"; commit <hash> precedes commit <hash> |
| 4 | First run read line by line | 20 | 18 | contract-run-1.txt (commit <hash>); NOTES.md "First-run failures" |
| 5 | Ambiguous sentences | 20 | 17 | NOTES.md "Ambiguous sentences", A<n> found by me |
| 6 | AI-LOG.md | 10 | 9 | AI-LOG.md prompts + Rejected |
| | **Total** | 100 | **<tổng>** | |

## What I did not manage
<một đoạn ngắn, thành thật: điều gì chưa làm được hoặc chưa chắc>

## What I would do differently
<một đoạn ngắn, thành thật: điều gì tôi muốn làm khác đi>

```

**Chấm trung thực.** Lệch quá +10 so với điểm thật bị trừ 3 đến 10 điểm. Tiêu chí nào claim mà không có dòng bằng chứng thì tính là chưa làm. Thiếu file này bị trừ 10 và tổng trong tên file bị bỏ qua.

### Bước 10 — Đóng gói và nộp

Tên file: `<MSSV>_<tổng tự chấm>.zip`, ví dụ `23120001_82.zip`. Tổng này phải bằng tổng trong bảng ở `SELF_ASSESSMENT_REPORT.md`.

```bash
cd ..
zip -r 23120001_82.zip awad-api-contract-starter -x "awad-api-contract-starter/node_modules/*" "awad-api-contract-starter/data/*"
unzip -l 23120001_82.zip | grep -E "\.git/|NOTES.md|AI-LOG.md|SELF_ASSESSMENT_REPORT.md|contract-run"
```

Phải có trong zip: thư mục `.git/`, `src/v1.js`, `src/app.js`, `migrations/002_*`, `contract-run-1.txt`, `contract-run-final.txt`, `NOTES.md`, `AI-LOG.md`, `SELF_ASSESSMENT_REPORT.md`.

Nộp từ tài khoản `<MSSV>@student.hcmus.edu.vn`, **trước 22:00 ngày 28/10/2026**. Tên file sai không bị trừ điểm nhưng làm chậm kết quả.

---

## 5. Mẫu `AI-LOG.md`

```markdown
# AI-LOG

## 2026-09-30 — Đặc tả tính năng: Chia hóa đơn tại bàn (IA#1)
- **Tool**: Antigravity (Gemini 3.8 Flash).   

- **Asked for**: Viết đặc tả tính năng chia hóa đơn tại bàn cho hệ thống smart-restaurant trong 1 trang chuẩn, bám sát template Slide 11 và xử lý trọn vẹn 5 thin places của Slide 9.   

- **Kept**: Cấu trúc các RESTful API endpoints (`/tables/{id}/split-sessions`, `/split-sessions/{id}/payments`), các mã trạng thái HTTP chuẩn (200, 201, 400, 403, 409, 410, 422), và cấu trúc envelope chuẩn `ErrorResponse`.  

- **Changed**: Dịch toàn bộ nội dung tài liệu và ví dụ JSON sang tiếng Việt kỹ thuật chuyên nghiệp; định dạng lại danh sách mã trạng thái thành dạng bullet point có giải thích ý nghĩa nghiệp vụ cụ thể; mở rộng mục `## Data` với bảng schema chi tiết kiểu dữ liệu và ràng buộc cho 3 bảng (`split_sessions`, `split_shares`, `split_payments`).

- **Rejected**: Các file phản biện sau buổi lab (`questions.md`, `spec-revised.md`) do AI tạo sớm trước khi diễn ra buổi lab swap; kiến trúc webhook callback bất đồng bộ phức tạp từ cổng thanh toán bên thứ ba (thay bằng luồng redirect đồng bộ để đảm bảo tài liệu gọn trong 1 trang); logic chia tiền boa (tip) phần trăm theo từng người.

- **By hand**: Tự định nghĩa quy tắc chia tiền dư số lẻ modulo trong VND (Host nhận `sh-1` và gánh $+1\text{ VND}$), tự thiết lập ngữ nghĩa và cơ chế bảo mật cho custom header `X-Table-Session` để chống truy cập chéo bàn (`403 FORBIDDEN_TABLE_MISMATCH`), và tự viết báo cáo tự đánh giá `SELF_ASSESSMENT_REPORT.md` với mức điểm 70/100 cho giai đoạn trước buổi lab. 

```

---

## 6. Những bẫy cần nhớ

1. **Thứ tự commit:** `NOTES.md` (dự đoán) → code agent → `contract-run-1.txt` → các commit fix. Đảo thứ tự là mất điểm tiêu chí 3 và 4.
2. **Không sửa `test/` hay `CONTRACT.md`.** Sửa là tiêu chí 1 và 2 về 0.
3. **Không chạy lại và ghi đè `contract-run-1.txt`** sau khi đã sửa.
4. **Không dán code test vào prompt sửa lỗi.** Chỉ dùng tên test và số mục contract.
5. **Tạo bảng mới chỉ trong `migrations/002_*`**, có cả `.up.sql` và `.down.sql`. Bảng tạo ngoài migration hoặc thiếu down bị trừ 1–5 điểm.
6. **Bắt buộc có ít nhất 1 điểm mơ hồ do chính bạn tìm ra.**
7. **Bài cá nhân**, không làm nhóm.
8. **Zip phải có `.git`**, nhưng không có `node_modules/` và `data/`.

---

## 7. Checklist cuối

- [ ] Baseline chạy được: legacy 3/3, contract 0/29
- [ ] `NOTES.md` có 2 dự đoán kèm lý do, đã commit **trước** khi agent sửa `src/`
- [ ] Prompt đầu tiên đã ghi vào `AI-LOG.md`
- [ ] `contract-run-1.txt` được commit trước mọi commit fix
- [ ] Mỗi test fail ở lần đầu có một dòng giải thích trong `NOTES.md`
- [ ] Prompt fix chỉ chứa tên test + mục contract
- [ ] `contract-run-final.txt`: legacy 3/3, contract 29/29
- [ ] Từng dự đoán đã ghi kết quả (đúng/sai)
- [ ] Danh sách câu mơ hồ có quyết định + câu đề xuất, có ít nhất 1 điểm do mình tìm ra
- [ ] `AI-LOG.md` có phần Changed và Rejected thật
- [ ] `git diff <starter> -- test CONTRACT.md` rỗng
- [ ] `SELF_ASSESSMENT_REPORT.md` có đủ 6 dòng + "what I did not manage"
- [ ] Zip đúng tên `<MSSV>_<tổng>.zip`, có `.git`, không có `node_modules/` và `data/`
- [ ] Nộp từ mail `@student.hcmus.edu.vn` trước 22:00, 28/10/2026
