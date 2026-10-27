# Self-assessment — IA#1

Submitted by: 23120319 — Trương Thành Phát

> # Đây là mẫu template của SELF ASSIGNMENT, tự điều chỉnh theo từng tiêu chí đúng với rubric của bài

Total I claim: 70 / 100

| Criterion | Max | I claim | Evidence |
|---|---|---|---|
| Contract | 25 | 25 | `spec.md §Contract` — 4 endpoints cụ thể (`POST /tables/{id}/split-sessions`, `POST /split-sessions/{id}/payments`, `GET /split-sessions/{id}`, `POST /split-sessions/{id}/settle-cash`), payload JSON request/response đầy đủ kiểu dữ liệu, named schema chuẩn `ErrorResponse`, và 7 mã HTTP status codes cụ thể (200, 201, 400, 403, 404, 409, 410, 422). Người khác có thể lập trình client mà không cần hỏi lại. |
| Acceptance criteria | 25 | 25 | `spec.md §Acceptance` — AC1–AC6 đều có giá trị số học cụ thể (100.000 VND chia 3 thành 33.334 + 33.333 + 33.333 VND, VAT 8%), có thể chuyển trực tiếp thành test case mà không cần quyết định thêm. Bao phủ đầy đủ: số học chia đều (AC1), chia theo món (AC2), failure path cổng thanh toán (AC3), concurrency chống thanh toán trùng với `Idempotency-Key` (AC4), concurrency tranh chấp món (AC5), và ca giải cứu tại POS (AC6). |
| Edge cases and non-goals | 20 | 20 | `spec.md §Errors` xử lý trọn vẹn cả **5 thin places** theo Slide 9 (empty/first-run state, partial failure, permissions, concurrency & duplicates, limits); `spec.md §Out of scope` có mục non-goals tường minh loại trừ 4 tính năng ngoài phạm vi. |
| Implementability | 20 | 0 | *Chưa đánh giá (Giai đoạn trước Lab)*: Tiêu chí này được chấm dựa trên danh sách câu hỏi mà người bạn implementer ghi lại trong buổi Lab ngày 01/10. |
| Revision | 10 | 0 | *Chưa đánh giá (Giai đoạn trước Lab)*: Tiêu chí này được chấm sau buổi Lab khi nộp kèm `questions.md` và `spec-revised.md` phản hồi toàn bộ câu hỏi. |

## What I did not manage
- Chưa hỗ trợ phân bổ mã giảm giá (voucher/coupon) linh hoạt theo từng phần chia nhỏ; hiện tại quy định toàn bộ khuyến mãi bàn phải được khấu trừ trước khi khởi tạo phiên chia hóa đơn để giữ tài liệu tinh gọn trong 1 trang.
- Chưa thiết lập cơ chế đồng bộ offline 2 pha (two-phase commit) giữa phần cứng máy POS cục bộ và Cloud database mà giải quyết thông qua REST endpoint thu tiền mặt trực tiếp.

## What I would do differently
- Thiết kế luồng cho vai trò Host và Guest ngay từ bước phác thảo ban đầu để phân định rõ người chịu phần tiền lẻ modulo thay vì chỉ chia toán học thuần túy.
