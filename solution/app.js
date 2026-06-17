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
    await loadProducts();
    renderCustomers();
    renderOrders();
    updateDashboard();
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

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    products = await response.json();
    renderProducts();
    renderProductOptions();
    updateDashboard();
  } catch (error) {
    products = [];
    renderProducts();
  }
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
  await loadProducts();
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

  await loadProducts();
}

customerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const customer = {
    id: Date.now(),
    fullName: document.getElementById("customerName").value,
    phone: document.getElementById("customerPhone").value,
    address: document.getElementById("customerAddress").value
  };

  customers.push(customer);
  customerForm.reset();

  renderCustomers();
  renderCustomerOptions();
  updateDashboard();
});

function renderCustomers() {
  customerList.innerHTML = "";

  customers.forEach((customer) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${customer.fullName}</td>
      <td>${customer.phone}</td>
      <td>${customer.address}</td>
      <td>
        <button class="btn-delete" onclick="deleteCustomer(${customer.id})">Xóa</button>
      </td>
    `;

    customerList.appendChild(row);
  });

  renderCustomerOptions();
}

function deleteCustomer(id) {
  customers = customers.filter((customer) => customer.id !== id);
  renderCustomers();
  updateDashboard();
}

function renderCustomerOptions() {
  orderCustomer.innerHTML = `<option value="">Chọn khách hàng</option>`;

  customers.forEach((customer) => {
    const option = document.createElement("option");
    option.value = customer.id;
    option.textContent = customer.fullName;
    orderCustomer.appendChild(option);
  });
}

function renderProductOptions() {
  orderProduct.innerHTML = `<option value="">Chọn sản phẩm</option>`;

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} - ${formatCurrency(product.price)}`;
    orderProduct.appendChild(option);
  });
}

orderForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const customerId = Number(orderCustomer.value);
  const productId = Number(orderProduct.value);
  const quantity = Number(orderQuantity.value);

  const customer = customers.find((item) => item.id === customerId);
  const product = products.find((item) => item.id === productId);

  if (!customer || !product) {
    alert("Vui lòng chọn khách hàng và sản phẩm");
    return;
  }

  if (quantity <= 0 || quantity > product.quantity) {
    alert("Số lượng không hợp lệ hoặc vượt quá tồn kho");
    return;
  }

  const total = product.price * quantity;

  const order = {
    id: Date.now(),
    customerName: customer.fullName,
    productName: product.name,
    quantity,
    total,
    date: new Date().toLocaleDateString("vi-VN")
  };

  orders.push(order);
  product.quantity -= quantity;

  orderForm.reset();

  renderProducts();
  renderProductOptions();
  renderOrders();
  updateDashboard();
});

function renderOrders() {
  orderList.innerHTML = "";

  orders.forEach((order) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${order.customerName}</td>
      <td>${order.productName}</td>
      <td>${order.quantity}</td>
      <td>${formatCurrency(order.total)}</td>
      <td>${order.date}</td>
    `;

    orderList.appendChild(row);
  });
}

function updateDashboard() {
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const sold = orders.reduce((sum, order) => sum + order.quantity, 0);

  statProducts.textContent = products.length;
  statCustomers.textContent = customers.length;
  statOrders.textContent = orders.length;
  statRevenue.textContent = formatCurrency(revenue);

  reportRevenue.textContent = formatCurrency(revenue);
  reportSold.textContent = sold;
  reportOrders.textContent = orders.length;
}

function formatCurrency(value) {
  return Number(value).toLocaleString("vi-VN") + "đ";
}
