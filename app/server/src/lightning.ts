export class Lightning {
    GRPC_HOST = 'umbrel.local:10009'

    public static getInstance(): Lightning {
        return Lightning._instance
    }

    private static _instance: Lightning = new Lightning()

    constructor() {
        if (Lightning._instance) {
            throw new Error('Error: Instantiation failed: Use Lightning.getInstance() instead of new.')
        }
        Lightning._instance = this
    }

    public async createInvoice(amount: number): Promise<string> {
        // todo: create the invoice
        console.log('try to create an invoice for ' + amount)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('new_invoice_id_' + amount)
            }, 1000)
        })
    }

    public async subscribeToInvoice(hash: string, callback: (invoiceId: string) => void) {
        setTimeout(callback, 5000)
    }
}

export default Lightning
