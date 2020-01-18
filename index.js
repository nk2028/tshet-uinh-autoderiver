'use strict';

/* Global utilities */

function notify(text) {  // Function that displays a pop-up dialog
	Swal.fire({animation: false, text: text, confirmButtonText: '確定'});
}

function HTMLEscape(s) {  // NB: For the following 3 functions only!
	const pre = document.createElement('pre');
	pre.innerText = s;
	return pre.innerHTML;
}

function notifyErrorWithoutStack(err) {  // Function that displays a pop-up alert
	let msg = '<p lang="en-HK">Error: ' + HTMLEscape(err.message) + '</p>';
	Swal.fire({animation: false, icon: 'error', html: msg, confirmButtonText: '確定'});
}

function notifyError(err) {  // Function that displays a pop-up alert
	let msg = '<p lang="en-HK">Error: ' + HTMLEscape(err.message) + '</p>';
	if (err.stack)
		msg += '<pre lang="en-US" style="text-align: left;">' + HTMLEscape(err.stack) + '</pre>';
	Swal.fire({animation: false, icon: 'error', html: msg, confirmButtonText: '確定'});
}

function notifyErrorWithError(小韻號, err) {  // Function that displays a pop-up alert
	let msg = '<p>小韻號 <span lang="en-HK">' + 小韻號 + ', Error: ' + HTMLEscape(err.message) + '</span></p>';
	if (err.stack)
		msg += '<pre lang="en-US" style="text-align: left;">' + HTMLEscape(err.stack) + '</pre>';
	Swal.fire({animation: false, icon: 'error', html: msg, confirmButtonText: '確定'});
}

function myFlat(arrays) {  // Equals to Array.prototype.flat(), but supports Edge
	return arrays.reduce(function(a, b) { return a.concat(b); }, []);
}

/* Page initializer */

let schemaInputArea;

document.addEventListener('DOMContentLoaded', () => {
	/* Initialize codemirror */
	schemaInputArea = CodeMirror(schemaInput, {
		mode: 'javascript',
		lineNumbers: true
	});

	/* Load the selected schema */
	handleLoadSchema(document.forms.schemaSelect.schema.value);
});

/* Page event handler */

function handleLoadSchema(val) {
	fetch('examples/' + val + '.js')
	.then(response => response.text())
	.then(text => schemaInputArea.setValue(text))
	.catch(err => notifyError(err));
}

function handlePredefinedOptions() {
	loadSchema();
	if (predefinedOptions.value == 'exportAllSmallRhymes') {
		outputArea.classList.add('hidden');
		[...Array(3874).keys()].map(i => {
			outputArea.appendChild(document.createTextNode(get音韻描述(i + 1) + ' '));

			const span = document.createElement('span');
			span.lang = 'zh-Latn-x-output';
			span.appendChild(document.createTextNode(brogue2(i + 1)));
			outputArea.appendChild(span);

			outputArea.appendChild(document.createElement('br'));
		});
		outputArea.classList.remove('hidden');
		outputArea.handleExport = null;
	} else if (predefinedOptions.value == 'exportAllSyllables') {
		outputArea.innerText = [...new Set([...Array(3874).keys()].map(i => brogue2(i + 1)))].join(', ');
		outputArea.handleExport = null;
	} else if (predefinedOptions.value == 'convertArticle') {
		outputArea.classList.add('hidden');
		outputArea.innerHTML = '';
		[...articleInput.value].map(n => outputArea.appendChild(makeConversion(n)));
		outputArea.classList.remove('hidden');
		outputArea.handleExport = () => [...outputArea.childNodes].map(node => node.handleExport()).join('');
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
		userInput = new Function('小韻號', '字頭', schemaInputArea.getValue());
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
	if (res == null) {
		const err = new Error('No result for 小韻 ' + 小韻號 + ': ' + get音韻描述(小韻號));
		notifyErrorWithoutStack(err);
		throw err;
	}
	return res;
}

/* Make conversion */

function makeConversion(ch) {
	const yitis = getYitizi(ch).slice();  // 得到 ch 的所有異體字
	yitis.unshift(ch);  // 包括 ch 本身
	const res = myFlat(yitis.map(ch => {
		return query切韻音系(ch).map(o => {  // 對每個異體字，查出 小韻號 和 解釋
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

/* Make tooltip */

function makeTooltip(ch, pronunciation, sr, expl) {
	const span = document.createElement('span');
	span.classList.add('tooltip-item');
	span.appendChild(document.createTextNode(ch + ' '));

	const span_inner = document.createElement('span');
	span_inner.lang = 'zh-Latn-x-output';
	span_inner.innerText = pronunciation;
	span.appendChild(span_inner);
	span.appendChild(document.createTextNode(' ' + get音韻描述(sr) + ' ' + expl));

	return span;
}

/* Make entries */

function makeNoneEntry(ch) {
	/* Format for .entry-none example:
	<span class="entry entry-none">。</span>
	*/
	const outerContainer = document.createElement('span');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-none');
	outerContainer.appendChild(document.createTextNode(ch));
	outerContainer.handleExport = () => ch;
	return outerContainer;
}

function makeSingleEntry(ch, res) {
	/* Format for .entry-single example:
	<span class="entry entry-single">
		<ruby>
			年
			<rp>(</rp>
			<rt lang="zh-Latn-x-output">den˨˩</rt>
			<rp>)</rp>
		</ruby>
		<span class="tooltip-container">
			<span class="tooltip-item">年 <span lang="zh-Latn-x-output">nen</span> 泥開四先平 上同</span>
		</span>
	</span>
	*/
	const pronunciation = brogue2(res['小韻號']);

	const outerContainer = document.createElement('span');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-single');

	const ruby = document.createElement('ruby');
	ruby.appendChild(document.createTextNode(ch));

	const tooltipContainer = document.createElement('span');
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
	<span class="entry entry-multiple unresolved">
		<ruby>
			盡
			<rp>(</rp>
			<rt lang="zh-Latn-x-output">
				<span>sin˨˩</span>
				<span class="hidden">sin˧˥</span>
			</rt>
			<rp>)</rp>
		</ruby>
		<span class="tooltip-container">
			<span class="tooltip-item selected">盡 <span lang="zh-Latn-x-output">sin˨˩</span> 從開三眞上 竭也終也慈忍切又即忍切二</span>
			<span class="tooltip-item">盡 <span lang="zh-Latn-x-output">sin˧˥</span> 精開三眞上 曲禮曰虛坐盡前[-/虚坐盡後虚坐盡前]又慈忍切</span>
		</span>
	</span>
	*/
	const outerContainer = document.createElement('span');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-multiple');
	outerContainer.classList.add('unresolved');

	const ruby = document.createElement('ruby');
	ruby.appendChild(document.createTextNode(ch));

	const tooltipContainer = document.createElement('span');
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

		if (i == 0) {  // Select the first item by default
			outerContainer.currentSelection = pronunciation;
			tooltip.classList.add('selected');
		} else {  // Hide other items
			rtSpan.classList.add('hidden');
		}
	}

	outerContainer.appendChild(ruby);
	outerContainer.appendChild(tooltipContainer);
	outerContainer.handleExport = () => ch + '(' + outerContainer.currentSelection + ')';

	return outerContainer;
}
