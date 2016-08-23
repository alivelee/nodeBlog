var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/reg', function (req, res) {
  res.render('reg', { title: 'register' })
});
router.post('/reg', function (req, res) {
  var name = req.body.name,
      password = req.body.password,
      password_repeat = req.body['password-confirm'];
      if (password_repeat != password){
        req.flash('error','password is not the same');
        return res.redirect('/reg');
      }
      var md5 = crypto.createHash('md5'),
          password = md5.update(req.body.password).digest('hex');
          var newUser = new User({
            name: req.body.name,
            password: password,
            email: req.body.email
          });
      User.get(newUser.name, function(err,user){
        if (err) {
          req.flash('error',err);
          return res.redirect('/');
        }
        if (user) {
          req.flash('error','User existed');
          return res.redirect('/reg');
        }
        newUser.save(function(err,user){
          if (err){
            req.flash('error',error);
            return res.redirect('/reg');
          }
          req.session.user = user;
          req.flash('success','register success');
          res.redirect('/');

        });
      });
});
router.get('/login',function(req,res){
  res.render('login',{title:'Login'});
});
module.exports = router;
 