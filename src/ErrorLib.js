'use strict';

const errorMap = {

	PromiseTypeError: {
		errorType: TypeError,
		message: 'expecting a bluebird promise'
	},
	PromiseNotFound: {
		errorType: ReferenceError,
		message: 'no bluebird promise library found, make sure there is a bluebird dependency in package.json'
	},
	ReStubFunctionError: {
		errorType: TypeError,
		message: 'attempted to stub function which is already stubbed'
	}

};


const throwError = function throwError (error) {

	throw new error.errorType(error.message);
};


module.exports = {
	throwError: throwError,
	errorMap: errorMap
};
