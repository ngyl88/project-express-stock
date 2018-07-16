const express = require('express');

const router = express.Router();

router.use('/', (req, res, next) => {
    res.json({ message: 'Hello from Stock API!' });
});

module.exports = router;