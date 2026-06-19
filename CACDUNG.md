# Hướng Dẫn Sử Dụng & Cài Đặt Bộ Công Cụ Agent (.agents)

Tài liệu này hướng dẫn cách sử dụng, cài đặt và cấu hình bộ quy tắc, quy trình và kỹ năng cho AI Coding Assistant (Antigravity) trong mọi repository.

---

## 🎯 Sử dụng trong trường hợp nào?

* **Khi phát triển dự án phức tạp**: AI cần hiểu sâu sắc cấu trúc code thông qua đồ thị cuộc gọi (`code-review-graph`) thay vì chỉ tìm kiếm văn bản thông thường.
* **Khi muốn tối ưu chi phí & giới hạn Token**: Sử dụng `rtk` (Rust Token Killer) để nén dữ liệu output từ terminal (test logs, git, build logs) trước khi gửi tới AI (tiết kiệm 60-90% token).
* **Kiểm tra Edge Cases & Negative Paths**: AI tự động tuân thủ các checklist kiểm thử nghiêm ngặt, xử lý lỗi đầu vào, rò rỉ quyền truy cập, lỗi API và dữ liệu trống.
* **Tích hợp giám sát lỗi trực tiếp**: Dùng MCP Sentry để AI lấy trực tiếp stack trace và log lỗi thời gian thực nhằm sửa lỗi nhanh chóng.

---

## 🛠️ Hướng dẫn Cài đặt & Cấu hình

### Cách 1: Tự động (Khuyên dùng)
Chạy lệnh sau tại thư mục gốc (Workspace Root) của dự án:
```powershell
python setup_antigravity.py
```
*Script sẽ tự động cài đặt package `code-review-graph`, thiết lập `rtk` toàn cục, cập nhật cấu hình file `mcp_config.json` và thay thế toàn bộ liên kết đường dẫn tuyệt đối cũ bằng đường dẫn thực tế trên máy bạn.*

### Cách 2: Thủ công
1. **Cài đặt các gói phụ thuộc**:
   ```bash
   pip install code-review-graph
   # Cài đặt RTK trên Windows (hoặc tải trực tiếp từ GitHub nếu dùng OS khác)
   winget install rtk-ai.rtk --accept-source-agreements --accept-package-agreements
   rtk init -g
   ```
2. **Cập nhật cấu hình MCP** (`mcp_config.json` nằm tại thư mục `~/.gemini/antigravity/`):
   ```json
   {
     "mcpServers": {
       "code-review-graph": {
         "command": "<PYTHON_PATH_CỦA_BẠN>",
         "args": ["-m", "code_review_graph", "serve"],
         "cwd": "<WORKSPACE_ROOT>"
       },
       "sentry": {
         "command": "npx",
         "args": [
           "-y",
           "@sentry/mcp-server@latest",
           "--access-token",
           "YOUR_SENTRY_ACCESS_TOKEN"
         ]
       }
     }
   }
   ```
3. **Cập nhật lại đường dẫn trong các file Rule**:
   Chạy `python setup_antigravity.py` để script tự động sửa đổi tất cả các đường dẫn tuyệt đối trong `.agents/rules/` về đúng thư mục dự án của bạn.

---

## 📂 Cách cài đặt bộ công cụ này cho MỌI Repo khác

Để mang bộ quy tắc và kỹ năng thông minh này sang cấu hình cho bất kỳ dự án mới nào khác, hãy làm theo các bước sau:

1. **Copy bộ công cụ**:
   Sao chép thư mục `.agents/`, file `setup_antigravity.py` và `SETUP_ANTIGRAVITY.md` từ repo này và dán trực tiếp vào **thư mục gốc (Root)** của repo mới cần cấu hình.

2. **Chạy cấu hình tự động**:
   Mở terminal tại thư mục gốc của repo mới đó và chạy:
   ```bash
   python setup_antigravity.py
   ```
   *Lúc này, script sẽ tự động nhận diện đường dẫn của repo mới, đăng ký nó với `code-review-graph` trong file `mcp_config.json` dùng chung và chuẩn hóa lại toàn bộ đường dẫn liên kết trong các file quy tắc của repo đó.*

3. **Tải lại Agent**:
   Khởi động lại hoặc reload AI Agent (Antigravity) trong IDE để cập nhật cấu hình MCP mới.
