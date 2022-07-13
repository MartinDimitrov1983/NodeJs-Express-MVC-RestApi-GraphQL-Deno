const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

const products = [];

// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
  // Pug
  // res.render('add-product', { pageTitle: 'Add product', path: "/admin/add-product" })
  // Handlebars
  // res.render('add-product', { pageTitle: 'Add product', formCss: true, productCss: true, addProductPage: true,  })
  res.render('add-product', { pageTitle: 'Add product', path: "/admin/add-product" })
});

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect('/');
});

exports.routes = router;
exports.products = products;
