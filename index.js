const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
const contractABI = [/* Paste the ABI here */];
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);
const privateKey = process.env.PRIVATE_KEY;
const account = process.env.ACCOUNT_ADDRESS;

// Middleware for Error Handling
app.use((err, req, res, next) => {
    res.status(500).send({ error: err.message });
});

// 1. Get Current News
app.get('/news/current', async (req, res) => {
    try {
        const news = await contract.methods.getCurrentNews().call();
        res.json({
            title: news.title,
            source: news.source,
            realVotes: news.realVotes,
            fakeVotes: news.fakeVotes,
            timestamp: news.timestamp,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Vote (Real or Fake)
app.post('/news/vote', async (req, res) => {
    const { isReal } = req.body;
    if (typeof isReal !== 'boolean') {
        return res.status(400).json({ error: 'isReal must be a boolean value.' });
    }

    try {
        const data = contract.methods.vote(isReal).encodeABI();

        const tx = {
            from: account,
            to: contractAddress,
            gas: 2000000,
            data: data,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        res.json({ status: 'success', receipt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Set New News
app.post('/news', async (req, res) => {
    const { title, source, durationInMinutes } = req.body;
    if (!title || !source || !durationInMinutes) {
        return res.status(400).json({ error: 'Missing required fields: title, source, durationInMinutes.' });
    }

    try {
        const data = contract.methods.setNewNews(title, source, durationInMinutes).encodeABI();

        const tx = {
            from: account,
            to: contractAddress,
            gas: 2000000,
            data: data,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        res.json({ status: 'success', receipt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
