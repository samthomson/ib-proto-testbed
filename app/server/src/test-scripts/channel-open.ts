import { Lightning } from '../lightning'

const main = async () => {
    console.log('test opening a channel?')
    const lightning = Lightning.getInstance()

    const channelOpenAttempt = await lightning.openChannel(100001)
}

main()
