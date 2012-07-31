module.exports = function(app)
{
    fs = require('fs');

    nconf = require('nconf'),
    Recaptcha = require('recaptcha').Recaptcha;

    // home page
    app.get('/', function(req, res)
    {
        res.render('index', { title: 'Home Page.  ' })
    });

    // chat area
    app.get('/chat', function(req, res)
    {
        res.render('chat', { title: 'Chat with Me!  ' })
    });

    // about page
    app.get('/about', function(req, res)
    {
        res.render('about', { title: 'About Me.  ' })
    });
    // about page
    app.get('/demo', function(req, res)
    {
        res.render('demo', { title: 'Demo page.  ' })
    });
    // task page
    app.get('/task', function(req, res)
    {
        res.render('task', { title: 'task page.  ' })
    });
    var data = {
        "glossary": {
            "title": "example glossary",
            "GlossDiv": {
                "title": "S",
                "GlossList": {
                    "GlossEntry": {
                        "ID": "SGML",
                        "SortAs": "SGML",
                        "GlossTerm": "Standard Generalized Markup Language",
                        "Acronym": "SGML",
                        "Abbrev": "ISO 8879:1986",
                        "GlossDef": {
                            "para": "A meta-markup language, used to create markup languages such as DocBook.",
                            "GlossSeeAlso": ["GML", "XML"]
                        },
                        "GlossSee": "markup"
                    }
                }
            }
        }
    }
    app.get('/task_source', function(req, res)
    {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(data));
        res.end();
    });
    app.post('/task_source', function(req, res)
    {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(data));
        res.end();
    });
}
