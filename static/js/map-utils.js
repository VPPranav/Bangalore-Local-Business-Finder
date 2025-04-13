// Map utilities for Bangalore Local

// Initialize the map when the Google Maps API is loaded
function initializeMap() {
    console.log("Map utils: initializing map...")
    const mapElement = document.getElementById("map")
  
    if (!mapElement) {
      console.error("Map element not found")
      return
    }
  
    // Default center (Bangalore)
    const defaultCenter = { lat: 12.9716, lng: 77.5946 }
  
    // Create the map
    const map = new google.maps.Map(mapElement, {
      zoom: 12,
      center: defaultCenter,
      styles: [
        {
          featureType: "administrative",
          elementType: "labels.text.fill",
          stylers: [{ color: "#444444" }],
        },
        {
          featureType: "landscape",
          elementType: "all",
          stylers: [{ color: "#f2f2f2" }],
        },
        {
          featureType: "poi",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road",
          elementType: "all",
          stylers: [{ saturation: -100 }, { lightness: 45 }],
        },
        {
          featureType: "road.highway",
          elementType: "all",
          stylers: [{ visibility: "simplified" }],
        },
        {
          featureType: "road.arterial",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "water",
          elementType: "all",
          stylers: [{ color: "#4361ee" }, { visibility: "on" }],
        },
      ],
    })
  
    // Create info window
    const infoWindow = new google.maps.InfoWindow()
  
    // Load businesses for the map
    loadBusinessesForMap(map, infoWindow)
  
    // Add center on me button
    addCenterOnMeButton(map)
  }
  
  // Load businesses for the map
  function loadBusinessesForMap(map, infoWindow) {
    console.log("Loading businesses for map...")
  
    // Show loading indicator in map sidebar
    const mapList = document.getElementById("map-list")
    if (mapList) {
      mapList.innerHTML =
        '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading nearby places...</div>'
    }
  
    fetch("/api/businesses")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log(`Loaded ${data.length} businesses for map`)
  
        if (!map) {
          console.error("Map not initialized")
          return
        }
  
        const markers = addMarkersToMap(map, data, infoWindow)
        populateMapList(map, data, markers, infoWindow)
      })
      .catch((error) => {
        console.error("Error loading businesses for map:", error)
  
        // Show error in map sidebar
        if (mapList) {
          mapList.innerHTML =
            '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Error loading businesses. Please try again later.</div>'
        }
      })
  }
  
  // Add markers to the map
  function addMarkersToMap(map, businesses, infoWindow) {
    console.log(`Adding ${businesses.length} markers to map`)
    const bounds = new google.maps.LatLngBounds()
    const markers = []
  
    businesses.forEach((business) => {
      // Check if business has lat/lng properties
      if (!business.lat && !business.lng) {
        // For testing, generate random coordinates near Bangalore
        business.lat = 12.9716 + (Math.random() - 0.5) * 0.1
        business.lng = 77.5946 + (Math.random() - 0.5) * 0.1
      }
  
      const position = {
        lat: Number.parseFloat(business.lat),
        lng: Number.parseFloat(business.lng),
      }
  
      const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: business.name,
        animation: google.maps.Animation.DROP,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#4361ee",
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 10,
        },
      })
  
      // Create info window content
      const content = `
              <div class="info-window">
                  <h3>${business.name}</h3>
                  <p>${business.category} · ${business.location}</p>
                  <div class="info-rating">
                      ${generateStarRating(business.rating)} ${business.rating}
                  </div>
                  <a href="/business/${business.id}" class="info-link">View Details</a>
              </div>
          `
  
      // Add click event to marker
      marker.addListener("click", () => {
        infoWindow.close()
        infoWindow.setContent(content)
        infoWindow.open(map, marker)
      })
  
      markers.push({ marker, business })
      bounds.extend(position)
    })
  
    // Adjust map bounds to fit all markers
    if (markers.length > 0) {
      map.fitBounds(bounds)
  
      // If only one marker, zoom out a bit
      if (markers.length === 1) {
        map.setZoom(15)
      }
    }
  
    return markers
  }
  
  // Populate map sidebar list
  function populateMapList(map, businesses, markers, infoWindow) {
    const mapList = document.getElementById("map-list")
  
    if (!mapList) return
  
    // Clear existing list
    mapList.innerHTML = ""
  
    if (businesses.length === 0) {
      mapList.innerHTML = "<p>No businesses found in this area.</p>"
      return
    }
  
    // Create list items
    businesses.forEach((business, index) => {
      const listItem = document.createElement("div")
      listItem.className = "map-item"
      listItem.innerHTML = `
              <h4>${business.name}</h4>
              <div class="map-item-meta">
                  <span>${business.category}</span>
                  <span>${business.rating} <i class="fas fa-star" style="color: #ffc107;"></i></span>
              </div>
          `
  
      // Add click event to highlight marker
      listItem.addEventListener("click", () => {
        // Center map on marker
        map.panTo({ lat: Number.parseFloat(business.lat), lng: Number.parseFloat(business.lng) })
        map.setZoom(16)
  
        // Open info window
        const marker = markers[index].marker
        if (marker) {
          const content = `
                      <div class="info-window">
                          <h3>${business.name}</h3>
                          <p>${business.category} · ${business.location}</p>
                          <div class="info-rating">
                              ${generateStarRating(business.rating)} ${business.rating}
                          </div>
                          <a href="/business/${business.id}" class="info-link">View Details</a>
                      </div>
                  `
          infoWindow.setContent(content)
          infoWindow.open(map, marker)
        }
      })
  
      mapList.appendChild(listItem)
    })
  }
  
  // Add center on me button to the map
  function addCenterOnMeButton(map) {
    const centerControlDiv = document.createElement("div")
    centerControlDiv.className = "center-control"
    centerControlDiv.title = "Center map on your location"
  
    const controlButton = document.createElement("button")
    controlButton.className = "center-control-button"
    controlButton.innerHTML = '<i class="fas fa-location-arrow"></i>'
    centerControlDiv.appendChild(controlButton)
  
    // Setup the click event listener
    controlButton.addEventListener("click", () => {
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            map.setCenter(userLocation)
            map.setZoom(14)
  
            // Add a marker for user's location
            new google.maps.Marker({
              position: userLocation,
              map: map,
              title: "Your Location",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
                scale: 8,
              },
            })
          },
          (error) => {
            console.error("Error getting user location:", error)
            alert("Unable to get your location. Please check your browser settings.")
          },
        )
      } else {
        alert("Geolocation is not supported by this browser.")
      }
    })
  
    // Add the control to the map
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv)
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
  