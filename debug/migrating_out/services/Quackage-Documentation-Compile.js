const libPict = require('pict');

//const libMarked = require('marked');
//const libMarkedTexRenderer = require('marked-tex-renderer');


class DocumentationCompile extends libPict.ServiceProviderBase
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.serviceType = 'DocumentationCompile';

		this.ModelIndices = {};

		this.showdown = false;
	}

	getLaTeXFromMarkdown(pMarkdown)
	{
		return false;
// 		let tmpTexRenderer = new libMarkedTexRenderer()
// 		tmpTexRenderer.heading = this.latexHeadingSections;
// 		tmpTexRenderer.checkbox = (pChecked) => { return ''; };

// 		// Set the renderer to be markdown
// 		libMarked.setOptions(
// 			{
// 				renderer: tmpTexRenderer,
// 				gfm: true,
// 				failOnUnsupported: false,
// 				delRenderer: (pText) =>
// 				{
// 					// return TeX source to render deleted text
// 					return ``;
// 				},
// 				linkRenderer: (pHref, pTitle, pText) =>
// 				{
// 					// return TeX source to render hyperlinks
// 					return `\\href{${pHref}}{${pTitle} - ${pText}`;
// 				},
// 				imageRenderer: (pHref, pTitle, pText) =>
// 				{
// 					// return TeX source to render images
// 					return `
// \\bigskip
// \\begin{center}
// \\includegraphics[width=0.7\\textwidth]{${pHref}}
// \\end{center}

// `;
// 				}
// 			});

// 		return libMarked.parse(pMarkdown);
	}

	latexHeadingSections(pHeadingText, pHeadingLevel, pHeadingRaw)
	{
		let tmpHeadingType = ''

		switch (pHeadingLevel)
		{
			case 1:
				tmpHeadingType = '\\section';
				break;
			case 2:
				tmpHeadingType = '\\subsection';
				break;
			case 3:
				tmpHeadingType = '\\subsubsection';
				break;
			case 4:
				tmpHeadingType = '\\paragraph';
				break;
			case 5:
			case 6:
				tmpHeadingType = '\\subparagraph';
				break;
		}

		return `\n${tmpHeadingType}{${pHeadingText}}\n`;
	}

	latexHeadingSubsections(pHeadingText, pHeadingLevel, pHeadingRaw)
	{
		let tmpHeadingType = ''

		switch (pHeadingLevel)
		{
			case 1:
				tmpHeadingType = '\\subsection';
				break;
			case 3:
				tmpHeadingType = '\\paragraph';
				break;
			case 4:
			case 5:
			case 6:
				tmpHeadingType = '\\subparagraph';
				break;
		}

		return `\n${tmpHeadingType}{${pHeadingText}}\n`;
	}

	generateIndicesFromSchema(pMeadowSchema)
	{
		if (typeof (pMeadowSchema) != 'object')
		{
			this.log.error('...Invalid or no Meadow schema...');
			return false;
		}

		let tmpMeadowTables = Object.keys(pMeadowSchema.Tables);
		for (let i = 0; i < tmpMeadowTables.length; i++)
		{
			let tmpSchema = pMeadowSchema.Tables[tmpMeadowTables[i]];

			if (tmpSchema.hasOwnProperty('MeadowSchema') && tmpSchema.MeadowSchema.DefaultIdentifier)
			{
				this.ModelIndices[tmpSchema.MeadowSchema.DefaultIdentifier] = tmpSchema.TableName;
			}
		}

		return true;
	}

	generateLaTeXFromSchema(pMeadowTableSchema, pHeaderType)
	{
		let tmpLaTeX = '';

		let tmpHeaderType = (pHeaderType) ? pHeaderType : 'subsection';

		tmpLaTeX += `\n\\${tmpHeaderType}{${pMeadowTableSchema.TableName}}\n`;
		if (pMeadowTableSchema.hasOwnProperty('Description') && pMeadowTableSchema.Description.length > 0)
		{
			tmpLaTeX += pMeadowTableSchema.Description + "\n\\vspace{4mm}\n\n\\noindent\n";
		}
		tmpLaTeX += "\\begin{small}\n";
		tmpLaTeX += "\\begin{tabularx}{\\textwidth}{ l l l X }\n";
		tmpLaTeX += "\\textbf{Column Name} & \\textbf{Size} & \\textbf{Data Type} & \\textbf{Notes} \\\\ \\hline \n";
		for (let j = 0; j < pMeadowTableSchema.Columns.length; j++)
		{
			// Dump out each column......
			let tmpSize = (pMeadowTableSchema.Columns[j].Size == undefined) ? '' : pMeadowTableSchema.Columns[j].Size;

			let tmpDescription = '';

			if (pMeadowTableSchema.Columns[j].Join != undefined)
			{
				let tmpJoinTableName = this.ModelIndices[pMeadowTableSchema.Columns[j].Join];
				if (tmpJoinTableName)
				{
					tmpDescription += 'Joined to ' + tmpJoinTableName + '.' + pMeadowTableSchema.Columns[j].Join + "\n";
				}
			}
			if (pMeadowTableSchema.Columns[j].TableJoin)
			{
				tmpDescription += 'Joins to: ' + pMeadowTableSchema.Columns[j].TableJoin + "\n";
			}
			if (pMeadowTableSchema.Columns[j].hasOwnProperty('Description'))
			{
				tmpDescription += pMeadowTableSchema.Columns[j].Description + "\n";
			}

			tmpLaTeX += pMeadowTableSchema.Columns[j].Column + " & " + tmpSize + " & " + pMeadowTableSchema.Columns[j].DataType + " & " + tmpDescription + " \\\\ \n";
		}
		tmpLaTeX += "\\end{tabularx}\n";
		tmpLaTeX += "\\end{small}\n";

		return tmpLaTeX;
	}

	generateMarkdownFromSchema(pSchema)
	{
		return pSchema;
	}

	convertMarkdownToHTML(pDocumentText)
	{
		if (!this.showdown)
		{
			this.showdown = require('devextreme-showdown');
		}

		const tmpConverter = new this.showdown.Converter();

		return tmpConverter.makeHtml(pDocumentText);
	}

	/*
		{
			"Title": "Example Queries",
			"GeneratedContentFormatter": "BasicContent",
			"SourceContentType": "MarkdownContent",
			"Filters": [
				{
					"ForwardLabelMatch": ["model", "entity_abstractions"],
					"CategorizeByFolder": false
				}]
		}
	*/
	matchContentByFilters(pFilters)
	{
		let tmpMatchedContent = [];

		// Walk through each piece of content in the ContentSet
		for (let i = 0; i < this.fable.AppData.contentSet.length; i++)
		{
			let tmpContent = this.fable.AppData.contentSet[i];
			let tmpContentMatched = false;

			for (let j = 0; j < pFilters.length; j++)
			{
				let tmpFilter = pFilters[j];

				// Filters are ANDed together and used if they are present otherwise ignored
				if (tmpFilter.hasOwnProperty('ForwardLabelMatch') && Array.isArray(tmpFilter.ForwardLabelMatch) && (tmpFilter.ForwardLabelMatch.length > 0))
				{
					for (let k = 0; k < tmpContent.Labels.length; k++)
					{
						// If we match the first label of the forward label match, see if the rest match in sequence
						if (tmpFilter.ForwardLabelMatch[0] == tmpContent.Labels[k])
						{
							let tmpPotentialMatch = true;
							for (let l = 0; l < tmpFilter.ForwardLabelMatch.length; l++)
							{
								if ((k + l < tmpContent.Labels.length) && (tmpFilter.ForwardLabelMatch[l] == tmpContent.Labels[k + l]))
								{
									// Still in the running for a match!
								}
								else
								{
									tmpPotentialMatch = false;
								}
							}
							if (tmpPotentialMatch)
							{
								tmpContentMatched = true;
							}
						}
					}
				}
			}

			if (tmpContentMatched)
			{
				tmpMatchedContent.push(tmpContent);
			}
		}

		return tmpMatchedContent;
	}

	generateLaTexPartTitle(pPartTitle)
	{
		return `\n\\part{${pPartTitle}}\n`;
	}

	generateLaTexSectionTitle(pSectionTitle)
	{
		return `\n\\section{${pSectionTitle}}\n`;
	}

	compileDocumentationPart(pPartDefinition)
	{
		let tmpMeadowTables = [];
		if ((pPartDefinition.SourceContentType == 'MeadowSchema') && (!this.fable.AppData.meadowSchema))
		{
			this.log.error(`Part ${pPartDefinition.Title} requires a Meadow schema, but no valid schema was found.`);
			return false;
		}
		else if (this.fable.AppData.meadowSchema)
		{
			tmpMeadowTables = Object.keys(this.fable.AppData.meadowSchema.Tables);
		}

		let tmpPart = (
			{
				Title: pPartDefinition.Title,
				Section_HTML_Content: [],
				LaTeX_Content: '',
				Markdown_Content: '',
				SourcePart: pPartDefinition
			});

		this.fable.AppData.DocumentationOutput.Parts.push(tmpPart);

		switch (pPartDefinition.GeneratedContentFormatter)
		{
			case 'BasicContent':
				if ((pPartDefinition.SourceContentType == 'RawMarkdown') && (pPartDefinition.RawMarkdownContent))
				{
					tmpPart.LaTeX_Content = this.generateLaTexPartTitle(pPartDefinition.Title);
					tmpPart.Markdown_Content = pPartDefinition.RawMarkdownContent;
					tmpPart.LaTeX_Content += this.getLaTeXFromMarkdown(pPartDefinition.RawMarkdownContent);
				}
				else if (pPartDefinition.SourceContentType == 'MarkdownContent')
				{
					let tmpContentSet = this.matchContentByFilters(pPartDefinition.Filters);

					pPartDefinition.ContentSet = tmpContentSet;

					if (tmpContentSet.length > 0)
					{
						tmpPart.LaTeX_Content = this.generateLaTexPartTitle(pPartDefinition.Title);

						for (let i = 0; i < tmpContentSet.length; i++)
						{
							if (tmpPart.hasOwnProperty('PartLatexPrefix'))
							{
								tmpPart.LaTeX_Content += tmpPart.PartLatexPrefix;
							}
							tmpPart.Markdown_Content += tmpContentSet[i].Content;
							tmpPart.LaTeX_Content = this.getLaTeXFromMarkdown(tmpPart.Markdown_Content);
						}
					}
				}
				break;

			case 'MeadowTableGroups':
				if (!this.fable.AppData.documentDefinition.MeadowEntityCategories)
				{
					this.log.error('Part requires MeadowEntityCategories to be defined.');
					return false;
				}

				this.log.info('...Compiling Grouped Meadow Schema to LaTeX...');
				tmpPart.LaTeX_Content = this.generateLaTexPartTitle(pPartDefinition.Title);

				let tmpTableGroups = [];
				let tmpMeadowEntryCategoryTables = Object.keys(this.fable.AppData.documentDefinition.MeadowEntityCategories);
				for (let i = 0; i < tmpMeadowEntryCategoryTables.length; i++)
				{
					// If it is a new group
					if ((tmpTableGroups.indexOf(this.fable.AppData.documentDefinition.MeadowEntityCategories[tmpMeadowEntryCategoryTables[i]].Group) == -1) &&
						// and if the table exists in the schema 
						this.fable.AppData.meadowSchema.Tables.hasOwnProperty(tmpMeadowEntryCategoryTables[i]))
					{
						tmpTableGroups.push(this.fable.AppData.documentDefinition.MeadowEntityCategories[tmpMeadowEntryCategoryTables[i]].Group);
					}
				}

				// Now enumerate the groups, create the parts and fill out the tables.
				for (let i = 0; i < tmpTableGroups.length; i++)
				{
					if (tmpPart.hasOwnProperty('PartLatexPrefix'))
					{
						tmpPart.LaTeX_Content += tmpPart.PartLatexPrefix;
					}

					tmpPart.LaTeX_Content += this.generateLaTexSectionTitle(tmpTableGroups[i]);

					for (let k = 0; k < tmpMeadowTables.length; k++)
					{
						let tmpTableName = tmpMeadowTables[k];
						if (this.fable.AppData.documentDefinition.MeadowEntityCategories.hasOwnProperty(tmpTableName) &&
							this.fable.AppData.documentDefinition.MeadowEntityCategories[tmpTableName].Group == tmpTableGroups[i])
						{
							this.log.info(`compiling LaTeX for [${tmpTableName}] in category [${tmpTableGroups[i]}]...`);
							if ((k > 0) && (tmpPart.hasOwnProperty('TableLatexConnector')))
							{
								tmpPart.LaTeX_Content += tmpPart.TableLatexConnector;
							}

							tmpPart.LaTeX_Content += this.generateLaTeXFromSchema(this.fable.AppData.meadowSchema.Tables[tmpTableName]);
						};
					}
				}

				//let tmpMarkdown = this.generateMarkdownFromSchema(this.fable.AppData.meadowSchema);
				this.log.info('...Grouped Meadow Schema compiled...');
				break;
			case 'MeadowTables':
				tmpPart.LaTeX_Content = this.generateLaTexPartTitle(pPartDefinition.Title);

				this.log.info('...Compiling Meadow Schema to LaTeX...');
				for (let i = 0; i < tmpMeadowTables.length; i++)
				{
					let tmpTableName = tmpMeadowTables[i];
					this.log.info(`compiling LaTeX for [${tmpTableName}]...`);
					tmpPart.LaTeX_Content += this.generateLaTeXFromSchema(this.fable.AppData.meadowSchema.Tables[tmpTableName]);
				}
				this.log.info('...Meadow Schema compiled...');
				this.log.info('...Compiling Meadow Schema to Markdown...');
				//let tmpMarkdown = this.generateMarkdownFromSchema(this.fable.AppData.meadowSchema);
				this.log.info('...Meadow Schema compiled...');
				break;
		}
	}

	compileDocumentation(fCallback)
	{
		this.log.info('...Compiling documentation...');

		this.log.info('...Generating Schema Indices...');
		this.generateIndicesFromSchema(this.fable.AppData.meadowSchema);

		this.fable.AppData.DocumentationOutput = (
			{
				Parts: [],
				DocumentDefinition: this.fable.AppData.documentDefinition,
				MeadowSchema: this.fable.AppData.meadowSchema
			});

		// ##. Compile each part of the documentation
		for (let i = 0; i < this.fable.AppData.documentDefinition.Parts.length; i++)
		{
			let tmpPartDefinition = this.fable.AppData.documentDefinition.Parts[i];
			this.compileDocumentationPart(tmpPartDefinition);
		}

		return fCallback();
	}
}

module.exports = DocumentationCompile;