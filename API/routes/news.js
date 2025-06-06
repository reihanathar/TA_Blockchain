const express = require("express");
const { ethers } = require("ethers");
const router = express.Router();
require("dotenv").config();
const contractABI = require("../abi/contractABI.json");

// Konfigurasi Ethers.js
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

// Endpoint: Get Current News
router.get("/current-news", async (req, res) => {
  try {
    const news = await contract.getCurrentNews();
    res.json({
      title: news.title,
      source: news.source,
      realVotes: news.realVotes.toString(),
      fakeVotes: news.fakeVotes.toString(),
      timestamp: news.timestamp.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Vote
router.post("/vote", async (req, res) => {
  const { isReal } = req.body;
  if (typeof isReal !== "boolean") {
    return res.status(400).json({ error: "isReal must be a boolean" });
  }

  try {
    const tx = await contract.vote(isReal);
    await tx.wait();
    res.json({ message: "Vote submitted successfully", txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Set New News
router.post("/set-news", async (req, res) => {
  const { title, source, durationInMinutes } = req.body;
  if (!title || !source || !durationInMinutes) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const tx = await contract.setNewNews(title, source, durationInMinutes);
    await tx.wait();
    res.json({ message: "News set successfully", txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/remaining-time', async (req, res) => {
  try {
    const remainingTime = await contract.getRemainingTime();
    res.json({ remainingTime: remainingTime.toString() }); // dalam detik
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route GET voting status (active or not)
router.get('/status', async (req, res) => {
  try {
    const isActive = await contract.getVotingStatus();
    res.json({ isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route POST end voting
router.post('/end', async (req, res) => {
  try {
    const tx = await contract.endVoting();
    await tx.wait();

    res.json({ message: "Voting ended successfully", txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
