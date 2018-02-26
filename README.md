# Promise Profiler
This repo will profile your code by giving you the execution time of all your promises in a json without disturbing the production level code.

### Documentation

* The documentation can be found at [here.](https://rajulbabel.github.io/promise-profiler/)

### Installation
* Install bluebird-promise-profiler as dev dependency

	```npm
	npm i bluebird-promise-profiler --save-dev
	```
* Please do update to the latest version for bug free experience.

### Usage

* We will implement routes and model for two function multiply and square (the working examples can be seen in ./examples of this repository).
* File: ./routes/route.js
	```js
	'use strict';
	
	const Promise = require('bluebird');
	const Model = require('../models/Model');
	
	/**
	 * Route for calling square function in ../models/Model.js
	 * @param num
	 * @returns {Promise}
	 */
	const squareRoute = function squareRoute (num) {
	
		return Model.square(num)
			// the function name 'squarePromise' will be one of the key in output of the profiler whose value would be around 1000 milliseconds
			.then(function squarePromise (result) {
	
				return {result};
	
			});
	};
	
	const squareAndMultiplyRoute = function squareAndMultiply (num1, num2) {
	
		return Promise.join(Model.multiply(num1, num2), Model.square(num1))
			// the function name 'spreadFunction' will be one of the key in output of the profiler whose value would be around 2000 milliseconds
			.spread(function spreadFunction (multiplyResult, squareResult) {
				return {multiplyResult, squareResult};
			});
	
	};
	
	module.exports = {
		squareRoute: squareRoute,
		squareAndMultiplyRoute: squareAndMultiplyRoute
	};
	
	```

* File: ./models/Model.js
	```js
	'use strict';
	
	const Promise = require('bluebird');
	
	/**
	 * Makes a delay of one second and returns back a promise which multiplies the two numbers.
	 * @param num1
	 * @param num2
	 * @returns {bluebird} Returns back a promise which multiplies the two numbers.
	 */
	const multiply = function multiply (num1, num2) {
	
		return new Promise (function (resolve, reject) {
	
			setTimeout(function promise1Timeout () {
				resolve(num1 * num2);
			}, 1000);
	
		});
	
	};
	
	/**
	 * Makes delay of one second and then calls multiply which further makes a delay of one second, so total delay is two seconds.
	 * @param num1
	 * @returns {bluebird} Returns back a promise which multiplies the given number.
	 */
    const square = function square (num1) {
	
		return new Promise (function (resolve, reject) {
	
			setTimeout(function promise1Timeout () {
	
				multiply(num1, num1)
					// the function name 'multiplyPromise' will be one of the key in output of the profiler whose value would be around 1000 milliseconds
					.then(function multiplyPromise (result) {
						resolve(result);
					});
	
			}, 1000);
	
		});
	
	};
	
	module.exports = {
		square: square,
		multiply: multiply
	};
	
	```

* The above are the files for routes and model respectively for squaring and multiplying a numbers.
* The multiply function in models causes a delay of one second and returns the output, therefore total time taken by square function is one seconds
* The square function also makes a delay of one second and then calls the multiply function, therefore total time taken by square function is two seconds.
* So now we need to profile this, without touching the code, now we make a temporary file called profiler.js

* profiler.js
	```js
	'use strict';
    // to run this file type 'node profiler' in your terminal
   
    const route = require('./routes/route');
    
    const promiseProfiler = require('bluebird-promise-profiler');
    promiseProfiler.startProfiling();
    
    //call square route
    route.squareRoute(5).then((res) => {
    
    	// { result: 25 }
    	console.log(res);
    
    	// { multiplyPromise: 1004.3564850000002, squarePromise: 2009.1301549999998 }
    	console.log(promiseProfiler.getProfilerResult());
    
    	// reset profiler result to analyze other route
    	promiseProfiler.resetProfiler();
    
    	// call squareAndMultiply route
    	route.squareAndMultiplyRoute(4, 5).then((result) => {
    
    		// { multiplyResult: 20, squareResult: 16 }
    		console.log(result);
    
    		// note there is a multiplyPromise included in this response as square function internally calls multiply function
    		// { multiplyPromise: 1004.7086040000004, spreadFunction: 2008.4984540000005 }
    		console.log(promiseProfiler.getProfilerResult());
    
    		// stop the profiler one you have profiled all the routes
    		promiseProfiler.stopProfiling();
    	});
    
    });
	
	```

* The function names that are given in the .then() or .spread() functions, profiling would be done according to it.
* Anonymous functions given inside .then() or .spread() will not be profiled. So please do give names into those functions.

### Tests

* Test without code coverage

	```npm
	npm test
	```

* Test with code coverage

	```npm
	npm run-script test-with-coverage
	```
