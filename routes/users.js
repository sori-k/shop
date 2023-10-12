var express = require('express');
var router = express.Router();
var db = require('../db'); //db import (같은 폴더 내에 없으니까 .. 으로 나가서)
var multer = require('multer');

// 업로드함수
var upload = multer({
    storage:multer.diskStorage({
        destination:(req, file, done) => {
            done(null, './public/upload/photo') // 현재 프로젝트의 퍼블릭에 업로드의 포토 (경로)
        },
        filename:(req, file, done) => { // 파일 이름 지정
            var fileName = Date.now() + ".jpg";
            done(null, fileName);
        }
    })
});

/* 사용자 목록 페이지로 이동 */
router.get('/', function(req, res, next) {
  res.render('index', {title:'사용자 목록', pageName:'users/list.ejs'})
});

// 사용자 목록 JSON
router.get('/list.json', function(req, res){
    const sql='select * from users order by uname';
    db.get().query(sql, function(err, rows){
        res.send(rows);
    });
});

// 로그인 페이지로 이동
router.get('/login', function(req, res){
  res.render('index', {title:'로그인', pageName:'users/login.ejs'})
});


// 로그인 체크
router.post('/login', function(req, res){
    const uid=req.body.uid; //request의 body에 있는 uid를 uid에 넣는다.
    const upass=req.body.upass;
    const sql='select * from users where uid=?';
    db.get().query(sql, [uid], function(err, rows){  // ?의 값을 [] 배열 타입으로 (여러개 있을 수 있어서 배열 타입으로)
        // select한 결과를 rows에 넣어주는

        let result='0'; // 문자열 타입으로, 처음 초기값 0 => user가 없을 때, 0 이 나옴
        if(rows[0]){ // user가 있으면 , !user (user가 없으면)
            if(rows[0].upass == upass){
                result='1';
            }else{
                result='2';
            }
        }
        res.send(result);
    });
});

// 회원가입 페이지로 이동
router.get('/insert', function(req, res){
    res.render('index', {title:'회원가입', pageName:'users/insert.ejs'})
});

// 회원가입
router.post('/insert', function(req, res){
    const uid=req.body.uid;
    const upass=req.body.upass;
    const uname=req.body.uname;
    const phone=req.body.phone;
    const address1=req.body.address1;
    const address2=req.body.address2;

    //console.log(uid, upass, uname, phone, address1, address2);

    const sql='insert into users(uid, upass, uname, phone, address1, address2) values(?, ?, ?, ?, ?, ?)';

    //sql 실행
    db.get().query(sql, [uid, upass, uname, phone, address1, address2], function(err, rows){
        res.redirect('/users/login') //회원가입후 로그인 페이지로 이동 -> 데이터베이스에 저장된다.
    });
});

// 마이페이지로 이동
router.get('/mypage', function(req, res){ //params로 받을 때) /:uid 넣기
    const uid=req.query.uid; // params로 받을 때) const uid=req.params.uid;
    const sql='select * from users where uid=?';
    db.get().query(sql, [uid], function(err, rows){
        //console.log('.............', uid);
        //console.log(rows[0]);
        res.render('index', {title:'마이페이지', pageName:'users/mypage.ejs', user:rows[0]})
    }); 
});

// 수정페이지로 이동
router.get('/update', function(req, res){
    const uid=req.query.uid;
    const sql='select * from users where uid=?';
    db.get().query(sql, [uid], function(err, rows){
        //console.log('.............', uid);
        console.log(rows[0]);
        res.render('index', {title:'정보수정', pageName:'users/update.ejs', user:rows[0]})
    });
});

// 정보수정
router.post('/update', upload.single('file'), function(req, res){
    const uid=req.body.uid;
    const uname=req.body.uname;
    const phone=req.body.phone;
    const address1=req.body.address1;
    const address2=req.body.address2;
    //console.log(uid,uname,phone,address1,address2);

    let photo = req.body.photo; //기존 사진을
    if(req.file) photo = req.file.filename; //바뀐 파일이 있으면 새롭게
    console.log('photo....', photo);

    //db에 업데이트
    const sql='update users set uname=?, phone=?, address1=?, address2=?, photo=? where uid=?';
    db.get().query(sql, [uname, phone, address1, address2, photo, uid], function(err, rows){
        if(err) console.log(err); // 에러가 있으면 에러 출력 아니면 수정 후 마이 페이지로 이동
        res.redirect('/users/mypage?uid=' + uid);
    });
});

// 비밀번호변경 페이지로 이동
router.get('/change', function(req, res){
    res.render('index', {title:'비밀번호 변경', pageName:'users/change.ejs'})
});

// 비밀번호 변경
router.post("/change", function(req, res){
    const uid=req.body.uid;
    const upass=req.body.npass;
    const sql='update users set upass=? where uid=?';
    db.get().query(sql, [upass, uid], function(err, rows){
        if(err) console.log(err);
        res.sendStatus(200); // 잘 실행되었는지 코드 보내는 거 200 -> ok
    });
});

module.exports = router;