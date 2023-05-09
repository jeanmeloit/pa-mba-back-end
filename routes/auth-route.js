const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { v4 } = require("uuid");
const { db } = require("../firebase/firebase.js");
const collectionRef = db.collection("user");
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  collectionRef
    .where("email", "==", email)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        res.status(403).json({ message: "User not found" });
        throw new Error("User not found");
      }
      const user = querySnapshot.docs[0];

      // const passwordBytes = Buffer.from(password, "base64");

      return compare(user.data(), password, res);
    });
});

const compare = async (user, password, res) => {
  bcrypt
    .compare(password, user.password)
    .then((passwordMatches) => {
      if (!passwordMatches) {
        res.status(403).json({ message: "Invalid credentials" });
        throw new Error("Invalid credentials");
      }

      const token = jwt.sign(
        {
          uid: user.uuid,
          email: user.email,
        },
        "<SECRET_KEY>",
        { expiresIn: "15m" }
      );

      const userData = {
        ...user,
        token,
      };

      res.json({ data: userData });
    })
    .catch((error) => {
      console.error(error);
      res.status(403).json({ message: "Invalid credentials" });
    });
};

router.post("/signup", async (req, res) => {
  try {
    const userUuid = `USR-${v4()}`;
    const personUuid = `PRS-${v4()}`;

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const canAccessTill = new Date();
    canAccessTill.setDate(canAccessTill.getDate() + 2);

    const user = {
      uuid: userUuid,
      ...req.body,
      password: hashedPassword,
      accessLevel: "GUEST",
      canAccessTill: canAccessTill.toISOString(),
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

module.exports = router;
