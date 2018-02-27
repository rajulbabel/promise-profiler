'use strict';

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

		// stop the profiler once the profiling is done
		promiseProfiler.stopProfiling();
	});

});
