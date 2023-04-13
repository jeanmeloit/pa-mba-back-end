const express = require("express");
const router = express.Router();

const { v4 } = require("uuid");
const { db } = require("../firebase/firebase.js");
const collectionRef = db.collection("class");
const uuidPrefix = "CLS";

router.get("/", async (req, res) => {
  await collectionRef
    .get()
    .then((querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => doc.data());
      res.status(200).json(items);
    })
    .catch(() => res.sendStatus(500));
});

router.get("/:uuid", async (req, res) => {
  const { uuid } = req.params;
  if (!uuid) {
    return res.sendStatus(404);
  }

  const doc = await collectionRef.doc(uuid).get();

  if (!doc.exists) {
    return res.sendStatus(400);
  }

  res.status(200).send(doc.data());
});

router.post("/", async (req, res) => {
  const uuid = `${uuidPrefix}-${v4()}`;
  await collectionRef
    .doc(uuid)
    .set(
      {
        uuid,
        ...req.body,
      },
      { merge: true }
    )
    .then(() => {
      res.status(200).json({
        message: "Class created successfully",
        createdClass: req.body,
      });
    })
    .catch(() => res.sendStatus(500));
});

router.put("/:uuid", async (req, res) => {
  const { uuid } = req.params;

  await collectionRef
    .doc(uuid)
    .set(
      {
        uuid,
        ...req.body,
      },
      { merge: true }
    )
    .then(() =>
      res.status(200).json({
        message: "Class updated successfully",
        updatedClass: {
          uuid,
          ...req.body,
        },
      })
    )
    .catch(() => res.sendStatus(500));
});

router.patch("/:uuid", async (req, res) => {
  const { uuid } = req.params;

  await collectionRef
    .doc(uuid)
    .update(
      {
        ...req.body,
      },
      { merge: true }
    )
    .then(() =>
      res.status(200).json({
        message: "Class updated successfully",
      })
    )
    .catch(() => res.sendStatus(500));
});

router.delete("/:uuid", async (req, res) => {
  const { uuid } = req.params;

  await collectionRef
    .doc(uuid)
    .delete()
    .then(() =>
      res.status(200).json({
        message: "Class deleted successfully",
        deletedClass: {
          uuid,
          ...req.body,
        },
      })
    )
    .catch(() => res.sendStatus(500));
});

module.exports = router;
