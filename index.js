```js
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

async function startSocket() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const { version } = await fetchLatestBaileysVersion();
  const store = makeInMemoryStore({});

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    browser: ['DarksrBot', 'Chrome', '1.0.0']
  });

  store.bind(sock.ev);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, pairingCode } = update;

    if (connection === 'open') {
      console.log('Connected to WhatsApp!');
    }

    if (pairingCode) {
      console.log(`Pairing Code: ${pairingCode}`);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error = Boom)?.output?.statusCode !== 401;
      if (shouldReconnect) {
        startSocket();
      }
    }
  });
}

startSocket();

app.get('/', (req, res) => {
