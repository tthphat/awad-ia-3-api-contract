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

