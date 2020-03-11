'use strict';

/* Global utilities */

// Function that displays a pop-up dialog
function notify(text) {
	Swal.fire({animation: false, text: text, confirmButtonText: '確定'});
}

// Function that displays a pop-up dialog (HTML version)
function notifyHTML(msg) {
	Swal.fire({animation: false, html: msg, confirmButtonText: '確定'});
}

// NB: For the following 3 functions only!
function HTMLEscape(s) {
	const pre = document.createElement('pre');
	pre.innerText = s;
	return pre.innerHTML;
}

// Function that displays a pop-up alert
function notifyErrorWithoutStack(err) {
	let msg = '<p lang="en-HK">Error: ' + HTMLEscape(err.message) + '</p>';
	Swal.fire({animation: false, icon: 'error', html: msg, confirmButtonText: '確定'});
}

// Function that displays a pop-up alert
function notifyError(err) {
	let msg = '<p lang="en-HK">Error: ' + HTMLEscape(err.message) + '</p>';
	if (err.stack)
		msg += '<pre lang="en-HK" style="text-align: left;">' + HTMLEscape(err.stack) + '</pre>';
	Swal.fire({animation: false, icon: 'error', html: msg, confirmButtonText: '確定'});
}

// Function that displays a pop-up alert
function notifyErrorWithError(小韻號, err) {
	let msg = '<p>小韻號 <span lang="en-HK">' + 小韻號 + ', Error: ' + HTMLEscape(err.message) + '</span></p>';
	if (err.stack)
		msg += '<pre lang="en-HK" style="text-align: left;">' + HTMLEscape(err.stack) + '</pre>';
	Swal.fire({animation: false, icon: 'error', html: msg, confirmButtonText: '確定'});
}

// Equals to Array.prototype.flat(), but supports Edge
function myFlat(arrays) {
	return arrays.reduce(function(a, b) { return a.concat(b); }, []);
}

/* Copy to clipboard */

// From https://stackoverflow.com/a/30810322

function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;
	textArea.style.position = "fixed";  //avoid scrolling to bottom
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		if (successful)
			notify('已成功匯出至剪貼簿');
		else
			notifyErrorWithoutStack(new Error('匯出至剪貼簿失敗'));
	} catch (err) {
		notifyError(err);
	}

	document.body.removeChild(textArea);
}

function copyTextToClipboard(txt) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(txt);
		return;
	}
	navigator.clipboard.writeText(txt).then(() => {
		notify('已成功匯出至剪貼簿');
	}, err => {
		notifyError(err);
	});
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

// Load schema to code area
function handleLoadSchema(val) {
	fetch('examples/' + val + '.js')
	.then(response => response.text())
	.then(txt => schemaInputArea.setValue(txt))
	.catch(err => notifyError(err));
}

function handlePredefinedOptions() {
	loadSchema();
	if (predefinedOptions.value == 'convertArticle') {
		outputArea.classList.add('hidden');
		outputArea.innerHTML = '';
		makeConversions(articleInput.value);
		outputArea.classList.remove('hidden');
		outputArea.handleExport = () => [...outputArea.childNodes].map(node => node.handleExport()).join('');
		outputArea.handleRuby = () => [...outputArea.childNodes].map(node => node.handleRuby()).join('');
	} else if (predefinedOptions.value == 'exportAllSmallRhymes') {
		outputArea.classList.add('hidden');
		outputArea.innerHTML = '';
		[...Array(3874).keys()].map(i => {
			outputArea.appendChild(document.createTextNode(Qieyun.get音韻描述(i + 1) + ' '));

			const span = document.createElement('span');
			span.lang = 'en-x-ipa';
			span.appendChild(document.createTextNode(brogue2(i + 1)));
			outputArea.appendChild(span);

			outputArea.appendChild(document.createElement('br'));
		});
		outputArea.classList.remove('hidden');
		outputArea.handleExport = null;
		outputArea.handleRuby = null;
	} else if (predefinedOptions.value == 'exportAllSyllables') {
		outputArea.innerText = [...new Set([...Array(3874).keys()].map(i => brogue2(i + 1)))].join(', ');
		outputArea.handleExport = null;
		outputArea.handleRuby = null;
	}
}

function handleCopy() {
	const txt = !outputArea.handleExport
		? outputArea.innerText
		: outputArea.handleExport();  // A user-defined attribute

	if (!txt) {
		notifyErrorWithoutStack(new Error('請先進行操作，再匯出結果'));
	} else {
		copyTextToClipboard(txt);
	}
}

function handleRuby() {
	const txt = !outputArea.handleRuby
		? outputArea.innerText
		: outputArea.handleRuby();  // A user-defined attribute

	if (!txt) {
		notifyErrorWithoutStack(new Error('請先進行操作，再匯出結果'));
	} else {
		copyTextToClipboard(txt);
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
		const err = new Error('No result for 小韻 ' + 小韻號 + ': ' + Qieyun.get音韻描述(小韻號));
		notifyErrorWithoutStack(err);
		throw err;
	}
	return res;
}

/* Make conversion */

function makeConversions(txt) {
	[...txt].map(n => outputArea.appendChild(makeConversion(n)));
}

function makeConversion(ch) {
	const yitis = getYitizi(ch).slice();  // 得到 ch 的所有異體字
	yitis.unshift(ch);  // 包括 ch 本身

	let pronunciation_map = {};  // Merge by pronunciation

	yitis.map(ch => {
		Qieyun.query切韻音系(ch).map(o => {  // 對每個異體字，查出 小韻號 和 解釋
			o['字頭'] = ch;  // { 字頭, 小韻號, 解釋 }

			const pronunciation = brogue2(o['小韻號']);

			if (!pronunciation_map[pronunciation])
				pronunciation_map[pronunciation] = [];

			pronunciation_map[pronunciation].push(o);
		});
	});

	const len = Object.keys(pronunciation_map).length;

	if (!len)
		return makeNoneEntry(ch);
	else if (len == 1)
		return makeSingleEntry(ch, pronunciation_map);
	else
		return makeMultipleEntry(ch, pronunciation_map);
}

/* Make tooltip */

function makeTooltip(pronunciation, ress) {
	const span = document.createElement('span');
	span.classList.add('tooltip-item');

	const span_pronunciation = document.createElement('span');
	span_pronunciation.lang = 'en-x-ipa';
	span_pronunciation.innerText = pronunciation;
	span.appendChild(span_pronunciation);
	span.appendChild(document.createTextNode(' '));

	for (let [i, res] of ress.entries()) {
		if (i != 0)
			span.appendChild(document.createElement('br'));

		const ch = res['字頭'],
			sr = res['小韻號'],
			expl = res['解釋'];

		const span_ch = document.createElement('span');
		span_ch.classList.add('tooltip-ch');
		span_ch.innerText = ch;
		span.appendChild(span_ch);
		span.appendChild(document.createTextNode(' '));

		span.appendChild(document.createTextNode(Qieyun.get音韻描述(sr) + ' ' + expl));
	}

	return span;
}

/* Make entries */

function makeNoneEntry(ch) {
	const outerContainer = document.createElement('span');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-none');
	outerContainer.appendChild(document.createTextNode(ch));
	outerContainer.handleExport = () => ch;
	outerContainer.handleRuby = () => ch;
	return outerContainer;
}

function makeSingleEntry(ch, pronunciation_map) {
	const [pronunciation, ress] = Object.entries(pronunciation_map)[0];

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
	rt.lang = 'en-x-ipa';
	rt.innerText = pronunciation;
	ruby.appendChild(rt);

	const rp_right = document.createElement('rp');
	rp_right.appendChild(document.createTextNode(')'));
	ruby.appendChild(rp_right);

	const tooltip = makeTooltip(pronunciation, ress);
	tooltipContainer.appendChild(tooltip);

	outerContainer.appendChild(ruby);
	outerContainer.appendChild(tooltipContainer);
	const exportText = ch + '(' + pronunciation + ')';
	outerContainer.handleExport = () => exportText;
	const rubyText = '<ruby>' + ch + '<rp>(</rp><rt lang="zh-Latn">' + pronunciation + '</rt><rp>)</rp></ruby>';
	outerContainer.handleRuby = () => rubyText;

	return outerContainer;
}

function makeMultipleEntry(ch, pronunciation_map) {
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
	rt.lang = 'en-x-ipa';
	ruby.appendChild(rt);

	const rp_right = document.createElement('rp');
	rp_right.appendChild(document.createTextNode(')'));
	ruby.appendChild(rp_right);

	let rtSpanArray = [];
	let tooltipArray = [];

	for (let [i, [pronunciation, ress]] of Object.entries(pronunciation_map).entries()) {
		const rtSpan = document.createElement('span');
		rtSpan.innerText = pronunciation;
		rt.appendChild(rtSpan);
		rtSpanArray.push(rtSpan);

		const tooltip = makeTooltip(pronunciation, ress);
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
	outerContainer.handleRuby = () => '<ruby>' + ch + '<rp>(</rp><rt lang="zh-Latn">' + outerContainer.currentSelection + '</rt><rp>)</rp></ruby>';

	return outerContainer;
}

/* Privacy */

function showPrivacy() {
	notifyHTML(`<div style="text-align: initial;">
<h1>私隱權政策</h1>
<p>《切韻》音系自動推導器（下稱「本網頁」）是一項開源的網絡服務。作為本網頁的開發者，我們對閣下的私隱非常重視。本網頁的開發者不會透過本網頁收集閣下的任何信息。</p>
<p>下面將具體介紹本網頁能在何種程度上保障閣下的私隱權。</p>
<h2>閣下鍵入的內容</h2>
<p>本網頁的開發者不會收集閣下在本網頁中鍵入的任何內容。任何與閣下鍵入的內容相關的運算均在閣下的系統本地完成。本網頁不會將包括待注音的文本、注音結果在內的任何信息傳送至伺服器。</p>
<h2>閣下的其他信息</h2>
<p>本網頁使用的內容託管於以下站點：GitHub Pages、jsDelivr、Google Fonts、cdnjs。在閣下訪問本網頁時，閣下的瀏覽器將與這些站點交互。本網頁的開發者並不能讀取閣下訪問這些站點時的信息，亦無法控制這些站點如何使用閣下訪問時的信息。<p>
</div>`);
}
