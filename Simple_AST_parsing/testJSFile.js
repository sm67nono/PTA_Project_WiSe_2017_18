//Sample Recursion: smanna Dec 2, 2017
//A recursive fibnonacci function
function fibonacci(num) {
  if (num <= 1) return 1;
  return fibonacci(num - 1) + fibonacci(num - 2);
}

//A recursive fibonacci function variant
function fibo2(n)
{

  return _fib(n,0,1);

  function _fib(n, a, b)
  {

    return n > 0 ? [a, ..._fib(n-1, a+b,a)]:[];

  }

}

//Sample Fiter: smanna Dec 8, 2017

var planetSize = [320, 133, 540, 170,181, 192];

function checkifPlanet(planets) {
    return planets >= 190;
}

function myFunction()
{
    //Using Filter 1
    var newSystem = planetSize.filter(checkifPlanet);

    var reCheck = planetSize.filter(function(pl)
    {
      return pl >=171
    });

    //console.log(newSystem);
    //console.log(reCheck);
}

myFilterFunction();



//Sample Map: smanna Dec 8, 2017
//Multiply all the values in array with a specific number:

var numbers = [65, 44, 12, 4];

var multiplyWith = 12;

function multiplyArrayElement(num) {
    return num * multiplyWith;
}

function myMapFunction() {
    var mapValue = numbers.map(multiplyArrayElement);

    var mapValueAgain = mapValue.map(function(principal)
  {
    var interest = (principal * 5.25 * 5.0);
    return (interest/100);

  });

    //console.log(mapValue);
    //console.log(mapValueAgain);
}

myMapFunction();




//Sample Reduce: smanna Dec 8, 2017

//Example: Sum up orbital satellites launches in 2014.

var satellites = [
    { country:'Russia', launches:32 },
    { country:'US', launches:23 },
    { country:'China', launches:16 },
    { country:'Europe(ESA)', launches:7 },
    { country:'India', launches:4 },
    { country:'Japan', launches:3 }
];

function countlaunches(prevVal, elem)
{
    return prevVal + elem.launches;

}

var sum = satellites.reduce(function(prevVal, elem)
{
    return prevVal + elem.launches;
}, 0);


var sum2 = satellites.reduce(countlaunches, 0);
// ES6
// rockets.reduce((prevVal, elem) => prevVal + elem.launches, 0);

//console.log(sum) // 85
//console.log(sum2) // 85
