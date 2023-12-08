import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as fs from 'fs'
import { LightningAddress } from '@getalby/lightning-tools'
import * as crypto from 'crypto' // or 'node:crypto'
globalThis.crypto = crypto as any

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
interface ListInvoiceResponse {
    invoices: {
        value: number
        state: number
        creation_date: number
    }[]
}

interface OpenChannelResponse {
    success: boolean
}

interface GetInvoiceResponse {
    paymentRequest: string
    paymentHash: string
}

export class Lightning {
    private GRPC_HOST = 'umbrel.local:10009'

    private lnd: any = null
    private invoiceClient: any = null
    private routerClient: any = null

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

        // used?
        const routerRPC: any = grpc.loadPackageDefinition(
            protoLoader.loadSync(['lnd/router.proto'], loaderOptions),
        ).routerrpc

        const macaroon = fs.readFileSync('lnd/admin.macaroon').toString('hex')
        const metadata = new grpc.Metadata()
        metadata.add('macaroon', macaroon)
        const macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
            callback(null, metadata)
        })

        const sslCreds = grpc.credentials.createSsl(fs.readFileSync('./lnd/tls.cert'))

        const credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds)

        this.lnd = new lnrpc.Lightning(this.GRPC_HOST, credentials)
        this.invoiceClient = new invoicesrpc.Invoices(this.GRPC_HOST, credentials)
        this.routerClient = new routerRPC.Router(this.GRPC_HOST, credentials)

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

    public async getPastInvoicesPaid() {
        const request = {
            pending_only: false,
            // index_offset: <uint64>,
            num_max_invoices: 3,
            reversed: true,
            // creation_date_start: <uint64>,
            // creation_date_end: <uint64>,
        }

        return new Promise((resolve) => {
            this.lnd.listInvoices(
                request,
                // todo
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                (err, response: ListInvoiceResponse) => {
                    if (err) {
                        console.error('err listing invoices', err)
                    }
                    if (response) {
                        console.log('response', response.invoices)
                        resolve(response.invoices)
                    }
                    // console.log('something?', response, err);
                },
            )
        })
    }

    public async openChannel(amountInSatoshis: number): Promise<OpenChannelResponse> {
        console.log('will try to open a channel for sats:' + amountInSatoshis)

        return new Promise((resolve) => {
            // const client = new lnrpc.Lightning(GRPC_HOST, creds)

            const request = {
                // sat_per_vbyte: <uint64>,
                node_pubkey: Buffer.from('03bc9337c7a28bb784d67742ebedd30a93bacdf7e4ca16436ef3798000242b2251', 'hex'),
                // node_pubkey_string: <string>,
                local_funding_amount: amountInSatoshis,
                // push_sat: <int64>,
                // target_conf: <int32>,
                // sat_per_byte: <int64>,
                // private: <bool>,
                // min_htlc_msat: <int64>,
                // remote_csv_delay: <uint32>,
                // min_confs: <int32>,
                // spend_unconfirmed: <bool>,
                // close_address: <string>,
                // funding_shim: <FundingShim>,
                // remote_max_value_in_flight_msat: <uint64>,
                // remote_max_htlcs: <uint32>,
                // max_local_csv: <uint32>,
                // commitment_type: <CommitmentType>,
                // zero_conf: <bool>,
                // scid_alias: <bool>,
                // base_fee: <uint64>,
                // fee_rate: <uint64>,
                // use_base_fee: <bool>,
                // use_fee_rate: <bool>,
                // remote_chan_reserve_sat: <uint64>,
                // fund_max: <bool>,
                memo: `A channel opened for ${amountInSatoshis} sats`,
                // outpoints: <OutPoint>,
            }

            try {
                const call = this.lnd.openChannel(request)

                call.on('data', function (response: any) {
                    // A response was received from the server.
                    console.log('response', response)
                    resolve({ success: false })
                })
                call.on('status', function (status: any) {
                    // The current status of the stream.
                    console.log('status', status)
                    resolve({ success: false })
                })
                call.on('end', function () {
                    // The server has closed the stream.
                    console.log('END OF STREAM')
                    resolve({ success: false })
                })
            } catch (err) {
                console.log('err', err)
                resolve({ success: false })
                // return { success: false }
            }
        })
    }

    public async getInvoice(albyAddress: string, numberOfSatoshis: number): Promise<GetInvoiceResponse> {
        const ln = new LightningAddress(albyAddress)

        await ln.fetch()
        // request an invoice for 1000 satoshis
        // this returns a new `Invoice` class that can also be used to validate the payment
        const invoice = await ln.requestInvoice({
            satoshi: numberOfSatoshis,
            comment: 'A value for value payment from https://insightfulbits.com/',
        })

        const { paymentRequest, paymentHash } = invoice

        // console.log(paymentRequest) // print the payment request
        // console.log(paymentHash) // print the payment hash

        return {
            paymentRequest,
            paymentHash,
        }
    }

    public async payInvoice(paymentRequest: string) {
        console.log('will try to pay invoice' + paymentRequest)

        return new Promise((resolve) => {
            const request = {
                // dest: <bytes>,
                // amt: <int64>,
                // payment_hash: <bytes>,
                // final_cltv_delta: <int32>,
                payment_request: paymentRequest,
                timeout_seconds: 600,
                fee_limit_sat: 20,
                // outgoing_chan_id: <uint64>,
                // cltv_limit: <int32>,
                // route_hints: <RouteHint>,
                // dest_custom_records: <DestCustomRecordsEntry>,
                // amt_msat: <int64>,
                // fee_limit_msat: <int64>,
                // last_hop_pubkey: <bytes>,
                // allow_self_payment: <bool>,
                // dest_features: <FeatureBit>,
                // max_parts: <uint32>,
                // no_inflight_updates: <bool>,
                // outgoing_chan_ids: <uint64>,
                // payment_addr: <bytes>,
                // max_shard_size_msat: <uint64>,
                // amp: <bool>,
                // time_pref: <double>,
            }

            try {
                // todo: use sync method?
                const call = this.routerClient.sendPaymentV2(request)

                call.on('data', function (response: any) {
                    // A response was received from the server.
                    console.log('response', response)
                    resolve({ success: false })
                })
                call.on('status', function (status: any) {
                    // The current status of the stream.
                    console.log('status', status)
                    resolve({ success: false })
                })
                call.on('end', function () {
                    // The server has closed the stream.
                    console.log('END OF STREAM')
                    resolve({ success: false })
                })
            } catch (err) {
                console.log('err', err)
                resolve({ success: false })
                // return { success: false }
            }
        })
    }

    public async lookUpAsync(requestHash: string): Promise<any> {
        return new Promise((resolve) => {
            const paymentHash = Buffer.from(requestHash, 'hex')
            // console.log('paymentHash to test with', paymentHash)
            const request = {
                // r_hash: Buffer.from(requestHash, 'hex'),
                r_hash: paymentHash,
            }

            try {
                // todo: use sync method?
                const call = this.lnd.lookupInvoice(request)

                call.on('data', function (response: any) {
                    // A response was received from the server.
                    console.log('response', response)
                    resolve({ success: false })
                })
                call.on('status', function (status: any) {
                    // The current status of the stream.
                    console.log('status', status)
                    resolve({ success: false })
                })
                call.on('end', function () {
                    // The server has closed the stream.
                    console.log('END OF STREAM')
                    resolve({ success: false })
                })
            } catch (err) {
                console.log('err', err)
                resolve({ success: false })
                // return { success: false }
            }
        })
    }
}

export default Lightning

// todo: integrate error handling of the lightning connection
