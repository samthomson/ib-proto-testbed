// Install the ws package first: npm install ws
import WebSocket from 'ws'

// Create a WebSocket server
const port = 8080
const wss = new WebSocket.Server({ port })

interface Invoice {
    amount: number
    creationDate: Date
    expiryDate: Date
    status: 'paid' | 'unpaid'
    lnAddress: string
}

const recentInvoices: Invoice[] = []

// Set up a connection event
wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected?')

    // Set up message event for this connection
    ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`)

        // Send a welcome message to the client
        ws.send(JSON.stringify({ action: 'connection', connected: true }))

        const parsedMessage = JSON.parse(message.toString())
        switch (parsedMessage.action) {
            case 'createInvoice':
                // Simulate creating an invoice
                const newInvoice: Invoice = {
                    amount: parsedMessage.amount,
                    creationDate: new Date(),
                    expiryDate: new Date(Date.now() + 3600000), // 1 hour from now
                    status: 'unpaid',
                    lnAddress: 'ln-address-here',
                }
                recentInvoices.push(newInvoice)
                // ws.send(JSON.stringify({ action: 'newInvoice', invoice: newInvoice }))
                console.log('will now send out invoices', recentInvoices)
                ws.send(JSON.stringify({ action: 'allInvoices', invoices: recentInvoices }))

                // simulate it getting paid after 10s (in reality, this would come from watching the node)
                setInterval(() => {
                    if (recentInvoices.length > 0) {
                        recentInvoices[recentInvoices.length - 1].status = 'paid'
                        ws.send(
                            JSON.stringify({
                                action: 'invoicePaid',
                                invoice: recentInvoices[recentInvoices.length - 1],
                            }),
                        )
                    }
                }, 10000)
        }
    })
})

// const emitInvoices = () => {
//     wss.emit('newInvoice', { invoices: recentInvoices })
// }

console.log(`WebSocket server started on ws://localhost:${port}`)
