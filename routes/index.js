const path = require('path')

const express = require('express');

const router = express.Router();

router.get("/", (req, res, next) => {

    res.sendFile(path.join(__dirname, '..', 'models', 'admin.html'));
});

router.get("/users", (req, res, next) => {

    res.sendFile(path.join(__dirname, '..', 'models', 'users.html'));
});

module.exports = router