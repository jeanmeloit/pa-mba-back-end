const express = require("express");
const router = express.Router();

const { v4 } = require("uuid");
const { db } = require("../firebase/firebase.js");
const collectionRef = db.collection("checkin");
const uuidPrefix = "CKN";


router.get("/", async (req, res) => {
  const { classUuid, date } = req.query;

  try {
    const querySnapshot = await db
      .collection("checkin")
      .where("classRef", "==", db.collection("class").doc(classUuid))
      .where("date", "==", date)
      .get();

    const studentRefs = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      studentRefs.push(data.personRef);
    });

    // Busca os alunos pelos objetos obtidos na query anterior
    const getStudentsPromises = studentRefs.map((studentRef) => {
      return studentRef.get();
    });

    const docs = await Promise.all(getStudentsPromises);

    const students = docs.map((doc) => doc.data());

    res.status(200).send(students);
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

router.post("/", async (req, res) => {
  const uuid = `${uuidPrefix}-${v4()}`;

  const studentRef = db.collection("person").doc(req.body.personUuid);
  const classRef = db.collection("class").doc(req.body.classUuid);

  await collectionRef
    .doc(uuid)
    .set(
      {
        uuid,
        date: req.body.date,
        personRef: studentRef,
        classRef: classRef,
      },
      { merge: true }
    )
    .then(() => {
      res.status(200).json({
        message: "Checkin registered successfully",
        createdClass: req.body,
      });
    })
    .catch(() => res.sendStatus(500));
});

router.delete("/:uuid", async (req, res) => {
  const { uuid } = req.params;

  await collectionRef
    .doc(uuid)
    .delete()
    .then(() =>
      res.status(200).json({
        message: "Checkin deleted successfully",
        deletedClass: {
          uuid,
          ...req.body,
        },
      })
    )
    .catch(() => res.sendStatus(500));
});

module.exports = router;
