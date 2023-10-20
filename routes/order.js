var express = require('express');
var router = express.Router();
var db = require('../db');

//주문 등록 페이지로 이동
router.get('/insert', function(req, res){
    const cart = req.query.cart;

    res.render('index', {title:'주문하기', pageName:'users/order.ejs', cart:cart}); //pageName 줄 때만 맨앞에 / 안붙이고 시작
}); //cart에 주문할 상품이 들어가있다.

//주문할 도서목록
router.get('/cart.json', function(req, res){
    const cart = req.query.cart;
    const uid = req.query.uid;

    let sql=`select * from view_cart where  cid in (${cart})`; //주문 도서목록
    db.get().query(sql, function(err, rows){
        const order = rows; //order에 주문 도서목록이 들어가있다.
        sql ='select * from users where uid=?';  //주문자 정보 가져오기
        db.get().query(sql, [uid], function(err, rows){ //rows에 사용자 정보
            res.send({order, user:rows[0]});
        }); // 목록이 order에 들어가있다.
    });
}) // 그 뒤 핸들바 이용 출력하기.


//주문자 정보 입력
router.post('/purchase/insert', function(req, res){
    const uid=req.body.uid;
    const rname=req.body.rname;
    const rphone=req.body.rphone;
    const raddress1=req.body.raddress1;
    const raddress2=req.body.raddress2;
    const sum=req.body.sum;
    
    let sql='insert into purchase(uid, rname, rphone, raddress1, raddress2, sum) values(?, ?, ?, ?, ?, ?)';

    db.get().query(sql, [uid, rname, rphone, raddress1, raddress2, sum], function(err){
        //pid (주문자 번호)를 받아와야함
        sql='select last_insert_id() last'; //제일 마지막에 입력(insert)한 번호를 받아올 수 있다.
        db.get().query(sql, function(err, rows){
            res.send(rows[0].last.toString()); //숫자로 데이터 보내면 오류나서 toString으로
        });
    });
});




module.exports = router;