// Cache DOM nodes needed for wishlist rendering and theme behavior.
const wishlistList = document.getElementById("wishlist-list");
const wishlistSummary = document.getElementById("wishlist-summary");
const themeToggle = document.getElementById("theme-toggle");
const wishlistKey = "furnitureWishlist";
const themeKey = "furnitureTheme";

// Restore the persisted theme when the wishlist page opens.
function initTheme() {
  const savedTheme = localStorage.getItem(themeKey) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

// Show the icon for the alternate theme the user can switch to.
function updateThemeIcon(theme) {
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

// Toggle the theme and save the selection in browser storage.
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

// Read saved wishlist products from localStorage.
function getWishlistItems() {
  const stored = localStorage.getItem(wishlistKey);
  return stored ? JSON.parse(stored) : [];
}

// Persist the latest wishlist state after removals.
function setWishlistItems(items) {
  localStorage.setItem(wishlistKey, JSON.stringify(items));
}

// Render all wishlist products or a helpful empty state when nothing is saved.
function renderWishlist() {
  const items = getWishlistItems();
  wishlistList.innerHTML = "";
  if (!items.length) {
    wishlistSummary.textContent = "Your wishlist is empty.";
    wishlistList.innerHTML =
      "<div class='empty-state'>Add furniture from the shop to save it here.</div>";
    return;
  }

  wishlistSummary.textContent = `You have ${items.length} favorite item${items.length > 1 ? "s" : ""}.`;

  items.forEach((product) => {
    // Each saved item shows the product image, name, price, and a remove action.
    const item = document.createElement("div");
    item.className = "cart-item";
    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="item-info">
        <h2>${product.name}</h2>
        <p>$${product.price.toFixed(2)}</p>
      </div>
      <button class="remove-button">Remove</button>
    `;

    item.querySelector(".remove-button").addEventListener("click", () => {
      const updated = getWishlistItems().filter(
        (entry) => entry.id !== product.id,
      );
      setWishlistItems(updated);
      renderWishlist();
    });

    wishlistList.appendChild(item);
  });
}

// Initial render when the wishlist page loads.
renderWishlist();
