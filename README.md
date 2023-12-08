# a test bed to play around with some btc-lightning flows

Testbed repo to work through some flows.
It works by connecting to a local lightning node via the gRPC interface. A react front end talks to the backend via websockets.

## set up

Add these things:

- app/server/lnd/invoice.macaroon
- app/server/lnd/invoices.proto
- app/server/lnd/lightning.proto
- app/server/lnd/tls.cert

`docker-compose build`
`docker-compose run app sh` then `cd server && yarn && cd ../client && yarn`

`docker-compose up`

## todo

- [x] btc -> lightning, eg opening a channel
- [x] lightning: pay an alby LN address
- [x] lightning: pay a non-alby LN address (stackernews, and some actual wallets)
- [?] lightning: URL payment?
- [ ] lightning: generate a withdrawal invoice (phoenix)
- [ ] top up lightning channel. close and create new?
