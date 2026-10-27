# AI Log (CSC13114)

Sinh viên: 23120319 — Trương Thành Phát

> # Đây là template của AI-LOG.md

## 2026-09-30 — Đặc tả tính năng: Chia hóa đơn tại bàn (IA#1)
- **Tool**: Antigravity (Gemini 3.8 Flash).
- **Asked for**: Viết đặc tả tính năng chia hóa đơn tại bàn cho hệ thống smart-restaurant trong 1 trang chuẩn, bám sát template Slide 11 và xử lý trọn vẹn 5 thin places của Slide 9.
- **Kept**: Cấu trúc các RESTful API endpoints (`/tables/{id}/split-sessions`, `/split-sessions/{id}/payments`), các mã trạng thái HTTP chuẩn (200, 201, 400, 403, 409, 410, 422), và cấu trúc envelope chuẩn `ErrorResponse`.
- **Changed**: Dịch toàn bộ nội dung tài liệu và ví dụ JSON sang tiếng Việt kỹ thuật chuyên nghiệp; định dạng lại danh sách mã trạng thái thành dạng bullet point có giải thích ý nghĩa nghiệp vụ cụ thể; mở rộng mục `## Data` với bảng schema chi tiết kiểu dữ liệu và ràng buộc cho 3 bảng (`split_sessions`, `split_shares`, `split_payments`).
- **Rejected**: Các file phản biện sau buổi lab (`questions.md`, `spec-revised.md`) do AI tạo sớm trước khi diễn ra buổi lab swap; kiến trúc webhook callback bất đồng bộ phức tạp từ cổng thanh toán bên thứ ba (thay bằng luồng redirect đồng bộ để đảm bảo tài liệu gọn trong 1 trang); logic chia tiền boa (tip) phần trăm theo từng người.
- **By hand**: Tự định nghĩa quy tắc chia tiền dư số lẻ modulo trong VND (Host nhận `sh-1` và gánh $+1\text{ VND}$), tự thiết lập ngữ nghĩa và cơ chế bảo mật cho custom header `X-Table-Session` để chống truy cập chéo bàn (`403 FORBIDDEN_TABLE_MISMATCH`), và tự viết báo cáo tự đánh giá `SELF_ASSESSMENT_REPORT.md` với mức điểm 70/100 cho giai đoạn trước buổi lab.

> # Thực hiện phần AI-LOG của bạn bên dưới

## 2026-10-28 — IA#3: Hiện thực API /v1 theo CONTRACT.md (Lần 1)
- **Tool**: Antigravity (Gemini 3.8 Flash).
- **Asked for**: "Implement the /v1 API in src/v1.js exactly as CONTRACT.md specifies, and the headers its section 5 requires on the legacy API in src/app.js. Put any new table in a new migration with a down. Do not read or edit anything under test/, and do not edit CONTRACT.md. Run npm test when you are done; it must stay green. Don't change anything in test/ and CONTRACT.md. New table must be created in migrations/002_*.up.sql + migrations/002_*.down.sql"
- **Kept**: Cấu trúc route `/v1` trong `src/v1.js`, helper `sendProblem` theo RFC 9457, hàm `canonicalize` chuẩn hóa JSON để đối chiếu body cho `Idempotency-Key`, giải thuật phân trang cursor `limit + 1` để tránh trỏ vào trang rỗng, tạo migration `migrations/002_idempotency.up.sql` và `.down.sql` để lưu khóa idempotency, và các header RFC 9745 (`Deprecation`), RFC 8594 (`Sunset`), `Link` cho API legacy trong `src/app.js`.
- **Changed**: Tách việc gửi lỗi 500 `internal` thành một câu generic cố định, tuyệt đối không lộ stack trace hay thông báo SQL; xử lý gom danh sách lỗi `validation` và `unknown-menu-item` theo đúng chuẩn mảng `errors`.
- **Rejected**: Không cài thêm bất kỳ dependency nào từ npm (như lodash, express, body-parser) để giữ đúng yêu cầu zero-dependency Node 22; không đưa logic xử lý lỗi RFC 9457 sang các route legacy.
- **By hand**: Tự viết file migration `002_idempotency.up.sql` và `.down.sql` theo đúng chuẩn naming để chạy qua script `scripts/migrate.js`.
