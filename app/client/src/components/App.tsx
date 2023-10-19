import React from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket';
import QRCode from "react-qr-code"

// todo: share this type
interface Invoice {
    value: { low: number }
    state: number
    creation_date: { low: number }
}

const App = () => {
	const [newInvoice, setNewInvoice] = React.useState<undefined | string>(undefined)
	const [invoiceMessage, setInvoiceMessage] = React.useState<string>('')

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
					setNewInvoice(parsedData.invoiceId)
					break
				case 'allInvoices':
					setInvoices(parsedData.invoices)
					break
				case 'invoicePaid':
					setInvoiceMessage(`invoice ${parsedData.payment_request} is now paid :>`)
					break
			}
		}
	  }, [lastMessage]);



	const sendTip = () => {
		setNewInvoice(undefined)
		setInvoiceMessage('')
		const amount = Math.floor(Math.random() * 1000) + 1

		sendMessage(JSON.stringify({ action: 'createInvoice', amount }))
	}

	return (
		<div>
			{connectionStatus}<hr/>
			<p>
				[todo: form for creating invoices]
				<button onClick={sendTip}>send tip</button>
				<br/>
				{newInvoice && invoiceMessage === '' && <div>
					{newInvoice}:
					<QRCode value={newInvoice} />
					
				</div>}
				{invoiceMessage !== '' && <div>
					{invoiceMessage}
				</div>}
			</p>
			<hr/>
			{(invoices ?? []).length > 0 && (
				<div>
					<h4>Past tips</h4>
					<ul>
						{invoices.map((invoice, key) => (
							<li key={key}>
								<>{invoice.creation_date.low}: {invoice.value.low} - {invoice.state}</>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

export default App
