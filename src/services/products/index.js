const express = require("express");
const fs = require("fs");
const path = require("path");
const shortid = require("shortid");
const router = express.Router();
const multer = require("multer");

const loadFromDisk = () =>
  JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../products.json"),
      "utf8",
      err => {
        if (err) throw err;
      }
    )
  );

router.post("/", (req, res) => {
  var allProducts = loadFromDisk();
  var newProduct = req.body;
  newProduct._id = shortid.generate();
  newProduct.createdAt = new Date();
  newProduct.updatedAt = new Date();
  newProduct.imageUrl = "";
  allProducts.push(newProduct);
  fs.writeFileSync(
    path.join(__dirname, "../../products.json"),
    JSON.stringify(allProducts)
  );
  res.send("Added");
});

router.get("/", (req, res) => {
  const allProducts = loadFromDisk();
  res.send(allProducts.length > 0 ? allProducts : "There are no products");
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  var allProducts = loadFromDisk();
  var filteredByID = allProducts.find(item => item._id.toString() === id);
  var indexToChange = allProducts.findIndex(item => item._id.toString() === id);
  if (indexToChange != -1) {
    var creationDate = filteredByID.createdAt;
    var myID = filteredByID._id;
    var imageUrl = filteredByID.imageUrl;
    var { name, brand, price, category, description } = req.body;
    allProducts[indexToChange] = {
      _id: myID,
      name,
      brand,
      price,
      category,
      description,
      imageUrl: imageUrl,
      createdAt: creationDate,
      updatedAt: new Date()
    };
    fs.writeFileSync(
      path.join(__dirname, "../../products.json"),
      JSON.stringify(allProducts)
    );
    res.send(`Item ${id} updated at ${new Date()}`);
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const allProducts = loadFromDisk();
  var filteredByID = allProducts.find(item => item._id.toString() === id);
  if (filteredByID) {
    var invariantItems = allProducts.filter(item => item._id.toString() !== id);
    fs.writeFileSync(
      path.join(__dirname, "../../products.json"),
      JSON.stringify(invariantItems)
    );
    res.send(`Item ${id} deleted`);
  } else res.status(404).send("Not Found");
});

//FILE UPLOAD
const imgFolder = path.join(__dirname, "../../public/imgs");
const upload = multer({
  limits: {
    fileSize: 20000000
  }
});

router.post("/upload/:id", upload.single("prod_picture"), (req, res) => {
  var fullUrl = req.protocol + "://" + req.get("host") + "/image/";
  var ext = req.file.originalname.split(".").reverse()[0];
  if (ext !== "png" && ext !== "jpg" && ext !== "gif" && ext !== "jpeg") {
    res.status(400).send("only images allowed");
  } else {
    var fileName = req.params.id + "." + ext;
    var path = "./public/imgs/" + fileName;
    fs.writeFile(path, req.file.buffer, err => {
      if (err) throw err;
    });
    //modify the products
    var allProducts = loadFromDisk();
    var productToUpdate = allProducts.find(prod => prod._id === req.params.id);
    var allProducts = allProducts.filter(prod => prod._id !== req.params.id);
    productToUpdate.imageUrl = fullUrl + fileName;
    allProducts.push(productToUpdate);
    console.log(__dirname);
    fs.writeFileSync("./src/products.json", JSON.stringify(allProducts));
    res.send("Uploaded");
  }
});

module.exports = router;
