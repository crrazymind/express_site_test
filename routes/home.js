module.exports = function(app) {
    fs = require('fs');

    nconf = require('nconf'),
    Recaptcha = require('recaptcha').Recaptcha;

    // home page
    app.get('/', function(req, res) {
        res.render('index', { title: 'Home Page.  ' })
    });

    // chat area
    app.get('/chat', function(req, res) {
        res.render('chat', { title: 'Chat with Me!  ' })
    });

    // about page
    app.get('/about', function(req, res) {
        res.render('about', { title: 'About Me.  ' })
    });
    // about page
    app.get('/demo', function(req, res) {
        res.render('demo', { title: 'Demo page.  ' })
    });
    // uploads page
/*    app.get('/upload', function(req, res) {
        res.render('upload', { title: 'Upload images here.  ' })
    });*/
    /*app.get('/uploads', function(req, res) {
    fs.readDir(__dirname + "../../uploads/");
    });*/
 /*   app.get('/upload_image', function(req, res) {

        var recaptcha = new Recaptcha(nconf.get('recaptcha:publicKey'), nconf.get('recaptcha:privateKey'));
        res.render('upload', {
            title: 'Upload images here.',
            recaptcha_upload: recaptcha.toHTML()
        });
        
        //res.render('upload', { title: 'Upload images here.  ' });
    });

    app.post('/upload_image', function(req, res) {
        var data = {
            remoteip:  req.connection.remoteAddress,
            challenge: req.body.recaptcha_challenge_field,
            response:  req.body.recaptcha_response_field
        };
        var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);

        recaptcha.verify(function(success, error_code) {
            if (success) {
                fs.readFile(req.files.displayImage.path, function(err, data) {
                    var newPath = __dirname + "../../public/user_uploads/" + req.files.displayImage.name;
                    newItem = fs.writeFile(newPath, data, function(err) {
                        res.write('\n upload failed!');
                        res.redirect("back");
                    });
                    var renderPath = "/user_uploads/" + req.files.displayImage.name;
                    res.render('upload_thanks', {
                        title: 'thanks for upload',
                        imagedata: renderPath
                    });
                });
            }
            else {
                // Redisplay the form.
                var recaptcha = new Recaptcha(nconf.get('recaptcha:publicKey'), nconf.get('recaptcha:privateKey'));
                res.render('upload', {
                    title: 'Upload images here.',
                    recaptcha_upload: recaptcha.toHTML()
                });
            }
        });



    });*/
}
