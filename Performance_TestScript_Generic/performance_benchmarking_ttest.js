var ttest= require('ttest');
 
// Two sample t-test Based on "2Sample_tTestData.xlsx"

//===========================Semver================================
//Case 1. Semver ForEach
var stat=ttest([8.65,92.62,199.22], [8.25,78.71,147.44], {mu: 1})

console.log("Semver ForEach");
console.log(stat.testValue());
console.log(stat.pValue());
console.log(stat.confidence());
console.log(stat.valid());
console.log(stat.freedom());

//Case 2. Semver Map

var stat=ttest([8.65,92.62,199.22], [9.43,90.49,178.35], {mu: 1})

console.log("Semver Map");
console.log(stat.testValue());
console.log(stat.pValue());
console.log(stat.confidence());
console.log(stat.valid());
console.log(stat.freedom());



//Case 3. Semver filter

var stat=ttest([8.65,92.62,199.22], [9.87,91.45,177.66], {mu: 1})

console.log("Semver Filter");
console.log(stat.testValue());
console.log(stat.pValue());
console.log(stat.confidence());
console.log(stat.valid());
console.log(stat.freedom());

//========================Rimraf===================================

//Case 1. Rimraf ForEach

var stat=ttest([13.78,54.60,113.44], [9.42,66.16,115.11], {mu: 1})

console.log("Rimraf ForEach");
console.log(stat.testValue());
console.log(stat.pValue());
console.log(stat.confidence());
console.log(stat.valid());
console.log(stat.freedom());

//========================Minimst===================================

//Case 1. Minimist ForEach


var stat=ttest([15.37,57.54,116.58], [6.10,53.21,114.17], {mu: 1})

console.log("Minimist ForEach");
console.log(stat.testValue());
console.log(stat.pValue());
console.log(stat.confidence());
console.log(stat.valid());
console.log(stat.freedom());

//==========================Namomist=================================

//Case 1. Nanomist ForEach

var stat=ttest([7.52,61.09,117.88], [7.12,58.41,115.47], {mu: 1})

console.log("Nanomist ForEach");
console.log(stat.testValue());
console.log(stat.pValue());
console.log(stat.confidence());
console.log(stat.valid());
console.log(stat.freedom());