var app = angular.module('plunker', []);

app.controller('MainCtrl', ['$scope', '$http', function($scope, $http, $filter){


//--------LOAD COURSE DIRECTORY DATA

$scope.userType = "none";
$scope.userID = -1;
$scope.name = "none";
$scope.userNameValue = "student";
$scope.lectureInfo = [];
$scope.selectedAssign = "";
$scope.maxID = 0;
$scope.allFeedData;
$scope.currentLect = "";

var currentIndex;//current course - local var
$scope.test = new Array();
     $scope.test.push('Hello');
     $scope.test.push('bye');

//TO DO: SET TO RUN ONLY AFTER SUCCESSFUL LOG IN
function getCourses(){
	var dirURL = "https://caab.sim.vuw.ac.nz/api/millsmade1/course_directory.json";
	$http.get(dirURL).then(
		function success(info){
			$scope.allCourseData = info.data.courses;
			console.log($scope.allCourseData);
		},
		function failure(){
			alert("fail");
		}
		);
}


//info for single test (eg selceted) REMOVE THIS
	$scope.courseName ="CLASS123";
	$scope.trimester = 1;
	$scope.lecture = "FirstName LastName";
	$scope.year = 2021;
	$scope.courseDesc ="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco boris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";




//fucniton to update course info
	$scope.updateCourse = function(){
  		if($scope.courseNameEdit != ""  && $scope.trimesterEdit != "" && $scope.lectureEdit.ID != "" && $scope.yearEdit != "" && $scope.courseDescEdit != ""){//SUCCESS
  			
  			//TO CHANGE - local display - not a nice way to do it but whatever
  			$scope.currentCourse.Name = $scope.courseNameEdit;
  			$scope.currentCourse.Trimester = $scope.trimesterEdit;
			$scope.currentCourse.LecturerID = $scope.lectureEdit.ID;
			$scope.currentCourse.Year = $scope.yearEdit;
			$scope.currentCourse.Overview = $scope.courseDescEdit;

			//ID Name, Overview, Year Trimester, LectureTimes, LecturerID

			//update in db
			var url =  "https://caab.sim.vuw.ac.nz/api/millsmade1/update.course_directory.json";
			var updateObj = {
				"ID": $scope.currentCourse.ID,
				"Name": $scope.courseNameEdit,
				"Overview": $scope.courseDescEdit,
				"Year": $scope.yearEdit,
				"Trimester": $scope.trimesterEdit,
				"LectureTimes": $scope.currentCourse.LectureTimes,//CHANGE THIS _ ADD TO EDIT
				"LecturerID": $scope.lectureEdit.ID}
			$http.post(url, updateObj).then(
				function success(){
					//recall all data from db to get updates
					getCourses();
					//$scope.successFeedback = "Update Successful";
					$scope.showDirectory();
					$scope.successFeedback = "Update Successful";
				},
				function failure(){
					$scope.errorFeedback = "Error Updating Info";
				}
				);

			
			
		}else{
			$scope.errorFeedback = "Error Updating Info";
		}
	}

//sleect individual course display
$scope.selectCourse = function(courseIndex){


	currentIndex = courseIndex;
	getAssignments();
	//alert(courseIndex);
	hideall();
	//console.log($scope.allCourseData[courseIndex]);
	
	$scope.currentCourse = $scope.allCourseData[courseIndex];
	//alert(JSON.stringify($scope.lectureInfo));
	for(var i =0; i<$scope.lectureInfo.length; i++){
		if($scope.lectureInfo[i].ID== $scope.currentCourse.LecturerID){
			$scope.currentLect=$scope.lectureInfo[i].name;
		}
	}
	console.log($scope.currentCourse);
	console.log($scope.currentCourse.Name);
	$scope.displayDirectory = false;
	$scope.displayindvcourse = true;

}

//display indv course- no info change
function displayCourse(){
	hideall();
	$scope.displayindvcourse = true;

}

//delete course 
$scope.deleteCourse = function(){
	var url = "https://caab.sim.vuw.ac.nz/api/millsmade1/delete.course."+$scope.currentCourse.ID+".json";;
	$http.delete(url).then(
		function success(){
			getCourses();
			$scope.showDirectory();
			$scope.successFeedback = "Course Removed Successfully";
		},
		function failure(){
			alert("fail");
		}
		)

	

	
	//$scope.showDirectory();
	//$scope.allCourseData.splice(currentIndex,1);
	//$scope.successFeedback = "Course Removed Successfully";
}


//--------------BUTTONS HIDE/SHOW-------

//implement hide all function
$scope.displayDirectory = false;
$scope.displayFeed = false;
$scope.displayindvcourse = false;
$scope.displayeditcourse = false;
$scope.displayeditassign = false;
$scope.displaynewassign = false;
$scope.displayaddcourse = false;
$scope.displayButtons = false;
$scope.displayLogin = true;
$scope.displayLogout = false;

$scope.staffDisplay = false;
$scope.studentDisplay = false;

$scope.showDirectory = function (){
	hideall();
	$scope.displayDirectory = true;
}

function hideall(){
	$scope.successFeedback = ""; //in case of early escape - CHANGE TO ng-show
	$scope.errorFeedback = "";
	$scope.displayDirectory = false;
	$scope.displayFeed = false;
	$scope.displayindvcourse = false;
	$scope.displayeditcourse = false;
	$scope.displayeditassign = false;
	$scope.displaynewassign = false;
	$scope.displayaddcourse = false;
}

//--------------BUTTONS HIDE/SHOW Edit Course-------
$scope.editCourse = function(){
	hideall();
	getAssignments();
	$scope.displayeditcourse = true;
	//edit variables (initially equal to display vars)
	$scope.courseNameEdit = $scope.currentCourse.Name;
	$scope.courseCodeEdit = $scope.currentCourse.ID;
	$scope.trimesterEdit = parseInt($scope.currentCourse.Trimester);
	$scope.lectureEdit = $scope.currentCourse.LecturerID;
	$scope.yearEdit = $scope.currentCourse.Year;
	$scope.courseDescEdit = $scope.currentCourse.Overview;
}

//--------------ADD Course-------

$scope.newCourse = function(){
	hideall();
	$scope.displayaddcourse = true;
	//edit variables (initially equal to display vars)
	$scope.courseNameEdit = "";
	$scope.courseCodeEdit = "";
	$scope.trimesterEdit = "";
	$scope.lectureEdit = "";
	$scope.yearEdit = "";
	$scope.courseDescEdit = "";
	$scope.lectTimesEdit = "";
}

$scope.addValidCourse = function(){
	//check existing courses:
	var dupe = 0;
	for(var i = 0; i < $scope.allCourseData.length; i++){
		if($scope.allCourseData[i].ID == $scope.courseCodeEdit){
			dupe = 1;
			break;
		}
	}
	if(dupe){
		$scope.errorFeedback = "Could not add course - duplicate courseID";
	}else if($scope.courseNameEdit != ""  && $scope.trimesterEdit != "" && $scope.lectureEdit != "" && $scope.yearEdit != "" && $scope.courseDescEdit != "" && $scope.courseCodeEdit != "" && $scope.lectTimesEdit != ""){//SUCCESS
		var url =  "https://caab.sim.vuw.ac.nz/api/millsmade1/update.course_directory.json";
		var updateObj = {
			"ID": $scope.courseCodeEdit,
			"Name": $scope.courseNameEdit,
			"Overview": $scope.courseDescEdit,
			"Year": $scope.yearEdit,
			"Trimester": $scope.trimesterEdit,
			"LectureTimes": $scope.lectTimesEdit,
			"LecturerID": $scope.lectureEdit
		}	

		$http.post(url, updateObj).then(
			function success(){
				//recall all data from db to get updates
				getCourses();
				$scope.successFeedback = "Update Successful";
				$scope.displayDirectory = true;
				$scope.displayaddcourse = false;
			},
			function failure(){
				$scope.errorFeedback = "Error Updating Info";
			}
		);	
	


	}else{
		$scope.errorFeedback = "Could not add course - Missing Data";
	}

}
//-------------------------ADD ASSIGNMENT--------------
//addAssignment
$scope.addAssignment =  function(){
	
	hideall();
	//alert($scope.currentCourse.ID);
	//also need unused ID
	$scope.displaynewassign = true;
	$scope.assignNameEdit = "";
	$scope.assignDateEdit = "";
	$scope.assignDescEdit = "";

}
function findMaxID(){
	//alert("running");
	//find unused assignID
	var max = 1;
	var url = "https://caab.sim.vuw.ac.nz/api/millsmade1/assignment_directory.json";
	$http.get(url).then(
  	function success(info) {
  		for(i=0; i<info.data.assignments.length;i++){
  			//alert(i);
  			if(parseInt(info.data.assignments[i].ID) > max){
  				max = parseInt(info.data.assignments[i].ID);
  				
  			}
  		}
  		$scope.maxID = max + 1;
	},function failure(){
  alert ("Error getting assignment info");
}
);

	
}
$scope.addNewAssign = function(){
	findMaxID();
	if($scope.assignNameEdit != ""  && $scope.assignDateEdit != "" && $scope.assignDescEdit != ""){//SUCCESS
			//update in db
			var url =  " https://caab.sim.vuw.ac.nz/api/millsmade1/update.assignment_directory.json";
			var updateObj = {
				"ID": $scope.maxID,
				"Name": $scope.assignNameEdit,
				"Overview": $scope.assignDescEdit,
				"CourseID": $scope.currentCourse.ID,
				"DueDate": $scope.assignDateEdit
			};
			$http.post(url, updateObj).then(
				function success(){

					//recall all data from db to get updates
					getCourses();
					//$scope.successFeedback = "Update Successful";
					$scope.showDirectory();
					$scope.successFeedback = "Added Successfully";
				},
				function failure(){
					$scope.errorFeedback = "Error Adding Assignment";
				}
				);
		}else{
			$scope.errorFeedback = "Error Updating Info - empty fields";
		}

}
//---DELETE ASSIGNMENT------
//delete course 
$scope.deleteAssign = function(ID){
	alert($scope.currentAssignmentInfo[ID].ID);
	var url = "https://caab.sim.vuw.ac.nz/api/millsmade1/delete.assignment."+$scope.currentAssignmentInfo[ID].ID+".json";
	$http.delete(url).then(
		function success(){
			getCourses();
			$scope.showDirectory();
			$scope.successFeedback = "Course Removed Successfully";
		},
		function failure(){
			alert("fail");
		}
		)

	

	
	//$scope.showDirectory();
	//$scope.allCourseData.splice(currentIndex,1);
	//$scope.successFeedback = "Course Removed Successfully";
}

  //-------------------RUN LOGIN AGAINST USER LIST--------
function checkUsers(data){
	var found = false;
  for(var i = 0; i < data.length; i++){
    if($scope.Username == data[i].LoginName && $scope.Password == data[i].Password && $scope.userNameValue == data[i].UserType){
      found = true;
      break;
    }  
  }

  if(found){
  	//alert("Successfully Logged in");
  	successfulLogin(data[i].ID, data[i].UserType, data[i].LoginName);
  }else{
  	alert("Invalid Login");
  }
}

/*called after valid login*/
function successfulLogin(userID, userType, userName){
	//reset input values
	$scope.Username = "";
	$scope.Password = "";
	$scope.userNameValue = "student";

	if(userType == "student"){
		$scope.staffDisplay = false;
		$scope.studentDisplay = true;

	}else{
		$scope.staffDisplay = true;
		$scope.studentDisplay = false;

	}
	getCourses();
	hideall();
	$scope.userType = userType;
	$scope.userID = userID;
	$scope.displayDirectory = true;
	$scope.displayButtons = true;
	$scope.displayLogin = false;
	$scope.displayLogout = true;
	$scope.name = userName;
}


/*Logout function */
$scope.logout = function(){
	//reset user variables
	$scope.userType = "none";
	$scope.userID = -1;
	$scope.name = "none";

	//reset display
	$scope.displayDirectory = false;
	$scope.displayButtons = false;
	$scope.displayLogin = true;
	$scope.displayLogout = false;
	$scope.staffDisplay = false;
	$scope.studentDisplay = false;



}

function getLectureUsers(data){
	$scope.lectureInfo = [];

	for(var i = 0; i < data.length; i++){
    if(data[i].UserType == "lecturer"){
    	var obj = {name: data[i].LoginName, ID : data[i].ID};
        $scope.lectureInfo.push(obj);
    }  
  }

}
//$scope.userNameValue = "student"
$scope.Login=function() {

var url = "https://caab.sim.vuw.ac.nz/api/millsmade1/user_list.json";


$http.get(url).then(
  function success(info) {
	getLectureUsers(info.data.users);//should be one var but i am lazy
    var data = info.data.users;
    //alert(JSON.stringify(data))
    checkUsers(data);
},
function failure(){
  alert ("Unsuccessful");
}
);

}
//ASSIGNMENTS

function getAssignments(){//query for all assignments - initial call

	var url = "https://caab.sim.vuw.ac.nz/api/millsmade1/assignment_directory.json";
	$http.get(url).then(
  function success(info) {
	getAssignmentList(info.data.assignments);//should be one var but i am lazy
	},function failure(){
  alert ("Error getting assignment info");
}
);

}

function getAssignmentList(data){//assignments for current selection
	$scope.currentAssignmentInfo = [];
	for(var i = 0; i < data.length; i++){
    if(data[i].CourseID == $scope.currentCourse.ID){
    	var dateString = data[i].DueDate.split('T');
    	var obj = {ID:data[i].ID,Name:data[i].Name,Overview:data[i].Overview,DueDate:data[i].DueDate,dateString:dateString[0]};
        $scope.currentAssignmentInfo.push(obj);
    }  
  }


}


$scope.editAssignment =  function(assignID){
	selectAssign(assignID);
	
	hideall();
	$scope.displayeditassign = true;
	$scope.assignNameEdit = $scope.selectedAssign.Name;
	$scope.assignDateEdit = new Date($scope.selectedAssign.DueDate);
	$scope.assignDescEdit = $scope.selectedAssign.Overview;

	
}

function selectAssign(ID){
	for(var i = 0; i < $scope.currentAssignmentInfo.length; i++){
		if($scope.currentAssignmentInfo[i].ID == ID){
			$scope.selectedAssign = $scope.currentAssignmentInfo[i];
			break;
		}

	}
}

$scope.updateAssign = function(){
	if($scope.assignNameEdit != ""  && $scope.assignDateEdit != "" && $scope.assignDescEdit != ""){//SUCCESS
			//update in db
			var url =  " https://caab.sim.vuw.ac.nz/api/millsmade1/update.assignment_directory.json";
			var updateObj = {
				"ID": $scope.selectedAssign.ID,
				"Name": $scope.assignNameEdit,
				"Overview": $scope.assignDescEdit,
				"CourseID": $scope.currentCourse.ID,
				"DueDate": $scope.assignDateEdit
			};
			$http.post(url, updateObj).then(
				function success(){

					//recall all data from db to get updates
					getCourses();
					//$scope.successFeedback = "Update Successful";
					$scope.showDirectory();
					$scope.successFeedback = "Update Successful";
				},
				function failure(){
					$scope.errorFeedback = "Error Updating Info";
				}
				);
		}else{
			$scope.errorFeedback = "Error Updating Info - empty fields";
		}

}

//------------------COURSE FEED-------------------------------------
$scope.showFeed = function (){
	hideall();
	$scope.displayFeed = true;
	//get correct courses
	//alert($scope.userID);
	callGetFeed();



}
function callGetFeed(){
	var url =  "https://caab.sim.vuw.ac.nz/api/millsmade1/course_association_directory.json";

	$http.get(url).then(
  function success(info) {
	getUserFeed(info.data.courseAssociations);//should be one var but i am lazy
	},function failure(){
  alert ("Error getting feed");
}
);

}
function getUserFeed(data){//assignments for current selection
	var currentFeedIDs = [];
	$scope.allFeedData = [];
	//get course IDs
for(var i = 0; i < data.length; i++){
    if(data[i].StudentID == $scope.userID){
    	//var obj = {ID:data[i].ID,Name:data[i].Name,Overview:data[i].Overview,DueDate:data[i].DueDate};
        currentFeedIDs.push(data[i].CourseID);
    }  
  }
  //get courses associated with course IDs
  //ID //NAME//Overview // Year //Trimester //LectureTimes //LecturerID
 for(var j = 0; j < $scope.allCourseData.length; j++){
 	if(currentFeedIDs.includes($scope.allCourseData[j].ID)){
 		//alert($scope.allCourseData[j].ID);
 		var obj = {ID:$scope.allCourseData[j].ID,Name:$scope.allCourseData[j].Name,Year:$scope.allCourseData[j].Year,Trimester:$scope.allCourseData[j].Trimester}
        $scope.allFeedData.push(obj);
 	}
 }
//alert($scope.allFeedData.length);

//alert(currentFeedIDs);
//alert($scope.allCourseData);
}  
$scope.deleteFromFeed = function(index){
	//know course and user ID - get assoc id form table
	var url =  "https://caab.sim.vuw.ac.nz/api/millsmade1/course_association_directory.json";
	//alert($scope.allFeedData[index].ID);
	$http.get(url).then(
  function success(info) {
  	for(var i = 0 ; i< info.data.courseAssociations.length; i++){
  		if(info.data.courseAssociations[i].StudentID == $scope.userID && info.data.courseAssociations[i].CourseID==$scope.allFeedData[index].ID){
  			var url = "https://caab.sim.vuw.ac.nz/api/millsmade1/delete.course_association."+info.data.courseAssociations[i].ID+".json";
  			$http.delete(url).then(
			function success(){
				getCourses();
				$scope.showFeed();
				$scope.successFeedback = "Feed Successfully Updated";
			},
			function failure(){
				alert("fail");
			}
			)
  		}
  	}
	getUserFeed(info.data.courseAssociations);//should be one var but i am lazy
	},function failure(){
  alert ("Error getting feed data");
}
);
}

$scope.addToFeed =function(){
	var url =  "https://caab.sim.vuw.ac.nz/api/millsmade1/course_association_directory.json";

	$http.get(url).then(
  function success(info) {
	getUserFeed(info.data.courseAssociations);//should in early function but runs weird
	//alert($scope.currentCourse.ID);
	var dupe = false;
	for(var i = 0; i < $scope.allFeedData.length; i++){
		if($scope.allFeedData[i].ID == $scope.currentCourse.ID){
			
			dupe = true;
		}
	}
	if(dupe == false){
	var max = 1;
	var url = "https://caab.sim.vuw.ac.nz/api/millsmade1/course_association_directory.json";
	$http.get(url).then(
  	function success(info) {
  		for(i=0; i<info.data.courseAssociations.length;i++){
  			if(parseInt(info.data.courseAssociations[i].ID) > max){
  				max = parseInt(info.data.courseAssociations[i].ID);
  				
  			}
  		}
  		var url2 = "https://caab.sim.vuw.ac.nz/api/millsmade1/update.course_association_directory.json"
  		var obj={ID:max+1,StudentID:$scope.userID,CourseID:$scope.currentCourse.ID};
  		//alert(JSON.stringify(obj));
  		$http.post(url2, obj).then(
			function success(){
				//recall all data from db to get updates
				getCourses();
				$scope.successFeedback = "Update Successful";
				$scope.displayDirectory = true;
				$scope.displayindvcourse = false;
			},
			function failure(){
				$scope.errorFeedback = "Error Updating Info";
			}
		);	



	},function failure(){
 // alert ("Error getting assignment info");
}
);

}else{
	$scope.errorFeedback = "Error Adding to feed - course ID already exists";
}
},function failure(){
  alert ("Error getting feed");
}
);
}



}]);