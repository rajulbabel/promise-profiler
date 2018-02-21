'use strict';

const errorMap = {

	PromiseTypeError: {
		message: 'expecting a bluebird promise'
	}

};

const throwError = {
	PromiseTypeError: () => {
		throw new TypeError(errorMap.PromiseTypeError.message);
	}
};

module.exports = {
	throwError: throwError,
	errorMap: errorMap
};
