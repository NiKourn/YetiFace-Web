/**
 * Footer Renderer Module
 * Handles the creation and rendering of the site footer from JSON data
 */

/**
 * Renders the site footer with dynamic content from JSON data
 * @param {Object} footerData - Footer data from JSON
 * @param {string} footerData.companyName - Company name for copyright
 * @param {string} footerData.year - Year setting ("auto" for current year)
 * @param {string} [footerData.additionalText] - Additional copyright text
 * @param {Array} [footerData.links] - Array of footer links
 */
export function renderFooter(footerData) {
	// Get the footer element
	const footerEl = document.getElementById('footer')
	if (!footerEl) {
		console.error('❌ Footer element not found')
		return
	}

	// Clear existing content
	footerEl.innerHTML = ''

	// Create footer content container
	const footerContent = document.createElement('div')
	footerContent.className = 'footer-content'

	// Create copyright section
	const copyrightSection = createCopyrightSection(footerData)
	footerContent.appendChild(copyrightSection)

	// Create links section if links exist
	if (footerData?.links && footerData.links.length > 0) {
		const linksSection = createLinksSection(footerData.links)
		footerContent.appendChild(linksSection)
	}

	// Add content to footer
	footerEl.appendChild(footerContent)

	// Show the footer (it's hidden by default during loading)
	footerEl.style.display = 'block'
}

/**
 * Creates the copyright section with company name and year
 * @param {Object} footerData - Footer data object
 * @returns {HTMLElement} The copyright section element
 */
function createCopyrightSection(footerData) {
	const copyrightDiv = document.createElement('div')
	copyrightDiv.className = 'footer-copyright'

	// Determine the year to display
	const year = footerData?.year === 'auto' ? getCurrentYear() : footerData?.year || getCurrentYear()

	// Build copyright text
	const companyName = footerData?.companyName || 'Yetiface Games'
	const additionalText = footerData?.additionalText || ''

	const copyrightText = `© ${year} ${companyName}${additionalText ? ` - ${additionalText}` : ''}`

	const copyrightP = document.createElement('p')
	copyrightP.textContent = copyrightText
	copyrightP.className = 'copyright-text'

	copyrightDiv.appendChild(copyrightP)

	return copyrightDiv
}

/**
 * Creates the footer links section
 * @param {Array} links - Array of link objects
 * @returns {HTMLElement} The links section element
 */
function createLinksSection(links) {
	const linksDiv = document.createElement('div')
	linksDiv.className = 'footer-links'

	const linksList = document.createElement('ul')
	linksList.className = 'footer-links-list'

	links.forEach((link) => {
		if (link.name && link.url) {
			const listItem = document.createElement('li')
			listItem.className = 'footer-link-item'

			const linkElement = document.createElement('a')
			linkElement.href = link.url
			linkElement.textContent = link.name
			linkElement.className = 'footer-link'

			// Add appropriate attributes for external links
			if (link.url.startsWith('http')) {
				linkElement.target = '_blank'
				linkElement.rel = 'noopener noreferrer'
			}

			listItem.appendChild(linkElement)
			linksList.appendChild(listItem)
		}
	})

	linksDiv.appendChild(linksList)
	return linksDiv
}

/**
 * Gets the current year
 * @returns {number} The current year
 */
export function getCurrentYear() {
	return new Date().getFullYear()
}

/**
 * Hides the footer (useful during loading)
 */
export function hideFooter() {
	const footerEl = document.getElementById('footer')
	if (footerEl) {
		footerEl.style.display = 'none'
	}
}

/**
 * Shows the footer
 */
export function showFooter() {
	const footerEl = document.getElementById('footer')
	if (footerEl) {
		footerEl.style.display = 'block'
	}
}
