const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");

if (productForm) {
  productForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("productName").value;
    const brand = document.getElementById("brand").value;
    const price = document.getElementById("price").value;
    const quantity = document.getElementById("quantity").value;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${name}</td>
      <td>${brand}</td>
      <td>${price}</td>
      <td>${quantity}</td>
    `;

    productList.appendChild(row);
    productForm.reset();
  });
}
