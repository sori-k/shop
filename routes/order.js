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
        sql='select last_insert_id() last'; //제일 마지막에 입력(insert)한 번호를 받아올 수 있다. (자동으로 들어간 pi값 가져오기위해)
        db.get().query(sql, function(err, rows){
            res.send(rows[0].last.toString()); //숫자로 데이터 보내면 오류나서 toString으로
        });
    });
});

//주문상품 등록
router.post('/book/insert', function(req, res){
    const pid=req.body.pid;
    const bid=req.body.bid;
    const qnt=req.body.qnt;
    const price=req.body.price;
    const cid=req.body.cid;

    console.log(pid,bid,qnt,price,cid);

    let sql='insert into orders(pid, bid, qnt, price) values(?, ?, ?, ?)';
    db.get().query(sql, [pid, bid, qnt, price], function(err){
        if(err) console.log('주문상품등록 오류:', err);

        //장바구니 비워주기
        sql='delete from cart where cid=?';
        db.get().query(sql, [cid], function(err){
            res.sendStatus(200);
        });
    });
});

//주문목록 페이지로 이동
router.get('/', function(req, res){
    res.render('index', {title:'주문목록', pageName:'order/list.ejs'})
});

//주문목록 JSON
router.get('/list.json', function(req, res){ //localhost:3000/order/list.json?uid=orange
    const uid=req.query.uid;

    const sql='select * from view_purchase where uid=?';
    db.get().query(sql, [uid], function(err, rows){
        res.send(rows);
    });
});


//주문상품목록.json (주문목록 페이지내에서)
router.get('/book.json', function(req, res){ //localhost:3000/order/book.json?pid=10
    const pid=req.query.pid;
    let sql='select * from view_orders where pid=?';
    db.get().query(sql, [pid], function(err, rows){
        const books=rows;

        sql='select * from view_purchase where pid=?';
        db.get().query(sql, [pid], function(err, rows){
            res.send({books, info:rows[0]}); //books => 주문한 도서정보, info => 주문한 정보(배송지, 주문상태 등)
        });
    });
});

//주문관리 페이지 출력
router.get('/admin', function(req, res){ //localhost:3000/order/admin.json?page=1
    res.render('index', {title:'주문관리', pageName:'order/admin.ejs'})
});

//주문관리(를 위한) .json
router.get('/admin.json', function(req, res){
    const page=req.query.page; //query에 있는 page는 string이라 
    const start=(parseInt(page)-1)*3;
    const status=req.query.status;

    let sql='';
    if(status == '100'){ //모든 구매 데이터 출력
        sql='select * from view_purchase limit ?,3';
    }else{ //상태에 해당하는 구매 데이터만 출력
        sql=`select * from view_purchase where status=${status} limit ?,3`; //해당 status값이 일치할때
    }
    db.get().query(sql, [start], function(err, rows){
        res.send(rows);
    });
});


//주문 갯수 구하기
router.get('/count', function(req, res){ //localhost:3000/order/count
    let sql='';
    const status=req.query.status;
    
    if(status == 100){
        sql='select count(*) as cnt from purchase';
    }else{
        sql=`select count(*) as cnt from purchase where status=${status}`;
    }
    
    db.get().query(sql, function(err, rows){
        res.send(rows[0].cnt.toString()); //숫자로 send하면 오류나서 toString으로 변환해서..
    });
})

//주문상태 변경
router.post('/status/update', function(req, res){
    const pid=req.body.pid;
    const status=req.body.status;

    const sql='update purchase set status=? where pid=?';
    db.get().query(sql, [status, pid], function(err){
        res.sendStatus(200);
    });
});
module.exports = router;