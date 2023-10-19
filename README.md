# tip me

An app to facilitate lightning payments to a predefined address.
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

- lightning connection
- send some basic node state to the client

### some errors to test against

- node starting up
- dns failure (on wrong network)
