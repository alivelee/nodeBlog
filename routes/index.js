var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
/* GET home page. */
router.get('/', function (req, res, next) {
  Post.getAll(null,function(err,posts){
    if (err){
      posts = [];
    }
    res.render('index', { 
      title:'Main Page',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});
router.get('/reg',checkNotLogin);
router.get('/reg', function (req, res) {
  res.render('reg', { 
    title: 'register',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
router.post('/reg',checkNotLogin);
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
router.get('/login',checkNotLogin);
router.get('/login',function(req,res){
  res.render('login',{
    title:'Login',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
router.post('/login',checkNotLogin);
router.post('/login',function(req,res){
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  User.get(req.body.name,function(err,user){
      if(!user){
        req.flash('error','user not exist');
        return res.redirect('/login');
      }
      if (user.password != password){
        req.flash('error','password incorrect');
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success','login success');
      res.redirect('/');
  });
});
router.get('/logout',function(req,res){
  req.session.user = null;
  req.flash('success','logout success');
  res.redirect('/');
});
router.get('/post',checkLogin);
router.get('/post',function(req,res){
  res.render('post',{
    title:'Post',
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
});
router.post('/post',checkLogin);
router.post('/post',function(req,res){
  var currentUser = req.session.user;
  post = new Post(currentUser.name,req.body.title,req.body.post);
  post.save(function(err){
    if (err) {
      req.flash('error',err);
      return res.redirect('/');
    }
    req.flash('success','post success');
    res.redirect('/');
  });
});
router.get('/u/:name',function(req,res){
  User.get(req.params.name, function(err,user){
    if (!user) {
      req.flash('error','user not exist');
      return res.redirect('/');
    }
    Post.getAll(user.name, function(err,posts){
      if (err) {
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('user',{
        title: user.name,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
     });
    });
  });
});
router.get('/u/:name/:day/:title',function(req,res){
  Post.getOne(req.params.name,req.params.day,req.params.title,function(err,post){
    if (err) {
      req.flash('error',err);
      return res.redirect('/');
    }
    res.render('article',{
      title:req.params.title,
      post:post,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
});
function checkLogin(req,res,next){
  if (!req.session.user){
    req.flash('error','Not Login');
    res.redirect('/login');
  }
  next();
}
function checkNotLogin(req,res,next){
  if (req.session.user){
    req.flash('error','Logined');
    res.redirect('back');
  }
  next();
}


module.exports = router;
 