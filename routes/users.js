var express = require('express');
var router = express.Router();
var db = require('../db'); //db import (같은 폴더 내에 없으니까 .. 으로 나가서)

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
router.post('/insert', function(req, res){ //post의 action으로 가는데 submit 될때, 실행
    const uid=req.body.uid;
    const upass=req.body.upass;
    const uname=req.body.uname;
    const phone=req.body.phone;
    const address1=req.body.address1;
    const address2=req.body.address2;
    console.log(uid,upass,uname,phone,address1,address2);

    const sql="insert into users(uid, upass, uname, phone, address1, address2) values(?, ?, ?, ?, ?, ?)";

    //sql 실행
    db.get().query(sql, [uid, upass, uname, phone, address1, address2], function(err, rows){
        res.redirect('/users/login') //회원가입후 로그인 페이지로 이동 -> 데이터베이스에 저장된다.
    });
});
module.exports = router;
