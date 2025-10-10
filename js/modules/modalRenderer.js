/**
 * Modal Renderer Module
 * Builds and manages modals (e.g., Privacy, Terms) from JSON data
 */

/**
 * Render modals based on data from JSON and wire up handlers
 * @param {Array<{id:string,title:string,content:string[]}>} modals
 */
export function renderModals(modals = []) {
	if (!Array.isArray(modals) || modals.length === 0) return

	// Container to hold all modals
	let container = document.getElementById('modal-container')
	if (!container) {
		container = document.createElement('div')
		container.id = 'modal-container'
		document.body.appendChild(container)
	}

	// Build each modal
	modals.forEach((m) => {
		if (!m || !m.id || !m.title) return
		if (document.getElementById(`modal-${m.id}`)) return // already exists

		const overlay = document.createElement('div')
		overlay.className = 'modal-overlay'
		overlay.id = `modal-${m.id}`
		overlay.setAttribute('role', 'dialog')
		overlay.setAttribute('aria-modal', 'true')
		overlay.setAttribute('aria-labelledby', `modal-${m.id}-title`)
		overlay.setAttribute('aria-hidden', 'true')

		const dialog = document.createElement('div')
		dialog.className = 'modal-dialog'

		const header = document.createElement('div')
		header.className = 'modal-header'

		const title = document.createElement('h2')
		title.className = 'modal-title'
		title.id = `modal-${m.id}-title`
		title.textContent = m.title

		const closeBtn = document.createElement('button')
		closeBtn.className = 'modal-close'
		closeBtn.setAttribute('aria-label', 'Close')
		closeBtn.innerHTML = '&times;'
		closeBtn.addEventListener('click', () => closeModal(m.id))

		header.appendChild(title)
		header.appendChild(closeBtn)

		const body = document.createElement('div')
		body.className = 'modal-body'

		// Accept array of strings as paragraphs by default
		if (Array.isArray(m.content)) {
			m.content.forEach((block) => {
				const p = document.createElement('p')
				p.textContent = block
				body.appendChild(p)
			})
		} else if (typeof m.content === 'string') {
			const p = document.createElement('p')
			p.textContent = m.content
			body.appendChild(p)
		}

		dialog.appendChild(header)
		dialog.appendChild(body)
		overlay.appendChild(dialog)

		// Click outside to close
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) closeModal(m.id)
		})

		container.appendChild(overlay)
	})

	// Wire link handlers after building
	attachModalLinkHandlers(modals)

	// Open on hash if provided
	if (location.hash) {
		const id = location.hash.replace('#', '')
		const exists = modals.some((m) => m.id === id)
		if (exists) openModal(id)
	}

	// Listen for hash changes
	window.addEventListener('hashchange', () => {
		const id = location.hash.replace('#', '')
		const exists = modals.some((m) => m.id === id)
		if (exists) openModal(id)
	})
}

/**
 * Attach click handlers to links with href like #privacy to open modals
 * @param {Array<{id:string}>} modals
 */
export function attachModalLinkHandlers(modals = []) {
	const ids = new Set(modals.map((m) => m.id))
	document.querySelectorAll('a[href^="#"]').forEach((a) => {
		const id = a.getAttribute('href').replace('#', '')
		if (!ids.has(id)) return
		a.addEventListener('click', (e) => {
			e.preventDefault()
			openModal(id)
		})
	})
}

let lastFocus = null

/**
 * Open modal by id
 * @param {string} id
 */
export function openModal(id) {
	const overlay = document.getElementById(`modal-${id}`)
	if (!overlay) return
	lastFocus = document.activeElement
	overlay.setAttribute('aria-hidden', 'false')
	overlay.classList.add('open')
	document.body.style.overflow = 'hidden'
	const title = overlay.querySelector('.modal-title')
	if (title) title.focus({ preventScroll: true })
	// Update hash for deep linking
	if (location.hash !== `#${id}`) {
		history.pushState(null, '', `#${id}`)
	}
	// ESC to close
	const escHandler = (e) => {
		if (e.key === 'Escape') {
			closeModal(id)
		}
	}
	overlay.__escHandler = escHandler
	document.addEventListener('keydown', escHandler)
}

/**
 * Close modal by id
 * @param {string} id
 */
export function closeModal(id) {
	const overlay = document.getElementById(`modal-${id}`)
	if (!overlay) return
	overlay.setAttribute('aria-hidden', 'true')
	overlay.classList.remove('open')
	document.body.style.overflow = ''
	if (lastFocus && typeof lastFocus.focus === 'function') {
		lastFocus.focus({ preventScroll: true })
	}
	// Clean hash if it matches this modal
	if (location.hash === `#${id}`) {
		history.pushState('', document.title, window.location.pathname + window.location.search)
	}
	if (overlay.__escHandler) {
		document.removeEventListener('keydown', overlay.__escHandler)
		delete overlay.__escHandler
	}
}
