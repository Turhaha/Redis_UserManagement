const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

//Create Redis Client
let client = redis.createClient();

client.on('connect', () => {
    console.log("Connected to Redis ... ");
});

// Set Port
const port = 3000;

// Init app
const app = express();

// View Engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// body-bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// methodOverride
app.use(methodOverride('_method'));

// Search page
app.get('/', (req, res, next) => {
    res.render('searchusers');
});

// Search processing
app.post('/user/search', (req, res, next) => {
    let id = req.body.id;

    client.hgetall(id, (err, obj) => {
        if (!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            })
        }
    })
});

// Add User page
app.get('/user/add', (req, res, next) => {
    res.render('adduser');
});

// Process Add User page
app.post('/user/add', (req, res, next) => {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], (err, replay) => {
        if (err) {
            console.log(err);
        }
        console.log(replay);
        res.redirect('/');
    })
});

// Delete User
app.delete('/user/delete/:id', (req, res, next) => {
    client.del(req.params.id);
    res.redirect('/');
})

app.listen(port, () => {
    console.log('Server start on port ' + port);
});
