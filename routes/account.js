
module.exports = function(app) {

    // user account page
    app.get('/account', function(req, res) {
        console.log(req);
        res.render('account/account', { user: req.user });
    });

    // logout
    app.get('/logout', function(req, res) {
        res.redirect('/');
    });
}

