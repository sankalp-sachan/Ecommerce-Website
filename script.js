// API Base URL (change to your backend address if deployed)
const API_URL = " http://localhost:5000/api";

// Variables
let productsList = [];
let shoppingCart = [];

// DOM Elements
const productsContainer = document.getElementById("productsContainer");
const cartBtn = document.getElementById("cartBtn");
const cartSidebar = document.getElementById("cartSidebar");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartSummary = document.getElementById("cartSummary");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");
const cartTax = document.getElementById("cartTax");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const confirmationModal = document.getElementById("confirmationModal");
const closeConfirmationBtn = document.getElementById("closeConfirmationBtn");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutTotal = document.getElementById("checkoutTotal");
const orderNumber = document.getElementById("orderNumber");
const categoryFilter = document.getElementById("categoryFilter");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let currentDisplayedProducts = 4;
let selectedCategory = "all";

// Fetch Products from API
async function fetchProducts(category = "all") {
  try {
    const res = category === "all"
      ? await fetch(`${API_URL}/products`)
      : await fetch(`${API_URL}/products/category/${category}`);
    productsList = await res.json();
    renderProducts(productsList);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Fetch Cart from API
async function fetchCart() {
  try {
    const res = await fetch(`${API_URL}/cart`);
    shoppingCart = await res.json();
    renderCart();
  } catch (error) {
    console.error("Error fetching cart:", error);
  }
}

// Render Products
function renderProducts(products) {
  productsContainer.innerHTML = "";

  products.slice(0, currentDisplayedProducts).forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className =
      "product-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out";

    const ratingStars = [];
    for (let i = 1; i <= 5; i++) {
      ratingStars.push(
        `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ${
          i <= Math.floor(product.rating)
            ? "text-yellow-400 fill-current"
            : i - 0.5 <= product.rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>`
      );
    }

    productCard.innerHTML = `
      <div class="relative">
        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
        ${product.stock <= 5
          ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">Only ${product.stock} left</span>`
          : ""
        }
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800">${product.name}</h3>
        <div class="flex items-center mt-1">
          ${ratingStars.join("")}
          <span class="text-xs text-gray-500 ml-1">(${product.rating})</span>
        </div>
        <p class="text-gray-600 text-sm mt-2 line-clamp-2">${product.description}</p>
        <div class="flex justify-between items-center mt-4">
          <span class="text-lg font-bold text-indigo-600">₹${product.price.toFixed(2)}</span>
          <button class="add-to-cart-btn px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition" data-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `;

    productsContainer.appendChild(productCard);
  });

  loadMoreBtn.style.display = currentDisplayedProducts >= products.length ? "none" : "inline-flex";
}

// Render Cart
function renderCart() {
  cartItemsContainer.innerHTML = "";
  if (shoppingCart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h4 class="mt-2 text-lg font-medium text-gray-500">Your cart is empty</h4>
        <p class="mt-1 text-sm text-gray-400">Start shopping to add items to your cart</p>
      </div>
    `;
    cartSummary.classList.add("hidden");
    cartCount.textContent = "0";
    return;
  }

  let subtotal = 0;
  shoppingCart.forEach((item) => {
    const product = productsList.find(p => p.id === item.id);
    if (!product) return;
    subtotal += product.price * item.quantity;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item py-4 px-2 transition";
    cartItem.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0 h-16 w-16">
          <img src="${product.image}" alt="${product.name}" class="h-full w-full object-contain">
        </div>
        <div class="ml-4 flex-1">
          <div class="flex justify-between">
            <h4 class="text-sm font-medium text-gray-900">${product.name}</h4>
            <span class="text-sm font-medium text-gray-900">₹${(product.price * item.quantity).toFixed(2)}</span>
          </div>
          <div class="flex justify-between mt-1">
            <div class="flex items-center">
              <button class="decrease-quantity text-gray-500 hover:text-indigo-600 px-1" data-id="${product.id}">-</button>
              <span class="mx-2 text-sm">${item.quantity}</span>
              <button class="increase-quantity text-gray-500 hover:text-indigo-600 px-1" data-id="${product.id}">+</button>
            </div>
            <button class="remove-item text-red-500 hover:text-red-700 text-sm" data-id="${product.id}">Remove</button>
          </div>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  cartSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
  cartTax.textContent = `₹${tax.toFixed(2)}`;
  cartTotal.textContent = `₹${total.toFixed(2)}`;
  checkoutSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
  checkoutTotal.textContent = `₹${total.toFixed(2)}`;
  cartCount.textContent = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
  cartSummary.classList.remove("hidden");
}

// Add to Cart
async function addToCart(productId) {
  await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: productId, quantity: 1 })
  });
  fetchCart();
}

// Update Quantity
async function updateCartQuantity(productId, change) {
  const item = shoppingCart.find(i => i.id === productId);
  if (!item) return;
  const newQty = item.quantity + change;
  if (newQty <= 0) {
    await fetch(`${API_URL}/cart/${productId}`, { method: "DELETE" });
  } else {
    await fetch(`${API_URL}/cart/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty })
    });
  }
  fetchCart();
}

// Checkout
checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    payment: document.getElementById("payment").value,
    cart: shoppingCart
  };

  const res = await fetch(`${API_URL}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (result.orderId) {
    orderNumber.textContent = result.orderId;
    checkoutModal.classList.add("hidden");
    confirmationModal.classList.remove("hidden");
    shoppingCart = [];
    renderCart();
  }
});

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  fetchCart();

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart-btn")) {
      addToCart(parseInt(e.target.dataset.id));
    }
    if (e.target.classList.contains("increase-quantity")) {
      updateCartQuantity(parseInt(e.target.dataset.id), 1);
    }
    if (e.target.classList.contains("decrease-quantity")) {
      updateCartQuantity(parseInt(e.target.dataset.id), -1);
    }
    if (e.target.classList.contains("remove-item")) {
      updateCartQuantity(parseInt(e.target.dataset.id), -999);
    }
  });

  categoryFilter.addEventListener("change", (e) => {
    selectedCategory = e.target.value;
    currentDisplayedProducts = 4;
    fetchProducts(selectedCategory);
  });

  loadMoreBtn.addEventListener("click", () => {
    currentDisplayedProducts += 4;
    renderProducts(productsList);
  });

  cartBtn.addEventListener("click", () => {
    cartSidebar.classList.add("open");
    cartSidebar.classList.remove("translate-x-full");
  });

  closeCartBtn.addEventListener("click", () => {
    cartSidebar.classList.remove("open");
    cartSidebar.classList.add("translate-x-full");
  });

  checkoutBtn.addEventListener("click", () => {
    checkoutModal.classList.remove("hidden");
  });

  closeModalBtn.addEventListener("click", () => {
    checkoutModal.classList.add("hidden");
  });

  closeConfirmationBtn.addEventListener("click", () => {
    confirmationModal.classList.add("hidden");
  });
});
