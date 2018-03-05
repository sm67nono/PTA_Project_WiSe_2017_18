/*
Responsible for order of Execution of the modules. The module carries out the following task:
*/
var fs = require('fs');
var module_Function = require('./analyze_map_Functions');
var module_FunctionExp = require('./analyze_map_FunctionsExpression');
var module_Root = require('./analyze_map_Root');


if (process.argv.length < 3) {
    console.log('Usage: analyze.js <filename>.js');
    process.exit(1);
}

// 3
var filename = process.argv[2];
console.log('Reading ' + filename);
var code = fs.readFileSync(filename, 'utf-8');

//1. First we convert the map inside functions expressions to Iterative
var output_Pipeline_3 = module_FunctionExp.analyzeMapFunctionExpressionCode(code);
//2. Second we convert the map in functions into Iterative
var output_Pipeline_1 = module_Function.analyzeMapFunctionCode(output_Pipeline_3);
//3. Lastly we convert the map inside Root of the program to Iterative
var output_Pipeline_2 = module_Root.analyzeMapRootCode(output_Pipeline_1);

//console.log(output_Pipeline_2);

fs.writeFile('Refactored/Refactored_itrerativeMap.js', output_Pipeline_2, function (err) {
  if (err) throw err;
  console.log('Saved!');
});
