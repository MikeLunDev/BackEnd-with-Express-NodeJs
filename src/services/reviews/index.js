const express = require("express");
const fs = require("fs");
const router = express.Router();
const shortid = require("shortid");
const path = require("path");

const loadFromDisk = () =>
  JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../reviews.json"), "utf8", err => {
      if (err) throw err;
    })
  );

router.get("/", (request, response) => {
  const allReviews = loadFromDisk();
  response.send(
    allReviews.length > 0 ? allReviews : "There are still no reviews"
  );
});

router.get("/:id", (request, response) => {
  var reviews = loadFromDisk();
  var reviewsFromID = reviews.filter(
    rev => rev.elementId === request.params.id
  );
  if (!reviewsFromID) response.send("No Reviews Yet... ");
  else response.send(reviewsFromID);
});

router.delete("/:id", (request, response) => {
  var reviewsDB = loadFromDisk();
  var toDelete = reviewsDB.find(item => item._id === request.params.id);
  if (toDelete) {
    var reviewToKeep = reviewsDB.filter(rev => rev._id !== request.params.id);
    fs.writeFileSync(
      path.join(__dirname, "../../reviews.json"),
      JSON.stringify(reviewToKeep)
    );
    response.send("Deleted", reviewToKeep);
  } else response.status(404).send("not found");
});

router.post("/", (request, response) => {
  var allReviews = loadFromDisk();
  var reqBody = request.body;
  reqBody._id = shortid.generate();
  reqBody.createdAt = new Date();
  allReviews.push(reqBody);
  fs.writeFileSync(
    path.join(__dirname, "../../reviews.json"),
    JSON.stringify(allReviews)
  );
  response.send(allReviews);
});

router.put("/:id", (request, response) => {
  var reviewsDB = loadFromDisk();
  var toModify = reviewsDB.find(rev => rev._id === request.params.id);
  if (toModify) {
    var newDb = reviewsDB.filter(x => x._id !== request.params.id); //removing previous item
    var review = request.body;
    review._id = request.params.id;
    review.createdAt = new Date();
    review.elementId = toModify.elementId;
    newDb.push(review); //adding new item
    fs.writeFileSync(
      path.join(__dirname, "../../reviews.json"),
      JSON.stringify(newDb)
    );
    response.send(newDb);
  } else response.status(404).send("not found");
});

module.exports = router;
