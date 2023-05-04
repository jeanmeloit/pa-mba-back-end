const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Token was not informed" });
  }

  jwt.verify(token, "<SECRET_KEY>", (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Expired token" });
      } else {
        return res.status(403).json({ message: "Invalid token" });
      }
    }

    req.uid = decoded.uid;

    next();
  });
};

module.exports = verifyToken;
