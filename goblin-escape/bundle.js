const drawPlayer = (ctx, pos) => {
    ctx.fillStyle = "#f75631";
    ctx.beginPath();
    ctx.arc(pos.X, pos.Y, 5, 0, 2 * Math.PI);
    ctx.fill();
};

const init = () => {
    canvas = document.getElementById("2dCanvas");
    ctx = canvas.getContext("2d");
    dragging = false;
    if (ctx != null) {
        registerEvents();
        requestAnimationFrame(() => update({ X: 10, Y: 10 }));
    }
};
const update = (pos) => {
    draw(pos);
};
const draw = (pos) => {
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer(ctx, pos);
};
const registerEvents = () => {
    canvas.addEventListener("mousemove", ({ pageX, pageY }) => {
        if (dragging) {
            update({ X: pageX, Y: pageY });
        }
    });
    canvas.addEventListener("mousedown", ({ pageX, pageY }) => {
        dragging = true;
        update({ X: pageX, Y: pageY });
    });
    canvas.addEventListener("mouseup", () => {
        dragging = false;
    });
};
const resizeCanvas = () => {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
};
window.onload = init;
