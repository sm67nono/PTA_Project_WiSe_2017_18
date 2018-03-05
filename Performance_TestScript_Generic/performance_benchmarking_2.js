//Forking a Synchronous child process for "npm test"
var exec = require('child_process').execSync;
var now=require('performance-now');
var cmd = "npm test";

var options = {
  encoding: 'utf8'
};

//Test Suite for 10 iterations
var t0 = now();
for(var i=0;i<10;i++)
{
	exec(cmd, options);
}
var t1 = now();
console.log("Time taken for 10 Test iterations ", (t1-t0).toFixed(3),"milliseconds");

//Test Suite for 100 iterations
/*var t0 = now();
for(var i=0;i<100;i++)
{
	exec(cmd, options);
}
var t1 = now();
console.log("Time taken for 10 Test iterations ", (t1-t0).toFixed(3),"milliseconds");*/
