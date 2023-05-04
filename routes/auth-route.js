const express = require("express");
const router = express.Router();
const { db } = require("../firebase/firebase.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const collectionRef = db.collection("person");
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  collectionRef
    .where("mail", "==", email)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        res.status(403).json({ message: "User not found" });
        throw new Error("User not found");
      }
      const user = querySnapshot.docs[0];

      return compare(user.data(), password, res);
    });
});

const compare = async (user, password, res) => {
  bcrypt
    .compare(password, user.password)
    .then((passwordMatches) => {
      console.log(passwordMatches);
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

router.post("/signup", (req, res) => {
  const user = req.body;

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      res.status(500).json({ message: "Internal server error" });
    } else {
      user.password = hash;
      db.collection("users")
        .doc(user.email)
        .set(user)
        .then(() => {
          res.status(200).json({ message: "User created successfully!" });
        })
        .catch((error) => {
          res.status(500).json({ message: "Internal server error" });
        });
    }
  });
});

module.exports = router;
