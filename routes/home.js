module.exports = function(app) {
    var fs = require('fs');
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
    app.get('/upload_image', function(req, res) {
        res.render('upload', { title: 'Upload images here.  ' })
    });
    
    app.post('/upload_image', function(req, res) {
        fs.readFile(req.files.displayImage.path, function(err, data) {
            var newPath = __dirname + "../../uploads/" + req.files.displayImage.name;
            var newItem = fs.writeFile(newPath, data, function(err) {
                res.write('\n upload failed!');
                res.redirect("back");
            });

            res.render('upload_thanks', {
                title: 'thanks for upload',
                imagedata: newItem
            });

        });
    });
}
