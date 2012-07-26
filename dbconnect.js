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
    if (!validatePresenceOf(this.name)) {
      next(new Error('Invalid data'));
    } else {
      next();
    }
});

var userModel = function(){
    this.model = usersModelCons;

    this.findItems = function(query, callback){
        this.model.find(query, callback);
    };

    this.saveItem = function(data,callback){
        var user = new this.model(data);
        if(user){
            user.save(function(err, data){
            if(err){
                    callback('save failed');
                    return;
                }else{
                    callback(null, data.name + ' saved');
                }

            });
        }else{
            callback('wrong data');
        }

    }
}

exports.usersModel = new userModel;