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

router.post('/sign-up', (req, res) => {
    if (validate(req.body)) {
        console.log('Validated registration form data.');
        res.json({ message: 'Valid' });
    } else {
        console.log('Registration form data is invalid.');
        res.json({ message: 'Invalid' });
    };
});

module.exports = router;



// app.post('/debug/login', async (req, res) => {
//     const validationResult = validateLogin(req.body);
//     const email = (req.body.email);
//     const password = (req.body.password);

//     async function validateUser(result) {
//         if (result == true) {
//             const user = await User.query().where('userEmail', email).first();
//             console.log(user)


//             // const email = user[0].userEmail;
//             // const password = user[0].userPassword;

//             // const comparison = await bcrypt.compare(email, password)
//             //     .then((result) => { return result; })
//             //     .catch((err) => {
//             //         throw err;
//             //     });

//             // return comparison;
//         } else {
//             return 'Not valid'
//         }
//     }

//     validateUser(validationResult)
    
//     // let confirmation = confirmPassword();
//     // console.log(confirmation);

//     res.send('OK')
//     // 
//     // let matched = null;

//     // if (validated) {
//     //     const user = await User.query().where('userEmail', req.body.email);
//     //     const email = user[0].userEmail;
//     //     const password = user[0].userPassword;
//     //     const match = await bcrypt.compare(email, password)
//     //         .then((result) => { return result; });
        
//     //     matched = match;
//     // };

//     // if (matched) {
//     //     console.log('A match')
//     //     res.send('OK')
//     // }

//     //     bcrypt.compare(email, password)
//     //         .then((result) => { // Log result to see boolean.
//     //             if (result) {
//     //                 console.log('User ID: ' + user[0].id);
                    
//     //                 res.cookie('userId', user[0].id, {
//     //                     httpOnly: true,
//     //                     signed: true,
//     //                     // secure: true
//     //                 });
//     //             } else {
//     //                 res.send('BAD') // Password doesn't match.
//     //             };
//     //         });
//     // } else {
//     //     res.json('Failed');
//     // };
// });
