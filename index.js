var fs = require('fs');
var fork = require('child_process').fork;
express = require('express');
var app = express();
var port = process.env.PORT || 6842;
var bodyParser = require('body-parser')
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
	extended: true
}));


var simpleGit = require('simple-git');
var updateFolder = function (path) {
	var git = simpleGit(path);
	var pidPath = path+"/app.pid";
	var execPath = path+"/app.js";
	if(fs.existsSync(pidPath))
		process.kill(fs.readFileSync(pidPath))
	git.pull('origin', 'master', {'--rebase': 'true'}, function(){
		if(fs.existsSync(execPath))
			fork(execPath);
	});
}

var epsiFacebookBot_backFacebookBot = function(){
	console.log("HOOK for backFacebookBot");
	updateFolder("/opt/nginx/facebookBot/backFacebookBot");
}

var epsiFacebookBot_backDatabaseApi = function(){
	console.log("HOOK for backDatabaseApi");
	updateFolder("/opt/nginx/facebookBot/backDatabaseApi");
}

var epsiFacebookBot_backFacebookApi = function(){
	console.log("HOOK for backFacebookApi");
	updateFolder("/opt/nginx/facebookBot/backFacebookApi");
}

var epsiFacebookBot_frontFacebookBotManager = function(){
	console.log("HOOK for frontFacebookBotManager");
	updateFolder("/opt/nginx/facebookBot/frontFacebookBotManager");
}

var functions ={
	epsiFacebookBot_backFacebookBot,
	epsiFacebookBot_backDatabaseApi,
	epsiFacebookBot_backFacebookApi,
	epsiFacebookBot_frontFacebookBotManager
};

app.post('/', function(req, res) {
	var fnName = req.body.repository.full_name.replace("/", "_");
	var fn = functions[fnName];
	if(!fn)
		return res.sendStatus(204);
	fn();
	res.sendStatus(200);
});

app.listen(port);
console.log('Server started! At http://localhost:' + port);

