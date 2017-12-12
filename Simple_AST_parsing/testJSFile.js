k=7;
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

//Test n number in series
/*
  var n=4;
  var x=fibonacci(n);
  console.log("The "+n+" fibonacci number is (recursion method 1)"+x);

  var x1=fibo2(n);
  console.log("The "+n+" fibonacci number is (using recursion method 2)"+x1);
*/
