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

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
