
//Simple tool which searches if there is recursive functions traversing the AST and lists them out: smanna Dec 2, 2017
var fs = require('fs'),
    esprima = require('esprima');
var estraverse = require('estraverse');


var functionLists=[];

//Manual traversing the AST
function traverse(node, func) {
    func(node);
    for (var key in node) {
        if (node.hasOwnProperty(key)) {
            var child = node[key];
            if (typeof child === 'object' && child !== null) {
                if (Array.isArray(child)) {
                    child.forEach(function(node) {
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func);
                }
            }
        }
    }
}

//Check for recursive pattern
function checkifRecursive()
{
for(var i = 0, len = functionLists.length; i < len; i++)
  {
    var currentfunctionAST = functionLists[i];
    var functionName = currentfunctionAST.id.name;
    estraverse.traverse(currentfunctionAST, {
    enter: function(node){
      //if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'Program')
      if (node.type === 'CallExpression')
      {
        var calleefunctionName=node.callee.name;
        //console.log("For function "+functionName+" called function Name is "+calleefunctionName);
        //Prints out recursion functions
        if(functionName==calleefunctionName)
        {
                console.log("Function "+functionName+" is a recursive function. Call to itself detected");

        }
      }
    }
    });
    //console.log(i+" function "+JSON.stringify(functionLists[i],null,4));
  }

}



//Traversing using estraverse
function findRecursion(ast){
estraverse.traverse(ast, {
enter: function(node){
  //if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'Program')
  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression')
  {
    functionLists.push(node);
  }
}
});
//Check for recursive pattern
checkifRecursive();

}





//Static Analysis calls Here
function analyzeCode(code) {
    // 1
	 var ast = esprima.parse(code);
	 console.log("The AST is:");
	 console.log(JSON.stringify(ast,null,4));

	console.log("Traversing the AST Manually");
	/*
    traverse(ast, function(node) {
        console.log(node.type);
    }); */


  console.log("Traversing the AST using estraverse");
  findRecursion(ast);

}

// 2
if (process.argv.length < 3) {
    console.log('Usage: analyze.js <filename>.js');
    process.exit(1);
}

// 3
var filename = process.argv[2];
console.log('Reading ' + filename);
var code = fs.readFileSync(filename, 'utf-8');

analyzeCode(code);
console.log('Done');
