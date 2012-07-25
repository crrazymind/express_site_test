var sys = require("util");
var mongoose = require("mongoose"),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var dbConnection = mongoose.createConnection(nconf.get('mongo:url'));

function validatePresenceOf(value) {
  return value && value.length;
}

var UsersSchema = new Schema({
    'name': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
    'pwd': String,
    'salt': String,
    'id' : Number
});

var usersModelCons = dbConnection.model('users', UsersSchema);


    UsersSchema.pre('save', function(next) {
        next();
    });

    var userModel = function(){
        this.model = usersModelCons;

        this.findItems = function(query, callback){
            this.model.find(query, callback);
        };

        this.saveItem = function(data, callback){
            console.log(data);
            var user = new Schema(data);
            if(user){
                user.save(function(err){
                if(err){
                        callback('save failed');
                        return;
                    }

                });
            }else{
                callback('wrong data');
            }

        }
    }

exports.usersModel = new userModel;


/*

var usersSchema = new Schema({
	name: String,
	hash: String,
	pwd: String
});

var usersModelCons = dbConnection.model('users', usersSchema);
var usersModel = new usersModelCons();


usersModel.findItems = function (query, callback) {
	usersModelCons.find(query, callback);
}
usersModel.saveSingleItem = function(data, callback)
{
    if(data.name)
    {
        console.log('name passed to: ', data.name);
        var model = usersModelCons;
        model.find({ 'name': data.name }, function(err, data)
        {
            if(err) callback('unknown error on find matches step inside save method')

            if(data.length > 0)
            {
                console.log('to update ');
                //var update = { $inc: { pwd: data.pwd} };
                var update = { $inc: { visits: 1} };
                model.update({ 'name': data.name }, update, { multi: true }, function(err, numbers)
                {
                    if(err) callback(err);
                    callback(null, numbers + ' updated in db');
                });
            }
            else
            {
                console.log(model);
                model.insert(data, function(err, numbers)
                {
                    if(err) callback(err);
                    callback(null, numbers + ' updated in db');
                });
            }
        });
    }
    else
    {
        callback('unknown data in query');
    }
}
exports.usersModel = usersModel;
/*
 this.find({ 'name': 'q@q.q' }, function(err, docs)
        {
            if(err) console.log(err);

            console.log(docs.length);
        });

*/
/*    var Db = mongodb.Db;
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

    */