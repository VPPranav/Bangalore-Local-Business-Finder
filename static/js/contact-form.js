document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm")
    const formStatus = document.getElementById("form-status")
  
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault()
  
        // Clear previous status messages
        formStatus.textContent = ""
        formStatus.className = "form-status"
        formStatus.style.display = "none"
  
        // Get form data
        const formData = new FormData(contactForm)
  
        // Validate required fields
        const name = formData.get("name")
        const email = formData.get("email")
        const message = formData.get("message")
  
        if (!name || !email || !message) {
          formStatus.textContent = "Please fill all required fields"
          formStatus.className = "form-status error"
          formStatus.style.display = "block"
          return
        }
  
        // Validate email format
        if (!validateEmail(email)) {
          formStatus.textContent = "Please enter a valid email address"
          formStatus.className = "form-status error"
          formStatus.style.display = "block"
          return
        }
  
        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]')
        const originalButtonText = submitButton.textContent
        submitButton.textContent = "Sending..."
        submitButton.disabled = true
  
        // Send form data to server
        fetch("/submit-contact", {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`)
            }
            return response.json()
          })
          .then((data) => {
            // Reset button state
            submitButton.textContent = originalButtonText
            submitButton.disabled = false
  
            if (data.success) {
              // Show success message
              formStatus.textContent = data.message
              formStatus.className = "form-status success"
              formStatus.style.display = "block"
  
              // Reset form
              contactForm.reset()
            } else {
              // Show error message
              formStatus.textContent = data.message
              formStatus.className = "form-status error"
              formStatus.style.display = "block"
              console.error("Form submission error:", data.message)
            }
          })
          .catch((error) => {
            // Reset button state
            submitButton.textContent = originalButtonText
            submitButton.disabled = false
  
            // Show error message
            formStatus.textContent = "An error occurred. Please try again later."
            formStatus.className = "form-status error"
            formStatus.style.display = "block"
            console.error("Error:", error)
          })
      })
    }
  
    // Email validation function
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(String(email).toLowerCase())
    }
  })