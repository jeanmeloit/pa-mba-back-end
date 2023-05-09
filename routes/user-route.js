const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const { v4 } = require("uuid");
const { db } = require("../firebase/firebase.js");
const collectionRef = db.collection("user");
const uuidPrefix = "USR";

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
  try {
    const userUuid = `${uuidPrefix}-${v4()}`;
    const personUuid = `PRS-${v4()}`;

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = {
      uuid: userUuid,
      ...req.body,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      personUuid: `person/${personUuid}`,
    };

    await collectionRef.doc(userUuid).set(user, { merge: true });

    const person = {
      uuid: personUuid,
      name: req.body.name,
      phone: req.body.phone,
      age: req.body.age,
      email: req.body.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userUuid: `user/${userUuid}`,
    };

    await db.collection("person").doc(personUuid).set(person, { merge: true });

    res.status(200).json({
      message: "User created successfully",
      createdUser: user,
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.put("/:uuid", async (req, res) => {
  const { uuid } = req.params;

  const user = {
    uuid,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  if (req.body.password) {
    const hashedPassword = bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
  }

  await collectionRef
    .doc(uuid)
    .set(user, { merge: true })
    .then(() =>
      res.status(200).json({
        message: "User updated successfully",
        updatedUser: {
          uuid,
          ...req.body,
          updatedAt: new Date().toISOString(),
        },
      })
    )
    .catch(() => res.sendStatus(500));
});

router.patch("/:uuid", async (req, res) => {
  const { uuid } = req.params;

  const user = {
    uuid,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  if (req.body.password) {
    const hashedPassword = bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
  }

  await collectionRef
    .doc(uuid)
    .set(user, { merge: true })
    .then(() =>
      res.status(200).json({
        message: "User updated successfully",
        updatedUser: {
          uuid,
          ...req.body,
          updatedAt: new Date().toISOString(),
        },
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
        message: "User deleted successfully",
        deletedUser: {
          uuid,
          ...req.body,
        },
      })
    )
    .catch(() => res.sendStatus(500));
});

module.exports = router;
