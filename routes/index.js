var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/reg', function (req, res) {
  res.render('reg', { title: 'register' })
});
router.post('/reg', function (req, res) {

});
router.get('/login',function(req,res){
  res.render('login',{title:'Login'});
});
module.exports = router;
 