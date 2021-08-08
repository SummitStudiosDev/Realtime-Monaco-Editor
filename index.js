const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const options = {
  cors: {
    origin: '*',
  }	
};
const io = require("socket.io")(httpServer, options);
const cors = require('cors')
app.use(cors());
var bodyParser = require('body-parser')
var fs = require('fs');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use('/static', express.static('static'))

app.get('/', function(req, res) {
   res.render("index.html")
});



io.on("connection", (socket) => {
	
	/*
	socket.broadcast.emit("join", socket.id);
	console.log(socket.id+" has joined");
	*/
  
	socket.on('disconnect', function () {
		socket.broadcast.emit("leave", socket.id);
		console.log(socket.id+' disconnected');
	});

	
	socket.on('content_change', (elem1) => {
		socket.broadcast.to(elem1.roomid).emit('content_change',elem1.changes);
	});
	
    socket.on('join', function(room) {
		console.log("sent "+socket.id+" to "+room);
        socket.join(room);
        socket.broadcast.to(room).emit('newJoin',socket.id);
    });

    socket.on('setValue', function(data) {
		console.log("messaging "+data.socket+" "+data.value);
        socket.to(data.socket).emit('setValue',data.value);
    });
  
  
    socket.on('cursorPos', function(data) {
        socket.broadcast.to(data.room).emit('cursorPos',{'pos':data.pos,'name':socket.id});
    });

    socket.on('selectedPos', function(data) {
        socket.broadcast.to(data.room).emit('selectedPos',{'selection':data.selection,'name':socket.id});
    });
  
});


let port = 8080;
httpServer.listen(port, () => {
  console.log(`Website listening at http://localhost:${port}`)
});
