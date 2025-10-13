/**
 * Steam utilities: try to open Steam client from a web store URL, with web fallback
 */

/**
 * Try to open Steam client from a web store URL; fall back to web if client not detected.
 * Handles:
 * - App pages: https://store.steampowered.com/app/3983920/... -> steam://store/3983920
 * - Any other Steam store URL (e.g., search): steam://openurl/<encoded-full-url>
 * - Non-Steam URLs: opens in web directly
 * @param {string} steamUrl - e.g., https://store.steampowered.com/app/3983920/... or search URL
 */
export function tryOpenSteamFromWebUrl(steamUrl) {
	if (typeof steamUrl !== 'string' || steamUrl.length === 0) return

	const isSteamHost = /^https?:\/\/(store\.steampowered\.com|steamcommunity\.com)\//i.test(steamUrl)
	const appMatch = steamUrl.match(/\/app\/(\d+)/)

	if (!isSteamHost) {
		// Not a Steam-managed URL; just open web
		window.open(steamUrl, '_blank', 'noopener,noreferrer')
		return
	}

	let steamProtocolUrl = ''
	if (appMatch && appMatch[1]) {
		// Open specific app in client store
		steamProtocolUrl = `steam://store/${appMatch[1]}`
	} else {
		// Generic Steam URL (e.g., search, developer page, community group) -> open inside client
		const encoded = encodeURI(steamUrl)
		steamProtocolUrl = `steam://openurl/${encoded}`
	}

	checkSteamAvailability(steamProtocolUrl, steamUrl)
}

/**
 * Checks if Steam is available and opens appropriate link
 * @param {string} steamAppUrl - The steam:// protocol URL
 * @param {string} steamUrl - The fallback website URL
 */
function checkSteamAvailability(steamProtocolUrl, steamUrl) {
	// 🧪 TEST MODE: Set to true to simulate no Steam installed
	const TEST_NO_STEAM = false

	if (TEST_NO_STEAM) {
		setTimeout(() => {
			window.open(steamUrl, '_blank', 'noopener,noreferrer')
		}, 50)
		return
	}

	const testFrame = document.createElement('iframe')
	testFrame.style.display = 'none'
	testFrame.style.width = '1px'
	testFrame.style.height = '1px'

	let steamDetected = false
	let timeoutId

	const cleanup = () => {
		clearTimeout(timeoutId)
		try {
			if (testFrame.parentNode) document.body.removeChild(testFrame)
		} catch {}
	}

	const handleFocusChange = () => {
		steamDetected = true
		cleanup()
	}
	const handleVisibilityChange = () => {
		if (document.hidden && !steamDetected) {
			steamDetected = true
			cleanup()
		}
	}

	window.addEventListener('blur', handleFocusChange, { once: true })
	document.addEventListener('visibilitychange', handleVisibilityChange)

	timeoutId = setTimeout(() => {
		if (!steamDetected) {
			window.open(steamUrl, '_blank', 'noopener,noreferrer')
		}
		window.removeEventListener('blur', handleFocusChange)
		document.removeEventListener('visibilitychange', handleVisibilityChange)
		cleanup()
	}, 100)

	document.body.appendChild(testFrame)
	setTimeout(() => {
		if (!steamDetected) testFrame.src = steamProtocolUrl
	}, 10)
}
