// Eventually to be moved to the stricture package

const libFableServiceProviderBase = require('fable-serviceproviderbase');

var libFS = require('fs');
var libPath = require('path');
var libLineReader = require('line-by-line');
var libJSONFile = require('jsonfile');
var libUnderscore = require('underscore');
var libAsync = require('async');

/**
* Stricture MicroDDL Compiler
*/

// ## Load the default state for meadow and pict configuration settings
var _DefaultAPIDefinitions = require(__dirname + '/Meadow-Endpoints-Definition-Defaults.js')
var _DefaultAPISecurity = require(__dirname + '/Meadow-Endpoints-Security-Defaults.js');

var _DefaultPict = require(__dirname + '/Pict-Configuration-Defaults.js');


const _DefaultOptions = (
	{
	});

class StrictureCompiler extends libFableServiceProviderBase
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

	GenerateMeadowSchema(pModelData)
	{
		var tmpTable = pModelData;

		console.log('  > Table: ' + tmpTable.TableName);

		var tmpPrimaryKey = 'ID' + tmpTable.TableName;

		// Get the primary key
		for (var j = 0; j < tmpTable.Columns.length; j++)
			if (tmpTable.Columns[j].DataType == 'ID')
				tmpPrimaryKey = tmpTable.Columns[j].Column;

		var tmpModel = ({
			Scope: tmpTable.TableName,
			DefaultIdentifier: tmpPrimaryKey,

			Domain: (typeof (tmpTable.Domain) === 'undefined') ? 'Default' : tmpTable.Domain,

			Schema: [],

			DefaultObject: {},

			JsonSchema: ({
				title: tmpTable.TableName,
				type: 'object',
				properties: {},
				required: []
			}),

			Authorization: {}
		});
		for (var j = 0; j < tmpTable.Columns.length; j++)
		{
			var tmpColumnName = tmpTable.Columns[j].Column;
			var tmpColumnType = tmpTable.Columns[j].DataType;
			var tmpColumnSize = tmpTable.Columns[j].hasOwnProperty('Size') ? tmpTable.Columns[j].Size : 'Default';

			var tmpSchemaEntry = { Column: tmpColumnName, Type: 'Default' };
			// Dump out each column......
			switch (tmpColumnType)
			{
				case 'ID':
					tmpSchemaEntry.Type = 'AutoIdentity';
					tmpModel.DefaultObject[tmpColumnName] = 0;
					tmpModel.JsonSchema.properties[tmpColumnName] = { type: 'integer', size: tmpColumnSize };
					tmpModel.JsonSchema.required.push(tmpColumnName);
					break;
				case 'GUID':
					tmpSchemaEntry.Type = 'AutoGUID';
					tmpModel.DefaultObject[tmpColumnName] = '0x0000000000000000';
					tmpModel.JsonSchema.properties[tmpColumnName] = { type: 'string', size: tmpColumnSize };
					break;
				case 'ForeignKey':
					tmpSchemaEntry.Type = 'Integer';
					tmpModel.DefaultObject[tmpColumnName] = 0;
					tmpModel.JsonSchema.properties[tmpColumnName] = { type: 'integer', size: tmpColumnSize };
					tmpModel.JsonSchema.required.push(tmpColumnName);
					break;
				case 'Numeric':
					tmpSchemaEntry.Type = 'Integer';
					tmpModel.DefaultObject[tmpColumnName] = 0;
					tmpModel.JsonSchema.properties[tmpColumnName] = { type: 'integer', size: tmpColumnSize };
					break;
				case 'Decimal':
					tmpSchemaEntry.Type = 'Decimal';
					tmpModel.DefaultObject[tmpColumnName] = 0.0;
					tmpModel.JsonSchema.properties[tmpColumnName] = { type: 'number', size: tmpColumnSize };
					break;
				case 'String':
				case 'Text':
					tmpSchemaEntry.Type = 'String';
					tmpModel.DefaultObject[tmpColumnName] = '';
					tmpModel.JsonSchema.properties[tmpColumnName] = { type: 'string', size: tmpColumnSize };
					break;
				case 'DateTime':
					tmpSchemaEntry.Type = 'DateTime';
					tmpModel.DefaultObject[tmpColumnName] = null;
					tmpModel.JsonSchema.properties[tmpColumnName] = { type: 'string', size: tmpColumnSize };
					break;
				case 'Boolean':
					tmpSchemaEntry.Type = 'Boolean';
					tmpModel.DefaultObject[tmpColumnName] = false;
					tmpModel.JsonSchema.properties[tmpColumnName] = { type: 'boolean', size: tmpColumnSize };
					break;
			}
			// Now mark up the magic columns that branch by name
			switch (tmpColumnName)
			{
				case 'CreateDate':
					tmpSchemaEntry.Type = 'CreateDate';
					break;
				case 'CreatingIDUser':
					tmpSchemaEntry.Type = 'CreateIDUser';
					break;
				case 'UpdateDate':
					tmpSchemaEntry.Type = 'UpdateDate';
					break;
				case 'UpdatingIDUser':
					tmpSchemaEntry.Type = 'UpdateIDUser';
					break;
				case 'DeleteDate':
					tmpSchemaEntry.Type = 'DeleteDate';
					break;
				case 'DeletingIDUser':
					tmpSchemaEntry.Type = 'DeleteIDUser';
					break;
				case 'Deleted':
					tmpSchemaEntry.Type = 'Deleted';
					break;
			}
			tmpSchemaEntry.Size = tmpColumnSize;

			// Now add it to the array
			tmpModel.Schema.push(tmpSchemaEntry);
		}

		return tmpModel
	}

	/***********
	 * MicroDDL Compiler
	 *
	 *****/
	compileMicroDDL(pFilePath, pFileName, fCallback)
	{
		pFable = this.fable;

		var tmpStrictureModelFile = pFable.settings.OutputLocation + pFable.settings.OutputFileName + '.json';
		var tmpStrictureModelExtendedFile = pFable.settings.OutputLocation + pFable.settings.OutputFileName + '-Extended.json';
		var tmpStrictureModelPICTFile = pFable.settings.OutputLocation + pFable.settings.OutputFileName + '-PICT.json';

		var tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => { };

		pFable.Stricture = (
			{
				// This hash table will hold the model
				Tables: {},

				// This array will hold the order for the tables in the model, so they match the order they are first introduced to Stricture
				TablesSequence: [],

				// This hash table will hold the authenticator configuration for the entire model
				Authorization: {},

				// This hash table will hold the meadow endpoint configuration for the entire model
				Endpoints: {},

				Pict: {}
			}
		);

		console.info('--> Compiling MicroDDL to JSON');
		console.log('  > Input file:  ' + pFable.settings.InputFileName);
		console.log('  > Output file: ' + tmpStrictureModelFile);
		console.log('  > Extended Output file: ' + tmpStrictureModelExtendedFile);

		// Read in the file
		console.info('  > Reading DDL File(s)');
		ReadMicroDDLFile(pFable, pFable.settings.InputFileName,
			function ()
			{
				libAsync.waterfall(
					[
						(fStageComplete) =>
						{
							// Generate the output
							console.info('  > Metacompiling the Model');
							libJSONFile.writeFile(tmpStrictureModelFile,
								{ Tables: pFable.Stricture.Tables },
								{ spaces: 4 },
								function (pError)
								{
									if (pError)
									{
										console.error('  > Error writing out model JSON: ' + pError);
									}
									else
									{
										console.info('  > Model JSON Successfully Written');
									}
									return fStageComplete(pError);
								}
							);
						},
						(fStageComplete) =>
						{
							console.info(' Auto-generating inline meadow schemas');
							for (var tmpTableKey in pFable.Stricture.Tables)
							{
								var tmpTable = pFable.Stricture.Tables[tmpTableKey];
								var tmpSchema = GenerateMeadowSchema(tmpTable);
								pFable.Stricture.Tables[tmpTableKey].MeadowSchema = tmpSchema;
							}
							return fStageComplete();
						},
						(fStageComplete) =>
						{
							// Generate the output
							console.info('  > Compiling the Extended Model');
							// Decorate the current model with the right output
							if (typeof (pFable.Stricture) === 'object')
							{
								if (pFable.Stricture.hasOwnProperty('Tables') && (typeof (pFable.Stricture) === 'object'))
								{
									let tmpTableList = Object.keys(pFable.Stricture.Tables);
									for (let i = 0; i < tmpTableList.length; i++)
									{
										const tmpTableName = tmpTableList[i];
										const tmpTableObject = pFable.Stricture.Tables[tmpTableName];
										// For now, have duplicate data in the schema.
										let tmpJSONSchemaInsert;
										try
										{
											tmpJSONSchemaInsert = JSON.parse(JSON.stringify(tmpTableObject));
										}
										catch (pError)
										{
											pFable.log.info(`Error parsing JSON for table: ${tmpTableName} -- ${pError}`)
										}
										// Remove the JSON Schema from the JSON Schema insert of the meadow model
										delete tmpJSONSchemaInsert.JsonSchema;
										// Add the JSON Schema to the model JSONSchema
										tmpTableObject.MeadowSchema.JsonSchema.MeadowSchema = tmpJSONSchemaInsert;

									}
								}
							}
							libJSONFile.writeFile(tmpStrictureModelExtendedFile,
								pFable.Stricture,
								{ spaces: 4 },
								function (pError)
								{
									if (pError)
									{
										console.error('  > Error writing out Extended model JSON: ' + pError);
									}
									else
									{
										console.info('  > Extended Model JSON Successfully Written');
									}
									return fStageComplete(pError);
								}
							);
						},
						(fStageComplete) =>
						{
							// Generate the output
							console.info('  > Compiling the PICT Definition');
							libJSONFile.writeFile(tmpStrictureModelPICTFile,
								pFable.Stricture.Pict,
								{ spaces: 4 },
								function (pError)
								{
									if (pError)
									{
										console.error('  > Error writing out PICT model JSON: ' + pError);
									}
									else
									{
										console.info('  > PICT JSON Successfully Written');
									}
									return fStageComplete(pError);
								}
							);
						}
					],
					(pError) =>
					{
						if (pError)
						{
							console.error('  > ERROR Compiling DDL: ' + pError);
						}
						else
						{
							console.info('  > DDL Compile Stages completed successfully.');
						}

						return tmpCallback(pError);
					}
				)
			}
		);
	}
}

module.exports = StrictureCompiler;
module.exports.default_configuration = _DefaultOptions;
