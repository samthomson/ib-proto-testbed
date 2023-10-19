import React from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket';

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


	const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:3601');


	const connectionStatus = {
		[ReadyState.CONNECTING]: 'Connecting',
		[ReadyState.OPEN]: 'Open',
		[ReadyState.CLOSING]: 'Closing',
		[ReadyState.CLOSED]: 'Closed',
		[ReadyState.UNINSTANTIATED]: 'Uninstantiated',
	  }[readyState];

	  React.useEffect(() => {
		if (lastMessage !== null) {
			const parsedData = JSON.parse(lastMessage.data)

			switch (parsedData.action) {
				case 'newInvoice':
					// show it somewhere
					setInvoices((prevInvoices) => [
						...prevInvoices,
						parsedData.invoice,
					])
					break
				case 'allInvoices':
					setInvoices(parsedData.invoices)
					break
			}
		}
	  }, [lastMessage]);



	const sendTip = () => {
		const amount = Math.floor(Math.random() * 1000) + 1

		sendMessage(JSON.stringify({ action: 'createInvoice', amount }))
	}

	return (
		<div>
			{connectionStatus}<hr/>
			<p>
				[todo: form for creating invoices]
				<button onClick={sendTip}>send tip</button>
			</p>
			{(invoices ?? []).length > 0 && (
				<div>
					<h4>Past tips</h4>
					<ul>
						{invoices.map((invoice, key) => (
							<li key={key}>
								{invoice.amount}: {invoice.status}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

export default App
