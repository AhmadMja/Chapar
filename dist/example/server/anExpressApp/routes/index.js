"use strict";

var express = require('express');

var router = express.Router();
router.get('/', function (req, res) {
  setTimeout(function () {
    res.setHeader('header-name-1', 'header-value-1');
    res.header('header-name-2', 'header-value-2');
    res.status(200).json({
      data: 'this is a data in json format'
    });
  }, 1000);
});
router.post('/echo', function (req, res) {
  setTimeout(function () {
    res.set(req.headers);
    res.status(200).json(req.body);
  }, 1000);
});
router.get('/corrupted-response', function (req, res) {
  setTimeout(function () {
    try {
      res.status('AN_INVALID_STATUS_CODE').json('a non-json response');
    } catch (err) {
      res.status(500).json(err);
    }

    res.status(200).json({
      data: 'this route should not return 200 code'
    });
  }, 1000);
});
module.exports = router;