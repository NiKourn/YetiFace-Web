/**
 * Theme Manager Module
 * Handles dark/light theme switching and persistence
 */

/**
 * Sets up the theme toggle functionality for the provided button
 * @param {HTMLButtonElement} toggleBtn - The theme toggle button element
 */
export function setupThemeToggle(toggleBtn) {
	// Get the theme stylesheet link element
	const themeLink = document.getElementById('theme-style')

	if (!themeLink) {
		console.error('❌ Theme stylesheet link not found')
		return
	}

	// Load saved theme from localStorage, default to 'dark'
	const savedTheme = getStoredTheme()

	// Apply the saved theme on initialization
	setTheme(savedTheme)

	// Add click event listener to toggle between themes
	toggleBtn.addEventListener('click', () => {
		// Determine the new theme based on current theme
		const currentTheme = getCurrentTheme()
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

		setTheme(newTheme)
	})

	/**
	 * Internal function to set the theme
	 * @param {string} theme - Either 'dark' or 'light'
	 */
	function setTheme(theme) {
		// Validate theme parameter
		if (!['dark', 'light'].includes(theme)) {
			console.warn('⚠️ Invalid theme:', theme, 'defaulting to dark')
			theme = 'dark'
		}

		// Update the stylesheet href to load the correct theme
		themeLink.setAttribute('href', `css/${theme}.css`)

		// Store the theme preference in localStorage
		localStorage.setItem('theme', theme)

		// Add theme class to body for additional styling if needed
		document.body.setAttribute('data-theme', theme)

		// Clean up and preload the alternate theme for next switch
		updateThemePreloading(theme)
	}

	/**
	 * Updates preloading for theme switching performance
	 * @param {string} currentTheme - The currently active theme
	 */
	function updateThemePreloading(currentTheme) {
		const alternateTheme = currentTheme === 'dark' ? 'light' : 'dark'

		// Remove old preload links
		const existingPreloads = document.querySelectorAll('link[rel="preload"][href*="css/"]')
		existingPreloads.forEach((link) => {
			if (link.href.includes('dark.css') || link.href.includes('light.css')) {
				link.remove()
			}
		})

		// Preload the alternate theme for next switch
		const preloadLink = document.createElement('link')
		preloadLink.rel = 'preload'
		preloadLink.as = 'style'
		preloadLink.href = `css/${alternateTheme}.css`
		preloadLink.id = `preload-${alternateTheme}`
		document.head.appendChild(preloadLink)
	}
}

/**
 * Gets the currently applied theme by checking the stylesheet href
 * @returns {string} 'dark' or 'light'
 */
export function getCurrentTheme() {
	const themeLink = document.getElementById('theme-style')
	if (!themeLink) return 'dark'

	// Extract theme from the href attribute
	return themeLink.getAttribute('href').includes('dark') ? 'dark' : 'light'
}

/**
 * Gets the stored theme from localStorage
 * @returns {string} The stored theme or 'dark' as default
 */
export function getStoredTheme() {
	return localStorage.getItem('theme') || 'dark'
}

/**
 * Preloads the alternate theme stylesheet to avoid flash when switching
 * Only preloads the theme that isn't currently active
 */
export function preloadThemes() {
	const currentTheme = getStoredTheme()
	const alternateTheme = currentTheme === 'dark' ? 'light' : 'dark'

	// Remove any existing preload links for themes
	const existingPreloads = document.querySelectorAll('link[rel="preload"][href*="css/"]')
	existingPreloads.forEach((link) => {
		if (link.href.includes('dark.css') || link.href.includes('light.css')) {
			link.remove()
		}
	})

	// Only preload the alternate theme
	const link = document.createElement('link')
	link.rel = 'preload'
	link.as = 'style'
	link.href = `css/${alternateTheme}.css`
	link.id = `preload-${alternateTheme}`
	document.head.appendChild(link)
}
