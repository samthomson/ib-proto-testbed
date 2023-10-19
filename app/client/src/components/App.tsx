import React from 'react'

// todo: share this type
interface Invoice {
	amount: number
	creationDate: string
	expiryDate: string
	status: 'paid' | 'unpaid'
	lnAddress: string
}

const App = () => {
	const [invoices, setInvoices] = React.useState<Invoice[]>([])

	const wsRef = React.useRef<WebSocket | null>(null);

	React.useEffect(() => {
		// Initialize WebSocket connection
		const ws = new WebSocket('ws://localhost:3601')
		wsRef.current = ws;

		// if (!ws) {return}

		// Connection opened
		ws.addEventListener('open', () => {
			ws.send(JSON.stringify({action: 'connection', value: "Hello Server!"}))
		})

		// Listen for messages from server
		ws.addEventListener('message', (event) => {
			console.log('Message from server:', event?.data)

			const parsedData = JSON.parse(event.data)

			switch (parsedData.action) {
				case 'newInvoice':
					setInvoices((prevInvoices) => [
						...prevInvoices,
						parsedData.invoice,
					])
					break
				case 'allInvoices':
					setInvoices(parsedData.invoices)
					break
				case 'invoicePaid':
					setInvoices((prevInvoices) =>
						prevInvoices.map((inv) =>
							inv.lnAddress === parsedData.invoice.lnAddress
								? parsedData.invoice
								: inv,
						),
					)
					break
			}
		})

		// Cleanup
		return () => {
			ws.close()
		}
	}, [])

	const sendTip = () => {
		const amount = Math.floor(Math.random() * 1000) + 1

		wsRef.current?.send(JSON.stringify({action: 'createInvoice', amount }))
	}

	return (
		<div>
			<p>[todo: form for creating invoices]
				<button onClick={sendTip}>send tip</button>
			</p>
			{(invoices ?? []).length > 0 && (
				<div>
					<h4>Past tips</h4>
					<ul>
						{invoices.map((invoice, key) => (
							<li key={key}>{invoice.amount}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

export default App
