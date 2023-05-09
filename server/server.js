const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT ?? 3000;
const allowedOrigins = ["http://localhost:3570", "https://panther-checkin-control.web.app"];

const verifyToken = require("../middlewares/jwt-check");

const authRoutes = require("../routes/auth-route");
const userRoutes = require("../routes/user-route");
const personRoutes = require("../routes/person-route");
const classRoutes = require("../routes/class-route");
const checkinRoutes = require("../routes/checkin-route");

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", verifyToken);
app.use("/user", userRoutes);
app.use("/person", verifyToken);
app.use("/person", personRoutes);
app.use("/class", verifyToken);
app.use("/class", classRoutes);
app.use("/checkin", verifyToken);
app.use("/checkin", checkinRoutes);

app.get("/", function (req, res) {
  res.status(200).send("Working!");
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
