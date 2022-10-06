function toDegrees(radians) {
    return radians * 180.0 / Math.PI;
}

function toRadians(degrees) {
    return degrees * Math.PI / 180.0;
}

function Rotation2d(degrees) {
    this.sin = Math.sin(toRadians(degrees));
    this.cos = Math.cos(toRadians(degrees));

    this.getRadians = function() {
        return Math.atan2(this.sin, this.cos);
    }
    this.getDegrees = function() {
        return toDegrees(this.getRadians());
    }

    this.rotateBy = function(other) {
        return new Rotation2d(this.getDegrees() + other.getDegrees());
    }
}

function Translation2d(x, y) {
    this.x = x;
    this.y = y;

    this.norm = function() {
        return Math.hypot(this.x, this.y);
    }

    this.translateBy = function(other) {
        return new Translation2d(this.x + other.x, this.y + other.y);
    }

    this.rotateBy = function(rotation) {
        return new Translation2d(this.x * rotation.cos - this.y * rotation.sin, x * rotation.sin + y * rotation.cos);
    }

    this.inverse = function() {
        return new Translation2d(-this.x, -this.y);
    }

    this.distance = function(other) {
        return this.translateBy(other.inverse()).norm();
    }
}

function Pose2d(translation, rotation) {
    this.translation = translation;
    this.rotation = rotation;

    this.transformBy = function(other) {
        console.log("transforming");
        return new Pose2d(this.translation.translateBy(other.translation.rotateBy(this.rotation)),
            this.rotation.rotateBy(other.rotation));
    }
}

function QuinticHermiteSpline(pose0, pose1) {
    var scale = 1.2 * pose0.translation.distance(pose1.translation);
    this.x0 = pose0.translation.x;
    this.x1 = pose1.translation.x;
    this.dx0 = pose0.rotation.cos * scale;
    this.dx1 = pose1.rotation.cos * scale;
    this.ddx0 = 0;
    this.ddx1 = 0;
    this.y0 = pose0.translation.y;
    this.y1 = pose1.translation.y;
    this.dy0 = pose0.rotation.sin * scale;
    this.dy1 = pose1.rotation.sin * scale;
    this.ddy0 = 0;
    this.ddy1 = 0;

    this.ax = -6 * this.x0 - 3 * this.dx0 - 0.5 * this.ddx0 + 0.5 * this.ddx1 - 3 * this.dx1 + 6 * this.x1;
    this.bx = 15 * this.x0 + 8 * this.dx0 + 1.5 * this.ddx0 - this.ddx1 + 7 * this.dx1 - 15 * this.x1;
    this.cx = -10 * this.x0 - 6 * this.dx0 - 1.5 * this.ddx0 + 0.5 * this.ddx1 - 4 * this.dx1 + 10 * this.x1;
    this.dx = 0.5 * this.ddx0;
    this.ex = this.dx0;
    this.fx = this.x0;

    this.ay = -6 * this.y0 - 3 * this.dy0 - 0.5 * this.ddy0 + 0.5 * this.ddy1 - 3 * this.dy1 + 6 * this.y1;
    this.by = 15 * this.y0 + 8 * this.dy0 + 1.5 * this.ddy0 - this.ddy1 + 7 * this.dy1 - 15 * this.y1;
    this.cy = -10 * this.y0 - 6 * this.dy0 - 1.5 * this.ddy0 + 0.5 * this.ddy1 - 4 * this.dy1 + 10 * this.y1;
    this.dy = 0.5 * this.ddy0;
    this.ey = this.dy0;
    this.fy = this.y0;

    this.getPoint = function(t) {
        var x = this.ax * t * t * t * t * t + this.bx * t * t * t * t + this.cx * t * t * t + this.dx * t * t + this.ex * t + this.fx;
        var y = this.ay * t * t * t * t * t + this.by * t * t * t * t + this.cy * t * t * t + this.dy * t * t + this.ey * t + this.fy;
        return new Translation2d(x, y);
    }
}

//var spline = new QuinticHermiteSpline(new Pose2d(new Translation2d(0,0), new Rotation2d(45)), new Pose2d(new Translation2d(324,0), new Rotation2d(-45)));
//console.log(`${spline.ax}t^5 + ${spline.bx}t^4 + ${spline.cx}t^3 + ${spline.dx}t^2 + ${spline.ex}t + ${spline.fx}`);
//console.log(`${spline.ay}t^5 + ${spline.by}t^4 + ${spline.cy}t^3 + ${spline.dy}t^2 + ${spline.ey}t + ${spline.fy}`);