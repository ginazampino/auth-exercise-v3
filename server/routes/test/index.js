const express = require('express');
const router = express.Router();

// Route: /test

router.get('/', (req, res) => {
    res.json({ message: '/test/'});
});

router.post('/sign-up', (req, res) => {
    res.json({ message: '/test/sign-up' })
});

module.exports = router;