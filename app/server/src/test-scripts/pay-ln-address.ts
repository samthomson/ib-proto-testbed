import { Lightning } from '../lightning'

const main = async () => {
    console.log('testpaying an address')
    const lightning = Lightning.getInstance()

    // const lightningAddress = 'brokenvoice65881@getalby.com'
    // const lightningAddress = 'contentday13@walletofsatoshi.com'
    const lightningAddress = 'exploring_skintight367@stacker.news'

    const payAddressAttempt = await lightning.getInvoice(lightningAddress, 1002)

    console.log('payAddressAttempt', payAddressAttempt)

    await lightning.payInvoice(payAddressAttempt.paymentRequest)
}

const checkInv = async () => {
    const lightning = Lightning.getInstance()
    await lightning.lookUpAsync('451abfcbe20891ae4120eeb9bd27d17c0f393043e22383e77e0a46fa8e2cac39')
}

main()
// checkInv()

// 00c9413562fc78c90577589b2175e45a475f1dc826da8fd08bf3f98dee7d618e
