(function() {
  'use strict';
  angular.module('app')
  .controller('CreateQuestionController', CreateQuestionController);

  CreateQuestionController.$inject = ['$state', 'QuestionFactory', '$rootScope', "UserFactory"];

  function CreateQuestionController($state, QuestionFactory, $rootScope, UserFactory) {
    var vm = this;
    vm.status = UserFactory.status;
    if(!vm.status._user){
      $state.go("Home");
    }
    vm.question = {};
    vm.createQ = createQ;
    // vm.showTagInput = showTagInput;
    vm.getQuestions = getQuestions;
    vm.addTag = addTag;
    vm.deleteTag = deleteTag;
    vm.saveTags = saveTags;
    vm.addQlocation = addQlocation;
    vm.Qsubmit = true;
    vm.Qfeed = true;
    vm.getQuestions(); //getting all questions when page loads

    // document.getElementById("qDirections").addEventListener("click", function() {
    //   vm.createQDirections = false;
    //   console.log("hey")
    // });

function getQuestions() {
  QuestionFactory.findQuestions(vm.status._user.id).then(function(res) {
        vm.Qfeed = false;
        //Adds dateInMilliseconds to all questions to for sorting purposes

        vm.allquestions = res.map(function (item) {
          item.createdDate = new Date(item.createdDate);
          item.dateInMilliseconds = item.createdDate.getTime();
          return item;
        }).sort(function (a, b) {
          return b.dateInMilliseconds - a.dateInMilliseconds;
        });
        console.log(vm.allquestions);
      });
}


    //////Method to create question!

    function createQ() {
      vm.Qsubmit = false;
      vm.question.questionBody = vm.desc;
      vm.desc = null; // setting desc to questionbody
      console.log(vm.status._user.id);
      vm.question.user_id = vm.status._user.id;
      // vm.question.tag = vm.tag


      if (!vm.question.lat && !vm.question.lng) {
        QuestionFactory.getLocation().then(function(res) {
          console.log(res);
          //setting lng and lat if user has not selected it
          console.log('getting location');

          vm.question.lat = res.location.lat;
          vm.question.lng = res.location.lng;

          // console.log(vm.question)
          // console.log('creating quesiton');
          QuestionFactory.createQuestion(vm.question).then(function(res) {
            console.log(res);
            vm.saveTags(res);
            vm.question = {}; // deleting question object
            vm.desc = ''; // deleting question in html
            $state.go('QuestionsFeed');
          });
        });
      } else { //skips api call to find location
        console.log('skipped getting locaiton');
        QuestionFactory.createQuestion(vm.question).then(function(res) {
          console.log(res);
          vm.saveTags(res);
          vm.question = {}; // deleting question object
          vm.desc = ''; // deleting question in html
          $state.go('QuestionsFeed');
        });

      }

    }

    //handling tag creation!
    vm.tag = "";
    var counter = 0;
    vm.tags = [];

    // function showTagInput() {
    //   counter += 1
    //   vm.showInput = true;
    //   if (counter % 2 === 0) {
    //     vm.showInput = false;
    //   }
    //   console.log(vm.showInput);
    // }

    function addTag(tag) {
      vm.tagError = false;
      if (tag == "") {
        return;
      }
      var split_tag = tag.split('')
      console.log(split_tag)
      for (var k = 0; k < split_tag.length; k++) {
        if (split_tag[k] === ' ') {
          vm.tagError = true;
          return;
        }
      }
      vm.tags.push(tag.toLowerCase());
      vm.tag = ""
    }

    function deleteTag(index) {
      vm.tags.splice(index, 1);
    }

    function saveTags(question_id) {
      console.log('in save tags' + question_id);
      QuestionFactory.addTags(vm.tags, question_id).then(function(res) {
        console.log('saved tags');
        //alerts all users!
        QuestionFactory.sendAlerts(question_id).then(function(res) {
          console.log('lookng to send alerts');
        })
      }, function(res) {
        console.log('skpped tags, still trying to alert');
        QuestionFactory.sendAlerts(question_id).then(function(res) {
          console.log('lookng to send alerts');
        })
      })
    }

    ////Map Search
    function addQlocation() {
      vm.mapStatus = true;
      var geocoder = new google.maps.Geocoder();
      var geocoderRequest = {
        address: vm.questionLocation
      };
      geocoder.geocode(geocoderRequest, function(results, status) {
        console.log(results[0]);
        var loc = results[0].geometry.location;
        console.log(loc);
        vm.question.lat = loc.lat();
        vm.question.lng = loc.lng();
        console.log(vm.question);
        vm.map = new google.maps.Map(document.getElementById('map'), {
          center: {
            lat: loc.lat(),
            lng: loc.lng()
          },
          scrollwheel: true,
          zoom: 11,
        })
        var marker = new google.maps.Marker({
          map: vm.map,
          position: new google.maps.LatLng(loc.lat(), loc.lng()),
          title: 'Your Current Location',
          draggable: true
        });
        google.maps.event.addListener(marker, 'dragend', function() {
          if (vm.cityCircle) {
            vm.cityCircle.setMap(null);
          }
          console.log(marker)
          vm.question.lat = marker.position.lat();
          vm.question.lng = marker.position.lng();
          console.log(vm.question);


        });
      });
}
}

})();
