var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-help");
const verifyLogin = (req, res, next) => {
  if (req.session.admin.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET users listing. */
router.get("/", function (req, res, next) {
  productHelper.getAllproducts().then((products) => {
    // console.log(products);
    res.render("admin/view-products", { admin: true, products });
  });
});
router.get("/add-product", (req, res) => {
  res.render("admin/add-product", { admin: true });
});
router.post("/add-product", (req, res) => {
  console.log(req.body);
  console.log(req.files.Image);

  productHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    console.log(id);
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.render("admin/add-product");
      } else {
        console.log(err);
      }
    });
  });
});
router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;
  console.log(proId);
  productHelper.deleteProduct(proId).then((response) => {
    res.redirect("/admin/");
  });
});
router.get("/edit-product/:id", async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id);
  console.log(product);

  res.render("admin/edit-product", { product,admin: true });
});
router.post("/edit-product/:id", (req, res) => {
  console.log(req.params.id);
  productHelper.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files.Image) {
      let image = req.files.Image;
      let id = req.params.id;
      image.mv("./public/product-images/" + id + ".jpg");
    }
  });
});
router.get("/login", (req, res) => {
  if (req.session.admin) {
    res.redirect("/");
  } else {
    let adminloginErr = req.session.adminloginErr;
    res.render("user/login", { adminloginErr });
    req.session.user.loginErr = false;
  }
});
router.get("/login", (req, res) => {
  if (req.session.admin) {
    res.redirect("/");
  } else {
    let userloginErr = req.session.adminloginErr;
    res.render("admin/login", { adminloginErr });
    req.session.admin.loginErr = false;
  }
});
module.exports = router;
