# AI Log (CSC13114)

Sinh viên: 23120319 — Trương Thành Phát

## 2026-10-28 — IA#3: Hiện thực API /v1 theo CONTRACT.md (Lần 1)
- **Tool**: Antigravity (Gemini 3.8 Flash).
- **Asked for**: "Implement the /v1 API in src/v1.js exactly as CONTRACT.md specifies, and the headers its section 5 requires on the legacy API in src/app.js. Put any new table in a new migration with a down. Do not read or edit anything under test/, and do not edit CONTRACT.md. Run npm test when you are done; it must stay green. Don't change anything in test/ and CONTRACT.md. New table must be created in migrations/002_*.up.sql + migrations/002_*.down.sql"
- **Kept**: Toàn bộ mã nguồn lần đầu do agent viết: triển khai các endpoint `/v1` trong `src/v1.js`, helper chuẩn hóa lỗi RFC 9457 (`application/problem+json`), cơ chế `canonicalize` JSON cho `Idempotency-Key`, giải thuật phân trang cursor `limit + 1`, migration `002_idempotency.up.sql` + `.down.sql`, và các header RFC 9745 (`Deprecation`), RFC 8594 (`Sunset`), `Link` trên API legacy trong `src/app.js`.
- **Changed**: Không có ở lượt này (giữ nguyên 100% code thô ban đầu của agent để chạy kiểm thử và lưu `contract-run-1.txt` theo đúng quy trình rubric).
- **Rejected**: Không có ở lượt này (chưa bác bỏ đề xuất nào ở lần sinh mã đầu; các thay đổi và từ chối giải pháp của agent sẽ được ghi nhận chi tiết trong quá trình sửa lỗi ở Bước 6).
- **By hand**: Tự đọc `CONTRACT.md` và viết 4 dự đoán kèm lý do sâu sắc vào `NOTES.md`, commit `NOTES.md` trước khi agent chạm vào `src/`; tự xử lý lỗi đường dẫn Windows trong `scripts/migrate.js` bằng `fileURLToPath` để migration chạy ổn định trên môi trường Windows.

## 2026-10-28 — IA#3: Chẩn đoán lỗi môi trường POSIX path và chạy đối chiếu trên WSL/Linux
- **Tool**: Antigravity (Gemini 3.8 Flash).
- **Asked for**: "Instruct me how to re-run this test in wsl to check the error about POSIX path in test/contract.test.js"
- **Kept**: Hướng dẫn chạy kiểm thử trong môi trường WSL Ubuntu để kiểm tra tính độc lập nền tảng; kết quả log kiểm thử `contract-run-1-linux.txt` đạt 29/29 tests pass.
- **Changed**: Không sửa code trong `src/v1.js` hay `test/contract.test.js`, giữ nguyên vẹn logic ứng dụng và tài liệu kiểm thử theo đúng quy định rubric.
- **Rejected**: Không có ở lượt này.
- **By hand**: Tự mở WSL Ubuntu, điều hướng vào thư mục dự án và chạy `npm run contract` lưu ra `contract-run-1-linux.txt` làm bằng chứng thực nghiệm đối chiếu lỗi Windows.

## 2026-10-28 — IA#3: Phỏng vấn các câu có thể hiểu hai cách trong CONTRACT.md (Bước 7)
- **Tool**: Antigravity (Gemini 3.8 Flash).
- **Asked for**: "Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?"
- **Kept**: 3 điểm mơ hồ do agent phân tích (A1: Gom toàn bộ lỗi validation §2 & §4.2; A2: Cursor opaque dạng stateless base64 §4.4; A3: Phạm vi gắn header Deprecation/Sunset trên legacy `/menu` §5).
- **Changed**: Tự viết lập luận phân tích cho phần quyết định của sinh viên (`My decision`) theo góc nhìn kiến trúc phân tán và API UX; bổ sung các câu đề xuất sửa đổi chuẩn xác vào `NOTES.md`.
- **Rejected**: Không có ở lượt này.
- **By hand**: Tự phát hiện và phân tích điểm A4 `(found by me)` về việc `CONTRACT.md` bỏ sót hoàn toàn đặc tả triển khai multi-instance dùng chung cơ sở dữ liệu (đã được đối chiếu qua bộ test `§4 two instances, one database`).
