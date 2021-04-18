// Simple Express server setup to serve for local testing/dev API server

const express = require('express');
const session = require('express-session');
// var session = require('client-sessions');

const cookieParser = require('cookie-parser');

const cors = require('cors');

const bodyParser = require('body-parser');

// const DIST_DIR = './src/client';

const app = express();
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

const mongoUrl =
    'mongodb+srv://shubham:MangoDB^1234@gym-automation.rt6fz.mongodb.net/UserCredsDB?retryWrites=true&w=majority';

require('./database');
// const UserCreds = mongoose.model('user_creds');
const UserReg = mongoose.model('user_reg');
const member_reg = mongoose.model('members_reg');
const reset_pwd = mongoose.model('user_otp');
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;

app.use(bodyParser.json());

const HOST = process.env.API_HOST || 'localhost';
const PORT = process.env.API_PORT || 3002;

console.log('loading  ');

app.use(
    cors({
        origin: ['http://localhost:3001'], //frontend server localhost:8080
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true // enable set cookie
    })
);
app.use(cookieParser('process.env.SESSIONSECRET')); // any string ex: 'keyboard cat'
app.use(
    session({
        secret: 'process.env.SESSIONSECRET',
        store: new MongoStore({ mongooseConnection: db }),
        cookie: {
            maxAge: 60000,
            httpOnly: false,
            secure: false // for normal http connection if https is there we have to set it to true
        },
        resave: false,
        saveUninitialized: true
    })
);
db.on('connected', () => {
    console.log('connected to mongo');
});
db.on('error', (err) => {
    console.log('failed to mongo ', err);
});
db.on('close', () => {
    console.log('connection closed');
});
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    // res.header('Content-type','application/json; charset=UTF-8')
    next();
});
app.post('/api/v1/authentication', async (req, res) => {
    console.log('Got body:  ', req.body);
    let userFound;

    try {
        let response = await UserReg.find({ email: req.body.username });
        if (response.length > 0) {
            userFound = response[0];
            if (
                userFound.email === req.body.username &&
                userFound.password === req.body.password
            ) {
                console.log(userFound);
                req.session.username = req.body.username;
                res.statusMessage = 'Success';
                res.statusCode = 200;
                res.status(200).send({
                    message: 'Success',
                    userDetails: userFound
                });
                console.log(req.session);
            } else {
                res.statusMessage = 'Failed';
                res.status(200).send({
                    message: 'Failed'
                });
            }
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        console.log(error);
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error.message
        });
    }
});

app.post('/api/v1/getSession', (req, res) => {
    console.log('get  ', req.session);
    console.log('', JSON.stringify(req.body) + '   ' + req.session.username);
    if (req.body.username && req.session.username) {
        // if (req.body.username === req.session.username) {
        res.status(200).send({
            message: true
        });
        // }
    } else {
        res.status(200).send({
            message: false
        });
    }
});

app.post('/api/v1/logout', (req, res) => {
    console.log('get  ', req.session);
    console.log('', JSON.stringify(req.body) + '   ' + req.session.username);
    if (req.body.username && req.session.username) {
        if (req.body.username === req.session.username) {
            res.clearCookie('connect.sid');
            // db.close();
            res.status(200).send({
                message: true
            });
        }
    } else {
        res.status(200).send({
            message: false
        });
    }
});

app.post('/api/v1/userReg', async (req, res) => {
    try {
        const user = new UserReg({
            name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            dob: req.body.dob,
            password: req.body.password,
            mobile: req.body.mobile
        });
        let response = await user.save();
        console.log(response);
        if (response) {
            res.statusMessage = 'Success';
            res.statusCode = 200;
            res.status(200).send({
                message: 'Success'
            });
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error.message
        });
    }
});
app.post('/api/v1/getAllUsers', async (req, res) => {
    let response = await UserReg.find({});
    console.log(response);
    if (response.length > 0) {
        res.statusMessage = 'Success';
        res.statusCode = 200;
        res.status(200).send({
            message: 'Success',
            data: response
        });
    } else {
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed'
        });
    }
});
app.post('/api/v1/deleteUser', async (req, res) => {
    console.log(req.body);
    try {
        let response = await UserReg.findByIdAndRemove(req.body.Id);
        console.log(response);
        if (response) {
            res.statusMessage = 'Success';
            res.statusCode = 200;
            res.status(200).send({
                message: 'Success'
            });
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error.message
        });
    }
});

app.post('/api/v1/editUser', async (req, res) => {
    console.log(req.body);
    try {
        let response = await UserReg.findByIdAndUpdate(req.body.Id, {
            name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            dob: req.body.dob,
            // password: req.body.password,
            mobile: req.body.mobile
        });
        console.log(response);
        if (response) {
            res.statusMessage = 'Success';
            res.statusCode = 200;
            res.status(200).send({
                message: 'Success'
            });
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        console.log(error);
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error
        });
    }
});

app.post('/api/v1/editPassword', async (req, res) => {
    console.log(req.body);
    try {
        let response = await UserReg.findOneAndUpdate({email:req.body.email}, {
            password: req.body.password
        });
        console.log(response);
        if (response) {
            res.statusMessage = 'Success';
            res.statusCode = 200;
            res.status(200).send({
                message: 'Success'
            });
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        console.log(error);
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error
        });
    }
});
app.post('/api/v1/getLoggedInUser', async (req, res) => {
    console.log(req.body);
    try {
        let userFound;
        let response = await UserReg.find({ email: req.body.username });
        console.log(response);
        if (response.length > 0) {
            userFound = response[0];
            res.statusMessage = 'Success';
            res.statusCode = 200;
            res.status(200).send({
                message: 'Success',
                userdetails: userFound
            });
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error.message
        });
    }
});

// Member apis

app.post('/api/v1/getAllMembers', async (req, res) => {
    let response = await member_reg.find({});
    console.log(response);
    if (response.length > 0) {
        res.statusMessage = 'Success';
        res.statusCode = 200;
        res.status(200).send({
            message: 'Success',
            data: response
        });
    } else {
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed'
        });
    }
});
app.post('/api/v1/memberReg', async (req, res) => {
    try {
        console.log(req.body);
        const member = new member_reg({
            name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            dob: req.body.dob,
            mobile: req.body.mobile
        });
        let response = await member.save();
        console.log(response);
        if (response) {
            res.statusMessage = 'Success';
            res.statusCode = 200;
            res.status(200).send({
                message: 'Success'
            });
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error.message
        });
    }
});
app.post('/api/v1/editMember', async (req, res) => {
    console.log(req.body);
    try {
        let response = await member_reg.findByIdAndUpdate(req.body.Id, {
            name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            dob: req.body.dob,
            mobile: req.body.mobile
        });
        console.log(response);
        if (response) {
            res.statusMessage = 'Success';
            res.statusCode = 200;
            res.status(200).send({
                message: 'Success'
            });
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        console.log(error);
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error
        });
    }
});

app.post('/api/v1/deleteMember', async (req, res) => {
    console.log(req.body);
    try {
        let response = await member_reg.findByIdAndRemove(req.body.Id);
        console.log(response);
        if (response) {
            res.statusMessage = 'Success';
            res.statusCode = 200;
            res.status(200).send({
                message: 'Success'
            });
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error.message
        });
    }
});
const nodemailer = require('nodemailer');

app.post('/api/v1/mailReset', async (req, res) => {
    try {
        let digits = '0123456789abcdefghijklmnopqrstuvwxyz';
        let otpLength = 6;
        let otp = '';
        for (let i = 1; i <= otpLength; i++) {
            let index = Math.floor(Math.random() * digits.length);
            otp = otp + digits[index];
        }
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mukulmahawariya11@gmail.com',
                pass: '84515481'
            }
        });

        let mailOptions = {
            from: 'mukulmahawariya11@gmail.com',
            to: 'mukulknight@gmail.com',
            // ,shubhamkanungo95@gmail.com
            subject: 'Sending Email using Node.js',
            text: 'Otp to reset password  ' + otp
        };

        transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                console.log(req.body.email);
                const reset = new reset_pwd({
                    otp: otp,
                    userEmail: req.body.email,
                });
                let response = await reset.save();
                console.log(response);
                if (response) {
                    res.statusMessage = 'Success';
                    res.statusCode = 200;
                    res.status(200).send({
                        message: 'Success',
                        id: '607ad61383942601e8933407'
                    });
                } else {
                    res.statusMessage = 'Failed';
                    res.status(200).send({
                        message: 'Failed'
                    });
                }
            }
        });
        // console.log(req.body);
    } catch (error) {
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error.message
        });
    }
});

app.post('/api/v1/getOtp', async (req, res) => {
    console.log(req.body);
    // let id = req.body.id;
    // id = id.slice(0,-2);
    // console.log(id);
    try {
        let response = await reset_pwd.findOne({ userEmail: req.body.email });
        console.log('otp  ' + response);
        if (response) {
            res.statusMessage = 'Success';
            res.statusCode = 200;
            res.status(200).send({
                message: 'Success',
                userOTP: response
            });
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error.message
        });
    }
});

app.post('/api/v1/deleteOtp', async (req, res) => {
    console.log(req.body);
    try {
        let response = await reset_pwd.deleteMany({
            userEmail: req.body.email
        });
        console.log('delete     ' + response);
        if (response) {
            res.statusMessage = 'Success';
            res.statusCode = 200;
            res.status(200).send({
                message: 'Success'
            });
        } else {
            res.statusMessage = 'Failed';
            res.status(200).send({
                message: 'Failed'
            });
        }
    } catch (error) {
        res.statusMessage = 'Failed';
        res.status(200).send({
            message: 'Failed',
            error: error.message
        });
    }
});

// app.get('/api/v1/reset/:token', (req, res) => {
//     console.log('get  ', req.params.token);
//     return res.redirect('http://localhost:3001/')
// });

app.listen(PORT, () =>
    console.log(
        `✅  API Server started: http://${HOST}:${PORT}/api/v1/endpoint`
    )
);
