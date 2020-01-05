'use strict';

/* Global utilities */

function notify(text) {  // Function that displays a pop-up dialog
	Swal.fire({animation: false, text: text, confirmButtonText: '確定'});
}

function notifyErrorWithoutStack(err) {  // Function that displays a pop-up alert
	let msg = '<p lang="en-HK">Error: ' + err.message + '</p>';
	Swal.fire({animation: false, icon: 'error', html: msg, confirmButtonText: '確定'});
}

function notifyError(err) {  // Function that displays a pop-up alert
	let msg = '<p lang="en-HK">Error: ' + err.message + '</p>';
	if (err.stack)
		msg += '<pre lang="en-US" style="text-align: left;">' + err.stack + '</pre>';
	Swal.fire({animation: false, icon: 'error', html: msg, confirmButtonText: '確定'});
}

function notifyErrorWithError(小韻號, err) {  // Function that displays a pop-up alert
	let msg = '<p>小韻號 <span lang="en-HK">' + 小韻號 + ', Error: ' + err.message + '</span></p>';
	msg += '<pre lang="en-US" style="text-align: left;">' + err.stack + '</pre>';
	Swal.fire({animation: false, icon: 'error', html: msg, confirmButtonText: '確定'});
}

function myFlat(arrays) {  // Equals to Array.prototype.flat(), but supports Edge
	return arrays.reduce(function(a, b) { return a.concat(b); }, []);
}

/* Page initializer */

let codeInputArea;

document.addEventListener('DOMContentLoaded', () => {
	/* Initialize codemirror */
	codeInputArea = CodeMirror(schemaInput, {
		value: 'const is = s => equal音韻地位(小韻號, s);\n\n// Your script goes here\n',
		mode: 'javascript',
		lineNumbers: true
	});

	/* Load the selected schema */
	handleLoadSchema(document.forms.schemaSelect.schema.value);
});

/* Page event handler */

function handleLoadSchema(val) {
	fetch('examples/' + val + '.js')
	.then(response => {
		return response.text();
	})
	.then(text => {
		codeInputArea.setValue(text);
	})
	.catch(err => {
		notifyError(err);
	});
}

function handlePredefinedOptions() {
	loadSchema();
	if (predefinedOptions.value == 'exportAllSmallRhymes') {
		outputArea.innerText = [...Array(3874).keys()].map(i => get音韻描述(i + 1) + ' ' + brogue2(i + 1)).join('\n');
		outputArea.handleExport = null;
	} else if (predefinedOptions.value == 'exportAllSyllables') {
		outputArea.innerText = [...new Set([...Array(3874).keys()].map(i => brogue2(i + 1)))].join(', ');
		outputArea.handleExport = null;
	} else if (predefinedOptions.value == 'convertArticle') {
		handleArticle();
	}
}

function handleCopy() {
	const text = !outputArea.handleExport
		? outputArea.innerText
		: outputArea.handleExport();  // A user-defined attribute

	if (!text) {
		notifyErrorWithoutStack(new Error('請先進行操作，再匯出結果'));
	} else {
		navigator.clipboard.writeText(text).then(() => {
			notify('已成功匯出至剪貼簿');
		}, err => {
			notifyError(err);
		});
	}
}

/* Brogue2 function */

let userInput;

function loadSchema() {
	try {
		userInput = new Function('小韻號', '字頭', codeInputArea.getValue());
	} catch (err) {
		notifyError(err);
		throw err;
	}
}

function brogue2(小韻號, 字頭) {
	let res;
	try {
		res = userInput(小韻號, 字頭);
	} catch (err) {
		notifyErrorWithError(小韻號, err);
		throw err;
	}
	if (res == null)
		throw new Error('No result for' + 小韻號);
	return res;
}

/* Make conversion */

function handleArticle() {
	outputArea.innerHTML = '';

	const convertText = articleInput.value;
	[...convertText].map(n => {
		outputArea.appendChild(makeConversion(n));
	});
	outputArea.handleExport = () => [...outputArea.childNodes].map(node => node.handleExport()).join('');
}

function makeConversion(ch) {
	const qiteis = (qitei[ch] || []).slice();  // 得到 ch 的所有異體字
	qiteis.unshift(ch);  // Include ch itself
	const res = myFlat(qiteis.map(ch => {
		return query切韻音系(ch).map(o => {  // 查出 小韻號 和 解釋
			o['字頭'] = ch;
			return o;  // { 字頭, 小韻號, 解釋 }
		});
	}));

	if (!res.length)
		return makeNoneEntry(ch);
	else if (res.length == 1)
		return makeSingleEntry(ch, res[0]);
	else
		return makeMultipleEntry(ch, res);
}

function makeLongStr(sr) {
	return get音韻描述(sr);
}

function makeTooltip(ch, pronunciation, sr, expl) {
	const div = document.createElement('div');
	div.classList.add('tooltip-item');
	div.innerHTML = ch + ' <span lang="zh-Latn-x-output">' + pronunciation + '</span> ' + makeLongStr(sr) + ' ' + expl;
	return div;
}

/* Make entries */

function makeNoneEntry(ch) {
	/* Format for .entry-none example:
	<div class="entry entry-none">。</div>
	*/
	const outerContainer = document.createElement('div');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-none');
	outerContainer.appendChild(document.createTextNode(ch));
	outerContainer.handleExport = () => ch;
	return outerContainer;
}

function makeSingleEntry(ch, res) {
	/* Format for .entry-single example:
	<div class="entry entry-single">
		<ruby>
			年
			<rp>(</rp>
			<rt lang="zh-Latn-x-output">den˨˩</rt>
			<rp>)</rp>
		</ruby>
		<div class="tooltip-container">
			<div class="tooltip-item">年 <span lang="zh-Latn-x-output">nen</span> 泥開四先平 上同</div>
		</div>
	</div>
	*/
	const pronunciation = brogue2(res['小韻號']);

	const outerContainer = document.createElement('div');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-single');

	const ruby = document.createElement('ruby');
	ruby.appendChild(document.createTextNode(ch));

	const tooltipContainer = document.createElement('div');
	tooltipContainer.classList.add('tooltip-container');

	const rp_left = document.createElement('rp');
	rp_left.appendChild(document.createTextNode('('));
	ruby.appendChild(rp_left);

	const rt = document.createElement('rt');
	rt.lang = 'zh-Latn-x-output';
	rt.innerText = pronunciation;
	ruby.appendChild(rt);

	const rp_right = document.createElement('rp');
	rp_right.appendChild(document.createTextNode(')'));
	ruby.appendChild(rp_right);

	const tooltip = makeTooltip(res['字頭'], pronunciation, res['小韻號'], res['解釋']);
	tooltipContainer.appendChild(tooltip);

	outerContainer.appendChild(ruby);
	outerContainer.appendChild(tooltipContainer);
	const exportText = ch + '(' + pronunciation + ')';
	outerContainer.handleExport = () => exportText;

	return outerContainer;
}

function makeMultipleEntry(ch, ress) {
	/* Format for .entry-multiple example:
	<div class="entry entry-multiple unresolved">
		<ruby>
			盡
			<rp>(</rp>
			<rt lang="zh-Latn-x-output">
				<span>sin˨˩</span>
				<span class="hidden">sin˧˥</span>
			</rt>
			<rp>)</rp>
		</ruby>
		<div class="tooltip-container">
			<div class="tooltip-item selected">盡 <span lang="zh-Latn-x-output">sin˨˩</span> 從開三眞上 竭也終也慈忍切又即忍切二</div>
			<div class="tooltip-item">盡 <span lang="zh-Latn-x-output">sin˧˥</span> 精開三眞上 曲禮曰虛坐盡前[-/虚坐盡後虚坐盡前]又慈忍切</div>
		</div>
	</div>
	*/
	const outerContainer = document.createElement('div');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-multiple');
	outerContainer.classList.add('unresolved');

	const ruby = document.createElement('ruby');
	ruby.appendChild(document.createTextNode(ch));

	const tooltipContainer = document.createElement('div');
	tooltipContainer.classList.add('tooltip-container');

	const rp_left = document.createElement('rp');
	rp_left.appendChild(document.createTextNode('('));
	ruby.appendChild(rp_left);

	const rt = document.createElement('rt');
	rt.lang = 'zh-Latn-x-output';
	ruby.appendChild(rt);

	const rp_right = document.createElement('rp');
	rp_right.appendChild(document.createTextNode(')'));
	ruby.appendChild(rp_right);

	let rtSpanArray = [];
	let tooltipArray = [];

	for (let i = 0, len = ress.length; i < len; i++) {
		const res = ress[i];
		const pronunciation = brogue2(res['小韻號']);

		const rtSpan = document.createElement('span');
		rtSpan.innerText = pronunciation;
		rt.appendChild(rtSpan);
		rtSpanArray.push(rtSpan);

		const tooltip = makeTooltip(res['字頭'], pronunciation, res['小韻號'], res['解釋']);
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
