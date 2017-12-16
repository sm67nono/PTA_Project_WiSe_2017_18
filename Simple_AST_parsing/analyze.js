
//Simple tool which searches if there is recursive functions traversing the AST and lists them out: smanna Dec 2, 2017
var fs = require('fs'),
    esprima = require('esprima');
var estraverse = require('estraverse');

//Store Function Declarations
var functionRecursionList=[];

//For functional operations Map,Reduce, Filter
var functionListForOperations=[];


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

//Check for recursive pattern : smanna Dec 2, 2017
function checkifRecursive()
{
for(var i = 0, len = functionRecursionList.length; i < len; i++)
  {
    var currentfunctionAST = functionRecursionList[i];
    var functionName = '';
    if(currentfunctionAST.type==="FunctionDeclaration")
    {
        functionName=currentfunctionAST.id.name;
    }
    estraverse.traverse(currentfunctionAST, {
    enter: function(node){
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
    //console.log(i+" function "+JSON.stringify(functionRecursionList[i],null,4));
  }

}


//Check for functional pattern map, reduce and filter: smanna Dec 8, 2017
function checkifFunctionalOperations()
{
for(var i = 0, len = functionListForOperations.length; i < len; i++)
  {
    var currentfunctionAST = functionListForOperations[i];
    var functionName = 'Program';
    if(currentfunctionAST.type==="FunctionDeclaration")
    {
        functionName=currentfunctionAST.id.name;
    }
    estraverse.traverse(currentfunctionAST, {
    enter: function(node){
      if (node.type === 'CallExpression')
      {
        //Check for Filter, Map and Reduce here

        var typeOfOp='';
        if(node.callee.property)
        {
          typeOfOp=node.callee.property.name;
        }
        //Prints out Filter functions
        if(typeOfOp=='filter')
        {
                console.log(functionName+" is using a  filter operation.");

        }
        //Prints out Map functions
        if(typeOfOp=='map')
        {
                console.log(functionName+" is using a  Map operation.");

        }
        //Prints out Reduce functions
        if(typeOfOp=='reduce')
        {
                console.log(functionName+" is using a  Reduce operation.");

        }
      }
    }
    });
  }

}




//Traversing using estraverse
function findRecursion(ast){
estraverse.traverse(ast, {
enter: function(node){

  
  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'Program')
  {
    functionRecursionList.push(node);
  }
}
});
//Check for recursive pattern
checkifRecursive();

}


//Traversing using estraverse : smanna Dec 8, 2017
function findfunctionalOps(ast){
estraverse.traverse(ast, {
enter: function(node){
  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'Program')
  {
    functionListForOperations.push(node);
  }
}
});
//Check for functoinal patterns(Filter, Map and Reduce)
checkifFunctionalOperations();

}


//Static Analysis calls Here : smanna Dec 8, 2017
function analyzeCode(code) {
    // 1
	 var ast = esprima.parse(code);
	 console.log("The AST is:");
	// console.log(JSON.stringify(ast,null,4));

	console.log("Traversing the AST Manually");
	/*
    traverse(ast, function(node) {
        console.log(node.type);
    }); */
  console.log("Traversing the AST using estraverse");
  findRecursion(ast);
  findfunctionalOps(ast);

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
