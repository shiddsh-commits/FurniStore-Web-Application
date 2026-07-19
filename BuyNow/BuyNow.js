// Cache DOM nodes for checkout rendering, counts, theme, and toast feedback.
const buyNowCard = document.getElementById("buy-now-card");
const cartCountEl = document.getElementById("cart-count");
const wishlistCountEl = document.getElementById("wishlist-count");
const themeToggle = document.getElementById("theme-toggle");
const toast = document.getElementById("toast");
const cartKey = "furnitureCart";
const wishlistKey = "furnitureWishlist";
const themeKey = "furnitureTheme";
const buyNowKey = "furnitureBuyNowProduct";

// Read cart, wishlist, or checkout payload data from localStorage.
function getStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Persist updated cart or wishlist state after actions from the buy-now page.
function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Update header counters so the user can see current saved item counts.
function updateCounts() {
  cartCountEl.textContent = getStorage(cartKey).length;
  wishlistCountEl.textContent = getStorage(wishlistKey).length;
}

// Show temporary feedback when an item is added from the buy-now page.
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  toast.classList.remove("hidden");
  window.clearTimeout(window.toastTimeout);
  window.toastTimeout = window.setTimeout(() => {
    toast.classList.remove("visible");
    toast.classList.add("hidden");
  }, 1600);
}

// Restore the previously selected theme so checkout matches the rest of the site.
function initTheme() {
  const savedTheme = localStorage.getItem(themeKey) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";
}

// Toggle between light and dark theme and update the button icon.
function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem(themeKey, nextTheme);
  themeToggle.textContent = nextTheme === "dark" ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", toggleTheme);

// Reuse the same duplicate-safe storage pattern for cart and wishlist actions.
function addToStorage(product, storageKey, message) {
  const items = getStorage(storageKey);
  if (items.some((item) => item.id === product.id)) {
    showToast(`${product.name} is already added.`);
    return;
  }
  items.push(product);
  setStorage(storageKey, items);
  updateCounts();
  showToast(message);
}

// Render either an empty state, a cart checkout summary, or a single-product checkout card.
function renderBuyNow(selected) {
  if (!selected) {
    buyNowCard.classList.remove("has-image");
    buyNowCard.classList.add("no-image");
    buyNowCard.innerHTML = `
      <div class="buy-now-details">
        <h1>No product selected</h1>
        <p>Please choose a product from the shop to buy now.</p>
        <div class="buy-now-actions">
          <a class="btn btn-primary" href="../LandingPage/index.html">Return to shop</a>
        </div>
      </div>
    `;
    return;
  }

  const isCartPurchase =
    selected.type === "cart" && Array.isArray(selected.items);
  const items = isCartPurchase
    ? selected.items
    : Array.isArray(selected.items)
      ? selected.items
      : [selected];

  if (isCartPurchase) {
    // Cart checkout renders a summary list of all selected products.
    buyNowCard.classList.remove("has-image");
    buyNowCard.classList.add("no-image");
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    buyNowCard.innerHTML = `
      <div class="buy-now-details">
        <h1>Buy All Items</h1>
        <p>You are buying ${items.length} item${items.length === 1 ? "" : "s"} from your cart.</p>
        <div class="buy-now-cart-items">
          ${items
            .map(
              (product) => `
            <div class="buy-now-item">
              <img src="${product.image}" alt="${product.name}" />
              <div>
                <h2>${product.name}</h2>
                <p>$${product.price.toFixed(2)}</p>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="buy-now-price">
          <strong>Total: $${total.toFixed(2)}</strong>
        </div>
        <div class="buy-now-actions">
          <button id="checkout-now" class="btn btn-primary">Proceed to Checkout</button>
          <a class="btn btn-secondary" href="../AddToCart/AddToCart.html">Review Cart</a>
        </div>
      </div>
    `;

    document.getElementById("checkout-now").addEventListener("click", () => {
      window.location.href = "../AddToCart/AddToCart.html";
    });
    return;
  }

  // Single-item checkout renders a richer product card with supporting actions.
  const product = items[0];
  buyNowCard.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <div class="buy-now-details">
      <h1>${product.name}</h1>
      <p>${product.badge ? `${product.badge} · ` : ""}Rating ${product.rating} · ${product.reviews} reviews</p>
      <div class="buy-now-price">
        <strong>$${product.price.toFixed(2)}</strong>
        ${product.oldPrice ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ""}
      </div>
      <p>Experience premium furniture delivery with easy checkout and quick support. Add it to cart or buy immediately.</p>
      <div class="buy-now-actions">
        <button id="add-to-cart" class="btn btn-secondary">Add to Cart</button>
        <button id="add-to-wishlist" class="btn btn-secondary">Add to Wishlist</button>
        <button id="checkout-now" class="btn btn-primary">Proceed to Checkout</button>
      </div>
    </div>
  `;

  document.getElementById("add-to-cart").addEventListener("click", () => {
    addToStorage(product, cartKey, "Added to cart");
  });
  document.getElementById("add-to-wishlist").addEventListener("click", () => {
    addToStorage(product, wishlistKey, "Added to wishlist");
  });
  document.getElementById("checkout-now").addEventListener("click", () => {
    addToStorage(product, cartKey, "Added to cart");
    window.location.href = "../AddToCart/AddToCart.html";
  });
}

// Read the temporary buy-now payload and gracefully handle missing or invalid data.
function loadBuyNowProduct() {
  const raw = localStorage.getItem(buyNowKey);
  if (!raw) {
    renderBuyNow(null);
    return;
  }
  try {
    const data = JSON.parse(raw);
    renderBuyNow(data);
  } catch {
    renderBuyNow(null);
  }
}

// Initialize checkout page state when the script loads.
initTheme();
updateCounts();
loadBuyNowProduct();
