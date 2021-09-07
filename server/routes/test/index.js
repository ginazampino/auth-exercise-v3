const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: '/test/'});
});

// Check for blank email and/or password.
function validate(formData) {
    let validated = null;

    let validEmail = typeof formData.email == 'string' && formData.email.trim() != '';
    let validPassword = typeof formData.password == 'string' && formData.password.trim() != '';

    if (validEmail && validPassword) {
        validated = true;
        return validated; 
    } else {
        validated = false;
        return validated;
    }
};

router.post('/test', (req, res) => {
    if (validate(req.body)) {
        console.log('Validated registration form data.');
        res.json({ message: 'Valid' });
    } else {
        console.log('Registration form data is invalid.');
        res.json({ message: 'Invalid' });
    };
});

module.exports = router;