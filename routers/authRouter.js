var db = require('../config.js');
const express = require("express");
const bcrypt = require('bcrypt');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);
const _ = require('lodash');
//jwt
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET

router.post('/login', async function (req, res) {
    try {
        let username = req.body.username
        let row = await query(`SELECT user_id,username,password FROM users where username=?;`, (username))
        let userid = row[0].user_id.toString()
        if (await bcrypt.compare(req.body.password, row[0].password)) {
            let token = await Jwt(userid)
            console.log(token)
            res.send(token.toString())
            res.end()
        }
    }
    catch (error) {
        console.log(error)
    }
});
async function Jwt(userid) {
    const token = jwt.sign(userid.toString(), SECRET);
    return token;
}


module.exports = router;