# Hệ thống quản lý cửa hàng điện thoại

## 1. Giới thiệu

Dự án xây dựng ứng dụng web hỗ trợ quản lý cửa hàng điện thoại. Hệ thống giúp nhân viên và quản lý thực hiện các chức năng như đăng nhập, quản lý sản phẩm điện thoại, quản lý khách hàng, lập đơn bán hàng, theo dõi tồn kho và xem báo cáo doanh thu.

## 2. Công nghệ sử dụng

- Front-end: HTML, CSS, JavaScript
- Back-end: Node.js, Express.js
- Cơ sở dữ liệu: SQLite
- Quản lý dự án: Jira
- Quản lý mã nguồn: GitHub
- Thiết kế giao diện: Figma

## 3. Chức năng chính

- Đăng nhập vào hệ thống
- Quản lý sản phẩm điện thoại
- Thêm, sửa, xóa sản phẩm
- Quản lý khách hàng
- Lập đơn bán hàng
- Tự động cập nhật tồn kho sau khi bán
- Xem báo cáo doanh thu
- Thống kê tổng sản phẩm, khách hàng, đơn hàng và doanh thu

## 4. Cấu trúc thư mục
PhoneStore-Agile/
│
├── api/
│   ├── server.js
│   ├── package.json
│   └── database/
│       ├── schema.sql
│       ├── seed.sql
│       └── phone_store.db
│
├── solution/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── figma/
│   └── figma-link.txt
│
└── README.md
