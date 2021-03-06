var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Rank = mongoose.model('Rank');

router.get('/getRanks', function(req, res){
	Rank.remove({}, function(err, repost){
		User.find({}, function(err, users){
			// console.log(users);
			for(var i = 0; i < users.length; i ++){

				var rankObj = {};
				var score = users[i].generalPoints + (users[i].knowledgePoints * 5);
				rankObj.name = users[i].username;
				rankObj.gPoints =  users[i].generalPoints;
				rankObj.kPoints = users[i].knowledgePoints;
				rankObj.img = users[i].image;
				rankObj.score = score;
				rankObj.userID = users[i]._id

				var UserRank = new Rank(rankObj)
				UserRank.save(function(err, response){
					
				})
				// console.log(users[i]._id)
				User.update({_id: users[i]._id }, {score: rankObj.score}, function(err, user){
						// res.send('user updated with score');
				})
			}
		})
	})
})

router.get('/', function(req, res){
	Rank.find({}, function(err, response){
		sortedResponse = response.sort(function (a, b) {
          return b.score - a.score
        });
		res.send(sortedResponse);
	})
})







module.exports = router;
