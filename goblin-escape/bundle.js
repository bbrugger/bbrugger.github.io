const getDistance = (origin, target) => {
    return getMagnitude({
        X: target.X - origin.X,
        Y: target.Y - origin.Y,
    });
};
const getMagnitude = (pt) => {
    return Math.sqrt(Math.pow(pt.X, 2) + Math.pow(pt.Y, 2));
};
const getProjection = (origin, target, dist) => {
    // returns a point in the line (origin, target) that has a distance
    // dist from origin
    const inclination = {
        X: target.X - origin.X,
        Y: target.Y - origin.Y,
    };
    const t = dist / getMagnitude(inclination);
    return {
        X: origin.X + t * inclination.X,
        Y: origin.Y + t * inclination.Y,
    };
};

class Lake {
    constructor(base) {
        this.center = base.center;
        this.radius = base.radius;
    }
    contains(pt) {
        return (Math.sqrt(Math.pow(pt.X - this.center.X, 2) + Math.pow(pt.Y - this.center.Y, 2)) < this.radius);
    }
    getDistanceToBorder(pt) {
        return this.radius - getDistance(this.center, pt);
    }
    getBorderProjection(pt) {
        return getProjection(this.center, pt, this.radius);
    }
    getPolarPoint(pt) {
        const inclination = {
            X: pt.X - this.center.X,
            Y: pt.Y - this.center.Y,
        };
        if (inclination.X > 0 && inclination.Y >= 0) {
            return {
                theta: Math.atan(inclination.Y / inclination.X),
            };
        }
        else if (inclination.X > 0 && inclination.Y < 0) {
            return {
                theta: Math.atan(inclination.Y / inclination.X) + 2 * Math.PI,
            };
        }
        else if (inclination.X < 0) {
            return {
                theta: Math.atan(inclination.Y / inclination.X) + Math.PI,
            };
        }
        else if (inclination.Y > 0) {
            return {
                theta: Math.PI / 2,
            };
        }
        else if (inclination.Y < 0) {
            return {
                theta: (3 * Math.PI) / 2,
            };
        }
        else {
            return { theta: 0 };
        }
    }
    getPolarPosition(pt) {
        return {
            X: this.center.X + this.radius * Math.cos(pt.theta),
            Y: this.center.Y + this.radius * Math.sin(pt.theta),
        };
    }
}

class Game {
    constructor() {
        this.player = { X: 0, Y: 0 };
        this.goblin = { theta: 0 };
        this.lake = new Lake({
            center: { X: 0, Y: 0 },
            radius: 100,
        });
    }
    reset() {
        this.player = this.lake.center;
        this.goblin = { theta: 0 };
        this.playerTarget = null;
        this.goblinTarget = null;
    }
    recenter(dimensions) {
        const middle = { X: dimensions.X / 2, Y: dimensions.Y / 2 };
        this.lake.center = middle;
        // TODO: keep the relative position of the player
        this.player = middle;
        this.lake.radius = Math.min(dimensions.X / 2, dimensions.Y / 2) - 10;
    }
    movePlayer(timedelta) {
        if (!this.playerTarget) {
            return;
        }
        if (Math.abs(this.player.X - this.playerTarget.X) < 1 &&
            Math.abs(this.player.Y - this.playerTarget.Y) < 1) {
            this.player.X = this.playerTarget.X;
            this.player.Y = this.playerTarget.Y;
            return;
        }
        this.player = getProjection(this.player, this.playerTarget, 0.1 * timedelta);
    }
    moveGoblin(timedelta) {
        if (!this.goblinTarget) {
            return;
        }
        if (Math.abs(this.goblin.theta - this.goblinTarget.theta) <
            4 / this.lake.radius) {
            this.goblin.theta = this.goblinTarget.theta;
            return;
        }
        let counterClockDist = this.goblinTarget.theta - this.goblin.theta;
        if (counterClockDist < 0) {
            counterClockDist += 2 * Math.PI;
        }
        let clockDist = this.goblin.theta - this.goblinTarget.theta;
        if (clockDist < 0) {
            clockDist += 2 * Math.PI;
        }
        if (counterClockDist < clockDist) {
            let newTheta = this.goblin.theta + (0.4 * timedelta) / this.lake.radius;
            if (newTheta >= 2 * Math.PI) {
                newTheta -= 2 * Math.PI;
            }
            this.goblin.theta = newTheta;
        }
        else if (counterClockDist > clockDist) {
            let newTheta = this.goblin.theta - (0.4 * timedelta) / this.lake.radius;
            if (newTheta < 0) {
                newTheta += 2 * Math.PI;
            }
            this.goblin.theta = newTheta;
        }
    }
}

const drawPlayerTarget = (ctx, pos) => {
    if (pos) {
        ctx.fillStyle = "#f75631";
        ctx.beginPath();
        ctx.arc(pos.X, pos.Y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
};
const drawPlayer = (ctx, pos) => {
    ctx.fillStyle = "#f75631";
    ctx.font = "20px serif";
    ctx.fillText("P", pos.X - 5, pos.Y + 5);
};
const drawGoblinTarget = (ctx, lake, pos) => {
    if (pos) {
        const pt = lake.getPolarPosition(pos);
        ctx.fillStyle = "#a21df5";
        ctx.beginPath();
        ctx.arc(pt.X, pt.Y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
};
const drawGoblin = (ctx, lake, pos) => {
    const pt = lake.getPolarPosition(pos);
    ctx.fillStyle = "#a21df5";
    ctx.font = "20px serif";
    ctx.fillText("G", pt.X - 5, pt.Y + 5);
};
const drawLake = (ctx, lake) => {
    ctx.fillStyle = "#61a5f2";
    ctx.beginPath();
    ctx.arc(lake.center.X, lake.center.Y, lake.radius, 0, 2 * Math.PI);
    ctx.fill();
};

const init = () => {
    canvas = document.getElementById("2dCanvas");
    ctx = canvas.getContext("2d");
    game = new Game();
    lastFrameTime = Date.now();
    if (ctx != null) {
        registerEvents();
        requestAnimationFrame(() => update());
    }
};
const update = (playerTarget) => {
    requestAnimationFrame(() => update());
    const now = Date.now();
    const timedelta = now - lastFrameTime;
    lastFrameTime = now;
    if (playerTarget) {
        if (game.lake.contains(playerTarget)) {
            game.playerTarget = playerTarget;
        }
        else {
            game.playerTarget = game.lake.getBorderProjection(playerTarget);
        }
    }
    game.movePlayer(timedelta);
    game.moveGoblin(timedelta);
    const playerBorderProjection = game.lake.getPolarPoint(game.player);
    if (game.lake.getDistanceToBorder(game.player) < 1) {
        if (Math.abs(game.goblin.theta - playerBorderProjection.theta) <
            4 / game.lake.radius) {
            window.alert("You were eaten by the goblin!");
        }
        else {
            window.alert("You got away!");
        }
        game.reset();
    }
    game.goblinTarget = playerBorderProjection;
    draw();
};
const draw = () => {
    const { dimensions, resized } = resizeCanvas();
    if (resized) {
        game.recenter(dimensions);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLake(ctx, game.lake);
    drawPlayerTarget(ctx, game.playerTarget);
    drawPlayer(ctx, game.player);
    drawGoblinTarget(ctx, game.lake, game.goblinTarget);
    drawGoblin(ctx, game.lake, game.goblin);
};
const registerEvents = () => {
    canvas.addEventListener("mousemove", ({ pageX, pageY }) => {
        requestAnimationFrame(() => update({ X: pageX, Y: pageY }));
    });
    canvas.addEventListener("touchmove", ({ changedTouches }) => {
        if (changedTouches.length > 0) {
            requestAnimationFrame(() => update({ X: changedTouches[0].screenX, Y: changedTouches[0].screenY }));
        }
    });
    window.addEventListener("resize", draw);
};
// resizeCanvas returns a point indicating the end vertices of the resized canvas.
const resizeCanvas = () => {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    let resized = false;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        resized = true;
    }
    return { dimensions: { X: canvas.width, Y: canvas.height }, resized };
};
window.onload = init;
