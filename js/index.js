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
import { getStoredTheme } from './modules/themeManager.js'
import { renderModals } from './modules/modalRenderer.js'

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
 * Waits for above-the-fold images (with src, not data-src) to finish loading.
 * Always resolves, even if some images fail or take too long.
 */
async function waitForAboveFoldImages() {
	// Wait a frame for layout to render
	await new Promise((resolve) => requestAnimationFrame(resolve))

	// Only wait for truly critical images: logo + first content image
	const critical = []
	const logo = document.querySelector('.site-logo[src]')
	if (logo) critical.push(logo)
	const firstItem = document.querySelector('.item-image[src]')
	if (firstItem && firstItem !== logo) critical.push(firstItem)
	if (critical.length === 0) return

	const loadPromises = critical.map((img) => {
		return new Promise((resolve) => {
			if (img.complete && img.naturalWidth !== 0) {
				// Already loaded successfully
				return resolve()
			}

			const onDone = () => {
				img.removeEventListener('load', onDone)
				img.removeEventListener('error', onDone)
				resolve()
			}

			img.addEventListener('load', onDone, { once: true })
			img.addEventListener('error', onDone, { once: true })
		})
	})

	await Promise.allSettled(loadPromises)
}

/**
 * Show a minimal cookie notice once per browser (first visit)
 * @param {{message:string, moreText?:string, moreLink?:string, buttonText?:string}} notice
 */
function maybeShowCookieNotice(notice) {
	try {
		const STORAGE_KEY = 'cookieNoticeAcknowledged'
		if (localStorage.getItem(STORAGE_KEY) === '1') return

		const bar = document.createElement('div')
		bar.className = 'cookie-notice'
		bar.setAttribute('role', 'region')
		bar.setAttribute('aria-label', 'Cookie notice')

		// Close (×) button
		const x = document.createElement('button')
		x.className = 'cookie-notice-close'
		x.type = 'button'
		x.setAttribute('aria-label', 'Close cookie notice')
		x.textContent = '×'
		x.addEventListener('click', () => {
			localStorage.setItem(STORAGE_KEY, '1')
			bar.classList.remove('show')
			setTimeout(() => bar.remove(), 300)
		})
		bar.appendChild(x)

		const msg = document.createElement('span')
		msg.className = 'cookie-notice-message'
		msg.textContent = notice.message || 'We do not use cookies for analytics or ads.'

		bar.appendChild(msg)

		if (notice.moreLink) {
			const link = document.createElement('a')
			link.href = notice.moreLink
			link.className = 'cookie-notice-link'
			link.textContent = notice.moreText || 'Learn more'
			link.addEventListener('click', () => {
				// Dismiss bar when navigating to details
				localStorage.setItem(STORAGE_KEY, '1')
				bar.classList.remove('show')
				setTimeout(() => bar.remove(), 300)
			})
			bar.appendChild(link)
		}

		const btn = document.createElement('button')
		btn.className = 'cookie-notice-button'
		btn.type = 'button'
		btn.textContent = notice.buttonText || 'Got it'
		btn.addEventListener('click', () => {
			localStorage.setItem(STORAGE_KEY, '1')
			bar.classList.remove('show')
			// remove after transition
			setTimeout(() => bar.remove(), 300)
		})
		bar.appendChild(btn)

		document.body.appendChild(bar)
		// allow styles to apply then show
		requestAnimationFrame(() => bar.classList.add('show'))
	} catch (e) {
		// If localStorage fails, skip notice silently
		console.warn('Cookie notice skipped:', e)
	}
}

// Track if app is already initialized
let isInitialized = false

/**
 * Main application initialization function
 * Called when the DOM is fully loaded
 */
async function initializeApp() {
	if (isInitialized) return
	isInitialized = true

	try {
		// Clean up URL first
		cleanupURL()

		// Wait briefly for local font to load -- reduces FOUT
		await Promise.race([
			document.fonts.load('400 16px "Bahnschrift"'),
			new Promise((resolve) => setTimeout(resolve, 800)),
		])

		// Apply saved theme
		applySavedTheme()

		// Load application data
		const data = await loadData()

		// Render all content
		if (data.meta) renderMetaData(data.meta)
		if (data.header) renderHeader(data.header)
		if (data.sections) renderSections(data.sections)
		if (data.footer) renderFooter(data.footer)
		if (data.modals) renderModals(data.modals)

		// Cookie notice (first visit, minimal, no consent needed)
		// if (data.cookieNotice?.enabled) {
		// 	maybeShowCookieNotice(data.cookieNotice)
		// }

		// Wait only for truly critical images (no arbitrary timeouts)
		await waitForAboveFoldImages()

		// Hide spinner, show app
		document.getElementById('app-spinner').style.display = 'none'
		document.getElementById('app-content').style.display = 'block'
	} catch (error) {
		console.error('❌ Failed to initialize:', error)
		// Show page even on error
		document.getElementById('app-spinner').style.display = 'none'
		document.getElementById('app-content').style.display = 'block'
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
