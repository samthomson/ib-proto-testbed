import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as fs from 'fs'

const loaderOptions = {
    keepCase: true,
    defaults: true,
    oneofs: true,
}

// todo: get some proper types
interface AddInvoiceResponse {
    payment_request: string
    r_hash: string
}
export class Lightning {
    private GRPC_HOST = 'umbrel.local:10009'

    private lnd: any = null
    private invoiceClient: any = null

    public static getInstance(): Lightning {
        return Lightning._instance
    }

    private static _instance: Lightning = new Lightning()

    // private lnrpc: any = null
    // private invoicesrpc: any = null

    constructor() {
        if (Lightning._instance) {
            throw new Error('Error: Instantiation failed: Use Lightning.getInstance() instead of new.')
        }
        Lightning._instance = this

        this.setupNodeConnection()
    }

    private setupNodeConnection() {
        // private invoicesrpc: any = null

        const lnrpc: any = grpc.loadPackageDefinition(
            protoLoader.loadSync(['lnd/lightning.proto'], loaderOptions),
        ).lnrpc

        const invoicesrpc: any = grpc.loadPackageDefinition(
            protoLoader.loadSync(['lnd/lightning.proto', 'lnd/invoices.proto'], loaderOptions),
        ).invoicesrpc

        const macaroon = fs.readFileSync('lnd/invoice.macaroon').toString('hex')
        const metadata = new grpc.Metadata()
        metadata.add('macaroon', macaroon)
        const macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
            callback(null, metadata)
        })

        const sslCreds = grpc.credentials.createSsl(fs.readFileSync('./lnd/tls.cert'))

        const credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds)

        this.lnd = new lnrpc.Lightning(this.GRPC_HOST, credentials)
        this.invoiceClient = new invoicesrpc.Invoices(this.GRPC_HOST, credentials)

        const request = {
            show: true,
            level_spec: 'info',
        }
    }

    public async createInvoice(amount: number): Promise<AddInvoiceResponse> {
        // todo: create the invoice
        console.log('try to create an invoice for ' + amount)
        return new Promise((resolve) => {
            const invoice = {
                value: amount, // amount in satoshis
                memo: `Test Invoice for ${amount.toLocaleString()} sats`,
            }
            console.log('will attempt to make an invoice for', invoice)

            this.lnd.addInvoice(invoice, (error: any, response: AddInvoiceResponse) => {
                if (error) {
                    console.error(error)
                    return
                }
                console.log('add invoice response', response)

                resolve(response)
            })
        })
    }

    public async subscribeToInvoice(r_hash: string, onSettledCallback: (r_hash: string) => void) {
        // todo:
        const request = {
            r_hash,
        }
        const call = this.invoiceClient.subscribeSingleInvoice(request)
        call.on('data', (response: any) => {
            // A response was received from the server.
            console.log('subscription info', response)
            const { state, payment_request } = response

            if (state === 1) {
                onSettledCallback(payment_request)
            }
        })
    }
}

export default Lightning

// todo: integrate error handling of the lightning connection
