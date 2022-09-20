var points = [];
var pointDescriptors = [];
var splinePoints = [];
var splines = [];
var currentSpline = null;
var currentSplineIndex;
var splineUpdateList = [];

var splineTrackables = [];
var splineTracers = [];
var splineT = 0;

var robot;
var robotTraceAuto;
var colors = 2.3;
var colorIndex = 0;
var scalingFactor = 1.75;

var draggingPoint = false;

function transformPose(Pose) {
	return {
		X: Pose.X * scalingFactor,
		Y: (Pose.Y+162.0) * scalingFactor,
		T: Pose.T + 90.0
	};
};

function getFieldX(pixelX) {
    return pixelX / scalingFactor;
}

function getFieldY(pixelY) {
    return (pixelY / scalingFactor) - 162;
}

function getPixelX(fieldX) {
    return fieldX * scalingFactor;
}

function getPixelY(fieldY) {
    return (fieldY + 162) * scalingFactor;
}

function isInArray(array, item) {
    var i;
    for (i of array) {
        if (i === item)
            return true;
    }
    return false;
}

function removeDuplicates(array) {
    result = [];
    var i;
    for (i of array) {
        if (!isInArray(result, i))
            result.push(i);
    }
    return result;
}

function generateSpline(index) {
    if (splinePoints.length > 1) {
        if (index === 0) {
            splines[0] = new QuinticHermiteSpline(splinePoints[0], splinePoints[1]);
            splineUpdateList.push(0);
        } else if (index === splinePoints.length - 1) {
            splines[splinePoints.length - 2] = new QuinticHermiteSpline(splinePoints[splinePoints.length - 2], splinePoints[splinePoints.length - 1]);
            splineUpdateList.push(splinePoints.length - 2);
        } else {
            splines[index - 1] = new QuinticHermiteSpline(splinePoints[index - 1], splinePoints[index]);
            splines[index] = new QuinticHermiteSpline(splinePoints[index], splinePoints[index + 1]);
            splineUpdateList.push(index - 1);
            splineUpdateList.push(index);
        }
        splineUpdateList = removeDuplicates(splineUpdateList);
        currentSplineIndex = splineUpdateList[0];
        currentSpline = splines[currentSplineIndex];
        splineT = 0;
    }
}

function updatePoint(point, yField, xField, tField, splinePoint, splineIndex, pointIndex, height, width) {
    point.style.top = (getPixelY(Number(yField.value)) - height / 2) + "px";
    point.style.left = (getPixelX(Number(xField.value)) - width / 2) + "px";
    splinePoint.translation.x = Number(xField.value);
    splinePoint.translation.y = Number(yField.value);
    splinePoint.rotation = new Rotation2d(Number(tField.value));
    console.log("splineIndex: " + splineIndex + ", lastIndex: " + (splines.length - 1));
    if(pointIndex === 0 || pointIndex === splinePoints.length - 1)
        splineTracers[splineIndex].reset();
    else {
        splineTracers[splineIndex].reset();
        splineTracers[splineIndex + 1].reset();
    }
    generateSpline(pointIndex);
}

// Make the DIV element draggable:
//dragElement(document.getElementById("mydiv"));

function dragElement(elmnt, yField, xField, tField, splinePoint, splineIndex, pointIndex, height, width) {

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        draggingPoint = true;
        e = e || window.event;
        e.preventDefault();
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        elmnt.style.top = (e.clientY - height / 2) + "px";
        elmnt.style.left = (e.clientX - width / 2) + "px";
        xField.value = getFieldX(e.clientX);
        yField.value = getFieldY(e.clientY);
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
        updatePoint(elmnt, yField, xField, tField, splinePoint, splineIndex, pointIndex, height, width);
    }
}

function copyToClip(str) {
    function listener(e) {
      e.clipboardData.setData("text/html", str);
      e.clipboardData.setData("text/plain", str);
      e.preventDefault();
    }
    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);
};

function printMousePos(event) {
    if (getFieldX(event.clientX) > 648 || getFieldY(event.clientY) > 162)
        return;

    if (draggingPoint) {
        draggingPoint = false;
        return;
    }

    var splinePoint = new Pose2d(new Translation2d(getFieldX(event.clientX), getFieldY(event.clientY)), new Rotation2d(0));
    splinePoints.push(splinePoint);
    var pointIndex = splinePoints.length - 1;
    var splineIndex = (pointIndex === 0) ? 0 : splinePoints.length - 2;

    var width = 10;
    var height = 10;

    var point = document.createElement("div");
    point.id = "point" + splinePoints.length;
    point.className = "point";
    point.style.height = height + "px";
    point.style.width = width + "px";
    point.style.backgroundColor = "black";
    point.style.position = "absolute";
    point.style.top = (event.clientY - height / 2) + "px";
    point.style.left = (event.clientX - width / 2) + "px";
    point.style.zIndex = "1000";
    point.style.borderRadius = (width / 2) + "px";
    document.body.appendChild(point);
    points.push(point);

    var descriptor = document.createElement("div");
    descriptor.id = "descriptor" + splinePoints.length;
    descriptor.className = "pointDescriptor autocomplete";
    descriptor.style.width = document.getElementById("field").style.width;
    descriptor.onmouseenter = function() {
        descriptor.style.backgroundColor = "#302d2d";
        point.style.backgroundColor = "#8f8f8f";
    }
    descriptor.onmouseleave = function() {
        descriptor.style.backgroundColor = "black";
        point.style.backgroundColor = "black";
    }

    var xLabel = document.createElement("p");
    xLabel.textContent = "X:";
    xLabel.style.marginLeft = "10px";
    xLabel.className = "pointText";
    descriptor.appendChild(xLabel);
    
    var xField = document.createElement("input");
    xField.type = "text";
    xField.name = "X";
    xField.value = getFieldX(event.clientX);
    xField.className = "descriptorField";
    xField.onchange = function() {
        updatePoint(point, yField, xField, tField, splinePoint, splineIndex, pointIndex, height, width);
    }
    descriptor.appendChild(xField);

    var yLabel = document.createElement("p");
    yLabel.textContent = "Y:";
    yLabel.className = "pointText";
    descriptor.appendChild(yLabel);

    var yField = document.createElement("input");
    yField.type = "number";
    yField.name = "Y";
    yField.value = getFieldY(event.clientY);
    yField.className = "descriptorField";
    yField.oninput = function() {
        updatePoint(point, yField, xField, tField, splinePoint, splineIndex, pointIndex, height, width);
    }
    descriptor.appendChild(yField);

    var tLabel = document.createElement("p");
    tLabel.textContent = "Heading:";
    tLabel.className = "pointText";
    descriptor.appendChild(tLabel);

    var tField = document.createElement("input");
    tField.type = "number";
    tField.name = "T";
    tField.value = 0;
    tField.className = "descriptorField";
    tField.oninput = function() {
        updatePoint(point, yField, xField, tField, splinePoint, splineIndex, pointIndex, height, width);
    }
    descriptor.appendChild(tField);

    var button = document.createElement("input");
    button.type = "button";
    button.value = "Update";
    button.className = "delete blueButton";
    button.onclick = function() {
        updatePoint(point, yField, xField, tField, splinePoint, splineIndex, pointIndex, height, width);
    }
    descriptor.appendChild(button);

    var copyPoint = document.createElement("input");
    copyPoint.type = "button";
    copyPoint.value = "Copy";
    copyPoint.className = "delete blueButton";
    copyPoint.onclick = function() {
        var str = `waypoints.add(new Pose2d(new Translation2d(${xField.value}, ${yField.value}), Rotation2d.fromDegrees(${tField.value})));`
        copyToClip(str);
    }
    descriptor.appendChild(copyPoint);


    var deleteButton = document.createElement("input");
    deleteButton.type = "button";
    deleteButton.value = "Delete";
    deleteButton.className = "delete";
    deleteButton.onclick = function() {
        if (splineTracers.length > 0) {
            if (splineIndex + 1 < splineTracers.length)
                splineTracers[splineIndex + 1].reset();
            splineTracers[splineIndex].reset();
        }
        descriptor.parentNode.removeChild(descriptor);
        point.parentNode.removeChild(point);
        points.splice(pointIndex, 1);
        pointDescriptors.splice(pointIndex, 1);
        splinePoints.splice(pointIndex, 1);
        splines.splice(splineIndex, 1);
        splineTrackables.splice(splineIndex, 1);
        splineTracers.splice(splineIndex, 1);
        if (points.length > 0) {
            var newIndex = (pointIndex === 0) ? 0 : pointIndex - 1;
            var newDescriptor = pointDescriptors[newIndex];
            newDescriptor.updateFunction();
        }
    }

    descriptor.updateFunction = function() {
        updatePoint(point, yField, xField, tField, splinePoint, splineIndex, pointIndex, height, width);
    }
    descriptor.appendChild(deleteButton);

    xField.updateFields = function(poseName) {
        console.log("X field has changed, x field value is now " + poseName);
        if (isInArray(Object.keys(fieldPoses), poseName)) {
            var pose = fieldPoses[poseName];
            xField.value = pose.translation.x;
            yField.value = pose.translation.y;
            tField.value = pose.rotation.getDegrees();
            xField.onchange();
        }
    }

    autocomplete(xField, Object.keys(fieldPoses));

    if (pointIndex === 1) {
        var pathName = document.createElement("input");
        pathName.type = "text";
        pathName.placeholder = "Path name";
        document.getElementById("pathCopier").appendChild(pathName);

        var copyPath = document.createElement("input");
        copyPath.type = "button";
        copyPath.value = "Copy Path";
        copyPath.className = "reset";
        copyPath.onclick = function() {
            var str = 
            `private Trajectory<TimedState<Pose2dWithCurvature>> get${pathName.value}(){
                List<Pose2d> waypoints = new ArrayList<>();
                `;

            var i;
            for (i of pointDescriptors) {
                var fields = i.getElementsByClassName("descriptorField");
                str += 
                `waypoints.add(new Pose2d(new Translation2d(${fields[0].value}, ${fields[1].value}), Rotation2d.fromDegrees(${fields[2].value})));
                `;
            }

            str += 
            `
                return generateTrajectory(false, waypoints, Arrays.asList(), kMaxVelocity, kMaxAccel, kMaxDecel, kMaxVoltage, 24.0, 1);
            }`;

            copyToClip(str);
        }

        document.getElementById("pathCopier").appendChild(copyPath);

        pathName.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                copyPath.click();
            }
        });
    }

    document.body.appendChild(descriptor);
    pointDescriptors.push(descriptor);

    dragElement(point, yField, xField, tField, splinePoint, splineIndex, pointIndex, height, width);

    if (splinePoints.length > 1) {
        var splineTrackable = new Trackable(
            'spline' + (splinePoints.length - 1), null, null, null,
            {
                width: /*robotOpts.width*/0,
                height: /*robotOpts.height*/0,
                scalar: scalingFactor,
                transformPose: transformPose
            });
        splineTrackable.update = function(pose) {
            this.CurrentPose = pose;
            this.CurrentPose = $.extend({}, {X:0,Y:0,T:0}, this.CurrentPose || {});
            this.CurrentFieldPose = this.transformPose(this.CurrentPose);
            $(this.elem).css({
                "width":this.width(),
                "height":this.height(),
                "top":(-this.height())/2,
                "left":(-this.width())/2
            });
            $(this.elem).css('transform',this.translateX()+this.translateY()+this.rotateT());
            this.log();
            this.elem.dispatchEvent(this.eventUpdate);
        }
        var splineTracer = new Traceable(
            splineTrackable, 'splineTracer' + (splinePoints.length - 1),
            {
                thiccness: 1,
                smoothing: false
            });

        scale('#splineTracer' + (splinePoints.length - 1),['width','height']);
        document.getElementById("spline" + (splinePoints.length - 1)).style.border = "none";
        splineTrackables.push(splineTrackable);
        splineTracers.push(splineTracer);
        generateSpline(pointIndex);
    }

    console.log("Click X: " + event.clientX + " Click Y: " + event.clientY);
}

document.addEventListener("click", printMousePos);