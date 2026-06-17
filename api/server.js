const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const databasePath = path.join(__dirname, "database", "phone_store.db");
const schemaPath = path.join(__dirname, "database", "schema.sql");
const seedPath = path.join(__dirname, "database", "seed.sql");

const db = new sqlite3.Database(databasePath);

function initDatabase() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema, (err) => {
    if (err) {
      console.error("Lỗi tạo bảng:", err.message);
      return;
    }

    db.get("SELECT COUNT(*) AS total FROM users", (err, row) => {
      if (err) return;

      if (row.total === 0) {
        const seed = fs.readFileSync(seedPath, "utf8");
        db.exec(seed);
      }
    });
  });
}

initDatabase();

app.get("/", (req, res) => {
  res.send("API hệ thống quản lý cửa hàng điện thoại đang chạy");
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT id, username, role FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi server" });
      }

      if (!user) {
        return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
      }

      res.json({
        message: "Đăng nhập thành công",
        user
      });
    }
  );
});

app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm" });
    }

    res.json(rows);
  });
});

app.post("/api/products", (req, res) => {
  const { name, brand, price, quantity, description } = req.body;

  db.run(
    "INSERT INTO products (name, brand, price, quantity, description) VALUES (?, ?, ?, ?, ?)",
    [name, brand, price, quantity, description],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Lỗi thêm sản phẩm" });
      }

      res.json({
        message: "Thêm sản phẩm thành công",
        id: this.lastID
      });
    }
  );
});

app.put("/api/products/:id", (req, res) => {
  const { name, brand, price, quantity, description } = req.body;
  const { id } = req.params;

  db.run(
    "UPDATE products SET name = ?, brand = ?, price = ?, quantity = ?, description = ? WHERE id = ?",
    [name, brand, price, quantity, description, id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Lỗi cập nhật sản phẩm" });
      }

      res.json({ message: "Cập nhật sản phẩm thành công" });
    }
  );
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Lỗi xóa sản phẩm" });
    }

    res.json({ message: "Xóa sản phẩm thành công" });
  });
});

app.get("/api/customers", (req, res) => {
  db.all("SELECT * FROM customers", (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy danh sách khách hàng" });
    res.json(rows);
  });
});

app.post("/api/customers", (req, res) => {
  const { full_name, phone, address } = req.body;

  db.run(
    "INSERT INTO customers (full_name, phone, address) VALUES (?, ?, ?)",
    [full_name, phone, address],
    function (err) {
      if (err) return res.status(500).json({ message: "Lỗi thêm khách hàng" });

      res.json({
        message: "Thêm khách hàng thành công",
        id: this.lastID
      });
    }
  );
});

app.delete("/api/customers/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM customers WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ message: "Lỗi xóa khách hàng" });

    res.json({ message: "Xóa khách hàng thành công" });
  });
});

app.get("/api/orders", (req, res) => {
  const sql = `
    SELECT 
      orders.id,
      customers.full_name AS customer_name,
      products.name AS product_name,
      order_items.quantity,
      order_items.price,
      orders.total_amount,
      orders.order_date
    FROM orders
    JOIN customers ON orders.customer_id = customers.id
    JOIN order_items ON orders.id = order_items.order_id
    JOIN products ON order_items.product_id = products.id
    ORDER BY orders.id DESC
  `;

  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng" });
    res.json(rows);
  });
});

app.post("/api/orders", (req, res) => {
  const { customer_id, product_id, quantity } = req.body;

  db.get("SELECT * FROM products WHERE id = ?", [product_id], (err, product) => {
    if (err) return res.status(500).json({ message: "Lỗi kiểm tra sản phẩm" });
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    if (quantity <= 0 || quantity > product.quantity) {
      return res.status(400).json({ message: "Số lượng không hợp lệ hoặc vượt quá tồn kho" });
    }

    const totalAmount = product.price * quantity;
    const orderDate = new Date().toISOString().slice(0, 10);

    db.run(
      "INSERT INTO orders (customer_id, order_date, total_amount) VALUES (?, ?, ?)",
      [customer_id, orderDate, totalAmount],
      function (err) {
        if (err) return res.status(500).json({ message: "Lỗi tạo đơn hàng" });

        const orderId = this.lastID;

        db.run(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, product_id, quantity, product.price],
          function (err) {
            if (err) return res.status(500).json({ message: "Lỗi tạo chi tiết đơn hàng" });

            db.run(
              "UPDATE products SET quantity = quantity - ? WHERE id = ?",
              [quantity, product_id],
              function (err) {
                if (err) return res.status(500).json({ message: "Lỗi cập nhật tồn kho" });

                res.json({
                  message: "Tạo đơn hàng thành công",
                  order_id: orderId,
                  total_amount: totalAmount
                });
              }
            );
          }
        );
      }
    );
  });
});

app.get("/api/reports", (req, res) => {
  const sql = `
    SELECT 
      IFNULL(SUM(orders.total_amount), 0) AS total_revenue,
      IFNULL(SUM(order_items.quantity), 0) AS products_sold,
      COUNT(DISTINCT orders.id) AS total_orders
    FROM orders
    LEFT JOIN order_items ON orders.id = order_items.order_id
  `;

  db.get(sql, (err, report) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy báo cáo doanh thu" });
    res.json(report);
  });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
