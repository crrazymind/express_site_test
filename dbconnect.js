

    var sys = require("util");
    var mongodb = require("mongodb");

    var Db = mongodb.Db;
    var Connection = mongodb.Connection;
    var Server = mongodb.Server;
    var BSON = mongodb.BSON;
    var ObjectID = mongodb.ObjectID;

    activeProvider = function(host, port)
    {
        this.db = new Db('express_db', new Server(host, port, { auto_reconnect: true }, {}));
        this.db.open(function(err)
        {
            console.log('db opened');
        });
    };

    activeProvider.prototype.getCollection= function(callback) {
      this.db.collection('users', function(error, article_collection) {
        if( error ) callback(error);
        else callback(null, article_collection);
      });
    };


    activeProvider.prototype.save = function(dbName, data, callback)
    {
        this.db.collection(dbName, function(error, db_collection)
        {
            if(error) console.log('error: ', error);
            else
            {
                //console.log('names: ', db_collection.find(null, {name: 1}));
                console.log('names: ', db_collection.find({name : 'q@q.q'}));
                
                if(false && db_collection.find({ name: data.name }))
                {
                    //console.log('update to: ', data.name);
                    //var cursor = db.users.find(); while (cursor.hasNext()) printjson(cursor.next());
                    db_collection.update({ name: data.name }, { $set: { id: 10} });
                    //db_collection.find(data.name)
                } else
                {
                    db_collection.insert(data, function(err, data_res)
                    {
                        if(err) console.log('insert error: ', err);
                        else
                        {
                            callback(data.name.toString() + ' inserted to db');
                        }
                    });
                }
            }
        });
    };

    activeProvider.prototype.findUsers = function(dbName, data, callback)
    {
        this.db.collection(dbName, function(error, db_collection)
        {
            if(error) console.log('error: ', error);
            else
            {
                db_collection.find().toArray(function(error, results)
                {
                    if(error) callback(error);
                    else callback(null, results)
                });
            }
        });
    };



    exports.activeProvider = activeProvider;

