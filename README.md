# FurnitureEcommerce

`FurnitureEcommerce` is a static multi-page furniture storefront built with plain HTML, CSS, and JavaScript. It demonstrates how to create a browser-only ecommerce experience with product browsing, search, cart and wishlist storage, theme switching, and a simple buy-now flow without using a frontend framework.

The project uses a local JSON dataset for product information and `localStorage` for user state such as cart items, wishlist items, theme choice, and temporary checkout data.

## Features

- Data-driven furniture catalog loaded from `data/db.json`
- Search bar for filtering products by name
- Product pagination on the landing page
- Two product carousels for additional discovery
- Add to cart and add to wishlist actions
- Dedicated cart page with remove, clear, single buy-now, and cart checkout actions
- Dedicated wishlist page with removal flow
- Buy-now page for single-product and full-cart purchase summaries
- Light and dark theme toggle with persistence
- Toast notifications for quick user feedback

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- JSON product data
- Browser `localStorage`

## Folder Structure

```text
FurnitureEcommerce/
|-- README.md
|-- data/
|   `-- db.json
|-- LandingPage/
|   |-- index.html
|   |-- index.css
|   `-- index.js
|-- AddToCart/
|   |-- AddToCart.html
|   |-- AddToCart.css
|   `-- AddToCart.js
|-- Wishlist/
|   |-- Wishlist.html
|   |-- Wishlist.css
|   `-- Wishlist.js
`-- BuyNow/
    |-- BuyNow.html
    |-- BuyNow.css
    `-- BuyNow.js
```

## Page Overview

### `LandingPage/index.html`

This is the main storefront page.

It includes:

- The site header with search, theme toggle, and navigation
- A hero section introducing the furniture shop
- A paginated product grid
- Two carousels for additional product discovery
- A toast container for action feedback

The logic in `LandingPage/index.js` is responsible for:

- Loading and parsing the furniture dataset
- Filtering products by search input
- Rendering paginated product cards
- Rendering both carousels
- Handling cart, wishlist, and buy-now actions
- Managing theme state and header counts

### `AddToCart/AddToCart.html`

This page displays the current cart contents.

Main behaviors:

- Reads cart items from `localStorage`
- Renders saved products
- Allows the user to remove items
- Allows the user to clear the full cart
- Allows single-item buy now
- Allows checkout of all cart items together

### `Wishlist/Wishlist.html`

This page displays saved wishlist items.

Main behaviors:

- Reads wishlist items from `localStorage`
- Renders saved products
- Allows removal of individual items
- Supports the same theme experience as the rest of the site

### `BuyNow/BuyNow.html`

This page acts as a lightweight checkout preview.

It supports two kinds of payloads:

- A single selected product
- A full-cart checkout payload

Main behaviors:

- Reads a temporary buy-now payload from `localStorage`
- Renders a single-product or multi-product summary
- Allows adding the selected item back to cart or wishlist
- Shows header counts and theme state

## Data Source

Furniture data is stored in:

- `data/db.json`

The file contains a `products` array with fields such as:

- `product_id`
- `title`
- `price`
- `price_was`
- `rating`
- `reviews`
- `thumbnails`
- `price_badge`
- `badges`
- `link`

The landing page converts those raw records into a smaller UI-friendly shape before rendering product cards.

## Local Storage Keys

The project currently uses these keys:

| Purpose | Key |
| --- | --- |
| Cart | `furnitureCart` |
| Wishlist | `furnitureWishlist` |
| Theme | `furnitureTheme` |
| Buy now payload | `furnitureBuyNowProduct` |

### What each key stores

- `furnitureCart`
  Array of saved cart products
- `furnitureWishlist`
  Array of saved wishlist products
- `furnitureTheme`
  Current theme choice such as `light` or `dark`
- `furnitureBuyNowProduct`
  Temporary single-product or cart checkout payload

## User Flow

The typical flow through the project is:

1. Open `LandingPage/index.html`.
2. Browse or search the furniture catalog.
3. Add items to cart or wishlist.
4. Open the cart page to review purchases.
5. Use `Buy Now` for one product or the full cart.
6. Open the buy-now page to continue the checkout-style flow.

## Styling Notes

The visual style of the project focuses on:

- Rounded cards
- Soft shadows
- Clear spacing
- Theme-aware colors
- Simple pill-style buttons

Each page keeps its own stylesheet, while the theme values follow the same overall pattern across all sections.

## Running the Project

Because the project loads JSON with `fetch()`, it should be served through a local web server instead of opening files directly with `file:///`.

### Option 1: VS Code Live Server

1. Open the `FurnitureEcommerce` folder in VS Code.
2. Right-click `LandingPage/index.html`.
3. Choose `Open with Live Server`.

### Option 2: Python HTTP Server

From the `FurnitureEcommerce` folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/LandingPage/index.html
```

### Option 3: Node static server

From the `FurnitureEcommerce` folder:

```bash
npx serve .
```

Then open the URL shown by the server and navigate to `LandingPage/index.html`.

## Important Implementation Notes

### 1. The project is frontend-only

There is no backend, real checkout, payment integration, or user authentication. All state lives in the browser.

### 2. Product data is normalized on the landing page

The landing page script converts the raw JSON into smaller objects that are easier to render across cards and carousels.

### 3. Cart and wishlist state persist across pages

All pages read and write the same `localStorage` keys, which keeps the shopping flow connected.

### 4. Buy-now uses a temporary stored payload

Instead of a server-side checkout session, the project stores the selected product or cart summary in `localStorage` and reads it from the buy-now page.

## How to Extend the Project

Useful improvements could include:

- Add quantity controls to the cart
- Add sorting options on the landing page
- Add filters by price, rating, or badge
- Add a move-to-cart action on the wishlist page
- Add richer checkout form fields on the buy-now page
- Replace local JSON with an API
- Add tests for product parsing and cart behavior

## Troubleshooting

### Products do not load

Possible causes:

- The page was opened directly from the filesystem
- The server root is wrong
- `data/db.json` is not reachable from the current page path

Fix:

- Serve the folder through a local web server
- Confirm the `fetch("../data/db.json")` path resolves correctly

### Cart or wishlist looks wrong

Possible causes:

- Old `localStorage` data is still present
- You switched browser or profile
- The stored values were manually edited or cleared

Fix:

- Clear the relevant browser storage keys
- Reload the page and test again

### Theme does not persist

Possible causes:

- Browser storage is disabled
- Theme data was cleared

Fix:

- Check whether `localStorage` is available and writable in the browser

## Summary

`FurnitureEcommerce` is a good learning project for building a small storefront with only browser technologies. It covers:

- Data loading from JSON
- Dynamic rendering with JavaScript
- Search and pagination
- Carousel-style product discovery
- Shared browser storage across multiple pages
- Basic cart, wishlist, and buy-now flows

It is especially useful if you want to practice ecommerce UI patterns without introducing a framework or backend.
