/**
 * Data Loader Module
 * Handles fetching and loading JSON data from the server
 */

/**
 * Fetches the main application data from data.json
 * @returns {Promise<Object>} The parsed JSON data containing header and sections
 * @throws {Error} If the network request fails or response is not ok
 */
export async function loadData() {
	try {
		// Fetch data from the JSON file
		const response = await fetch('data/data.json')

		// Check if the response is successful
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		// Parse and return the JSON data
		const data = await response.json()
		return data
	} catch (error) {
		// Log the error for debugging
		console.error('❌ Failed to load data:', error)
		throw error // Re-throw so calling code can handle it
	}
}

/**
 * Displays an error message in the main content area
 * @param {string} message - The error message to display
 */
export function displayError(message = 'Failed to load content.') {
	const main = document.getElementById('main-content')
	if (main) {
		main.innerHTML = `<p class="error-message">${message}</p>`
	}
}
