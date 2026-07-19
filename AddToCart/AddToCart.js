// Cache DOM nodes used across the cart page.
const cartList = document.getElementById("cart-list");
const cartSummary = document.getElementById("cart-summary");
const clearCartButton = document.getElementById("clear-cart");
const checkoutCartButton = document.getElementById("checkout-cart");
const themeToggle = document.getElementById("theme-toggle");
const cartKey = "furnitureCart";
const themeKey = "furnitureTheme";
const buyNowKey = "furnitureBuyNowProduct";

// Restore the saved theme so the cart page matches the rest of the storefront.
function initTheme() {
  const savedTheme = localStorage.getItem(themeKey) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

// Update the icon to reflect the available theme switch.
function updateThemeIcon(theme) {
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

// Toggle light and dark mode and persist the current preference.
function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem(themeKey, newTheme);
  updateThemeIcon(newTheme);
}

themeToggle.addEventListener("click", toggleTheme);
initTheme();

// Read the current cart list from browser storage.
function getCartItems() {
  const stored = localStorage.getItem(cartKey);
  return stored ? JSON.parse(stored) : [];
}

// Persist the latest cart state after removals or checkout changes.
function setCartItems(items) {
  localStorage.setItem(cartKey, JSON.stringify(items));
}

// Render cart items from storage and update the empty state or summary message.
function renderCart() {
  const items = getCartItems();
  cartList.innerHTML = "";
  if (!items.length) {
    cartSummary.textContent = "Your cart is empty.";
    cartList.innerHTML =
      "<div class='empty-state'>Add furniture from the shop to see it here.</div>";
    return;
  }

  cartSummary.textContent = `You have ${items.length} item${items.length > 1 ? "s" : ""} in your cart.`;

  items.forEach((product) => {
    // Each cart row shows the saved item with quick actions for purchase or removal.
    const item = document.createElement("div");
    item.className = "cart-item";
    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="item-info">
        <h2>${product.name}</h2>
        <p>$${product.price.toFixed(2)}</p>
      </div>
      <div class="item-buttons">
        <button class="btn btn-primary btn-buynow">Buy Now</button>
        <button class="remove-button">Remove</button>
      </div>
    `;

    item.querySelector(".remove-button").addEventListener("click", () => {
      const updated = getCartItems().filter((entry) => entry.id !== product.id);
      setCartItems(updated);
      renderCart();
    });

    item.querySelector(".btn-buynow").addEventListener("click", () => {
      handleBuyNow(product);
    });

    cartList.appendChild(item);
  });
}

// Save the selected item as a temporary checkout payload and open the buy-now page.
function handleBuyNow(product) {
  localStorage.setItem(buyNowKey, JSON.stringify({ type: "single", items: [product] }));
  window.location.href = "../BuyNow/BuyNow.html";
}

// Clear the cart completely and rerender the page.
clearCartButton.addEventListener("click", () => {
  setCartItems([]);
  renderCart();
});

// Send the full cart to the buy-now page as a single checkout payload.
checkoutCartButton.addEventListener("click", () => {
  const items = getCartItems();
  if (!items.length) {
    window.alert("Your cart is empty. Add furniture first.");
    return;
  }
  localStorage.setItem(buyNowKey, JSON.stringify({ type: "cart", items }));
  window.location.href = "../BuyNow/BuyNow.html";
});

// Initial cart rendering when the page loads.
renderCart();
