// Install the ws package first: npm install ws
import WebSocket from 'ws'

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 })

// Set up a connection event
wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected')

    // Set up message event for this connection
    ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`)
    })

    // Send a welcome message to the client
    ws.send('Welcome to the server!')
})

console.log('WebSocket server started on ws://localhost:8080')
