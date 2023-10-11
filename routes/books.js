var express = require('express');
var router = express.Router();

/* 도서 검색 페이지. */
router.get('/', function(req, res, next) {
  res.render('index', {title:'도서 검색', pageName:'books/search.ejs'});
});

module.exports = router;

// 모든 페이지는 'index' 통해서
// render : 페이지 출력
// send : 데이터 출력