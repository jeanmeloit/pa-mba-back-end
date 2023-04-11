const express = require("express");
const router = express.Router();

const { v4 } = require("uuid");
const { db } = require("../firebase/firebase.js");
const collectionRef = db.collection("person");
const uuidPrefix = "PRS";

router.get("/", async (req, res) => {
  await collectionRef
    .get()
    .then((querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => doc.data());
      res.status(200).json(items);
    })
    .catch(() => res.sendStatus(500));
});

router.get("/:id", async (req, res) => {
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

router.post("/", async (req, res) => {
  const id = `${uuidPrefix}-${v4()}`;
  await collectionRef
    .doc(id)
    .set(
      {
        id: id,
        ...req.body,
      },
      { merge: true }
    )
    .then(() => {
      res.status(200).json({
        message: "Person created successfully",
        createdPerson: req.body,
      });
    })
    .catch(() => res.sendStatus(500));
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;

  await collectionRef
    .doc(id)
    .set(
      {
        id,
        ...req.body,
      },
      { merge: true }
    )
    .then(() =>
      res.status(200).json({
        message: "Person updated successfully",
      })
    )
    .catch(() => res.sendStatus(500));
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;

  await collectionRef
    .doc(id)
    .update(
      {
        ...req.body,
      },
      { merge: true }
    )
    .then(() =>
      res.status(200).json({
        message: "Person updated successfully",
      })
    )
    .catch(() => res.sendStatus(500));
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await collectionRef
    .doc(id)
    .delete()
    .then(() =>
      res.status(200).json({
        message: "Person deleted successfully",
      })
    )
    .catch(() => res.sendStatus(500));
});

module.exports = router;
