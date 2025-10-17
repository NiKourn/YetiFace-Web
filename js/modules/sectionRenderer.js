/**
 * Section Renderer Module
 * Handles the creation and rendering of content sections and items
 */

// Simple intersection observer for lazy loading
const lazyLoadObserver = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const img = entry.target
				console.log('🔄 Lazy loading image:', img.dataset.src)
				img.src = img.dataset.src
				delete img.dataset.src
				img.classList.remove('lazy-loading')
				img.classList.add('lazy-loaded')
				lazyLoadObserver.unobserve(img)
			}
		})
	},
	{ rootMargin: '100px' } // Increased margin for earlier loading
)

// Global counter for above-fold items
let globalItemIndex = 0

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

	// Reset global counter
	globalItemIndex = 0

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
	// Add section title
	const titleElement = createSectionTitle(section.title)
	const slug = slugify(section.title || '')

	sectionElement.className = 'section'
	sectionElement.classList.add(slug + '-section') // Add slug as class for styling
	sectionElement.appendChild(titleElement)

	// Create items container

	const itemsContainer = createItemsContainer(section.items, slug)
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
function createItemsContainer(items, sectionSlug = '') {
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
		// First 2 items globally load immediately (above fold)
		const isAboveFold = globalItemIndex < 2
		globalItemIndex++
		const itemElement = createItemElement(item, isAboveFold, sectionSlug)
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
 * @param {boolean} [isAboveFold=false] - Whether this item is above the fold
 * @returns {HTMLDivElement} The complete item element
 */
function createItemElement(item, isAboveFold = false, sectionSlug = '') {
	// Create item container
	const itemElement = document.createElement('div')
	itemElement.className = 'item'
	if (sectionSlug) {
		// Add a slug-based class, e.g., about-yetiface
		itemElement.classList.add(sectionSlug)
		// Helpful data attribute for targeting/debugging
		itemElement.setAttribute('data-section', sectionSlug)
	}

	// Add image if provided
	if (item.image) {
		const imageElement = createItemImage(item.image, item.heading, isAboveFold)
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
function createItemImage(imageUrl, altText = '', isAboveFold = false) {
	const imageElement = document.createElement('img')
	imageElement.alt = altText || 'Item image'
	imageElement.className = 'item-image'

	if (isAboveFold) {
		// Load immediately for above-fold images
		imageElement.src = imageUrl
	} else {
		// Store URL for lazy loading and add loading class
		imageElement.dataset.src = imageUrl
		imageElement.classList.add('lazy-loading')
		// Start observing for lazy loading
		lazyLoadObserver.observe(imageElement)
	}

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
		if (Array.isArray(item.text)) {
			item.text.forEach((line) => {
				const p = document.createElement('p')
				p.className = 'item-text'
				p.textContent = String(line)
				contentElement.appendChild(p)
			})
		} else {
			const textElement = document.createElement('p')
			textElement.className = 'item-text'
			appendMultilineText(textElement, item.text)
			contentElement.appendChild(textElement)
		}
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
 * Appends multi-line text into an element, converting \n to <br> safely (no innerHTML)
 * @param {HTMLElement} el
 * @param {string} text
 */
function appendMultilineText(el, text) {
	const parts = String(text).split('\n')
	parts.forEach((part, i) => {
		if (i > 0) el.appendChild(document.createElement('br'))
		el.appendChild(document.createTextNode(part))
	})
}

import { tryOpenSteamFromWebUrl } from './steamUtils.js'

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
	// Use a dedicated FA icon element to avoid changing the button text font
	steamButton.className = 'steam-button has-fa-icon'

	const iconEl = document.createElement('i')
	iconEl.className = 'fab fa-steam'
	iconEl.setAttribute('aria-hidden', 'true')

	const textEl = document.createElement('span')
	textEl.textContent = 'Open in Steam'

	steamButton.appendChild(iconEl)
	steamButton.appendChild(textEl)
	steamButton.setAttribute('aria-label', `View ${gameName || 'this game'} on Steam`)

	// Smart click handler with quick fallback
	steamButton.addEventListener('click', (event) => {
		event.preventDefault() // Prevent default link behavior
		tryOpenSteamFromWebUrl(steamUrl)
	})

	return steamButton
}

// Steam fallback logic moved to steamUtils.js for reuse

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
 * Convert a title to a CSS-friendly slug, e.g., "About Yetiface" -> "about-yetiface"
 * - lowercases
 * - removes diacritics
 * - replaces any non-alphanumeric with single hyphen
 * - trims hyphens
 * @param {string} str
 * @returns {string}
 */
function slugify(str) {
	try {
		return String(str)
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	} catch {
		return String(str || '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	}
}
