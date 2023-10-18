var express = require('express');
var router = express.Router();
var db = require('../db'); // 밖에 있는 db 파일 import (같은 경로에 없어서 ../ <- 밖으로)
var multer = require('multer');

//도서이미지 업로드함수
var upload = multer({
    storage:multer.diskStorage({
        destination:(req, file, done) => {
            done(null, './public/upload/book') // 현재 프로젝트의 퍼블릭에 업로드의 포토 (경로)
        },
        filename:(req, file, done) => { // 파일 이름 지정
            var fileName = Date.now() + ".jpg";
            done(null, fileName);
        }
    })
});

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

//도서목록 JSON (데이터 가져오는)
router.get('/list.json', function(req, res){
    const page=req.query.page;
    const start=(parseInt(page)-1)*5;
    const key=req.query.key;
    const query='%' + req.query.query + '%';
            // = `%${req.query.query}%`;  <- 이렇게도 가능 ` 백팁? 써서 가능
    const sql='select * from books where '+ key +' like ? order by bid desc limit ?, 5'; //시작페이지가 0
            //=`select * from books where ${key} like ? order by bid desc limit ?, 5`;  <- 이렇게도 작성 가능
    db.get().query(sql, [query, start], function(err, rows){
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
    const key=req.query.key;
    const query='%' + req.query.query + '%'; //앞뒤로 %%를 붙여줌 (앞, 뒤 어디에 단어가 있든 검색하려고)
    const sql='select count(*) total from books where ' + key + ' like?';
            //=`select count(*) total from books where ${key} like?`;  <- ${} 안에 변수명 적기
    db.get().query(sql, [query], function(err, rows){
        res.send(rows[0]);
    });
});

//도서 삭제
router.post('/delete', function(req, res){ //get, ? 일 때는 query, post일때는 body
    const bid=req.body.bid;
    const sql='delete from books where bid=?';
    db.get().query(sql, [bid], function(err){
        if(err) console.log('도서삭제', err);
        res.sendStatus(200); //status코드 200은 성공, 500은 서버오류, 404는 페이지 없음
    });
});

//도서정보 페이지 이동 -> 관리자 전용
router.get('/read', function(req, res){
    const bid=req.query.bid;
    const sql='select *, FORMAT(PRICE, 0) FMTPRICE, date_format(REGDATE, "%Y-%m-%d") FMTDATE from books where bid=?';
    db.get().query(sql, [bid], function(err, rows){
        if(err) console.log('도서정보 :', err);
        res.render('index', {title:'도서정보', pageName:'books/read.ejs', book:rows[0]})
    });
});

//도서정보 수정 페이지로 이동
router.get('/update', function(req, res){
    const bid=req.query.bid;
    const sql='select *, FORMAT(PRICE, 0) FMTPRICE, date_format(REGDATE, "%Y-%m-%d") FMTDATE from books where bid=?';
    db.get().query(sql, [bid], function(err, rows){
        if(err) console.log('정보수정 :', err);
        res.render('index', {title:'정보수정', pageName:'books/update.ejs', book:rows[0]})
    });
});

//도서 수정(db에)
router.post('/update', function(req, res){
    const bid=req.body.bid;
    const title=req.body.title;
    const price=req.body.price;
    const authors=req.body.authors;
    const publisher=req.body.publisher;
    const contents=req.body.contents;

    //console.log(bid,title,price,authors,publisher,contents);

    const sql='update books set title=?, price=?, authors=?, publisher=?, contents=? where bid=?';
    db.get().query(sql, [title, price, authors, publisher, contents, bid], function(err){
        if(err) console.log('수정 오류: ', err);
        res.redirect('/books/read?bid=' + bid);
    })
});

//이미지 업로드
router.post('/upload', upload.single('file'), function(req, res){
    if(req.file){
        const bid=req.body.bid;
        //console.log('파일이름: ', req.file.filename, bid);
        const image = '/upload/book/' + req.file.filename;
        const sql='update books set image=? where bid=?';
        db.get().query(sql, [image, bid], function(err){
            if(err) console.log('이미지 업로드 오류: ', err);
            res.redirect('/books/read?bid=' + bid);
        });
    }
});

//도서정보 페이지 출력 -> 사용자 전용
router.get('/info', function(req, res){
    const bid=req.query.bid;
    const sql='select *, FORMAT(PRICE, 0) FMTPRICE, DATE_FORMAT(REGDATE, "%Y-%m-%d") FMTDATE from books where bid=?';
    db.get().query(sql, [bid], function(err, rows){
        res.render('index', {title:'도서정보', pageName:'books/info.ejs', book:rows[0]});
    });
});

//좋아요 추가
router.post('/like/insert', function(req, res){
    const uid=req.body.uid;
    const bid=req.body.bid;
    const sql='insert into favorite(uid, bid) values(?, ?)';
    db.get().query(sql, [uid, bid], function(err){
        res.sendStatus(200);
    })
});

//좋아요 등록 취소
router.get('/like/delete', function(req, res){
    const uid=req.query.uid;
    const bid=req.query.bid;
    const sql='delete from favorite where uid=? and bid=?';
    db.get().query(sql, [uid, bid], function(err){
        res.sendStatus(200);
    })
});

//좋아요수 체크
router.get('/like/check', function(req, res){
    const uid=req.query.uid;
    const bid=req.query.bid;
    const sql='select count(*) total, (select count(*) from favorite where bid=? and uid=?) ucnt from favorite where bid=?';

    db.get().query(sql, [bid, uid, bid], function(err, rows){
        if(err) console.log('좋아요 수 체크 오류:', err);
        res.send(rows[0]);
    });
});
module.exports = router;

// 모든 페이지는 'index' 통해서
// render : 페이지 출력
// send : 데이터 출력
//db에 업데이트, 삭제 등은 post