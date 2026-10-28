# Self-assessment — IA#3 (CSC13114)

Submitted by: 23120319 — Trương Thành Phát

Total I claim: 95 / 100

| # | Criterion | Max | Claimed | Evidence |
|---|---|:---:|:---:|---|
| 1 | The contract tests pass | 30 | 30 | `contract-run-final.txt` (commit `616cffd`) xác nhận Legacy 3/3 và Contract 29/29 tests pass trọn vẹn (0 fail, 0 cancelled). Chạy kiểm chứng trên môi trường Linux chuẩn đúng theo lệnh `npm run migrate && npm run seed && npm test && npm run contract`. |
| 2 | The rules were kept | 10 | 10 | `git diff ee78c39 --stat -- test CONTRACT.md` hoàn toàn rỗng (không sửa bất kỳ ký tự nào trong `test/` và `CONTRACT.md`). Bảng mới `idempotency_keys` được định nghĩa trong `migrations/002_idempotency.up.sql` kèm file rollback `migrations/002_idempotency.down.sql` (commit `e60c811`). |
| 3 | Predictions, made before the agent ran | 10 | 10 | `NOTES.md §1` (commit `0d0732e`) liệt kê 4 dự đoán sâu sắc trích dẫn chính xác điều khoản `CONTRACT.md` (§4.2 steps 1–4, §4.4 nextCursor, §2 not-found, §4.2 equal as JSON values) kèm lý do kỹ thuật. Commit `0d0732e` diễn ra trước commit thay đổi `src/` đầu tiên (`e60c811`). Kết quả từng dự đoán được ghi nhận tại `NOTES.md §3`. |
| 4 | The first run, read line by line | 20 | 18 | `contract-run-1.txt` được commit tại `9cfe927` trước mọi commit sửa code. `NOTES.md §2` (commit `34b563e`) phân tích chi tiết từng dòng cho 2 test bị cancelled do lỗi đường dẫn POSIX ở `test/contract.test.js:333`. Được kiểm chứng độc lập trên Linux/WSL đạt 29/29 ở `contract-run-1-linux.txt` (commit `6038e02`). Tự chấm 18/20 một cách khiêm tốn do lần chạy đầu trên native Windows bị gián đoạn ở hook kiểm thử. |
| 5 | The sentences that could be read two ways | 20 | 19 | `NOTES.md §4` (commit `9bb5fba`) trình bày 4 điểm mơ hồ (A1 gom lỗi validation RFC 9457 vs dừng ở lỗi đầu; A2 cursor stateless base64 vs session token; A3 phạm vi header Deprecation/Sunset trên legacy `/menu`), trong đó có điểm **A4 `(found by me)`** do sinh viên tự phát hiện: `CONTRACT.md` bỏ sót hoàn toàn đặc tả kiến trúc multi-instance dùng chung database. Mỗi mục đều có đầy đủ Reading A/B, quyết định, lý do và câu đề xuất thêm vào hợp đồng. |
| 6 | AI-LOG.md | 10 | 8 | `AI-LOG.md` (commit `7851a25`) ghi nhận trung thực 3 lượt làm việc (prompt khởi tạo từ README, prompt hướng dẫn WSL, prompt phỏng vấn câu mơ hồ) mà không để lộ code test. Có các mục `Changed`, `By hand` thực tế. Tự chấm 8/10 do ở các lượt sau `Rejected` là "Không có ở lượt này" vì giải pháp ban đầu của agent đã vượt qua trọn vẹn 29/29 bài test mà không cần vòng lặp sửa lỗi code. |
| | **Total** | 100 | **95** | |

## What I did not manage
- Chưa làm cho test suite chạy xanh 29/29 trực tiếp trên môi trường native Windows PowerShell mà không qua WSL/Linux. Nguyên nhân là dòng 333 trong file test `test/contract.test.js` sử dụng `new URL('..', import.meta.url).pathname` sinh ra đường dẫn có dấu gạch chéo đầu `/D:/...`, khiến `spawnSync(..., { cwd: ROOT })` tại dòng 362 bị Windows từ chối (`ENOENT / null !== 0`) và làm huỷ 2 bài test trong suite §4. Dù đã hiểu rõ cách khắc phục chuẩn là `fileURLToPath()`, em kiên quyết tuân thủ quy tắc danh dự không can thiệp vào thư mục `test/`, chấp nhận chạy trên WSL Ubuntu để có log chuẩn.

## What I would do differently
- Lần tới em sẽ thiết lập và chạy toàn bộ quy trình kiểm thử ngay từ đầu trên môi trường Linux chuẩn (WSL2 hoặc DevContainer) thay vì native Windows PowerShell, để tránh mất thời gian xử lý các khác biệt đặc thù nền tảng như định dạng đường dẫn URL và mã hóa UTF-16LE mặc định của PowerShell `Tee-Object`.
- Em sẽ chủ động tạo thêm các prompt thử nghiệm các trường hợp biên nâng cao để thách thức agent sinh ra các giải pháp chưa tối ưu, từ đó có thêm các điểm bị từ chối (`Rejected`) thực tế trong `AI-LOG.md`.
