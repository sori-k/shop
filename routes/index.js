var express = require('express');
var router = express.Router();
var db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '홈페이지', pageName:'home.ejs'});
});


//지역검색 페이지로 이동
router.get('/search', function(req, res){
  res.render('index', {title:'지역검색', pageName:'local/search.ejs'});
});


//도서목록 JSON 데이터로 출력 (홈에서 사용)
router.get('/books.json', function(req, res){
  const uid=req.query.uid;
  const page=parseInt(req.query.page); //query로 받으면 문자열이라 숫자로 변환하기
  const query=`%${req.query.query}%`; 

  // -> `` 는 변수랑 문자을 합쳐서 문자열로 표시됨?
  //console.log('///////////////', query);

  const start=(page-1)*6; // 한 페이지에 6개씩 나오게
  //const sql=`select * from books where title like ? or authors like ? order by bid desc limit ?, 6`;

  let sql='select *, (select count(*) from favorite where bid=books.bid) total, '; //책 별로 총 좋아요 수
  sql+= '(select count(*) from favorite where bid=books.bid and uid=?) ucnt from books '; //ucnt => id별 누른
  sql+= 'where title like ? or authors like ? order by bid desc limit ?, 6';

  db.get().query(sql, [uid, query, query, start], function(err, rows){
    if(err) console.log('도서목록 JSON 오류:', err);
    res.send(rows); //http://localhost:3000/books.json?uid=black&page=1&query=
  })
});


//도서갯수 출력 (홈에서 사용)
router.get('/count', function(req, res){ //http://localhost:3000/count 실행시 전체 데이터갯수 출력
  const query=`%${req.query.query}%`; 
  const sql='select count(*) total from books where title like ? or authors like ?';
  db.get().query(sql, [query, query], function(err, rows){
    res.send(rows[0].total.toString());
  });
});


module.exports = router;



/* 기본으로 나와있는
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); //응답을 하겠다. 인덱스 페이지를 그려주겠다. title:'express'라고 나오게.. ('index'는 views에 )
    // '/'일때 index.ejs를 출력
*/