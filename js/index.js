// Fetch the JSON file and render content
async function loadData() {
	try {
		const resp = await fetch('data/data.json')
		if (!resp.ok) {
			throw new Error('Network response was not OK')
		}
		const data = await resp.json()
		renderHeader(data.header)
		renderSections(data.sections)
	} catch (err) {
		console.error('Failed to load data:', err)
		const main = document.getElementById('main-content')
		main.innerHTML = '<p>Failed to load content.</p>'
	}
}

function renderHeader(header) {
	const headerEl = document.getElementById('header')
	headerEl.innerHTML = '' // clear

	let logo = null
	let subtitleEl = null

	const logoDescriptionContainer = document.createElement('div')
	logoDescriptionContainer.className = 'logo-description-container'
	headerEl.appendChild(logoDescriptionContainer)

	// Add logo if it exists
	if (header.logo) {
		const logoContainer = document.createElement('div')
		logoContainer.className = 'logo-container'
		logoDescriptionContainer.appendChild(logoContainer)

		logo = document.createElement('img')
		logo.src = header.logo
		logo.alt = 'Logo'
		logo.className = 'site-logo'

		logoContainer.appendChild(logo)
	}

	// Add title/Name
	const titleEl = document.createElement('h1')
	titleEl.className = 'site-title'
	titleEl.textContent = header.title

	// Add subtitle if it exists
	if (header.subtitle) {
		subtitleEl = document.createElement('p')
		subtitleEl.textContent = header.subtitle
	}

	// Add theme toggle button
	const toggleBtn = document.createElement('button')
	toggleBtn.id = 'theme-toggle'
	toggleBtn.style.marginTop = '0.5rem'
	headerEl.appendChild(toggleBtn)

	// Append title and subtitle to the container
	logoDescriptionContainer.appendChild(titleEl)

	if (header.subtitle) {
		logoDescriptionContainer.appendChild(subtitleEl)
	}
	// Initialize theme toggle functionality
	setupThemeToggle(toggleBtn)
}

function setupThemeToggle(toggleBtn) {
	const themeLink = document.getElementById('theme-style')

	// Localstorage default theme: dark
	const savedTheme = localStorage.getItem('theme') || 'dark'
	setTheme(savedTheme)

	toggleBtn.addEventListener('click', () => {
		const newTheme = themeLink.getAttribute('href').includes('dark') ? 'light' : 'dark'
		setTheme(newTheme)
	})

	function setTheme(theme) {
		themeLink.setAttribute('href', `css/${theme}.css`)
		localStorage.setItem('theme', theme)
		toggleBtn.textContent = theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'
	}
}

function renderSections(sections) {
	const main = document.getElementById('main-content')
	main.innerHTML = '' // clear

	sections.forEach((section) => {
		const sectionEl = document.createElement('section')
		sectionEl.className = 'section'

		const titleEl = document.createElement('h2')
		titleEl.className = 'section-title'
		titleEl.textContent = section.title
		sectionEl.appendChild(titleEl)

		const itemsContainer = document.createElement('div')
		itemsContainer.className = 'items'

		section.items.forEach((item) => {
			const itemEl = document.createElement('div')
			itemEl.className = 'item'

			if (item.image) {
				const img = document.createElement('img')
				img.src = item.image
				img.alt = item.heading || ''
				itemEl.appendChild(img)
			}

			const contentEl = document.createElement('div')
			contentEl.className = 'item-content'

			if (item.heading) {
				const h = document.createElement('h3')
				h.className = 'item-heading'
				h.textContent = item.heading
				contentEl.appendChild(h)
			}

			if (item.text) {
				const p = document.createElement('p')
				p.className = 'item-text'
				p.textContent = item.text
				contentEl.appendChild(p)
			}

			itemEl.appendChild(contentEl)
			itemsContainer.appendChild(itemEl)
		})

		sectionEl.appendChild(itemsContainer)
		main.appendChild(sectionEl)
	})
}

// Kick off
window.addEventListener('DOMContentLoaded', loadData)
