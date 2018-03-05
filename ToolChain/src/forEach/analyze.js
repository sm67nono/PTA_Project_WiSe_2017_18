
var fs = require('fs');
var module_Function = require('./analyze_ForEach_Functions');
var module_FunctionExpression=require('./analyze_ForEach_FunctionExpression');
var module_Root = require('./analyze_ForEach_Root');


if (process.argv.length < 3) {
    console.log('Usage: analyze.js <filename>.js');
    process.exit(1);
}

// 3
var filename = process.argv[2];
console.log('Reading ' + filename);
var code = fs.readFileSync(filename, 'utf-8');

//1. First we convert the forEach inside functions to Iterative
var output_Pipeline_1 = module_Function.analyzeForEachFunctionCode(code);
//2. Second we convert the forEach in FunctionExpressions into Iterative
var output_Pipeline_3 = module_FunctionExpression.analyzeForEachFunctionExpressionCode(output_Pipeline_1);
//3. Lastly we convert the forEach inside Root of the program to Iterative
var output_Pipeline_2 = module_Root.analyzeForEachRootCode(output_Pipeline_3);



//console.log(output_Pipeline_2);

fs.writeFile('Refactored/Refactored_itrerativeForEach.js', output_Pipeline_2, function (err) {
  if (err) throw err;
  console.log('Saved!');
});
