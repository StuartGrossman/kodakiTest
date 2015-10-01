(function() {
	'use strict';
	angular.module('app')
	.controller('QuestionAnwserController', QuestionAnwserController);

	QuestionAnwserController.$inject = ['$state', 'QuestionFactory', '$stateParams', 'AnswerFactory', '$rootScope'];

	function QuestionAnwserController($state, QuestionFactory, $stateParams, AnswerFactory, $rootScope) {
		var vm = this;
		vm.edit = {}

		console.log($stateParams)

		vm.AnswerObj = {};

		vm.status = $rootScope._user

		console.log(vm.status)
		//logic for grabing individual question From questions feed
		if(!$stateParams.id){
			console.log('question error')
			alert('no question found')
		}else{

			QuestionFactory.findQuestion($stateParams.id).then(function(res){
				console.log('found question')
				vm.question = res
				console.log(vm.question)
			})
		}
		//options for showing edit and delete buttons
		vm.showOptions = function(){
			vm.options = true;
		}
		vm.hideOptions = function(){
			vm.options = false;
			vm.showEdit = false;
		}

		// Answer Logic
		vm.addAnswer = function(){
			//AnswerObj is the answer for question
			// vm.AnswerObj.answerBody = vm.answer // sets answer
			vm.AnswerObj.user_id = vm.status.id // sets user who submited it
			console.log(vm.AnswerObj)
			AnswerFactory.addAnswer(vm.AnswerObj).then(function(res){
				console.log('added answer')
				// console.log(res);
				vm.loading = true; // showing loading gif
				vm.AnswerObj = {}  // removes local object answer
				// console.log(res)
				var AnswerId = {}
				AnswerId.id = res._id // saves id of answer
				var QuestionId = $stateParams.id

				
				QuestionFactory.addIdRef(AnswerId, QuestionId).then(function(res){ // function to add ref to question
					
					QuestionFactory.findQuestion($stateParams.id).then(function(res){
						console.log('found question')
						vm.question = res
						console.log(vm.question)

						vm.loading = false;
					})
				})
			}
			//hadling errors
			// , function(res){   
			// 	console.log(res);
			// 	vm.errorMessage = res;
			// }
			)
		}

		vm.deleteQuestion = function(quesiton_id){
			console.log('hitting delete in controller')
			QuestionFactory.deleteQuestion(quesiton_id).then(function(res){
				console.log('soft deleted question')
				$state.go('QuestionsFeed')
			})
		}

		vm.editQuestion = function(){
			vm.showEdit = true;
			
		}

		vm.submitEdit = function(edit){
			vm.showEdit = false;
			
			// vm.edit.questionBody = edit
			QuestionFactory.editQuestion($stateParams.id, vm.edit).then(function(res){
				QuestionFactory.findQuestion($stateParams.id).then(function(res){
						console.log('found question')
						vm.question = res
						console.log(vm.question)
						vm.loading = false;
						vm.edit = {}
					})
			})
		}
	}
})();