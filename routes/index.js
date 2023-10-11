var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '홈페이지', pageName:'home.ejs'});
});

module.exports = router;

/* 기본으로 나와있는
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); //응답을 하겠다. 인덱스 페이지를 그려주겠다. title:'express'라고 나오게.. ('index'는 views에 )
    // '/'일때 index.ejs를 출력
*/