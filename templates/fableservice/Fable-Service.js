const FableServiceProviderBase = require('fable-serviceproviderbase');

const _DefaultOptions = (
	{
	});

class FableService extends FableServiceProviderBase
{
	/**
	 * @param {import('fable')} pFable - The fable instance.
	 * @param {Object<String, any>} [pOptions] - The options for the client.
	 * @param {String} [pServiceHash] - A service hash for the fable service.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DefaultOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);
	}

	doSomething()
	{
		return true;
	}
}

module.exports = FableService;

module.exports.default_configuration = _DefaultOptions;
