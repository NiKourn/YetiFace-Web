/**
 * Section Renderer Module
 * Handles the creation and rendering of content sections and items
 */

/**
 * Renders all content sections in the main content area
 * @param {Array} sections - Array of section objects from JSON data
 * @param {string} sections[].title - Section title
 * @param {Array} sections[].items - Array of items in the section
 */
export function renderSections(sections) {
	// Get the main content container
	const mainContent = document.getElementById('main-content')
	if (!mainContent) {
		console.error('❌ Main content element not found')
		return
	}

	// Clear any existing content
	mainContent.innerHTML = ''

	// Validate sections data
	if (!Array.isArray(sections) || sections.length === 0) {
		// mainContent.innerHTML = '<p class="no-content">No content available.</p>'
		return
	}

	// Render each section
	sections.forEach((section, index) => {
		const sectionElement = createSectionElement(section)
		mainContent.appendChild(sectionElement)
	})
}

/**
 * Creates a single section element with title and items
 * @param {Object} section - Section data object
 * @param {string} section.title - Section title
 * @param {Array} section.items - Array of items in the section
 * @returns {HTMLElement} The complete section element
 */
function createSectionElement(section) {
	// Create section container
	const sectionElement = document.createElement('section')
	sectionElement.className = 'section'

	// Add section title
	const titleElement = createSectionTitle(section.title)
	sectionElement.appendChild(titleElement)

	// Create items container
	const itemsContainer = createItemsContainer(section.items)
	sectionElement.appendChild(itemsContainer)

	return sectionElement
}

/**
 * Creates the section title element
 * @param {string} title - The section title
 * @returns {HTMLHeadingElement} The title element
 */
function createSectionTitle(title) {
	const titleElement = document.createElement('h2')
	titleElement.className = 'section-title'
	titleElement.textContent = title
	return titleElement
}

/**
 * Creates the items container with all items for a section
 * @param {Array} items - Array of item objects
 * @returns {HTMLDivElement} The items container element
 */
function createItemsContainer(items) {
	// Create the grid container for items
	const itemsContainer = document.createElement('div')
	itemsContainer.className = 'items'

	// Validate items data
	if (!Array.isArray(items) || items.length === 0) {
		const noItemsMsg = document.createElement('p')
		noItemsMsg.textContent = 'No items available in this section.'
		noItemsMsg.className = 'no-items'
		itemsContainer.appendChild(noItemsMsg)
		return itemsContainer
	}

	// Create each item element
	items.forEach((item, index) => {
		const itemElement = createItemElement(item)
		itemsContainer.appendChild(itemElement)
	})

	return itemsContainer
}

/**
 * Creates a single item element with image and content
 * @param {Object} item - Item data object
 * @param {string} [item.image] - Optional image URL
 * @param {string} [item.heading] - Optional item heading
 * @param {string} [item.text] - Optional item text content
 * @returns {HTMLDivElement} The complete item element
 */
function createItemElement(item) {
	// Create item container
	const itemElement = document.createElement('div')
	itemElement.className = 'item'

	// Add image if provided
	if (item.image) {
		const imageElement = createItemImage(item.image, item.heading)
		itemElement.appendChild(imageElement)
	}

	// Create content container
	const contentElement = createItemContent(item)
	itemElement.appendChild(contentElement)

	// Add click handler for future interactivity (optional)
	addItemClickHandler(itemElement, item)

	return itemElement
}

/**
 * Creates the item image element with lazy loading
 * @param {string} imageUrl - URL of the image
 * @param {string} [altText] - Alt text for the image
 * @returns {HTMLImageElement} The image element
 */
function createItemImage(imageUrl, altText = '') {
	const imageElement = document.createElement('img')
	imageElement.src = imageUrl
	imageElement.alt = altText || 'Item image'
	imageElement.className = 'item-image'
	imageElement.loading = 'lazy' // Native lazy loading

	// Add intersection observer for better lazy loading support
	addLazyLoadingObserver(imageElement)

	// Handle image loading errors
	imageElement.onerror = () => {
		imageElement.style.display = 'none'
	}

	// Handle successful image load
	imageElement.onload = () => {
		imageElement.classList.add('loaded')
	}

	return imageElement
}
/**
 * Creates the item content container with heading and text
 * @param {Object} item - Item data object
 * @param {string} [item.heading] - Optional item heading
 * @param {string} [item.text] - Optional item text content
 * @param {string} [item.steamUrl] - Optional Steam page URL
 * @returns {HTMLDivElement} The content container element
 */
function createItemContent(item) {
	// Create content container
	const contentElement = document.createElement('div')
	contentElement.className = 'item-content'

	// Add heading if provided
	if (item.heading) {
		const headingElement = document.createElement('h3')
		headingElement.className = 'item-heading'
		headingElement.textContent = item.heading
		contentElement.appendChild(headingElement)
	}

	// Add text content if provided
	if (item.text) {
		const textElement = document.createElement('p')
		textElement.className = 'item-text'
		textElement.textContent = item.text
		contentElement.appendChild(textElement)
	}

	// Add Steam link if provided
	if (item.steamUrl) {
		const steamButton = createSteamButton(item.steamUrl, item.heading)
		contentElement.appendChild(steamButton)
	}

	// If no content provided, show placeholder
	if (!item.heading && !item.text) {
		const placeholderElement = document.createElement('p')
		placeholderElement.className = 'item-text placeholder'
		placeholderElement.textContent = ''
		contentElement.appendChild(placeholderElement)
	}

	return contentElement
}

/**
 * Creates a simple Steam button with smart fallback
 * @param {string} steamUrl - The Steam page URL
 * @param {string} [gameName] - Optional game name for accessibility
 * @returns {HTMLAnchorElement} The Steam button element
 */
function createSteamButton(steamUrl, gameName = '') {
	const steamButton = document.createElement('a')
	steamButton.href = steamUrl // Fallback for right-click
	steamButton.target = '_blank'
	steamButton.rel = 'noopener noreferrer'
	steamButton.className = 'steam-button'
	steamButton.textContent = 'Open in Steam'
	steamButton.setAttribute('aria-label', `View ${gameName || 'this game'} on Steam`)

	// Smart click handler with quick fallback
	steamButton.addEventListener('click', (event) => {
		event.preventDefault() // Prevent default link behavior

		// Extract app ID and try Steam protocol
		const appIdMatch = steamUrl.match(/\/app\/(\d+)/)

		if (appIdMatch && appIdMatch[1]) {
			const appId = appIdMatch[1]
			const steamAppUrl = `steam://store/${appId}`

			// Check if Steam is available before trying
			checkSteamAvailability(steamAppUrl, steamUrl, gameName)
		} else {
			// If can't extract app ID, open website directly
			window.open(steamUrl, '_blank', 'noopener,noreferrer')
		}
	})

	return steamButton
}

/**
 * Checks if Steam is available and opens appropriate link
 * @param {string} steamAppUrl - The steam:// protocol URL
 * @param {string} steamUrl - The fallback website URL
 * @param {string} [gameName] - Optional game name for logging
 */
function checkSteamAvailability(steamAppUrl, steamUrl, gameName = '') {
	// 🧪 TEST MODE: Set to true to simulate no Steam installed
	const TEST_NO_STEAM = false // Change to true for testing

	if (TEST_NO_STEAM) {
		setTimeout(() => {
			window.open(steamUrl, '_blank', 'noopener,noreferrer')
		}, 50)
		return
	}

	// Create a hidden iframe to test Steam protocol
	const testFrame = document.createElement('iframe')
	testFrame.style.display = 'none'
	testFrame.style.width = '1px'
	testFrame.style.height = '1px'

	// Set up before adding to DOM
	let steamDetected = false
	let timeoutId

	// Function to clean up
	const cleanup = () => {
		clearTimeout(timeoutId)
		try {
			if (testFrame.parentNode) {
				document.body.removeChild(testFrame)
			}
		} catch (e) {
			// Frame already removed
		}
	}

	// Listen for focus/blur events to detect Steam opening
	const handleFocusChange = () => {
		// If we lose focus quickly, Steam likely opened
		steamDetected = true
		cleanup()
	}

	// Listen for page visibility changes
	const handleVisibilityChange = () => {
		if (document.hidden && !steamDetected) {
			steamDetected = true
			cleanup()
		}
	}

	// Set up detection
	window.addEventListener('blur', handleFocusChange, { once: true })
	document.addEventListener('visibilitychange', handleVisibilityChange)

	// Fallback timeout - much shorter
	timeoutId = setTimeout(() => {
		if (!steamDetected) {
			window.open(steamUrl, '_blank', 'noopener,noreferrer')
		}

		// Clean up listeners
		window.removeEventListener('blur', handleFocusChange)
		document.removeEventListener('visibilitychange', handleVisibilityChange)
		cleanup()
	}, 100) // Very short timeout - 100ms

	// Add iframe and try Steam
	document.body.appendChild(testFrame)

	// Small delay to let event listeners set up
	setTimeout(() => {
		if (!steamDetected) {
			testFrame.src = steamAppUrl
		}
	}, 10)
}

/**
 * Adds click handler to item for future interactivity
 * @param {HTMLDivElement} itemElement - The item element
 * @param {Object} item - The item data object
 */
function addItemClickHandler(itemElement, item) {
	// Add click handler for future features (modal, navigation, etc.)
	itemElement.addEventListener('click', () => {
		// Future: Could open a modal, navigate to detail page, etc.
		// For now, just log the click
	})

	// Add keyboard accessibility
	itemElement.setAttribute('tabindex', '0')
	itemElement.setAttribute('role', 'button')
	itemElement.setAttribute('aria-label', `View details for ${item.heading || 'item'}`)

	// Handle keyboard activation
	itemElement.addEventListener('keypress', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			itemElement.click()
		}
	})
}

/**
 * Adds lazy loading observer for better image loading performance
 * @param {HTMLImageElement} img - The image element to observe
 */
function addLazyLoadingObserver(img) {
	// Check if Intersection Observer is supported
	if ('IntersectionObserver' in window) {
		const imageObserver = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const image = entry.target
						// Image is already loaded via src, just add loaded class for animations
						image.classList.add('lazy-loaded')
						observer.unobserve(image)
					}
				})
			},
			{
				// Start loading when image is 50px away from viewport
				rootMargin: '50px',
			}
		)

		imageObserver.observe(img)
	} else {
		// Fallback for older browsers
		img.classList.add('lazy-loaded')
	}
}
