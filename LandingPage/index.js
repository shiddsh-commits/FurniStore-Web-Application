// Cache frequently-used DOM nodes once so the rest of the script can reuse them.
const productGrid = document.getElementById("product-grid");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const cartCountEl = document.getElementById("cart-count");
const wishlistCountEl = document.getElementById("wishlist-count");
const paginationEl = document.getElementById("pagination");
const themeToggle = document.getElementById("theme-toggle");
const toast = document.getElementById("toast");
const cartKey = "furnitureCart";
const wishlistKey = "furnitureWishlist";
const themeKey = "furnitureTheme";
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 12;
let carouselPositions = { "carousel-1": 0, "carousel-2": 0 };

// Read structured data from localStorage and fall back to an empty list.
function getStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Persist updated cart, wishlist, or theme state in the browser.
function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Keep the header badges synchronized with the current saved item counts.
function updateCounts() {
  cartCountEl.textContent = getStorage(cartKey).length;
  wishlistCountEl.textContent = getStorage(wishlistKey).length;
}

// Show a short-lived status message for cart, wishlist, or load actions.
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

// Convert raw API records into a smaller product shape used by the UI.
function parseProduct(item) {
  const image =
    item.thumbnails?.[0]?.[6] ||
    item.thumbnails?.[0]?.[5] ||
    item.thumbnails?.[0]?.[0] ||
    "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1400&q=95";

  return {
    id: item.product_id,
    name: item.title,
    price: item.price ?? 0,
    oldPrice: item.price_was ?? null,
    badge: item.price_badge || item.badges?.[0] || "",
    rating: item.rating?.toFixed(1) ?? "-",
    reviews: item.reviews ?? 0,
    image,
    link: item.link || "#",
  };
}

// Render only the current page of product cards after search filtering is applied.
function renderProducts(products) {
  productGrid.innerHTML = "";
  if (!products.length) {
    productGrid.innerHTML =
      "<div class='empty-state'><p>No furniture matched your search.</p></div>";
    paginationEl.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  paginatedProducts.forEach((product) => {
    // Build each product card from the normalized product object.
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-card-body">
        <div class="product-header">
          <h3>${product.name}</h3>
          ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
        </div>
        <p>Rating ${product.rating} · ${product.reviews} reviews</p>
        <div class="product-details">
          <div class="price-block">
            <span class="product-price">$${product.price.toFixed(2)}</span>
            ${product.oldPrice ? `<span class="product-old-price">$${product.oldPrice.toFixed(2)}</span>` : ""}
          </div>
          <div class="actions">
            <button class="btn-cart">Add to Cart</button>
            <button class="btn-wishlist" style='color:#222; background-color:#eee'
            >Wishlist</button>
          </div>
        </div>
      </div>
    `;

    const cartButton = card.querySelector(".btn-cart");
    const wishlistButton = card.querySelector(".btn-wishlist");

    cartButton.addEventListener("click", () =>
      addToStorage(product, cartKey, "Added to cart"),
    );
    wishlistButton.addEventListener("click", () =>
      addToStorage(product, wishlistKey, "Added to wishlist"),
    );

    productGrid.appendChild(card);
  });

  renderPagination(totalPages, products.length);
}

// Create page controls so the user can browse large product lists in smaller chunks.
function renderPagination(totalPages, totalProducts) {
  paginationEl.innerHTML = "";

  if (totalPages <= 1) return;

  const paginationContainer = document.createElement("div");
  paginationContainer.className = "pagination-controls";

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-btn";
  prevBtn.textContent = "← Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts(filteredProducts);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  paginationContainer.appendChild(prevBtn);

  // Page info
  const pageInfo = document.createElement("span");
  pageInfo.className = "page-info";
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  paginationContainer.appendChild(pageInfo);

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-btn";
  nextBtn.textContent = "Next →";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts(filteredProducts);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  paginationContainer.appendChild(nextBtn);

  paginationEl.appendChild(paginationContainer);
}

// Save a product to cart or wishlist while preventing duplicate entries.
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

// Filter the catalog by the current search term and rerender from page one.
function applySearch(query) {
  const lowerQuery = query.trim().toLowerCase();
  filteredProducts = allProducts.filter((item) =>
    item.name.toLowerCase().includes(lowerQuery),
  );
  currentPage = 1;
  renderProducts(filteredProducts);
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applySearch(searchInput.value);
});

searchInput.addEventListener("input", (event) => {
  applySearch(event.target.value);
});

// Restore the previously selected color theme when the page opens.
function initTheme() {
  const savedTheme = localStorage.getItem(themeKey) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

// Swap the icon so the toggle reflects which theme can be switched to next.
function updateThemeIcon(theme) {
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

// Toggle between light and dark theme and persist the choice.
function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem(themeKey, newTheme);
  updateThemeIcon(newTheme);
}

themeToggle.addEventListener("click", toggleTheme);

// Render a window of products into one of the horizontal carousels.
function renderCarousel(carouselId, products, startIndex = 0) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) {
    console.error(`Carousel element with ID ${carouselId} not found`);
    return;
  }

  carousel.innerHTML = "";

  const itemsToShow = products.slice(startIndex, startIndex + 6);

  itemsToShow.forEach((product) => {
    // Each carousel card keeps the same action model as the main product grid.
    const item = document.createElement("div");
    item.className = "carousel-item";
    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="carousel-item-content">
        <h4>${product.name.length > 30 ? product.name.substring(0, 30) + "..." : product.name}</h4>
        <p>⭐ ${product.rating}</p>
        <div class="carousel-item-price">$${product.price.toFixed(2)}</div>
        <div class="carousel-actions">
          <button class="btn btn-cart carousel-action">Add to Cart</button>
          <button class="btn btn-wishlist carousel-action">Wishlist</button>
          <button class="btn btn-primary carousel-action">Buy Now</button>
        </div>
      </div>
    `;

    const cartButton = item.querySelector(".btn-cart");
    const wishlistButton = item.querySelector(".btn-wishlist");
    const buyNowButton = item.querySelector(".btn-primary");

    cartButton.addEventListener("click", () =>
      addToStorage(product, cartKey, "Added to cart"),
    );
    wishlistButton.addEventListener("click", () =>
      addToStorage(product, wishlistKey, "Added to wishlist"),
    );
    buyNowButton.addEventListener("click", () => handleBuyNow(product));

    carousel.appendChild(item);
  });
}

// Store a temporary checkout payload and redirect to the buy-now page.
function handleBuyNow(product) {
  localStorage.setItem("furnitureBuyNowProduct", JSON.stringify(product));
  window.location.href = "../BuyNow/BuyNow.html";
}

// Connect previous/next buttons to the correct carousel and move in groups of three items.
function setupCarouselButtons(carouselNumber, totalItems) {
  const carouselId = `carousel-${carouselNumber}`;
  const prevBtnId = `carousel${carouselNumber}-prev`;
  const nextBtnId = `carousel${carouselNumber}-next`;

  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  if (!prevBtn || !nextBtn) {
    console.error(`Carousel buttons not found for carousel ${carouselNumber}`);
    return;
  }

  prevBtn.addEventListener("click", () => {
    carouselPositions[carouselId] = Math.max(
      0,
      carouselPositions[carouselId] - 3,
    );
    renderCarousel(
      carouselId,
      carouselNumber === 1 ? allProducts : allProducts.slice().reverse(),
      carouselPositions[carouselId],
    );
  });

  nextBtn.addEventListener("click", () => {
    const maxPosition = Math.max(0, totalItems - 6);
    carouselPositions[carouselId] = Math.min(
      maxPosition,
      carouselPositions[carouselId] + 3,
    );
    renderCarousel(
      carouselId,
      carouselNumber === 1 ? allProducts : allProducts.slice().reverse(),
      carouselPositions[carouselId],
    );
  });
}

// Reset both carousels and render their first visible sets after product loading.
function initializeCarousels() {
  if (allProducts.length === 0) return;

  carouselPositions["carousel-1"] = 0;
  carouselPositions["carousel-2"] = 0;

  renderCarousel("carousel-1", allProducts, 0);
  renderCarousel("carousel-2", allProducts.slice().reverse(), 0);

  setupCarouselButtons(1, allProducts.length);
  setupCarouselButtons(2, allProducts.length);
}

// Load the local furniture dataset, then render the catalog and supporting UI.
function loadProducts() {
  fetch("../data/db.json")
    .then((response) => response.json())
    .then((data) => {
      allProducts = Array.isArray(data.products)
        ? data.products.map(parseProduct)
        : [];
      filteredProducts = allProducts;
      renderProducts(filteredProducts);
      initializeCarousels();
      updateCounts();
    })
    .catch(() => {
      showToast("Could not load furniture data.");
      allProducts = [];
      filteredProducts = [];
      renderProducts(filteredProducts);
    });
}

// Start the landing page by restoring theme and loading the product catalog.
initTheme();
loadProducts();
