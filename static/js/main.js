// Global variables
let map
const markers = []
let businesses = []
let infoWindow
const visibleBusinesses = 6 // Number of businesses to show initially
let allBusinesses = [] // Store all businesses for load more functionality
let currentSortOption = "rating" // Default sort option
const currentPage = 1
const itemsPerPage = 6

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize mobile menu
  initMobileMenu()

  // Initialize hero search
  initHeroSearch()

  // Initialize category pills
  initCategoryPills()

  // Initialize search form if it exists
  const searchForm = document.getElementById("search-form")
  if (searchForm) {
    initSearchForm()
    loadCategories()
    loadLocations()
    loadBusinesses()
  }

  // Initialize load more button
  const loadMoreBtn = document.getElementById("load-more")
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreBusinesses)
  }

  // Initialize business navigation
  initBusinessNav()

  // Initialize gallery thumbnails
  initGalleryThumbnails()

  // Initialize newsletter form
  initNewsletterForm()

  // Initialize sort controls
  initSortControls()

  // Check for pre-selected filters from URL
  applyUrlFilters()
})

// Initialize map - This function is called by the Google Maps API
function initMap() {
  console.log("Google Maps API loaded successfully")
  // The actual map initialization will be handled by map-utils.js
  if (typeof initializeMap === "function") {
    initializeMap()
  } else {
    console.error("initializeMap function not found")
  }
}

// Initialize mobile menu
function initMobileMenu() {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
  const navLinks = document.querySelector(".nav-links")

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active")

      // Toggle between menu and close icons
      const icon = mobileMenuBtn.querySelector("i")
      if (icon.classList.contains("fa-bars")) {
        icon.classList.remove("fa-bars")
        icon.classList.add("fa-times")
      } else {
        icon.classList.remove("fa-times")
        icon.classList.add("fa-bars")
      }
    })
  }
}

// Initialize hero search
function initHeroSearch() {
  const heroSearchInput = document.getElementById("hero-search-input")
  const heroSearchBtn = document.getElementById("hero-search-btn")

  if (heroSearchInput && heroSearchBtn) {
    heroSearchBtn.addEventListener("click", () => {
      const searchValue = heroSearchInput.value.trim()
      if (searchValue) {
        window.location.href = `/?search=${encodeURIComponent(searchValue)}`
      }
    })

    heroSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const searchValue = heroSearchInput.value.trim()
        if (searchValue) {
          window.location.href = `/?search=${encodeURIComponent(searchValue)}`
        }
      }
    })
  }
}

// Initialize category pills
function initCategoryPills() {
  const categoryPills = document.querySelectorAll(".category-pill")

  categoryPills.forEach((pill) => {
    pill.addEventListener("click", function (e) {
      e.preventDefault()
      const category = this.dataset.category
      window.location.href = `/?category=${encodeURIComponent(category)}`
    })
  })
}

// Initialize search form event listeners
function initSearchForm() {
  const searchForm = document.getElementById("search-form")
  const searchInput = document.getElementById("search-input")
  const categorySelect = document.getElementById("category-select")
  const ratingSelect = document.getElementById("rating-select")
  const locationSelect = document.getElementById("location-select")

  // Add event listeners for form inputs
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault()
    filterBusinesses()
  })

  // Add event listeners for real-time filtering
  searchInput.addEventListener("input", debounce(filterBusinesses, 500))
  categorySelect.addEventListener("change", filterBusinesses)
  ratingSelect.addEventListener("change", filterBusinesses)
  locationSelect.addEventListener("change", filterBusinesses)
}

// Initialize sort controls
function initSortControls() {
  const sortSelect = document.getElementById("sort-select")
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      currentSortOption = this.value
      filterBusinesses()
    })
  }
}

// Apply filters from URL parameters
function applyUrlFilters() {
  const urlParams = new URLSearchParams(window.location.search)

  // Set search input if present in URL
  const searchParam = urlParams.get("search")
  const searchInput = document.getElementById("search-input")
  if (searchParam && searchInput) {
    searchInput.value = searchParam
  }

  // Set category if present in URL
  const categoryParam = urlParams.get("category")
  const categorySelect = document.getElementById("category-select")
  if (categoryParam && categorySelect) {
    // We'll set this after categories are loaded
    setTimeout(() => {
      if (categorySelect.querySelector(`option[value="${categoryParam}"]`)) {
        categorySelect.value = categoryParam
        filterBusinesses()
      }
    }, 500)
  }

  // Set location if present in URL
  const locationParam = urlParams.get("location")
  const locationSelect = document.getElementById("location-select")
  if (locationParam && locationSelect) {
    // We'll set this after locations are loaded
    setTimeout(() => {
      if (locationSelect.querySelector(`option[value="${locationParam}"]`)) {
        locationSelect.value = locationParam
        filterBusinesses()
      }
    }, 500)
  }

  // Set rating if present in URL
  const ratingParam = urlParams.get("rating")
  const ratingSelect = document.getElementById("rating-select")
  if (ratingParam && ratingSelect) {
    ratingSelect.value = ratingParam
  }
}

// Load categories for the filter dropdown
function loadCategories() {
  fetch("/api/categories")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((categories) => {
      const categorySelect = document.getElementById("category-select")
      if (!categorySelect) return

      // Clear existing options except the first one
      while (categorySelect.options.length > 1) {
        categorySelect.remove(1)
      }

      // Add "All Categories" option if it doesn't exist
      if (categorySelect.options.length === 0) {
        const allOption = document.createElement("option")
        allOption.value = ""
        allOption.textContent = "All Categories"
        categorySelect.appendChild(allOption)
      }

      // Add category options
      categories.forEach((category) => {
        const option = document.createElement("option")
        option.value = category
        option.textContent = category
        categorySelect.appendChild(option)
      })

      // Set selected category from URL if present
      const urlParams = new URLSearchParams(window.location.search)
      const categoryParam = urlParams.get("category")
      if (categoryParam) {
        // Find the matching option
        const matchingOption = Array.from(categorySelect.options).find(
          (option) => option.value.toLowerCase() === categoryParam.toLowerCase(),
        )

        if (matchingOption) {
          categorySelect.value = matchingOption.value
        }
      }
    })
    .catch((error) => {
      console.error("Error loading categories:", error)
    })
}

// Load locations for the filter dropdown
function loadLocations() {
  fetch("/api/locations")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((locations) => {
      const locationSelect = document.getElementById("location-select")
      if (!locationSelect) return

      // Clear existing options except the first one
      while (locationSelect.options.length > 1) {
        locationSelect.remove(1)
      }

      // Add "All Locations" option if it doesn't exist
      if (locationSelect.options.length === 0) {
        const allOption = document.createElement("option")
        allOption.value = ""
        allOption.textContent = "All Locations"
        locationSelect.appendChild(allOption)
      }

      // Add location options
      locations.forEach((location) => {
        const option = document.createElement("option")
        option.value = location
        option.textContent = location
        locationSelect.appendChild(option)
      })

      // Set selected location from URL if present
      const urlParams = new URLSearchParams(window.location.search)
      const locationParam = urlParams.get("location")
      if (locationParam) {
        // Find the matching option
        const matchingOption = Array.from(locationSelect.options).find(
          (option) => option.value.toLowerCase() === locationParam.toLowerCase(),
        )

        if (matchingOption) {
          locationSelect.value = matchingOption.value
        }
      }
    })
    .catch((error) => {
      console.error("Error loading locations:", error)
    })
}

// Load all businesses
function loadBusinesses() {
  showSkeletonLoader()

  fetch("/api/businesses")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch businesses")
      }
      return response.json()
    })
    .then((data) => {
      console.log(`Loaded ${data.length} businesses`)
      allBusinesses = data
      businesses = data.slice(0, visibleBusinesses)
      displayBusinesses(businesses)
      updateLoadMoreButton()

      // Apply URL filters if present
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.toString()) {
        filterBusinesses()
      }
    })
    .catch((error) => {
      console.error("Error loading businesses: ", error)
      showNoResults("Error loading businesses. Please try again later.")
    })
    .finally(() => {
      hideSkeletonLoader()
    })
}

// Load more businesses
function loadMoreBusinesses() {
  const currentCount = businesses.length
  const newBusinesses = allBusinesses.slice(currentCount, currentCount + visibleBusinesses)

  if (newBusinesses.length > 0) {
    businesses = [...businesses, ...newBusinesses]
    displayBusinesses(businesses)
    updateLoadMoreButton()
  }
}

// Update load more button visibility
function updateLoadMoreButton() {
  const loadMoreBtn = document.getElementById("load-more")
  if (loadMoreBtn) {
    if (businesses.length >= allBusinesses.length) {
      loadMoreBtn.style.display = "none"
    } else {
      loadMoreBtn.style.display = "inline-block"
    }
  }
}

// Filter businesses based on search criteria
function filterBusinesses() {
  showSkeletonLoader()

  const searchInput = document.getElementById("search-input")
  const categorySelect = document.getElementById("category-select")
  const ratingSelect = document.getElementById("rating-select")
  const locationSelect = document.getElementById("location-select")

  // Get values, handling null elements
  const searchValue = searchInput ? searchInput.value.trim() : ""
  const categoryValue = categorySelect ? categorySelect.value : ""
  const ratingValue = ratingSelect ? ratingSelect.value : ""
  const locationValue = locationSelect ? locationSelect.value : ""

  // Build query parameters
  const params = new URLSearchParams()
  if (searchValue) params.append("search", searchValue)
  if (categoryValue) params.append("category", categoryValue)
  if (ratingValue) params.append("rating", ratingValue)
  if (locationValue) params.append("location", locationValue)
  params.append("sort", currentSortOption)

  // Update URL with search parameters without reloading the page
  const newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "")
  window.history.pushState({ path: newUrl }, "", newUrl)

  // Fetch filtered businesses
  fetch(`/api/businesses?${params.toString()}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      console.log(`Filtered businesses: ${data.length} results`)
      allBusinesses = data
      businesses = data.slice(0, visibleBusinesses)
      displayBusinesses(businesses)

      updateLoadMoreButton()

      // Update filter tags
      updateFilterTags(searchValue, categoryValue, ratingValue, locationValue)
    })
    .catch((error) => {
      console.error("Error filtering businesses:", error)
      showNoResults("Error filtering businesses. Please try again later.")
    })
    .finally(() => {
      hideSkeletonLoader()
    })
}

// Update filter tags display
function updateFilterTags(search, category, rating, location) {
  const filterTagsContainer = document.getElementById("filter-tags")
  if (!filterTagsContainer) return

  filterTagsContainer.innerHTML = ""

  if (search) {
    addFilterTag(filterTagsContainer, `Search: ${search}`, () => {
      document.getElementById("search-input").value = ""
      filterBusinesses()
    })
  }

  if (category) {
    addFilterTag(filterTagsContainer, `Category: ${category}`, () => {
      document.getElementById("category-select").value = ""
      filterBusinesses()
    })
  }

  if (rating) {
    addFilterTag(filterTagsContainer, `Rating: ${rating}+`, () => {
      document.getElementById("rating-select").value = ""
      filterBusinesses()
    })
  }

  if (location) {
    addFilterTag(filterTagsContainer, `Location: ${location}`, () => {
      document.getElementById("location-select").value = ""
      filterBusinesses()
    })
  }

  // Add clear all button if there are filters
  if (search || category || rating || location) {
    const clearAllBtn = document.createElement("button")
    clearAllBtn.className = "btn btn-sm btn-outline"
    clearAllBtn.textContent = "Clear All"
    clearAllBtn.addEventListener("click", resetFilters)
    filterTagsContainer.appendChild(clearAllBtn)
  }
}

// Add a single filter tag
function addFilterTag(container, text, removeCallback) {
  const tag = document.createElement("div")
  tag.className = "filter-tag"
  tag.innerHTML = `${text} <i class="fas fa-times"></i>`

  tag.querySelector("i").addEventListener("click", removeCallback)

  container.appendChild(tag)
}

// Display businesses in the grid
function displayBusinesses(businessesToDisplay) {
  const businessesGrid = document.getElementById("businesses-grid")

  if (!businessesGrid) return

  // If we're displaying the first page, clear the grid
  if (businessesToDisplay === businesses) {
    businessesGrid.innerHTML = ""
  }

  if (businessesToDisplay.length === 0) {
    showNoResults("No businesses found matching your criteria.")
    return
  }

  // Create business cards
  businessesToDisplay.forEach((business) => {
    const businessCard = createBusinessCard(business)
    businessesGrid.appendChild(businessCard)
  })
}

// Create a business card element
function createBusinessCard(business) {
  const card = document.createElement("div")
  card.className = "business-card"

  const stars = generateStarRating(business.rating)
  const priceRange = business.price_range || "₹₹"

  card.innerHTML = `
    <div class="card-image">
      <img src="${business.image}" alt="${business.name}">
      <div class="card-category">${business.category}</div>
    </div>
    <div class="card-content">
      <h3 class="card-title">${business.name}</h3>
      <div class="card-location">
        <i class="fas fa-map-marker-alt"></i>
        <span>${business.location}</span>
      </div>
      <p class="card-description">${business.description.substring(0, 120)}${business.description.length > 120 ? "..." : ""}</p>
      <div class="card-footer">
        <div class="card-rating">
          <div class="stars">${stars}</div>
          <span>${business.rating}</span>
        </div>
        <div class="card-price">${priceRange}</div>
      </div>
      <a href="/business/${business.id}" class="btn btn-outline-primary btn-block" style="margin-top: 1rem;">View Details</a>
    </div>
  `

  return card
}

// Generate star rating HTML
function generateStarRating(rating) {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

  let starsHTML = ""

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>'
  }

  // Half star
  if (halfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>'
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>'
  }

  return starsHTML
}

// Show skeleton loader
function showSkeletonLoader() {
  const businessesGrid = document.getElementById("businesses-grid")

  if (!businessesGrid) return

  businessesGrid.innerHTML = `
    <div class="skeleton-loader">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>
  `
}

// Hide skeleton loader
function hideSkeletonLoader() {
  // Loader will be replaced when displaying businesses
}

// Show no results message
function showNoResults(message) {
  const businessesGrid = document.getElementById("businesses-grid")

  if (!businessesGrid) return

  businessesGrid.innerHTML = `
    <div class="no-results">
      <i class="fas fa-search" style="font-size: 3rem; color: var(--light-gray); margin-bottom: 1rem;"></i>
      <h3>${message}</h3>
      <p>Try adjusting your search criteria or explore other categories.</p>
      <button class="btn btn-primary" onclick="resetFilters()">Reset Filters</button>
    </div>
  `
}

// Reset all filters
function resetFilters() {
  const searchInput = document.getElementById("search-input")
  const categorySelect = document.getElementById("category-select")
  const ratingSelect = document.getElementById("rating-select")
  const locationSelect = document.getElementById("location-select")

  if (searchInput) searchInput.value = ""
  if (categorySelect) categorySelect.value = ""
  if (ratingSelect) ratingSelect.value = ""
  if (locationSelect) locationSelect.value = ""

  // Reset URL
  window.history.pushState({}, "", window.location.pathname)

  // Load all businesses again
  loadBusinesses()
}

// Initialize business navigation
function initBusinessNav() {
  const navLinks = document.querySelectorAll(".business-nav-links a")

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Remove active class from all links
      navLinks.forEach((l) => l.classList.remove("active"))

      // Add active class to clicked link
      this.classList.add("active")

      // Scroll to section
      const targetId = this.getAttribute("href").substring(1)
      const targetSection = document.getElementById(targetId)

      if (targetSection) {
        const headerHeight = 120 // Header + nav height
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })

  // Highlight active section on scroll
  window.addEventListener(
    "scroll",
    debounce(() => {
      const sections = document.querySelectorAll(".business-section")
      const headerHeight = 120

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top
        const sectionId = section.getAttribute("id")
        const navLink = document.querySelector(`.business-nav-links a[href="#${sectionId}"]`)

        if (sectionTop < headerHeight + 100 && sectionTop >= 0) {
          navLinks.forEach((l) => l.classList.remove("active"))
          if (navLink) navLink.classList.add("active")
        }
      })
    }, 100),
  )
}

// Initialize gallery thumbnails
function initGalleryThumbnails() {
  const thumbnails = document.querySelectorAll(".gallery-thumbnails img")
  const mainImage = document.querySelector(".gallery-main img")

  if (!thumbnails.length || !mainImage) return

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      // Update main image
      mainImage.src = this.src

      // Update active thumbnail
      thumbnails.forEach((t) => t.classList.remove("active"))
      this.classList.add("active")
    })
  })
}

// Initialize newsletter form
function initNewsletterForm() {
  const newsletterForm = document.querySelector(".newsletter-form")

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const emailInput = this.querySelector('input[type="email"]')
      const email = emailInput.value.trim()

      if (email) {
        // In a real app, you would send this to your backend
        alert(`Thank you for subscribing with ${email}! You'll receive our newsletter soon.`)
        emailInput.value = ""
      }
    })
  }
}

// Filter by category (used by category cards)
function filterByCategory(category) {
  const categorySelect = document.getElementById("category-select")
  if (categorySelect) {
    categorySelect.value = category
    filterBusinesses()

    // Scroll to businesses section
    const businessesSection = document.getElementById("explore")
    if (businessesSection) {
      businessesSection.scrollIntoView({ behavior: "smooth" })
    }
  }
}

// Filter by location (used by footer links)
function filterByLocation(location) {
  const locationSelect = document.getElementById("location-select")
  if (locationSelect) {
    locationSelect.value = location
    filterBusinesses()

    // Scroll to businesses section
    const businessesSection = document.getElementById("explore")
    if (businessesSection) {
      businessesSection.scrollIntoView({ behavior: "smooth" })
    }
  }
}

// Debounce function to limit how often a function is called
function debounce(func, delay) {
  let timeout
  return function () {
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), delay)
  }
}
