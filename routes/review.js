var express = require('express');
var router = express.Router();
var db = require('../db');

//리뷰목록 가져오는거
router.get('/list.json', function(req, res){ //테스트 localhost:3000/review/list.json?bid=57
    const bid=req.query.bid;
    const page=parseInt(req.query.page);
    const start=(page-1)*5;

    const sql='select * from review where bid=? order by rid desc limit ?, 5';
    db.get().query(sql, [bid, start], function(err, rows){
        res.send(rows);
    });
});

//total 리뷰갯수
router.get('/count', function(req, res){ //http://localhost:3000/review/count?bid=57
    const bid=req.query.bid;
    const sql='select count(*) as cnt from review where bid=?';
    db.get().query(sql, [bid], function(err, rows){
        res.send(rows[0].cnt.toString());
    })
});

//리뷰 등록
router.post('/insert', function(req, res){
    const bid=req.body.bid;
    const uid=req.body.uid;
    const contents=req.body.contents;

    const sql='insert into review(bid, uid, contents) values(?, ?, ?)';

    db.get().query(sql, [bid, uid, contents], function(err){
        res.sendStatus(200);
    })
});

module.exports = router;