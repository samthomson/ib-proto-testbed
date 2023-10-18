import React, { useEffect } from "react"

const App = () => {
	useEffect(() => {
		// Initialize WebSocket connection
		const ws = new WebSocket("ws://localhost:3601")

		// Connection opened
		ws.addEventListener("open", (event) => {
			ws.send("Hello Server!")
		})

		// Listen for messages from server
		ws.addEventListener("message", (event) => {
			console.log("Message from server:", event.data)
		})

		// Cleanup
		return () => {
			ws.close()
		}
	}, [])

	return <div>[web sockets?]</div>
}

export default App
