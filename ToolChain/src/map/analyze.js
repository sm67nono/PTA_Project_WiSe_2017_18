
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

var output_Pipeline_3 = module_FunctionExp.analyzeMapFunctionExpressionCode(code);
var output_Pipeline_1 = module_Function.analyzeMapFunctionCode(output_Pipeline_3);

var output_Pipeline_2 = module_Root.analyzeMapRootCode(output_Pipeline_1);

//console.log(output_Pipeline_2);

fs.writeFile('Refactored/Refactored_itrerativeMap.js', output_Pipeline_2, function (err) {
  if (err) throw err;
  console.log('Saved!');
});


//1. First we convert the filter_Functions inside functions to Iterative



//2. First we convert the filter_Functions inside Root of the program to Iterative
