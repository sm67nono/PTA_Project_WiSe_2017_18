
var fs = require('fs');
var module_Function = require('./analyze_Filter_Functions');
var module_FunctionExpression=require('./analyze_Filter_FunctionExpression');
var module_Root = require('./analyze_Filter_Root');


if (process.argv.length < 3) {
    console.log('Usage: analyze.js <filename>.js');
    process.exit(1);
}

// 3
var filename = process.argv[2];
console.log('Reading ' + filename);
var code = fs.readFileSync(filename, 'utf-8');

var output_Pipeline_1 = module_Function.analyzeFilterFunctionCode(code);

var output_Pipeline_3= module_FunctionExpression.analyzeFilterFunctionExpressionCode(output_Pipeline_1);

var output_Pipeline_2 = module_Root.analyzeFilterRootCode(output_Pipeline_3);



//console.log(output_Pipeline_2);

fs.writeFile('Refactored/Refactored_itrerativeFilter.js', output_Pipeline_2, function (err) {
  if (err) throw err;
  console.log('Saved!');
});


//1. First we convert the filter_Functions inside functions to Iterative



//2. First we convert the filter_Functions inside Root of the program to Iterative
