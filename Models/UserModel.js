var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require("jsonwebtoken")

var UserSchema = new mongoose.Schema({
	googleId: String,
	facebookId: String,
	displayName: String,
	username: {type: String, lowercase: true, unique: true},
	email: {type: String, lowercase: true, unique: true},
	image: String,
	passwordHash: String,
	salt: String,
	createdDate: Date,
	deactivatedDate: Date,
	lat: Number,
	lng: Number,
	tags: [{type: String}],
	radius: Number,
	generalPoints: Number,
	knowledgePoints: Number,
	questions: [{type: mongoose.Schema.Types.ObjectId, ref: "Questions"}],
	answers: [{type: mongoose.Schema.Types.ObjectId, ref: "Answers"}]
	//commentsMade?
});

UserSchema.methods.generateJWT = function() {
	var name = this.username || this.displayName;
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 36500);
	return jwt.sign({
		id : this._id,
		username : name,
		exp: exp.getTime() / 1000
	}, "super_secret");
}

UserSchema.methods.setPassword = function(password) {
	this.salt = crypto.randomBytes(64).toString('hex');
	this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
}

UserSchema.methods.checkPassword = function(password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	return hash === this.passwordHash;
};

mongoose.model('User', UserSchema);
