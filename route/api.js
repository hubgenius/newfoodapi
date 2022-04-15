const express = require("express");
const Exam = require("../model/user")
const New = require("../model/user1")
const upload = require("../middleware/upload");
const fs = require("fs");

const uploadsDir = __dirname + '../uploads';
const jwt = require('jsonwebtoken');
var secret = 'harrypotter';
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const config = require('../config');
const client = require('twilio')(config.accountID, config.authToken)
const { ObjectId } = require("mongodb")
const { OAuth2Client } = require('google-auth-library');
const { Console } = require("console");
const client1 = new OAuth2Client(process.env.CLIENT_ID)
CLIENT_ID = "4003000180-ltll1vf8euevgvter0mj4u9um3lgropv.apps.googleusercontent.com"

module.exports = function (router) {

    router.post("/google", async (req, res) => {
        const { token } = req.body
        const ticket = await client1.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });
        const { name, email, picture ,phone} = ticket.getPayload();
        New.find({ email: email }).exec(function (err, user) {
            if (user && user.length != 0) {
                console.log(user)
                var token1 = jwt.sign({ email: email }, secret, { expiresIn: '24h' });
                res.json({ success: true, message: 'User authenticated!', token: token1, email: email });

            }
            else {
                let mouse = new New()
                mouse.username = name;
                mouse.email = email;
                mouse.profile_url = picture;
                mouse.phone=phone;
                console.log(name);
                console.log(email);
                console.log(picture)

                mouse.save((err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        var token1 = jwt.sign({ email: email }, secret, { expiresIn: '24h' });
                        res.json({ success: true, message: 'User authenticated!', token: token1 });

                    }
                })


            }
        })

    })

  
    router.get('/food', async (req, res) => {
        // console.log("deedddcode", req.decoded)
        Exam.find({}).exec(function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: fale, message: 'User not found' });
            } else {
                res.json({ success: true, message: 'get details Successfully', data: user });
            }
        })
    });
    router.delete('/food/:id', function (req, res) {
        Exam.findByIdAndDelete({ _id: req.params.id }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'No user found' });
            } else {
                res.json({ success: true, message: 'Your Account has been delete now !!!' });
            }
        })
    });
    router.post('/Add', (req, res) => {
        upload(req, res, function (err) {
            // console.log("req.file---", req.file);
            // console.log("req.body",req.body)
            // if (err) {
            //     if (err.code === 'LIMIT_FILE_SIZE') {
            //         res.json({ success: false, message: 'Profile Image too large !!!' });
            //     } else if (err.code === 'filetype') {
            //         res.json({ success: false, message: 'Invaild : Only jpeg, jpg and png supported !!!' });
            //     } else {
            //         console.log(err);
            //         res.json({ success: false, message: 'Profile Image not upload !!!' });
            //     }
            // } else {
            if (req.file==null) {
                let data = new New()
                data.password = req.body.password;
                data.email = req.body.email;
                data.phone = req.body.phone;
                data.username = req.body.username
                data.save()
                res.json({ success: true, message: 'No file selected !!!' });
            } else {
                let data = new New()
                // data.name=req.body.name;
                data.password = req.body.password;
                data.email = req.body.email;
                data.phone = req.body.phone;
                data.username = req.body.username
                // data.description = req.body.description
                // data.quantities = req.body.quantities
                // data.price=req.body.price
                data.profile_file = req.file.filename;
                data.profile_url = "https://unlimitedfood.herokuapp.com/upload/" + req.file.filename;
                data.save()
                if (err) {
                    console.log(err.errors.username);
                    if (err.errors.username) {
                        res.json({ success: false, message: "Name is required" });
                    }
                    else {
                        res.json({ success: false, message: err });
                    }
                } else {
                    res.json({ success: true, message: 'Registration Successfully' });
                }

            }
            // }
            // })

        })


    });
    router.put('/forget', function (req, res) {
    
        New.findOne({ email: req.body.email }).exec(function (err, user) {
            if (err) throw err;
            if (req.body.password == null || req.body.password == '') {
                res.json({ success: false, message: 'Password not provided' });
            } else {
                user.password = req.body.password;
                user.save(function (err) {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {
                        // var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '24h' });
                        res.json({ success: true, message: 'Password has been reset!' });
                    }
                });
            }
        });
    });


    router.post('/login', function (req, res) {
        New.findOne({ email: req.body.email }).select('email  password').exec(function (err, user) {
            if (err) throw err;
            else {
                if (!user) {
                    res.json({ success: false, message: 'email and password not provided !!!' });
                } else if (user) {
                    if (!req.body.password) {
                        res.json({ success: false, message: 'No password provided' });
                    } else {
                        var validPassword = user.comparePassword(req.body.password);
                        if (!validPassword) {
                            res.json({ success: false, message: 'Could not authenticate password' });
                        } else {
                            // res.send(user);
                            var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '24h' });
                            res.json({ success: true, message: 'User authenticated!', token: token });
                        }
                    }
                }
            }
        });
    });
    // router.post('/login', (req, res) => {
    //     console.log("ssssss", req.body)

    //     res.send('hello from simple server :)')
    // })
    
    router.post('/otp', function (req, res) {
        New.findOne({
            phone: req.body.phone
        }).select('mobilenumber password').exec(function (err, user) {
            if (err) throw err;
            else {
                if (!user) {
                    res.json({ success: false, message: 'mobilenumber and password not provided !!!' });
                } else if (user) {
                    if (!req.body.password) {
                        res.json({ success: false, message: 'No password provided' });
                    } else {
                        var validPassword = user.comparePassword(req.body.password);
                        if (!validPassword) {
                            res.json({ success: false, message: 'Please Enter Right Password' });
                        } else {
                            console.log("sss", user.mobilenumber)
                            // res.send(user);
                            // var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '1h' });
                            client
                                .verify
                                .services(config.serviceID)
                                .verifications
                                .create({
                                    to: `+91${req.body.phone}`,
                                    channel: 'sms'
                                }).then((data) => {
                                    res.status(200).json({ data: data })
                                }).catch((err)=>{
                                    console.log(err)
                                })
                            res.json({ success: true, message: 'User authenticated!' });
                        }
                    }
                }
            }
        });
    })
    
    router.post('/verify', (req, res) => {
        New.findOne({
            phone: req.body.phone,
        }).exec(function (err, user) {
            if (err) throw err;
            else {
                if (!user) {
                    res.json({ success: false, message: 'mobilenumber and password not provided !!!' });
                } else if (user) {
                    console.log("ssss")
                    client
                        .verify
                        .services(config.serviceID)
                        .verificationChecks
                        .create({
                            to: `+91${req.body.phone}`,
                            code: req.body.code
                        }).then((data) => {
                            console.log(user)
                            var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '1h' });
                            res.status(200).json({ data: data, success: true, token: token })
                        }).catch((err) => {
                            console.log(err)
                            res.status(404).send('otp is expired !!!')
                        })
                }
            }
        });
    })

    router.post('/resend', (req, res) => {
        client
            .verify
            .services(config.serviceID)
            .verifications
            .create({
                to: `+91${req.body.phone}`,
                channel: 'sms'
            }).then((data) => {
                res.status(200).json({ data: data })
            })
    })

    router.get('/', async (req, res) => {
        // console.log("deedddcode", req.decoded)
        New.find({ email: req.body.email }).exec(function (err, user) {
            if (err) throw err;
            if (user) {
                res.json({ success: false, message: 'User not found' });
            } else {
                res.json({ success: true, message: 'get details Successfully', data: user });
            }
        })
    });
    router.delete('/:id', function (req, res) {
        New.findByIdAndDelete({ _id: req.params.id }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'No user found' });
            } else {
                res.json({ success: true, message: 'Your Account has been delete now !!!' });
            }
        })
    });


    // router.put('/forget', function (req, res) {
    //     Exam.findOne({ email: req.body.email }).exec(function (err, user) {
    //         if (err) throw err;
    //         if (req.body.password == null || req.body.password == '') {
    //             res.json({ success: false, message: 'Password not provided' });
    //         } else {
    //             user.password = req.body.password;
    //             user.save(function (err) {
    //                 if (err) {
    //                     res.json({ success: false, message: err });
    //                 } else {
    //                     // var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '24h' });
    //                     res.json({ success: true, message: 'Password has been reset!' });
    //                 }
    //             });
    //         }
    //     });
    // });

    // router.put('/forget', function (req, res) {
    //     Exam.findOne({ email: req.body.email }, function (err, user) {
    //         if (err) throw err;
    //         if (user) {
    //             res.json({ success: false, message: 'No user found' });
    //         } else {
    //             // user.username=req.body.username
    //             // user.email=req.body.email
    //             user.password = req.body.password
    //             // user.phonenumber=req.body.phonenumber
    //             user.save(function (err) {
    //                 if (err) {
    //                     console.log(err);
    //                 } else {
    //                     res.json({ success: true, message: 'Details has been updated!' });
    //                 }
    //             });
    //         }
    //     });
    // })

    router.use(function (req, res, next) {

        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid' });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided' });
        }
    });

    router.get('/loginwithgoogle', async (req, res) => {
        New.find({ email: req.decoded.email }).exec(function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'User not found' });
            } else {
                res.json({ success: true, message: 'get details Successfully', data: user });
                // res.send(user)
            }
        })
    });
    router.post('/', (req, res) => {
        upload(req, res, function (err) {
            console.log("req.file---", req.file);
            console.log("req.body", req.body)
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    res.json({ success: false, message: 'Profile Image too large !!!' });
                } else if (err.code === 'filetype') {
                    res.json({ success: false, message: 'Invaild : Only jpeg, jpg and png supported !!!' });
                } else {
                    console.log(err);
                    res.json({ success: false, message: 'Profile Image not upload !!!' });
                }
            } else {
                if (!req.file) {
                    res.json({ success: false, message: 'No file selected !!!' });
                } else {
                    let data = new Exam()
                    data.name = req.body.name;
                    // data.password=req.body.password;
                    // data.email=req.body.email;
                    // data.phone=req.body.phone;
                    // data.username = req.body.username
                    data.description = req.body.description
                    data.quantities = req.body.quantities
                    data.price = req.body.price
                    data.profile_file = req.file.filename;
                    data.profile_url = "https://unlimitedfood.herokuapp.com/upload/" + req.file.filename;
                    data.save(function (err) {
                        if (err) {
                            console.log(err.errors.name);
                            if (err.errors.name) {
                                res.json({ success: false, message: "Name is required" });
                            }
                            else {
                                res.json({ success: false, message: err });
                            }
                        } else {
                            res.json({ success: true, message: 'Registration Successfully' });
                        }
                    });
                }
            }
        })

    })
    // router.get('/', function(req, res) { 
    //     console.log("req.decoded",req.decoded)
    //     New.find({}.exec (function(err, user) {
    //         if (err) throw err;
    //         if (!user) {
    //             res.json({ success: false, message: 'No user found' });
    //         } else {
    //             res.json({ success: true, user: user });
    //         }
    //     }));

    // });
    // router.get('/', async (req, res) => {
    //     console.log("deedddcode", req.decoded)
    //     New.find({}).exec(function (err, user) {
    //         if (err) throw err;
    //         if (!user) {
    //             res.json({ success: fale, message: 'User not found' });
    //         } else {
    //             res.json({ success: true, message: 'get details Successfully', data: user });
    //         }
    //     })
    // });
    router.get('/Abc', async (req, res) => {
        console.log("deedddcode", req.decoded)
        New.findById(ObjectId(req.decoded.id)).exec(function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'User not found' });
            } else {
                res.json({ success: true, message: 'get details Successfully', data: user });
            }
        })
    });
    router.delete("/logout", async (req, res) => {
        await req.session.destroy()
        res.status(200)
        res.json({
            message: "Logged out successfully"
        })
    })
    router.put('/:id', upload, async (req, res) => {

        New.findById(ObjectId(req.decoded.id)).exec((err, data) => {
            if (req.file == null) {
                data.username = req.body.username
                data.email = req.body.email
                // result.password = req.body.password
                data.phone = req.body.phone
                data.save()
                res.send("hello")
                console.log(err)
            } else {
                data.username = req.body.username
                data.email = req.body.email
                // result.password = req.body.password
                data.phone = req.body.phone
                data.profile_file = req.file.filename;
                data.profile_url = "http://localhost:8000/upload/" + req.file.filename;
                data.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                res.send("hellllll")
            }
        })
    });
    // router.put('/:id', async (req, res) => {
    //     console.log("past____-", req.decoded);
    //     New.findOne({ _id: req.params.id }).exec((err, result) => {

    //         result.username = req.body.username
    //         result.email = req.body.email
    //         result.password = req.body.password
    //         result.phone=req.body.phone
    //         result.save()
    //         res.json({ success: "true", message: "done" })
    //     })
    // })
    //     router.get('/', function(req, res) { 
    //         // console.log(req.decoded)
    //         New.find({}, function(err, user) {
    //             if (err) throw err;
    //             if (!user) {
    //                 res.json({ success: false, message: 'No user found' });
    //             } else {
    //                 res.json({ success: true, user: user });
    //             }
    //         });

    //     });

    router.put('/e/:id', upload, async (req, res) => {

        Exam.findById({ _id: req.params.id }).exec((err, data) => {
            if (req.file == null) {
                data.username = req.body.username
                data.description = req.body.description
                data.quantities = req.body.quantities
                data.price = req.body.price
                data.save()
                res.send("hello")
                console.log(err)
            } else {
                data.username = req.body.username
                data.description = req.body.description
                data.quantities = req.body.quantities
                data.price = req.body.price
                data.profile_file = req.file.filename;
                data.profile_url = "http://localhost:8000/upload/" + req.file.filename;
                data.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                res.send("hellllll")
            }
        })
    });

    router.delete('/:id', function (req, res) {
        New.findByIdAndDelete({ _id: req.params.id }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'No user found' });
            } else {
                res.json({ success: true, message: 'Your Account has been delete now !!!' });
            }
        })
    });




    return router;
}