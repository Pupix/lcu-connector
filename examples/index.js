const LCUConnector = require('../lib');

const connector = new LCUConnector();

connector.on('connect', data => {
    console.log('League Client has started', data);
});

connector.on('disconnect', () => {
    console.log('League Client has been closed');
});

// Start listening for the LCU client
connector.start();
console.log('Listening for League Client');
