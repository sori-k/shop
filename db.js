var mysql = require('mysql'); 
var config = {
    connectionLimit:100, 
    host:'localhost', 
    user:'web', 
    password:'pass', 
    database:'webdb', 
    port:'3306'
}

var pool = mysql.createPool(config); 
var connection;

exports.connect = function() { // app.js에서 connect 해주고 다음부터는 get해서 쓰면됨
    pool.getConnection(function(err, con) {
            if(err) {
                console.log('db접속 오류:', err)
            }else {
                console.log('db접속 완료');
                connection = con; 
            }
        }
    );
}

exports.get = function() {
    return connection;
};