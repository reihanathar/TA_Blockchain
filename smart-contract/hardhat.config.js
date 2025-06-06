require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

module.exports = {
    solidity: "0.8.0",
    networks: {
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        }
    }
};