const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-help");
const userHelper = require("../helpers/user-help");
const { route } = require("./admin");
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
    console.log(req.session + "   ");
  }

  productHelper.getAllproducts().then((products) => {
    res.render("user/view-products", { products, user, cartCount });
  });
});
router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    let loginErr = req.session.loginErr;
    res.render("user/login", { loginErr });
    req.session.loginErr = false;
  }
});
router.get("/signup", (req, res) => {
  res.render("/signup");
});
router.post("/signup", (req, res) => {
  console.log(req.body);
  userHelper
    .doSignup(req.body)
    .then((response) => {
      console.log(response + " <=           <>This is Response");
      req.session.user = response;
      req.session.loggedIn = true;
      res.redirect("/");
    })
    .catch((error) => {
      return res.status(400).send(error.message);
    });
});
router.post("/login", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.userInfo;
      res.redirect("/");
    } else {
      req.session.loginErr = "Invalid Username or Password";
      res.redirect("/login");
    }
  });
});
router.get("/logout", (req, res) => {
  req.session.user=null
  res.redirect("/");
});
router.get("/cart", verifyLogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id);
  let toatalValue=0
  if(products.length>0){
           toatalValue = await userHelper.getTotalAmount(req.session.user._id);
  }
  const user = req.session.user._id;
  // console.log(user,"aslkdfjksak");
  console.log("$%$", req.session.user._id);
  console.log(products);
  res.render("user/cart", { products, user, toatalValue });
});
router.get("/add-to-cart/:id", (req, res) => {
 
  userHelper.addTOCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});
router.post("/change-product-quantity", (req, res, next) => {
  console.log(req.body);
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.body.user)
    
    res.json(response)
  })
});
router.get("/place-order", verifyLogin, async (req, res) => {
  let total = await userHelper.getTotalAmount(req.session._id);
  res.render("user/placeholder", { total,user:req.session.user });
});
router.post('/place-order',async(req,res)=>{
  let products=await userHelper.getCartProductList(req.body.userId)
  let totalPrice=await userHelper.getTotalAmount(req.body.userId)
  console.log(totalPrice, "totalPricetotalPrice");
  userHelper.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    console.log(orderId);
    console.log(req.body['payment-method'] , "req.body['payment-method']");
    if(req.body['payment-method']=='COD'){
      return res.json({cod_success:true})
    }else{
      userHelper.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
    
  })
  console.log(req.body);
})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
  let orders=await userHelper.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelper.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
      console.log("Payment Succefull");
    })
  }).catch((err)=>{
    console.log(err,"error Occured++++++++++++++++++");
    res.json({status:false,errMsg:''})
  })
})
router.get('/remove-product/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId,"prodid<--------------------->?<____________>")
  userHelper.removeProductFromCart(proId).then((response)=>{
    res.redirect('/')
  })
})
module.exports = router;
