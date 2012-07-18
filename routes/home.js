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
}
