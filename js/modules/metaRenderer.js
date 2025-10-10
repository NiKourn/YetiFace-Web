/**
 * Meta Data Renderer Module
 * Handles updating page title and meta description from JSON data
 */

/**
 * Updates the page title and meta description based on data
 * @param {Object} meta - Meta data object from JSON
 * @param {string} meta.title - The page title for the browser tab
 * @param {string} meta.description - The page description for SEO and social sharing
 */
export function renderMetaData(meta) {
	if (!meta || typeof meta !== 'object') {
		console.warn('⚠️ No meta data provided, using defaults')
		return
	}

	// Update page title
	if (meta.title) {
		document.title = meta.title
	}

	// Update meta description
	if (meta.description) {
		updateMetaDescription(meta.description)
	}

	//Loads later, not ideal solution
	// if (meta.faviconUrl) {
	// 	updateFavicon(meta.faviconUrl)
	// }

	// Update Open Graph tags for social sharing
	updateOpenGraphTags(meta)
}

/**
 * Updates or creates the meta description tag
 * @param {string} description - The description text
 */
function updateMetaDescription(description) {
	// Try to find existing meta description
	let metaDesc = document.querySelector('meta[name="description"]')

	if (metaDesc) {
		// Update existing tag
		metaDesc.setAttribute('content', description)
	} else {
		// Create new meta description tag
		metaDesc = document.createElement('meta')
		metaDesc.setAttribute('name', 'description')
		metaDesc.setAttribute('content', description)
		document.head.appendChild(metaDesc)
	}
}

/**
 * Updates Open Graph tags for better social media sharing
 * @param {Object} meta - Meta data object
 */
function updateOpenGraphTags(meta) {
	// Update or create Open Graph title
	updateOrCreateOGTag('og:title', meta.title)

	// Update or create Open Graph description
	updateOrCreateOGTag('og:description', meta.description)

	// Set the type to website
	updateOrCreateOGTag('og:type', 'website')

	// Add the current URL
	updateOrCreateOGTag('og:url', window.location.href)
}

/**
 * Helper function to update or create Open Graph meta tags
 * @param {string} property - The OG property name
 * @param {string} content - The content value
 */
function updateOrCreateOGTag(property, content) {
	if (!content) return

	let ogTag = document.querySelector(`meta[property="${property}"]`)

	if (ogTag) {
		// Update existing tag
		ogTag.setAttribute('content', content)
	} else {
		// Create new OG tag
		ogTag = document.createElement('meta')
		ogTag.setAttribute('property', property)
		ogTag.setAttribute('content', content)
		document.head.appendChild(ogTag)
	}
}

/**
 * Updates the favicon if provided in meta data
 * @param {string} faviconUrl - URL to the favicon
 */
export function updateFavicon(faviconUrl) {
	if (!faviconUrl) return

	// Find existing favicon link
	let faviconLink = document.querySelector('link[rel="icon"]')

	if (faviconLink) {
		faviconLink.setAttribute('href', faviconUrl)
	} else {
		// Create new favicon link
		faviconLink = document.createElement('link')
		faviconLink.setAttribute('rel', 'icon')
		faviconLink.setAttribute('href', faviconUrl)
		document.head.appendChild(faviconLink)
	}
}
