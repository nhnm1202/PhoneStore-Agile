const API_URL = "http://localhost:3000/api";

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const menuButtons = document.querySelectorAll(".menu");
const pages = document.querySelectorAll(".page");

const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");

const customerForm = document.getElementById("customerForm");
const customerList = document.getElementById("customerList");

const orderForm = document.getElementById("orderForm");
const orderCustomer = document.getElementById("orderCustomer");
const orderProduct = document.getElementById("orderProduct");
const orderQuantity = document.getElementById("orderQuantity");
const orderList = document.getElementById("orderList");

const statProducts = document.getElementById("statProducts");
const statCustomers = document.getElementById("statCustomers");
const statOrders = document.getElementById("statOrders");
const statRevenue = document.getElementById("statRevenue");

const reportRevenue = document.getElementById("reportRevenue");
const reportSold = document.getElementById("reportSold");
const reportOrders = document.getElementById("reportOrders");

let products = [];
let customers = [];
let orders = [];
let report = {
  total_revenue: 0,
  products_sold: 0,
  total_orders: 0
};

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      loginMessage.textContent = data.message || "Đăng nhập thất bại";
      return;
    }

    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    await loadAllData();
  } catch (error) {
    loginMessage.textContent = "Không kết nối được API";
  }
});

menuButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const target = this.dataset.target;

    menuButtons.forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");

    pages.forEach((page) => page.classList.remove("active-page"));
    document.getElementById(target).classList.add("active-page");
  });
});

async function loadAllData() {
  await loadProducts();
  await loadCustomers();
  await loadOrders();
  await loadReport();
  updateDashboard();
}

async function loadProducts() {
  const response = await fetch(`${API_URL}/products`);
  products = await response.json();

  renderProducts();
  renderProductOptions();
}

function renderProducts() {
  productList.innerHTML = "";

  products.forEach((product) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.brand}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${product.quantity}</td>
      <td>
        <button class="btn-edit" onclick="editProduct(${product.id})">Sửa</button>
        <button class="btn-delete" onclick="deleteProduct(${product.id})">Xóa</button>
      </td>
    `;

    productList.appendChild(row);
  });
}

productForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const id = document.getElementById("productId").value;

  const product = {
    name: document.getElementById("productName").value,
    brand: document.getElementById("brand").value,
    price: Number(document.getElementById("price").value),
    quantity: Number(document.getElementById("quantity").value),
    description: document.getElementById("description").value
  };

  const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
  const method = id ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
  });

  productForm.reset();
  document.getElementById("productId").value = "";

  await loadAllData();
});

function editProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  document.getElementById("brand").value = product.brand;
  document.getElementById("price").value = product.price;
  document.getElementById("quantity").value = product.quantity;
  document.getElementById("description").value = product.description || "";
}

async function deleteProduct(id) {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

  await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE"
  });

  await loadAllData();
}

async function loadCustomers() {
  const response = await fetch(`${API_URL}/customers`);
  customers = await response.json();

  renderCustomers();
  renderCustomerOptions();
}

function renderCustomers() {
  customerList.innerHTML = "";

  customers.forEach((customer) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${customer.full_name}</td>
      <td>${customer.phone}</td>
      <td>${customer.address || ""}</td>
      <td>
        <button class="btn-delete" onclick="deleteCustomer(${customer.id})">Xóa</button>
      </td>
    `;

    customerList.appendChild(row);
  });
}

customerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const customer = {
    full_name: document.getElementById("customerName").value,
    phone: document.getElementById("customerPhone").value,
    address: document.getElementById("customerAddress").value
  };

  await fetch(`${API_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(customer)
  });

  customerForm.reset();

  await loadAllData();
});

async function deleteCustomer(id) {
  if (!confirm("Bạn có chắc muốn xóa khách hàng này?")) return;

  await fetch(`${API_URL}/customers/${id}`, {
    method: "DELETE"
  });

  await loadAllData();
}

function renderCustomerOptions() {
  orderCustomer.innerHTML = `<option value="">Chọn khách hàng</option>`;

  customers.forEach((customer) => {
    const option = document.createElement("option");
    option.value = customer.id;
    option.textContent = customer.full_name;
    orderCustomer.appendChild(option);
  });
}

function renderProductOptions() {
  orderProduct.innerHTML = `<option value="">Chọn sản phẩm</option>`;

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} - ${formatCurrency(product.price)} - Tồn: ${product.quantity}`;
    orderProduct.appendChild(option);
  });
}

async function loadOrders() {
  const response = await fetch(`${API_URL}/orders`);
  orders = await response.json();

  renderOrders();
}

function renderOrders() {
  orderList.innerHTML = "";

  orders.forEach((order) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${order.customer_name}</td>
      <td>${order.product_name}</td>
      <td>${order.quantity}</td>
      <td>${formatCurrency(order.total_amount)}</td>
      <td>${formatDate(order.order_date)}</td>
    `;

    orderList.appendChild(row);
  });
}

orderForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const order = {
    customer_id: Number(orderCustomer.value),
    product_id: Number(orderProduct.value),
    quantity: Number(orderQuantity.value)
  };

  if (!order.customer_id || !order.product_id || order.quantity <= 0) {
    alert("Vui lòng chọn khách hàng, sản phẩm và nhập số lượng hợp lệ");
    return;
  }

  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(order)
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "Không thể tạo đơn hàng");
    return;
  }

  alert("Tạo đơn hàng thành công");
  orderForm.reset();

  await loadAllData();
});

async function loadReport() {
  const response = await fetch(`${API_URL}/reports`);
  report = await response.json();

  renderReport();
}

function renderReport() {
  reportRevenue.textContent = formatCurrency(report.total_revenue);
  reportSold.textContent = report.products_sold;
  reportOrders.textContent = report.total_orders;
}

function updateDashboard() {
  statProducts.textContent = products.length;
  statCustomers.textContent = customers.length;
  statOrders.textContent = report.total_orders;
  statRevenue.textContent = formatCurrency(report.total_revenue);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(value) {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
