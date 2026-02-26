const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');
const libPath = require('path');

class QuackageCommandUpdateNodeGitignore extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'update-node-gitignore';
		this.options.Description = 'Check the .gitignore in the current folder against a prototype node module .gitignore and add any missing entries';
		this.options.Aliases.push('update-gitignore');
		this.options.Aliases.push('gitignore');

		this.options.CommandOptions.push({ Name: '-d, --dry-run', Description: 'Show what would be added without modifying the file' });

		this.addCommand();
	}

	// Parse a .gitignore file into an array of structured blocks.
	// Each block is { comment: string|null, entries: string[] }
	// representing a comment header and the entries that follow it.
	parseGitignore(pContent)
	{
		let tmpLines = pContent.split('\n');
		let tmpBlocks = [];
		let tmpCurrentBlock = { comment: null, entries: [] };

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i];
			let tmpTrimmed = tmpLine.trim();

			if (tmpTrimmed.startsWith('#'))
			{
				// If we have accumulated entries, push the current block
				if (tmpCurrentBlock.comment !== null || tmpCurrentBlock.entries.length > 0)
				{
					tmpBlocks.push(tmpCurrentBlock);
				}
				tmpCurrentBlock = { comment: tmpLine, entries: [] };
			}
			else if (tmpTrimmed.length > 0)
			{
				tmpCurrentBlock.entries.push(tmpLine);
			}
			// blank lines are structural separators -- if we have a pending block with entries, close it
			else if (tmpCurrentBlock.entries.length > 0)
			{
				tmpBlocks.push(tmpCurrentBlock);
				tmpCurrentBlock = { comment: null, entries: [] };
			}
		}

		// Push any remaining block
		if (tmpCurrentBlock.comment !== null || tmpCurrentBlock.entries.length > 0)
		{
			tmpBlocks.push(tmpCurrentBlock);
		}

		return tmpBlocks;
	}

	// Collect all non-comment, non-blank entries from a gitignore into a Set
	collectEntries(pContent)
	{
		let tmpEntries = new Set();
		let tmpLines = pContent.split('\n');
		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpTrimmed = tmpLines[i].trim();
			if (tmpTrimmed.length > 0 && !tmpTrimmed.startsWith('#'))
			{
				tmpEntries.add(tmpTrimmed);
			}
		}
		return tmpEntries;
	}

	onRunAsync(fCallback)
	{
		let tmpOptions = this.CommandOptions;
		let tmpCWD = this.fable.AppData.CWD;
		let tmpProjectGitignorePath = `${tmpCWD}/.gitignore`;

		// Load the prototype gitignore from quackage's own .gitignore
		let tmpPrototypePath = libPath.join(this.fable.AppData.QuackageFolder, '.gitignore');

		if (!libFS.existsSync(tmpPrototypePath))
		{
			this.log.error(`Prototype .gitignore not found at [${tmpPrototypePath}]`);
			return fCallback(new Error('Prototype .gitignore not found'));
		}

		let tmpPrototypeContent = libFS.readFileSync(tmpPrototypePath, 'utf8');

		// Load or create the project gitignore
		let tmpProjectContent = '';
		let tmpProjectExists = libFS.existsSync(tmpProjectGitignorePath);
		if (tmpProjectExists)
		{
			tmpProjectContent = libFS.readFileSync(tmpProjectGitignorePath, 'utf8');
		}

		this.log.info(`Checking .gitignore in [${tmpCWD}] against prototype...`);

		// Collect all existing entries from the project gitignore
		let tmpExistingEntries = this.collectEntries(tmpProjectContent);

		// Parse the prototype into blocks so we can add missing entries with their section context
		let tmpPrototypeBlocks = this.parseGitignore(tmpPrototypeContent);

		// Walk each prototype block and find entries missing from the project
		let tmpMissingBlocks = [];
		let tmpTotalMissing = 0;

		for (let i = 0; i < tmpPrototypeBlocks.length; i++)
		{
			let tmpBlock = tmpPrototypeBlocks[i];
			let tmpMissingEntries = [];

			for (let j = 0; j < tmpBlock.entries.length; j++)
			{
				let tmpEntry = tmpBlock.entries[j].trim();
				if (!tmpExistingEntries.has(tmpEntry))
				{
					tmpMissingEntries.push(tmpBlock.entries[j]);
				}
			}

			if (tmpMissingEntries.length > 0)
			{
				tmpMissingBlocks.push({ comment: tmpBlock.comment, entries: tmpMissingEntries });
				tmpTotalMissing += tmpMissingEntries.length;
			}
		}

		if (tmpTotalMissing === 0)
		{
			this.log.info(`  --> .gitignore is up to date; nothing to add.`);
			return fCallback();
		}

		// Report what will be added
		this.log.info(`  --> Found ${tmpTotalMissing} missing ${tmpTotalMissing === 1 ? 'entry' : 'entries'}:`);
		for (let i = 0; i < tmpMissingBlocks.length; i++)
		{
			let tmpBlock = tmpMissingBlocks[i];
			if (tmpBlock.comment)
			{
				this.log.info(`    ${tmpBlock.comment}`);
			}
			for (let j = 0; j < tmpBlock.entries.length; j++)
			{
				this.log.info(`      + ${tmpBlock.entries[j]}`);
			}
		}

		if (tmpOptions.dry_run || tmpOptions.dryRun)
		{
			this.log.info(`  --> Dry run; no changes written.`);
			return fCallback();
		}

		// Build the section to append
		let tmpAppendLines = [];
		tmpAppendLines.push('');
		tmpAppendLines.push('# Added by quackage update-node-gitignore');

		for (let i = 0; i < tmpMissingBlocks.length; i++)
		{
			let tmpBlock = tmpMissingBlocks[i];
			tmpAppendLines.push('');
			if (tmpBlock.comment)
			{
				tmpAppendLines.push(tmpBlock.comment);
			}
			for (let j = 0; j < tmpBlock.entries.length; j++)
			{
				tmpAppendLines.push(tmpBlock.entries[j]);
			}
		}

		let tmpAppendContent = tmpAppendLines.join('\n') + '\n';

		// Ensure the existing file ends with a newline before appending
		if (tmpProjectContent.length > 0 && !tmpProjectContent.endsWith('\n'))
		{
			tmpAppendContent = '\n' + tmpAppendContent;
		}

		let tmpNewContent = tmpProjectContent + tmpAppendContent;

		if (tmpProjectExists)
		{
			this.log.info(`  --> Backing up .gitignore to .gitignore.quackage.bak ...`);
			libFS.writeFileSync(`${tmpCWD}/.gitignore.quackage.bak`, tmpProjectContent);
		}

		this.log.info(`  --> Writing updated .gitignore ...`);
		libFS.writeFileSync(tmpProjectGitignorePath, tmpNewContent);
		this.log.info(`  --> Done; ${tmpTotalMissing} ${tmpTotalMissing === 1 ? 'entry' : 'entries'} added.`);

		return fCallback();
	};
}

module.exports = QuackageCommandUpdateNodeGitignore;
