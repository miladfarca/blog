module.exports = function(app) {
    var app_name = "/jit";

    app.get(app_name + '/:type/:expression', function(req, res) {
        const {
            exec
        } = require('child_process');
        var flags = "";
        var type = req.params.type;
        if (type == "tokens") {
            flags = "--print-tokens --no-output";
        } else if (type == "ast-no-opt") {
            flags = "--print-ast-json --no-opt --no-output";
        } else if (type == "ast") {
            flags = "--print-ast-json --no-output";
        } else if (type == "registers") {
            flags = "--print-reg-alloc --no-output";
        } else if (type == "x64") {
            flags = "--print-code --no-output";
        }
        var expression = Buffer.from(req.params.expression, 'base64').toString();
        exec(__dirname + '/calc ' + flags + ' --inline "' + expression + "\"",
            function(err, stdout, stderr) {
                if (err) {
                    return res.sendStatus(400);
                } else {
                    res.status(200).json(stdout);
                }
            });
    });

}
