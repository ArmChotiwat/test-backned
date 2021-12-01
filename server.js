const experss = require('express');
const app = experss();
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/login.html'));
});


//Example_3
//http://localhost:3000/get 
const Test = require('./Example_2')
app.get('/get', async (req, res) => {
    try {
        const getResult = await Test((err) => { if (err) { throw err } });

        if (!getResult) { res.status(404).end(); }
        else {
            res.status(200).json(getResult).end();
        }
    } catch (error) {
        console.error(error);
    }
});

// login 3 users
// http://localhost:3000/approve/pang/pang
// http://localhost:3000/approve/arm/arm
// http://localhost:3000/approve/tarn/tarn
const approve = require('./Example_4')
app.post('/approve/:user/:pass', async (req, res) => {
    try {        
        const username = req.params.user;
        const password = req.params.pass;      

        const sent_approve = await approve(
            {
                username: String(username),
                password: String(password)
            },
            (err) => { if (err) { throw err; } }
        );
        if (!sent_approve) { res.status(404).end(); }
        else {
            res.status(200).json(sent_approve).end();
        }
    } catch (error) {
        console.error(error);
    }
});

app.listen(3000, () => {
    console.log('Node run server 3000');
});

module.exports = app;