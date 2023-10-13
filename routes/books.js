var express = require('express');
var router = express.Router();
var db = require('../db'); // 밖에 있는 db 파일 import (같은 경로에 없어서 ../ <- 밖으로)

/* 도서 검색 페이지. */
router.get('/', function(req, res, next) {
    res.render('index', {title:'도서 검색', pageName:'books/search.ejs'});
});

//도서검색 결과 저장
router.post('/search/insert', function(req, res) {
    const title=req.body.title;
    const authors=req.body.authors;
    const price=req.body.price;
    const publisher=req.body.publisher;
    const image=req.body.thumbnail;
    const contents=req.body.contents;
    const isbn=req.body.isbn;
    //console.log(title, authors, price, publisher, image, contents);

    const sql1='select * from books where isbn=?'; //isbn이 일치하는게 있는지 확인
    db.get().query(sql1, [isbn], function(err, rows){
        if(rows.length > 0) { //있으면
            res.send('1');
        }else{ //없으면 insert 작업하고
            const sql='insert into books(title, authors, price, publisher, image, contents, isbn) values(?, ?, ?, ?, ?, ?, ?)';
            db.get().query(sql, [title,authors,price,publisher,image,contents,isbn], function(err, rows){
                if(err) console.log('도서 등록:', err);
                res.send('0');
            });
        }
    });
});

//도서목록 JSON 데이터 가져오는
router.get('/list.json', function(req, res){
    const page=req.query.page;
    const start=(parseInt(page)-1)*5;
    const sql='select * from books order by bid desc limit ?, 5'; //시작페이지가 0
    db.get().query(sql, [start], function(err, rows){
        if(err) console.log('도서목록 JSON:' , err);
        res.send(rows);
    });
});

//도서목록 페이지로 이동
router.get('/list', function(req, res){
    res.render('index', {title:'도서목록', pageName:'books/list.ejs'})
});

//데이터 갯수 출력
router.get('/count', function(req, res){
    const sql='select count(*) total from books';
    db.get().query(sql, function(err, rows){
        res.send(rows[0]);
    });
});



module.exports = router;

// 모든 페이지는 'index' 통해서
// render : 페이지 출력
// send : 데이터 출력