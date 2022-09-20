var kBallRadius = 6.5;

var landmarks = {
    closeHatchPosition: new Pose2d(new Translation2d(48.0 + 166.57, 27.44 - 10.0 - 162.0), new Rotation2d(-30.0)),
    farHatchPosition: new Pose2d(new Translation2d(229.13 + 14.71, 27.44 - 10.0 - 162.0), new Rotation2d(-150.0)),
    humanLoaderPosition: new Pose2d(new Translation2d(0.0, 25.72 - 162.0), new Rotation2d(0.0)),
    autoBallPosition: new Pose2d(new Translation2d(48.0 - 4.0 - kBallRadius, 97.0 - (3.0*kBallRadius) - 162.0), new Rotation2d(-45.0)),
    rocketPortPosition: new Pose2d(new Translation2d(229.13, 27.44 - 162.0), new Rotation2d(-90.0)),
    closeShipPosition: new Pose2d(new Translation2d(260.8, -28.87), new Rotation2d(90.0)),
    midShipPosition: new Pose2d(new Translation2d(282.55 + 1.0, -28.87), new Rotation2d(90.0)),
    farShipPosition: new Pose2d(new Translation2d(304.3, -28.87), new Rotation2d(90.0))
};

var kRobotHalfLength = 36.5 / 2;
var kRobotHalfWidth = 36.5 / 2;

var fieldPoses = {
    autoStartingPose: new Pose2d(new Translation2d(48.0 + kRobotHalfLength, 97.0 + kRobotHalfWidth - 162.0), new Rotation2d(-90)),
    closeHatchScoringPose: landmarks.closeHatchPosition.transformBy(new Pose2d(new Translation2d(-kRobotHalfLength - 3.5, -2.0), new Rotation2d(0))),
    farHatchScoringPose: landmarks.farHatchPosition.transformBy(new Pose2d(new Translation2d(-kRobotHalfLength - 5.0, 8.0), new Rotation2d(0))),
    humanLoaderPose: landmarks.humanLoaderPosition.transformBy(new Pose2d(new Translation2d(kRobotHalfLength - 4.0, 2.0), new Rotation2d(0))),
    ballIntakePose: new Pose2d(landmarks.autoBallPosition.transformBy(new Pose2d(new Translation2d(kRobotHalfLength + 9.0, 0.0), new Rotation2d(0))).translation, new Rotation2d(0)),
    portScoringPose: landmarks.rocketPortPosition.transformBy(new Pose2d(new Translation2d(-kRobotHalfLength - 6.0, 0.0), new Rotation2d(0))),
    farShipScoringPose: landmarks.farShipPosition.transformBy(new Pose2d(new Translation2d(-kRobotHalfLength - 4.0, 0.0), new Rotation2d(0))),
    midShipScoringPose: landmarks.midShipPosition.transformBy(new Pose2d(new Translation2d(-kRobotHalfLength - 4.0, 0.0), new Rotation2d(0))),
    closeShipScoringPose: landmarks.closeShipPosition.transformBy(new Pose2d(new Translation2d(-kRobotHalfLength - 4.0, 6.0), new Rotation2d(0)))
};

function importPath(text) {
    var lines = text.split('\n');
    console.log(lines[0]);

    var line;
    for (line of lines) {
        if (line.includes("waypoints.add")) {
            
        }
    }
}

function getClipboard() {
    navigator.clipboard.readText()
    .then(text => {
        console.log('Pasted content: ', text);
        importPath(text);
    })
    .catch(err => {
        console.error('Failed to read clipboard contents: ', err);
    });
}

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                //inp.value = this.getElementsByTagName("input")[0].value;
                inp.updateFields(this.getElementsByTagName("input")[0].value);
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  }