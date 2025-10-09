/**
 * Main Application Entry Point
 * Orchestrates the loading and rendering of the entire application
 */

// Import all necessary modules
import { loadData, displayError } from './modules/dataLoader.js'
import { renderHeader } from './modules/headerRenderer.js'
import { renderSections } from './modules/sectionRenderer.js'
import { renderFooter, hideFooter } from './modules/footerRenderer.js'
import { renderMetaData } from './modules/metaRenderer.js'
import { preloadThemes, getStoredTheme } from './modules/themeManager.js'

/**
 * Redirects from index.html to root URL for cleaner URLs
 * Essential for GitHub Pages SEO and clean URLs
 */
function cleanupURL() {
	// Check if URL ends with /index.html
	if (window.location.pathname.endsWith('/index.html')) {
		// Get the current URL without index.html
		const cleanURL = window.location.href.replace('/index.html', '/')

		// Replace current history entry (no back button entry)
		window.history.replaceState(null, '', cleanURL)
	}
}

/**
 * Main application initialization function
 * Called when the DOM is fully loaded
 */
async function initializeApp() {
	try {
		// Clean up URL first (remove index.html if present)
		cleanupURL()

		// Apply saved theme IMMEDIATELY for proper loading state theming
		applySavedTheme()

		// Load application data first to get logo path
		const data = await loadData()

		// Show loading state with logo from data
		showLoadingState(data?.header?.logo)

		// Preload theme stylesheets for better UX
		preloadThemes()

		// 🐛 DEBUG: Add 3-second delay to see loading state
		await new Promise((resolve) => setTimeout(resolve, 500))

		// Validate data structure
		if (!data || typeof data !== 'object') {
			throw new Error('Invalid data structure received')
		}

		// Update page metadata (title, description, etc.)
		if (data.meta) {
			renderMetaData(data.meta)
		}

		// Render header section
		if (data.header) {
			renderHeader(data.header)
		}

		// Render content sections
		if (data.sections) {
			renderSections(data.sections)
		}

		// Render footer with data from JSON
		if (data.footer) {
			renderFooter(data.footer)
		}

		// Hide loading state and show content
		hideLoadingState()
	} catch (error) {
		// Handle any initialization errors
		console.error('❌ Failed to initialize application:', error)

		// Display user-friendly error message
		displayError('Sorry, something went wrong loading the page. Please try refreshing.')

		// Hide loading state
		hideLoadingState()
	}
}

/**
 * Applies the saved theme immediately for proper loading state theming
 */
function applySavedTheme() {
	const savedTheme = getStoredTheme()

	// Apply the theme stylesheet immediately
	const themeLink = document.getElementById('theme-style')
	if (themeLink) {
		themeLink.setAttribute('href', `css/${savedTheme}.css`)
	}

	// Set the theme data attribute on body for CSS targeting
	document.body.setAttribute('data-theme', savedTheme)
}

/**
 * Shows a loading state while the app initializes
 * Centers loading message and hides footer
 */
function showLoadingState(logoPath = 'assets/logo.webp') {
	// Don't change title - keep the SEO-friendly default title in HTML

	// Log current theme for debugging
	const currentTheme = document.body.getAttribute('data-theme') || 'dark'

	const mainContent = document.getElementById('main-content')
	if (mainContent) {
		mainContent.innerHTML = `
			<div class="loading-container">
				<img src="${logoPath}" alt="YetiFace Games" class="loading-logo site-logo-circular" style="width:50px; height:50px;">
				<div class="loading">LOADING</div>
			</div>
		`
	}

	// Hide footer during loading
	hideFooter() // Add loading class to body for additional CSS styling if needed
	document.body.classList.add('loading')
}
/**
 * Hides the loading state once initialization is complete
 */
function hideLoadingState() {
	// Remove loading class from body
	document.body.classList.remove('loading')

	// Loading content will be replaced by actual content automatically
}

/**
 * Handle any unhandled errors that might occur
 */
window.addEventListener('error', (event) => {
	console.error('💥 Unhandled error:', event.error)

	// Could send error to logging service here
	// trackError(event.error)
})

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
	console.error('💥 Unhandled promise rejection:', event.reason)

	// Prevent the error from appearing in console
	event.preventDefault()

	// Display user-friendly message
	displayError('An unexpected error occurred. Please refresh the page.')
})

// Initialize the application when DOM is ready
window.addEventListener('DOMContentLoaded', initializeApp)

// Optional: Add a manual refresh function for debugging
window.refreshApp = initializeApp
