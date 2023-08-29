require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // Import LocalStrategy
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'helloThere', // Replace with a secret key
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://codingdatta:0Im3UvqqKkFQY2Jn@cluster143.pxbc2d7.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const employSchema = new mongoose.Schema({
    username: String,
    password: String,
    secret:String
});

// Use passport-local-mongoose plugin for authentication
employSchema.plugin(passportLocalMongoose);

const employ = mongoose.model('employ', employSchema);

passport.use(new LocalStrategy(employ.authenticate())); // Use the LocalStrategy with the employ model

passport.serializeUser(employ.serializeUser());
passport.deserializeUser(employ.deserializeUser());

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/change',function (req, res) {
    res.render('change',{error:""})
})

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    employ.register(new employ({ username: username }), password, (err, user) => {
        if (err) {
            console.error(err);
            res.redirect('/register'); // Redirect back to the registration page on error
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets'); // Redirect to the secrets page after successful registration
            });
        }
    });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/secrets', // Redirect to secrets on successful login
    failureRedirect: '/login' // Redirect to login on failed login
}));

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.error('Error logging out:', err);
        }
        console.log('Logout successful');
        res.redirect('/');
    });

});

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        // User is authenticated, render the dashboard
        res.render('secrets',{secret:req.user.secret});
    } else {
        // Redirect to the login page if the user is not authenticated
        res.redirect('/login');
    }
});

app.get('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('submit');
    } else {
        res.redirect('/login');
    }
});

app.post('/change-password',function (req, res){
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    // Check if the user is authenticated (logged in)
    if (!req.isAuthenticated()) {
        // Redirect to the login page if the user is not authenticated
        return res.redirect('/login');
    }

    // Use passport-local-mongoose to change the password
    req.user.changePassword(oldPassword, newPassword, (err) => {
        if (err) {
            console.error(err);
            // Handle the error, e.g., display an error message to the user
            return res.render('change', { error: 'Password change failed. Please try again.' });
        }
        // Password change was successful
        res.redirect('/secrets'); // Redirect to a page after successful password change
    });
});

app.post('/submit', async (req, res) => {
    if (req.isAuthenticated()) {
        const newSecret = req.body.secret;

        try {
            const user = await employ.findById(req.user._id);

            if (!user) {
                return res.redirect('/secrets');
            }

            user.secret = newSecret;
            await user.save();
            console.log("Secret saved in the database");
            res.redirect('/secrets');
        } catch (err) {
            console.error(err);
            res.redirect('/secrets');
        }
    } else {
        res.redirect('/secrets');
    }
});




app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running at port 3000');
});
