/*
Responsible for order of Execution of the modules. The module carries out the following task:
*/
var fs = require('fs');
var module_Function = require('./analyze_reduce_Functions');
var module_FunctionExp = require('./analyze_reduce_FunctionsExpression');
var module_Root = require('./analyze_reduce_Root');


if (process.argv.length < 3) {
    console.log('Usage: analyze.js <filename>.js');
    process.exit(1);
}

// 3
var filename = process.argv[2];
console.log('Reading ' + filename);
var code = fs.readFileSync(filename, 'utf-8');
//1. First we convert the reduce inside functionsExpressions to Iterative
var output_Pipeline_3 = module_FunctionExp.analyzeReduceFunctionExpressionCode(code);
//2. First we convert the reduce inside functions to Iterative
var output_Pipeline_1 = module_Function.analyzeReduceFunctionCode(output_Pipeline_3);
//3. Lastly we convert the reduce inside Root of the program to Iterative
var output_Pipeline_2 = module_Root.analyzeReduceRootCode(output_Pipeline_1);

//console.log(output_Pipeline_2);

fs.writeFile('Refactored/Refactored_itrerativeReduce.js', output_Pipeline_2, function (err) {
  if (err) throw err;
  console.log('Saved!');
});
