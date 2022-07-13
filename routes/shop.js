const path = require('path');

const express = require('express');

const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
  const products = adminData.products
  //Pug
  //res.render('shop', { products, pageTitle: 'Products', path: "/" });

  //Handlebars
  // res.render('shop', { products, pageTitle: 'Products', hasProducts: products.length > 0, shopPage: true, productCss: true });

  // Ejs
  res.render('shop', { products, pageTitle: 'Products', path: "/" });
});

module.exports = router;
