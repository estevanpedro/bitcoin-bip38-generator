var PORT = process.env.PORT || 3000
var bitcoin = require("bitcoinjs-lib");
var bip38 = require('bip38');
var wif = require('wif');
var bodyParser = require('body-parser');
var express = require("express");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/paperwallet', async (req, res) => {
    try {
        // key to encrypt private key using bip38
        const key = await req.body.key;

        //Create new Public Key and private Key
        let testnet = bitcoin.networks.testnet;
        var keyPair = bitcoin.ECPair.makeRandom(testnet);
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        const privateKey = keyPair.toWIF();
        
        // Transform private Key into bip38
        var decoded = wif.decode(privateKey);
        var encryptedKey = bip38.encrypt(decoded.privateKey, decoded.compressed, key);
        
        return res.json({
            "message": "New wallet (BIP38) successfully created",
            "data": {
                "address": address,
                "encryptedKey" : encryptedKey, 
                "key": key,
            },
            "created_at": Date.now(),
        });

    } catch (err) {
        return res.status(200).send({error: 'Create new wallet Error'});
    }
});

app.listen(PORT, () => {
 console.log("Server running on port 8080");
});