let mouse = {
    x: 0,
    y: 0
}
let mousedown = 0
window.addEventListener('mousemove', (event) => {
    mouse.x = event.pageX;
    mouse.y = event.pageY;
})
window.addEventListener("mousedown", function () {
    mousedown = 1
    Move(mousedown, mouse)
});
window.addEventListener("mouseup", function () {
    mousedown = 0
    Move(mousedown, mouse)
});
var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
window.addEventListener("resize", resizeCanvas);
function resizeCanvas() {                   //螢幕顯示100%
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
function Lerp(start, end, amt) { //
    return (1 - amt) * start + amt * end //smooth移動
}

const players = new Map();
//player
class Player {
    constructor(player) {
        this.playerId = player.playerId
        this.playerName = player.playerName
        this.playerLevel = player.playerLevel
        this.playerClass = player.playerClass
        this.toPosition = player.toPosition
        this.position = player.position
        this.rotation = player.rotation
        this.moving = player.moving
    }
    Draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, 30, 0, Math.PI * 2)
        c.fillStyle = "red"
        c.fill()
        c.closePath()
    }
    Move() {
        this.position.x = Math.floor(Lerp(this.position.x, this.toPosition.x, 0.05))
        this.position.y = Math.floor(Lerp(this.position.y, this.toPosition.y, 0.05))
    }
    Update() {
        this.Draw()
        this.Move()
    }
}
class ThisPlayer {
    constructor(playerId, playerName, playerLevel, playerClass) {
        this.playerId = playerId
        this.playerName = playerName
        this.playerLevel = playerLevel
        this.playerClass = playerClass
    }
}
const characterData =  JSON.parse(localStorage.getItem('playerData'))
const thisPlayer = new ThisPlayer(characterData.character_id, characterData.character_name, characterData.character_level, characterData.character_class)

function Move(isMove, toPosition) {
    const message = {
        type: "Move",
        isMove,
        toPosition
    }
    SocketSend(Serialization(message));
}
function Serialization(obj) {
    const jsonString = JSON.stringify(obj);
    return jsonString
}
function Deserialization(jsonString) {
    const obj = JSON.parse(jsonString);
    return obj
}
function AddThisPlayer(player) {
    const message = {
        type: "AddPlayer",
        player
    };
    return message
}
//創建玩家
function CreatPlayer(playersInfo) {
    playersInfo.forEach(player => {
        players.set(player.playerId, new Player(player))
    });

}
function AddPlayer(player) {
    players.set(player.playerId, new Player(player))
}
//創建玩家

//刪除玩家
function DeletePlayer(id) {
    for (const [playerId, player] of players) {
        if (playerId === id) {
            players.delete(playerId);
            console.log('user disconnected:', playerId);
        }
    }
}

function DecodeState(message) {
    if (message.type == "CreatPlayer") {
        if (message.players !== []) {
            CreatPlayer(message.players)
            console.log("CreatPlayer")
        }
    }
    if (message.type == "AddPlayer") {
        if (message.players !== []) {
            AddPlayer(message.players)
            console.log("AddPlayer")
        }
    }
    if (message.type == "DeletePlayer") {
        if (message.player !== []) {
            DeletePlayer(message.player)
            console.log("DeletePlayerr")
        }
    }
    if (message.type == "SendList") {
        message.sendList.forEach(i => { DecodeSendList(i) })
    }

}
function DecodeSendList(action) {
    if (action.type == "MoveToPoint") {
        GraphicsMove(action.playerId, action.message.toPosition, action.message.moving)
    }
}

//玩家移動
function GraphicsMove(playerId, position, moving) {
    const obj = players.get(playerId)
    obj.toPosition = position
    obj.moving = moving
}


const socket = new WebSocket('ws://localhost:8080');
socket.onopen = function (event) {
    console.log('WebSocket connected!');
    socket.send(Serialization(AddThisPlayer(thisPlayer)));
};
socket.onmessage = function (event) {
    const messageJson = event.data;
    const message = Deserialization(messageJson)
    console.log('收到訊息:', message);
    DecodeState(message)
};
socket.onclose = function (event) {
    console.log('WebSocket disconnected!');
};
socket.onerror = function (error) {
    console.error('WebSocket error:', error);
};

function SocketSend(json) {
    socket.send(json);
}
function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = "rgba(35, 36, 42, 0.8)";
    c.fillRect(0, 0, canvas.width, canvas.height)
    players.forEach((value, key) => {
        value.Update()
    });
}
resizeCanvas()
animate()