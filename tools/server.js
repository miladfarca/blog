var express = require('express');
var cors = require('cors');
var app = express();

var corsOptions = {
    origin: ["https://miladfarca.github.io"],
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

//====================================================================
// Routes
//====================================================================
require('./list/JIT-compiler-visualizer/rest/server.js')(app);

var server = app.listen(8104, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Listening at http://%s:%s", host, port);
})