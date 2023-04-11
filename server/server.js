const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT ?? 3000;

const personRoutes = require("../routes/person-route");

app.use(cors({ credentials: true }));

app.use(express.json());

app.use("/person", personRoutes);

app.get("/", function (req, res) {
  res.status(200).send("Working!");
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
