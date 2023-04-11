const express = require("express");

const { v4 } = require("uuid");
const { db } = require("../firebase/firebase.js");

const collectionRef = db.collection("person");
const uuidPrefix = "PRS";

const app = express();
const port = 3000;

app.use(express.json());

// const personRouter = require("../routes/person");
// app.use("/person", personRouter);

app.get("/", (req, res) => {
  res.send("Hey you!");
});

app.get("/person", async (req, res) => {
  const ref = collectionRef.doc();
  const doc = await ref.get();

  if (!doc.exists) {
    return res.sendStatus(400);
  }

  res.status(200).send(doc.data());
});

app.get("/person/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.sendStatus(404);
  }

  const doc = await collectionRef.doc(id).get();

  if (!doc.exists) {
    return res.sendStatus(400);
  }

  res.status(200).send(doc.data());
});

app.post("/person", async (req, res) => {
  const id = `${uuidPrefix}-${v4()}`;
  const action = await collectionRef
    .doc(id)
    .set(
      {
        id: id,
        ...req.body,
      },
      { merge: true }
    )
    .then(() => {
      res.status(200).send();
    })
    .catch(() => res.sendStatus(500));
});

app.put("/person/:id", async (req, res) => {
  const { id } = req.params;

  const action = await collectionRef
    .doc(id)
    .set(
      {
        id,
        ...req.body,
      },
      { merge: true }
    )
    .then(() => res.status(200).send())
    .catch(() => res.sendStatus(500));
});

app.patch("/person/:id", async (req, res) => {
  const { id } = req.params;

  const action = await collectionRef
    .doc(id)
    .update(
      {
        ...req.body,
      },
      { merge: true }
    )
    .then(() => res.status(200).send())
    .catch(() => res.sendStatus(500));
});

app.delete("/person/:id", async (req, res) => {
  const { id } = req.params;

  const action = await collectionRef
    .doc(id)
    .delete()
    .then(() => res.status(200).send())
    .catch(() => res.sendStatus(500));
});

app.listen(port, () => {
  console.log("Server listening on port 3000");
});
