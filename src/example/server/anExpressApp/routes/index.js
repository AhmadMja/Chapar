const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  setTimeout(() => {
    res.setHeader('header-name-1', 'header-value-1');
    res.header('header-name-2', 'header-value-2');
    res.status(200).json({ data: 'this is a data in json format' });
  }, 1000);
});

router.post('/echo', (req, res) => {
  setTimeout(() => {
    res.set(req.headers);
    res.status(200).json(req.body);
  }, 1000);
});

router.get('/corrupted-response', (req, res) => {
  setTimeout(() => {
    try {
      res.status('AN_INVALID_STATUS_CODE').json('a non-json response');
    } catch (err) {
      res.status(500).json(err);
    }
    res.status(200).json({ data: 'this route should not return 200 code' });
  }, 1000);
});

module.exports = router;
