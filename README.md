# lcu-connector
Streamlined LCU integration for your app.

This connector automatically retrieves the credentials for the API that starts when the new League of Legends client is launched.

To find out more about how the new client works check out the [Riot Games engineering blog](https://engineering.riotgames.com/news/architecture-league-client-update)

For the LCU API documentation check out [Rift explorer](https://github.com/Pupix/rift-explorer)

## Download
lcu-connector is installable via:

- [GitHub](https://github.com/Pupix/lcu-connector) `git clone https://github.com/Pupix/lcu-connector.git`
- [yarn](https://yarnpkg.com/): `yarn add lcu-connector`
- [npm](https://www.npmjs.com/): `npm install lcu-connector`

## Usage example

```js
const LCUConnector = require('lcu-connector');
const connector = new LCUConnector();

connector.on('connect', (data) => {
    console.log(data);
    //  {
    //    address: '127.0.0.1'
    //    port: 18633,
    //    username: 'riot',
    //    password: H9y4kOYVkmjWu_5mVIg1qQ,
    //    protocol: 'https'
    //  }
});

// Start listening for the LCU client
connector.start();

```

## Available methods

### constructor (executablePath)

Creates a new lcu-connector.

**Parameters**

1. **[executablePath] {string}** A path to where the LeagueClient executable resides. If not passed it will be automatically figured out from the OS process list.

### start()

Starts listening for the LCU client.

### stop()

Stops the connector.

## Events

### connect

Fired when the connection to the LCU client is established

### disconnect

Fired when the connection to the LCU client is closed


