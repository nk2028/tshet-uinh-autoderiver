'use strict';

async function handleSchemaClick(val) {
	const response = await fetch('examples/' + val + '.js');
	const text = await response.text();
	codeInputArea.setValue(text);
	loadSchema();
}

// Function that displays a pop-up alert
function notify(text) {
	Swal.fire({animation: false, text: text});
}

function makeErr(err, i) {
	return '小韻 ' + i + ': ' + err.message + '\n' + err.stack;
}

var codeInputArea;

document.addEventListener('DOMContentLoaded', () => {
	// Initialize codemirror
	codeInputArea = CodeMirror(schemaInput, {
		value: 'const is = s => equal音韻地位(小韻號, s);\n\n// Your script goes here\n',
		mode: 'javascript',
		lineNumbers: true
	});

	// Load the selected schema
	handleSchemaClick(document.forms.schemaSelect.schema.value);
});

/* Brogue2 function */

var brogue2_inner;

function loadSchema() {
	try {
		brogue2_inner = new Function('小韻號', '字頭', codeInputArea.getValue());
	} catch (err) {
		notify(makeErr(err));
	}
}

function brogue2(小韻號, 字頭) {
	var res;
	try {
		res = brogue2_inner(小韻號, 字頭);
	} catch (err) {
		notify(makeErr(err, i + 1));
		throw err;
	}
	if (res == null)
		throw new Error('No result for' + 小韻號);
	return res;
}

/* Predefined Options */

function handlePredefinedOptions() {
	if (predefinedOptions.value == 'exportAllSmallRhymes') {
		loadSchema();
		outputArea.innerText = [...Array(3874).keys()].map(i => get音韻描述(i + 1) + ' ' + brogue2(i + 1)).join('\n');
		outputArea.handleExport = null;
	} else if (predefinedOptions.value == 'exportAllSyllables') {
		loadSchema();
		outputArea.innerText = [...new Set([...Array(3874).keys()].map(i => brogue2(i + 1)))].join(', ');
		outputArea.handleExport = null;
	} else if (predefinedOptions.value == 'convertArticle') {
		loadSchema();
		handleArticle();
	}
}

/* Converter */

function makeLongStr(sr) {
	return get音韻描述(sr);
}

function makeTooltip(ch, pronunciation, sr, expl) {
	const div = document.createElement('div');
	div.classList.add('tooltip-item');
	div.innerText = ch + ' ' + pronunciation + ' ' + makeLongStr(sr) + ' ' + expl;
	return div;
}

function makeNoEntry(ch) {
	const outerContainer = document.createElement('div');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-no');
	outerContainer.innerText = ch;
	outerContainer.handleExport = () => ch;

	return outerContainer;
}

function makeSingleEntry(ch, res) {
	const [actual_ch, sr, expl] = res;
	var pronunciation = brogue2(sr);

	const outerContainer = document.createElement('div');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-single');

	const ruby = document.createElement('ruby');
	const rb = document.createElement('rb');
	rb.innerText = ch;
	ruby.appendChild(rb);

	const tooltipContainer = document.createElement('div');
	tooltipContainer.classList.add('tooltip-container');

	const rt = document.createElement('rt');
	rt.lang = 'zh-Latn';
	rt.innerText = pronunciation;
	ruby.appendChild(rt);

	const tooltip = makeTooltip(actual_ch, pronunciation, sr, expl);
	tooltipContainer.appendChild(tooltip);

	outerContainer.appendChild(ruby);
	outerContainer.appendChild(tooltipContainer);
	const exportText = ch + '(' + pronunciation + ')';
	outerContainer.handleExport = () => exportText;

	return outerContainer;
}

function makeMultipleEntry(ch, ress) {
	const outerContainer = document.createElement('div');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-multiple');
	outerContainer.classList.add('unresolved');

	const ruby = document.createElement('ruby');
	const rb = document.createElement('rb');
	rb.innerText = ch;
	ruby.appendChild(rb);

	const tooltipContainer = document.createElement('div');
	tooltipContainer.classList.add('tooltip-container');

	const rt = document.createElement('rt');
	rt.lang = 'zh-Latn';
	ruby.appendChild(rt);

	let rtSpanArray = [];
	let tooltipArray = [];

	for (let i = 0, len = ress.length; i < len; i++) {
		const res = ress[i];
		const [actual_ch, sr, expl] = res;
		var pronunciation = brogue2(sr);

		const rtSpan = document.createElement('span');
		rtSpan.innerText = pronunciation;
		rt.appendChild(rtSpan);
		rtSpanArray.push(rtSpan);

		const tooltip = makeTooltip(actual_ch, pronunciation, sr, expl);
		tooltip.addEventListener('click', () => {
			rtSpanArray.map(rtSpan => rtSpan.classList.add('hidden'));
			rtSpan.classList.remove('hidden');

			outerContainer.currentSelection = pronunciation;
			outerContainer.classList.remove('unresolved');

			tooltipArray.map(tooltip => tooltip.classList.remove('selected'));
			tooltip.classList.add('selected');
		});
		tooltipContainer.appendChild(tooltip);
		tooltipArray.push(tooltip);

		if (i == 0) {
			outerContainer.currentSelection = pronunciation;
			tooltip.classList.add('selected');
		} else {
			rtSpan.classList.add('hidden');
		}
	}

	outerContainer.appendChild(ruby);
	outerContainer.appendChild(tooltipContainer);
	outerContainer.handleExport = () => ch + '(' + outerContainer.currentSelection + ')';

	return outerContainer;
}

function makeConversion(c) {
	// 異體字轉換
	var qiteis = (qitei[c] || []).slice();
	qiteis.unshift(c);
	var res = qiteis.map(c => {
		return query切韻音系(c).map(o => [c, o['小韻號'], o['解釋']]);
	}).flat();

	if (!res.length)
		return makeNoEntry(c);
	else if (res.length == 1)
		return makeSingleEntry(c, res[0]);
	else
		return makeMultipleEntry(c, res);
}

function handleArticle() {
	outputArea.innerHTML = '';

	const convertText = articleInput.value;
	convertText.split('').map(n => {
		outputArea.appendChild(makeConversion(n));
		outputArea.appendChild((() => { const n = document.createTextNode(' '); n.handleExport = () => ''; return n; })());
	});
	outputArea.handleExport = () => [...outputArea.childNodes].map(node => node.handleExport()).join('');
}

function handleCopy() {
	const text = !outputArea.handleExport ? outputArea.innerText : outputArea.handleExport();

	navigator.clipboard.writeText(text).then(() => {
		notify('已成功匯出至剪貼簿。');
	}, () => {
		notify('匯出至剪貼簿失敗。');
	});
}
