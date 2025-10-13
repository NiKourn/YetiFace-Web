/**
 * Header Renderer Module
 * Handles the creation and rendering of the site header
 */

import { setupThemeToggle } from './themeManager.js'
import { tryOpenSteamFromWebUrl } from './steamUtils.js'

/**
 * Renders the site header with logo, title, subtitle, and theme toggle
 * @param {Object} header - Header data from JSON containing title, subtitle, and logo
 * @param {string} header.title - The site title
 * @param {string} [header.subtitle] - Optional subtitle
 * @param {string} [header.logo] - Optional logo URL
 */
export function renderHeader(header) {
	// Get the header container element
	const headerEl = document.getElementById('header')
	if (!headerEl) {
		console.error('❌ Header element not found')
		return
	}

	// Clear any existing header content
	headerEl.innerHTML = ''

	// Create the main content container for logo, title, and subtitle
	const logoDescriptionContainer = createLogoDescriptionContainer()
	headerEl.appendChild(logoDescriptionContainer)

	// Add logo if provided
	if (header.logo) {
		const logoContainer = createLogoContainer(header.logo)
		logoDescriptionContainer.appendChild(logoContainer)
	}

	// Add the site title (always required)
	const titleElement = createTitleElement(header.title)
	logoDescriptionContainer.appendChild(titleElement)

	// Add subtitle if provided
	if (header.subtitle) {
		const subtitleElement = createSubtitleElement(header.subtitle)
		logoDescriptionContainer.appendChild(subtitleElement)
	}

	// Create header right section with theme toggle and social links
	const headerRight = createHeaderRightSection(header.socialLinks)
	headerEl.appendChild(headerRight)
}

/**
 * Creates the header right section with theme toggle and social links
 * @param {Array} [socialLinks] - Array of social link objects
 * @returns {HTMLDivElement} The header right section
 */
function createHeaderRightSection(socialLinks = []) {
	const headerRight = document.createElement('div')
	headerRight.className = 'header-right'

	// Create and add the theme toggle button
	const themeToggleButton = createThemeToggleButton()
	headerRight.appendChild(themeToggleButton)

	// Add social links if provided
	if (socialLinks && socialLinks.length > 0) {
		const socialLinksContainer = createSocialLinksContainer(socialLinks)
		headerRight.appendChild(socialLinksContainer)
	}

	// Initialize theme toggle functionality
	setupThemeToggle(themeToggleButton)

	return headerRight
}

/**
 * Creates the social links container
 * @param {Array} socialLinks - Array of social link objects
 * @returns {HTMLDivElement} The social links container
 */
function createSocialLinksContainer(socialLinks) {
	const container = document.createElement('div')
	container.className = 'social-links'

	socialLinks.forEach((link) => {
		if (!link.url) return
		const socialLink = createSocialLink(link)
		container.appendChild(socialLink)
	})

	return container
}

/**
 * Creates a single social link element
 * @param {Object} link - Social link object
 * @param {string} link.name - Display name for accessibility
 * @param {string} link.url - URL to link to
 * @param {string} link.icon - Font Awesome class name (e.g., "fab fa-twitter")
 * @returns {HTMLAnchorElement} The social link element
 */
function createSocialLink(link) {
	const socialLink = document.createElement('a')
	socialLink.href = link.url
	// Open external links in new tab, keep hash/internal links in same tab
	const isHashLink = typeof link.url === 'string' && link.url.startsWith('#')
	if (!isHashLink) {
		socialLink.target = '_blank'
		socialLink.rel = 'noopener noreferrer'
	}
	socialLink.className = 'social-link'
	socialLink.setAttribute('aria-label', `Follow Yetiface Games on ${link.name}`)
	socialLink.setAttribute('title', link.name)

	// Create Font Awesome icon
	const icon = document.createElement('i')
	icon.className = link.icon
	socialLink.appendChild(icon)

	// Special handling for Steam: try to open steam:// protocol and fall back to web
	const isSteam = typeof link.name === 'string' && link.name.toLowerCase() === 'steam'
	if (isSteam && typeof link.url === 'string') {
		socialLink.addEventListener('click', (e) => {
			e.preventDefault()
			tryOpenSteamFromWebUrl(link.url)
		})
		socialLink.setAttribute('aria-label', 'Open on Steam')
	}

	return socialLink
}

// Steam open/fallback is handled by steamUtils to maximize reuse

/**
 * Creates the container for logo, title, and subtitle
 * @returns {HTMLDivElement} The container element
 */
function createLogoDescriptionContainer() {
	const container = document.createElement('div')
	container.className = 'logo-description-container'
	return container
}

/**
 * Creates the logo container with the logo image
 * @param {string} logoUrl - URL of the logo image
 * @returns {HTMLDivElement} The logo container with image
 */
function createLogoContainer(logoUrl) {
	// Create logo container
	const logoContainer = document.createElement('div')
	logoContainer.className = 'logo-container'

	// Create logo image element with lazy loading
	const logoImage = document.createElement('img')
	logoImage.src = logoUrl
	logoImage.alt = 'Site Logo'
	logoImage.className = 'site-logo site-logo-circular'
	logoImage.loading = 'eager' // Ensure above-the-fold logo loads immediately

	// Handle logo loading errors
	logoImage.onerror = () => {
		console.warn('⚠️ Failed to load logo:', logoUrl)
		logoContainer.style.display = 'none'
	}

	// Handle successful logo load
	logoImage.onload = () => {
		logoImage.classList.add('loaded')
	}

	logoContainer.appendChild(logoImage)
	return logoContainer
}
/**
 * Creates the site title element
 * @param {string} title - The site title text
 * @returns {HTMLHeadingElement} The title element
 */
function createTitleElement(title) {
	const titleElement = document.createElement('h1')
	titleElement.className = 'site-title'
	titleElement.textContent = title
	return titleElement
}

/**
 * Creates the subtitle element
 * @param {string} subtitle - The subtitle text
 * @returns {HTMLParagraphElement} The subtitle element
 */
function createSubtitleElement(subtitle) {
	const subtitleElement = document.createElement('p')
	subtitleElement.className = 'site-subtitle'
	subtitleElement.textContent = subtitle
	return subtitleElement
}

/**
 * Creates the theme toggle button with sun and moon icons
 * @returns {HTMLButtonElement} The theme toggle button
 */
function createThemeToggleButton() {
	// Create the main button
	const toggleButton = document.createElement('button')
	toggleButton.id = 'theme-toggle'
	toggleButton.className = 'theme-toggle'
	toggleButton.setAttribute('aria-label', 'Toggle dark/light theme')
	toggleButton.setAttribute('title', 'Switch theme')

	// Create sun icon
	const sunIcon = document.createElement('span')
	sunIcon.className = 'icon sun-icon'
	sunIcon.setAttribute('aria-hidden', 'true')

	// Create moon icon
	const moonIcon = document.createElement('span')
	moonIcon.className = 'icon moon-icon'
	moonIcon.setAttribute('aria-hidden', 'true')

	// Append icons to button
	toggleButton.appendChild(sunIcon)
	toggleButton.appendChild(moonIcon)

	return toggleButton
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
