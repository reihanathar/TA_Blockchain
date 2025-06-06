const express = require("express");
const bodyParser = require("body-parser");
const newsRoutes = require("./routes/news");
require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use("/api/news", newsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
