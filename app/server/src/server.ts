import WebSocket from 'ws'

import { Lightning } from './lightning'

// Create a WebSocket server
const port = 8080
const wss = new WebSocket.Server({ port })
const lightning = Lightning.getInstance()

interface Invoice {
    amount: number
    creationDate: Date
    expiryDate: Date
    status: 'paid' | 'unpaid'
    lnAddress: string
}

const recentInvoices: Invoice[] = []

// Set up a connection event
let singleClient: WebSocket | null = null
wss.on('connection', (ws: WebSocket) => {
    singleClient = ws
    // send intial state of past txs
    sendRecentInvoices()

    // Set up message event for this connection
    ws.on('message', async (message: string) => {
        console.log(`Received message: ${message}`)

        const parsedMessage = JSON.parse(message.toString())
        switch (parsedMessage.action) {
            case 'createInvoice':
                const invoice = await lightning.createInvoice(parsedMessage.amount)

                lightning.subscribeToInvoice(invoice.r_hash, (payment_request: string) => {
                    // todo: mark the invoice paid?
                    sendInvoicePaid(payment_request)
                })
                ws.send(JSON.stringify({ action: 'newInvoice', invoiceId: invoice.payment_request }))

                // Simulate creating an invoice
                console.log('will now send out invoices', recentInvoices)
                sendRecentInvoices()
        }
    })
})

const sendRecentInvoices = () => {
    if (!singleClient) {
        return
    }

    singleClient.send(JSON.stringify({ action: 'allInvoices', invoices: recentInvoices }))
}

const sendInvoicePaid = (payment_request: string) => {
    if (!singleClient) {
        return
    }

    singleClient.send(JSON.stringify({ action: 'invoicePaid', payment_request }))
}

console.log(`WebSocket server started on ws://localhost:${port}`)
