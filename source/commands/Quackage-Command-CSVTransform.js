const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

const libFS = require('fs');
const libPath = require('path');
const libReadline = require('readline');

class QuackageCommandCSVTransform extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'csvtransform';
		this.options.Description = 'Transform a CSV into a comprehension, and either inject it in a file or create a new comprehension file.';

		this.options.CommandArguments.push({ Name: '<file>', Description: 'The CSV file to transform.' });

		// File Parameters
		this.options.CommandOptions.push({ Name: '-f, --file [filepath]', Description: 'The csv file to read.'});
		this.options.CommandOptions.push({ Name: '-o, --output [filepath]', Description: 'The comprehension output file.  Defaults to ./CSV-Comprehension-[filename].json'});

		// Comprehension Parameters
		// This can be *either* a mapping file, in the following format, or a set of parameters listed below.  The mapping file lets you map columns way easier!
/* Comprehension Mapping File (for the file `/debug/testdata/airports.csv` in this repository):
{
	"Entity": "Airport",
	"GUIDTemplate": "Airport-{~D:iata~}",
	"Mappings":
	{
		"Code": "{~D:iata~}",
		"Name": "{~D:name~}",
		"Description": "{~D:name~} airport in {~D:city~} auto-ingested from CSV file.",
		"City": "{~D:city~}",
		"State": "{~D:state~}",
		"Country": "{~D:country~}",
		"Latitude": "{~D:lat~}",
		"Longitude": "{~D:long~}"
	}
}

Alternate command-line only:

quack csvtransform airports.csv -e Airport -g "Airport-{~D:iata~}"" -c "Code={~D:iata~},Name={~D:name~},Description={~D:name~} airport in {~D:city~} auto-ingested from CSV file.,City={~D:city~},State={~D:state~},Country={~D:country~},Latitude={~D:lat~},Longitude={~D:long~}""

Note command-line will not allow you to use equal signs or commas in the templates at the moment.
*/
		this.options.CommandOptions.push({ Name: '-m, --mappingfile [filepath]', Description: 'The mapping file for the comprehension.'});

		this.options.CommandOptions.push({ Name: '-e, --entity [entity]', Description: 'The Entity we are pulling into the comprehension.'});
		this.options.CommandOptions.push({ Name: '-g, --guidtemplate [template]', Description: 'The Pict template for the entity GUID; for instance if the CSV has a column named "id", you could use {~D:id~} and that would be the GUID for the entity.'});
		this.options.CommandOptions.push({ Name: '-c, --columns [columns]', Description: 'The columns to map to the comprehension.  Format is "Column1={~D:column1~},Column2={~D:column2~},Column3={~D:column3~}"'});

		// Auto add the command on initialization
		this.addCommand();
	}

/* Generate a Comprehension
 *
 * This will generate a comprehension from a CSV file.
 * 
 * If a comprehension already exists, it will map the records to the existing comprehension.
 * 
 * Required Data Elements:
 * 
 * - Entity: The entity name for the comprehension.  Generated from the Filename if not provided.
 * - GUIDColumn: The column that contains the GUID for the record.
 * - Mappings: The mappings for the comprehension.  if not provided, will be generated from the first row of the CSV.
 */
	generateMappingFromRecord(pFileName, pRecord)
	{
		let tmpMapping = {};

		// Generate the entity name from the filename
		// For instance "my favorite cats.csv" would become "MyFavoriteCats"
		tmpMapping.Entity = this.fable.DataFormat.cleanNonAlphaCharacters(_DataFormat.capitalizeEachWord(libPath.basename(pFileName, libPath.extname(pFileName))));

		let tmpKeys = Object.keys(pRecord);

		// Generate the GUID template from the first record
		tmpMapping.GUIDTemplate = `${tmpMapping.Entity}-{~D:${tmpKeys[0]}~}`;
	}


	onRunAsync(fCallback)
	{
		let tmpFile = this.ArgumentString;
		if ((!tmpFile) || (typeof(tmpFile) != 'string') || (tmpFile.length === 0))
		{
			this.log.error('No valid filename provided.');
			return fCallback();
		}
		let tmpOutputFileName = this.CommandOptions.output;
		if ((!tmpOutputFileName) || (typeof(tmpOutputFileName) != 'string') || (tmpOutputFileName.length === 0))
		{
			tmpOutputFileName = `${process.cwd()}/CSV-Comprehension-${libPath.basename(tmpFile)}.json`;
			this.log.error(`No output filename provided.  Defaulting to ${tmpOutputFileName}`);
		}

		// Initialize the fable CSV parser
		this.fable.instantiateServiceProvider('CSVParser');
		this.fable.instantiateServiceProvider('FilePersistence');

		// Do some input file housekeeping
		if (!this.fable.FilePersistence.existsSync(tmpFile))
		{
			this.fable.log.error(`File [${tmpFile}] does not exist.  Checking in the current working directory...`);
			tmpFile = libPath.join(process.cwd(), tmpFile);
			if (!this.fable.FilePersistence.existsSync(tmpFile))
			{
				this.fable.log.error(`File [${tmpFile}] does not exist in the current working directory.  Could not parse file.`);
				return fCallback();
			}
		}

		/* This may be injecting into a specific comprehension file
		 * or creating a new one.
		 */
		let tmpComprehension = {};
		if (this.fable.FilePersistence.existsSync(tmpOutputFileName))
		{
			try
			{
				tmpComprehension = require(tmpOutputFileName);
			}
			catch (pError)
			{
				this.fable.log.error(`Error reading existing comprehension file [${tmpOutputFileName}].`);
			}
		}
		/* We need an index of GUIDs for the comprehension data set being generated -- preslot it if it doesn't exist
		*/

		const tmpRecords = [];
		this.fable.log.info(`Parsing CSV file [${tmpFile}]...`);

		const tmpReadline = libReadline.createInterface(
			{
				input: libFS.createReadStream(tmpFile),
				crlfDelay: Infinity,
			});

		tmpReadline.on('line',
			(pLine) =>
			{
				const tmpRecord = this.fable.CSVParser.parseCSVLine(pLine);
				if (tmpRecord)
				{
					tmpStatistics.RowCount++;

					if (tmpStatistics.FirstRow === null)
					{
						tmpStatistics.FirstRow = tmpRecord;
					}
					tmpStatistics.LastRow = tmpRecord;

					let tmpKeys = Object.keys(tmpRecord);
					for (let i = 0; i < tmpKeys.length; i++)
					{
						let tmpKey = tmpKeys[i];
						if (!(tmpKey in tmpStatistics.ColumnStatistics))
						{
							tmpStatistics.ColumnCount++;
							tmpStatistics.ColumnStatistics[tmpKey] = { Count: 0, EmptyCount: 0, NumericCount: 0, FirstValue: null, LastValue: null };
							tmpStatistics.Headers.push(tmpKey);
						}
						tmpStatistics.ColumnStatistics[tmpKey].Count++;
						if (tmpStatistics.ColumnStatistics[tmpKey].FirstValue === null)
						{
							tmpStatistics.ColumnStatistics[tmpKey].FirstValue = tmpRecord[tmpKey];
						}
						tmpStatistics.ColumnStatistics[tmpKey].LastValue = tmpRecord[tmpKey];
						if ((tmpRecord[tmpKey] === null) || (tmpRecord[tmpKey] === ''))
						{
							tmpStatistics.ColumnStatistics[tmpKey].EmptyCount++;
						}
						if (this.fable.Math.parsePrecise(tmpRecord[tmpKey], NaN) !== NaN)
						{
							tmpStatistics.ColumnStatistics[tmpKey].NumericCount++;
						}
					}
					tmpRecords.push(tmpRecord);
				}
			});

		tmpReadline.on('close',
			() =>
			{
				this.fable.log.info(`...CSV parser completed, examined ${tmpStatistics.RowCount} rows of data.`);
				this.fable.log.info(`...Found ${tmpStatistics.ColumnCount} columns in the CSV file.`);
				this.fable.log.info(`...Writing statistics to file [${tmpOutputFileName}]...`);
				if (this.CommandOptions.comprehension)
				{
					tmpStatistics.Records = tmpRecords
				}					
				this.fable.FilePersistence.writeFileSyncFromObject(tmpOutputFileName, tmpStatistics);
				this.fable.log.info(`...Statistics written.`);
				this.fable.log.info(`Summary: ${tmpStatistics.RowCount} rows, ${tmpStatistics.ColumnCount} columns in [${tmpFile}].`);
				this.fable.log.info(`  Headers: ${tmpStatistics.Headers.join(', ')}`);
				this.fable.log.info(`  First Row: ${JSON.stringify(tmpStatistics.FirstRow)}`);
				this.fable.log.info(`  Last Row: ${JSON.stringify(tmpStatistics.LastRow)}`);
				this.fable.log.info(`  Column Statistics:`);
				let tmpKeys = Object.keys(tmpStatistics.ColumnStatistics);
				for (let i = 0; i < tmpKeys.length; i++)
				{
					let tmpKey = tmpKeys[i];
					this.fable.log.info(`    -> [${tmpKey}]: ${JSON.stringify(tmpStatistics.ColumnStatistics[tmpKey])}`);
				}

				this.fable.log.info(`Have a nice day!`);
			});
	};
}

module.exports = QuackageCommandCSVTransform;