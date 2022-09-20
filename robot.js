function scale(elem, attribs) {
	for(a of attribs) {
//		console.log(elem,a)
		$(elem).css(a,parseFloat($(elem).css(a))*scalingFactor+"px");
	}
}

function distLessThan(x, log = false) {
	return function(){
		var d = Math.sqrt(Math.pow(this.trackable.getFieldX()-this.x,2)+Math.pow(this.trackable.getFieldY()-this.y,2));
		if(log) console.log("d = "+d+" <= "+x);
		return d <= x;
	}
}

var robotOpts = {
	width: 36.5,
	height: 36.5,
};

var wheelOpts = {
			width: 1.5,
			height: 4,
			scalar: scalingFactor*8,
			convertAngleToField: function(x){return x;},
			pose: null,
			smoothing: false
};

$(function(){
	$('.field').width($('.field').width()*scalingFactor);
	$('.field').height($('.field').height()*scalingFactor);
	$('.wall').each(function(e){$(this).css('top',parseFloat($(this).css('top'))*scalingFactor+"px");});
	$('#fieldImg').css('background-size',parseInt($('#fieldImg').css('background-size'))*scalingFactor+"px");
	$('body').css('margin-top',parseInt($('body').css('margin-top'))*scalingFactor+"px");
	mod0 = new Trackable('mod0',null,null,'Module 0 Angle',wheelOpts);
	mod1 = new Trackable('mod1',null,null,'Module 1 Angle',wheelOpts);
	mod2 = new Trackable('mod2',null,null,'Module 2 Angle',wheelOpts);
	mod3 = new Trackable('mod3',null,null,'Module 3 Angle',wheelOpts);
	pathHead = new Trackable(
		'pathHead',null,null,null,
		{
			width: robotOpts.width,
			height: robotOpts.height,
			scalar: scalingFactor,
			transformPose: transformPose,
			log: function(){
				console.log(NetworkTables.getValue(sd('Path Pose')));
				},
			smoothing: true,
			pose: 'Path Pose'
		});

	pathTracer = new Traceable(
		pathHead,'pathTracer',
		{
//			condition: function(){return true;},
			condition: distLessThan(64),
//			color: function(){return rainbow(colors,colorIndex++);},
//			color: function(){return rainbow(1.0,(2/3)*(1.0-NetworkTables.getValue(sd('Path Velocity'))));},
			color: function(){return rainbow(1.0,(2/3)*(1.0-NetworkTables.getValue(sd('Path Pose'))[3]));},
			thiccness: 1
		});
	
	robot = new Trackable(
		'robot',null,null,null,
		{
			pose: 'Robot Pose',
			width: robotOpts.width,
			height: robotOpts.height,
			scalar: scalingFactor,
			transformPose: transformPose
		});
	robotAutoTracer = new Traceable(
		robot,'robotAutoTracer',
		{
//			condition: function(){return NetworkTables.getValue(sd('Auto')) && distLessThan(64);},
//			color: function(){return rainbow(colors,1);},
			color: function(){return rainbow(1.0,(2/3)*(1.0-NetworkTables.getValue(sd('Robot Velocity'))));},
			thiccness: 1,
			smoothing: false
		});
	robotTeleTracer = new Traceable(
		robot,'robotTeleTracer',
		{
//			condition: function(){return !NetworkTables.getValue(sd('Auto')) && distLessThan(64);},
//			color: function(){return rainbow(colors,colorIndex++);},
			color: function(){return rainbow(1.0,(2/3)*(1.0-NetworkTables.getValue(sd('Robot Velocity'))));},
			thiccness: 1,
			smoothing: false
		});
		
	vector = new Trackable(
		'vector','Robot X','Robot Y','Vector Direction',
		{
			width: 0,
			height: function(){return 24*NetworkTables.getValue(sd('Vector Magnitude'));},
			scalar: scalingFactor,
			transformPose: transformPose
		});

	function updateSpline() {
		if (splines.length < 1)
			return;
		if (currentSpline === null)
			return;
		if (splineUpdateList.length < 1)
			return;
		if (splineT < 1.01) {
			var point = splines[currentSplineIndex].getPoint(splineT);
			splineTrackables[currentSplineIndex].update({
				X: point.x,
				Y: point.y,
				T: 0
			});
			splineT += 0.01;
		} else {
			if (splineUpdateList.length > 0)
				splineUpdateList.splice(0, 1);
			if (splineUpdateList.length > 0) {
				currentSplineIndex = splineUpdateList[0];
				splineT = 0;
			}
		}
	}
	setInterval(updateSpline, 1);

		
	$(robot.elem).append('<div class="frant">frant</div>');
	scale('#robot > .frant',['height','top','font-size']);
	scale('#robot',['border-width','border-radius']);
	scale('.field.overlay',['width','height']);
	NetworkTables.addRobotConnectionListener(function(state){$('#robot').css({"border-color":((state)?'#2222FF77':'#FF2222')});})
	onoffline = function(){$('#robot').css({"border-color":"#FF2222"});};
	NetworkTables.addKeyListener(sd('Auto'),function(key,state){if(state){traceables.reset()};});
});

