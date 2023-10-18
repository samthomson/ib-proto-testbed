# tip me

An app to facilitate lightning payments to a predefined address.
It works by connecting to a local lightning node via the gRPC interface. A react front end talks to the backend via websockets.

## set up

`docker-compose build`
`docker-compose run app sh` then `cd server && yarn && cd ../client && yarn`

## todo

### some errors to test against

- node starting up
- dns failure (on wrong network)
