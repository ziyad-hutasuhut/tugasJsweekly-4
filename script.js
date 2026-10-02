// =========================================================
// HSI PRODUCT EXPLORER - Phase 5 Script
// =========================================================

// --- State Management ---
let productsData = [];

// --- DOM Elements ---
const reloadBtn = document.getElementById("reload-btn");
const searchInput = document.getElementById("search-input");
const categorySelect = document.getElementById("category-select");
const sortSelect = document.getElementById("sort-select");
const resetBtn = document.getElementById("reset-btn");

const resultSummary = document.getElementById("result-summary");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const retryBtn = document.getElementById("retry-btn");
const emptyState = document.getElementById("empty-state");
const productGrid = document.getElementById("product-grid");

const productDialog = document.getElementById("product-dialog");
const dialogContent = document.getElementById("dialog-content");
const dialogClose = document.getElementById("dialog-close");

// --- API Endpoints ---
const API_URL = "https://dummyjson.com/products?limit=100";
const CATEGORIES_URL = "https://dummyjson.com/products/categories";

// --- Functions: UI State Handling ---
function showLoading() {
  loadingState.hidden = false;
  errorState.hidden = true;
  emptyState.hidden = true;
  productGrid.hidden = true;
  resultSummary.textContent = "Mengambil data dari API...";
}

function showError(message) {
  loadingState.hidden = true;
  errorState.hidden = false;
  emptyState.hidden = true;
  productGrid.hidden = true;
  errorMessage.textContent = message || "Gagal terhubung ke server.";
  resultSummary.textContent = "Gagal memuat data.";
}

function showEmpty() {
  loadingState.hidden = true;
  errorState.hidden = true;
  emptyState.hidden = false;
  productGrid.hidden = true;
  resultSummary.textContent = "Menampilkan 0 produk";
}

function showProducts() {
  loadingState.hidden = true;
  errorState.hidden = true;
  emptyState.hidden = true;
  productGrid.hidden = false;
}

// --- Functions: Fetch Data ---
async function fetchProducts() {
  showLoading();
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const data = await response.json();
    productsData = data.products;

    // Sukses mengambil data, langsung render
    renderApp();
  } catch (error) {
    console.error("Fetch Error:", error);
    showError("Terjadi kesalahan saat mengambil data. Coba periksa koneksi internet kamu.");
  }
}

async function fetchCategories() {
  try {
    const response = await fetch(CATEGORIES_URL);
    if (!response.ok) return;
    const categories = await response.json();

    // Clear pilihan kecuali default 'all'
    categorySelect.innerHTML = '<option value="all">Semua kategori</option>';

    categories.forEach((cat) => {
      const option = document.createElement("option");
      // Menangani format API dummyjson (bisa array string atau array object)
      const slug = typeof cat === "object" ? cat.slug : cat;
      const name = typeof cat === "object" ? cat.name : cat;

      option.value = slug;
      option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.warn("Gagal memuat daftar kategori:", error);
  }
}

// --- Functions: Filter & Sort Engine ---
function getFilteredAndSortedProducts() {
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedCategory = categorySelect.value;
  const sortBy = sortSelect.value;

  // 1. Filter Search & Kategori
  let result = productsData.filter((product) => {
    const matchSearch =
      product.title.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword);

    const matchCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  // 2. Sorting
  if (sortBy === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating-desc") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "name-asc") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  return result;
}

// --- Functions: Render UI ---
function renderApp() {
  const filteredProducts = getFilteredAndSortedProducts();

  if (filteredProducts.length === 0) {
    showEmpty();
    return;
  }

  showProducts();
  resultSummary.textContent = `Menampilkan ${filteredProducts.length} produk`;

  // Kosongkan grid terlebih dahulu
  productGrid.innerHTML = "";

  // Render kartu produk
  filteredProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image-wrap">
        <img class="product-image" src="${product.thumbnail}" alt="${product.title}" loading="lazy" />
      </div>
      <div class="product-body">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.title}</h3>
        <div class="product-meta">
          <span class="product-price">$${product.price}</span>
          <span class="product-rating">⭐️ ${product.rating}</span>
        </div>
        <button class="outline btn-detail" data-id="${product.id}">Lihat Detail</button>
      </div>
    `;

    // Event listener untuk tombol detail
    const detailBtn = card.querySelector(".btn-detail");
    detailBtn.addEventListener("click", () => openProductDetail(product.id));

    productGrid.appendChild(card);
  });
}

// --- Functions: Modal Detail ---
function openProductDetail(id) {
  const product = productsData.find((p) => p.id === id);
  if (!product) return;

  dialogContent.innerHTML = `
    <div class="dialog-detail">
      <img class="dialog-image" src="${product.thumbnail}" alt="${product.title}" />
      <div class="dialog-copy">
        <span class="product-category">${product.category}</span>
        <h2>${product.title}</h2>
        <p>${product.description}</p>

        <div class="detail-list">
          <div class="detail-row">
            <span>Harga</span>
            <strong>$${product.price}</strong>
          </div>
          <div class="detail-row">
            <span>Rating</span>
            <strong>⭐️ ${product.rating} / 5</strong>
          </div>
          <div class="detail-row">
            <span>Stok</span>
            <strong>${product.stock} unit</strong>
          </div>
          <div class="detail-row">
            <span>Brand</span>
            <strong>${product.brand || "-"}</strong>
          </div>
        </div>
      </div>
    </div>
  `;

  productDialog.showModal();
}

function closeDialog() {
  productDialog.close();
}

// --- Event Listeners ---
searchInput.addEventListener("input", renderApp);
categorySelect.addEventListener("change", renderApp);
sortSelect.addEventListener("change", renderApp);

resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  categorySelect.value = "all";
  sortSelect.value = "default";
  renderApp();
});

reloadBtn.addEventListener("click", fetchProducts);
retryBtn.addEventListener("click", fetchProducts);
dialogClose.addEventListener("click", closeDialog);

// Close dialog jika area luar modal diklik (backdrop)
productDialog.addEventListener("click", (e) => {
  const dialogBounds = productDialog.getBoundingClientRect();
  if (
    e.clientX < dialogBounds.left ||
    e.clientX > dialogBounds.right ||
    e.clientY < dialogBounds.top ||
    e.clientY > dialogBounds.bottom
  ) {
    productDialog.close();
  }
});

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
  fetchProducts();
});