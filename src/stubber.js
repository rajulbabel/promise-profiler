'use strict';

const ErrorLib = require('./ErrorLib');

/**
 * @class
 */
class StubObjectMethod {

	/**
	 * object[methodName] will be overridden by overrideFunction, note that the context for overrideFunction will be the same as for object[methodName].
	 * @constructor
	 * @param stubClassObject
	 * @param object {Object} Object which contains the method to be stubbed.
	 * @param methodName {string} Name of the method inside the object which has to be stubbed.
	 * @param overrideFunction {function} Function with which object[methodName] has to be stubbed.
	 */
	constructor (stubClassObject, object, methodName, overrideFunction) {

		this._stubClassObject = stubClassObject;
		this._object = object;
		this._methodName = methodName;
		this._overrideFunction = overrideFunction;
		this._restoreMethod = object[methodName];
		this._callCount = 0;
		this._args = [];

		const self = this;
		this._object[this._methodName] = function () {

			self._callCount++;
			self._args.push(...Object.values(arguments));
			return self._overrideFunction.call(this, ...self._args);
		}
	}


	/**
	 * Returns list of arguments passed to object[methodName] for every function call.
	 * @returns {Array}
	 */
	get callingArgs () {
		return this._args;
	}


	/**
	 * Returns total number of times object[methodName] is called.
	 * @returns {number}
	 */
	get callCount () {
		return this._callCount;
	}


	/**
	 * Restores object[methodName] to its original state.
	 */
	restore () {

		if (this._object && this._methodName) {
			this._object[this._methodName] = this._restoreMethod;
			this._stubClassObject._remove(this._object, this._methodName);
			this._object = null;
			this._methodName = null;
			this._overrideFunction = null;
			this._restoreMethod = null;
			this._callCount = 0;
			this._args = [];
		}
	}
}

/**
 * @class
 */
class Stub {

	/**
	 * @constructor
	 */
	constructor () {

		this._stubbedMethods = [];
	}


	/**
	 * Call this method to stub over a function of an object with another function.
	 * @param object {Object} Object which contains the method to be stubbed.
	 * @param methodName {string} Name of the method inside the object which has to be stubbed.
	 * @param overrideFunction {function} Function with which object[methodName] has to be stubbed.
	 * @returns {StubObjectMethod}
	 */
	stub (object, methodName, overrideFunction) {

		for (let i = 0; i < this._stubbedMethods.length; i++) {

			if (this._stubbedMethods[i].object === object && this._stubbedMethods[i].methodName === methodName) {
				ErrorLib.throwError(ErrorLib.errorMap.ReStubFunctionError);
			}
		}

		this._stubbedMethods.push({
			object: object,
			methodName: methodName
		});

		return new StubObjectMethod (this, object, methodName, overrideFunction);
	}


	_remove (object, methodName) {

		this._stubbedMethods = this._stubbedMethods.filter((element) => {
				return element.object  !== object && element.methodName !== methodName;
			});
	}

}

module.exports = new Stub();
