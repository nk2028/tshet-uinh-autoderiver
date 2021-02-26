/* global CodeMirror */
/* global Qieyun, Yitizi, tingle */

import { notifyErrorWithoutStack, notifyError, notifyErrorWithError } from './swal-utils';
import copyToClipboard from './to-clipboard';
import LargeTooltip from 'large-tooltip';

// load schema

export function handleLoadSchema(schema) {
  fetch(`https://cdn.jsdelivr.net/gh/nk2028/qieyun-examples@51eba08/${schema}.js`)
  .then((response) => response.text())
  .then((txt) => schemaInputArea.setValue(txt))
  .catch((err) => notifyError(err));
}

// initialize Codemirror

document.addEventListener('DOMContentLoaded', () => {
  const schemaInput = document.getElementById('schemaInput');
  schemaInputArea = CodeMirror(schemaInput, {
    mode: 'javascript',
    lineNumbers: true,
  });
}, false);

// initialize large-tooltip

let largeTooltip;

document.addEventListener('DOMContentLoaded', () => {
  largeTooltip = LargeTooltip.init();
}, false);

// initialize the schema for autoderiver

let schemaInputArea;

document.addEventListener('DOMContentLoaded', () => {
  const schema = document.getElementById('schemaSelect').schema.value;
  handleLoadSchema(schema); // automatically load the selected schema on page loaded
});

// call deriver

let userInput;

function loadSchema() {
  try {
    userInput = new Function('音韻地位', '字頭', schemaInputArea.getValue());
  } catch (err) {
    notifyError(err);
    throw err;
  }
}

function callDeriver(音韻地位, 字頭) {
  try {
    const res = userInput(音韻地位, 字頭);
    if (res == null) {
      throw new Error('Result is null');
    }
    return res;
  } catch (err) {
    notifyErrorWithError(`音韻地位：${音韻地位.描述}`, err);
    throw err;
  }
}

// 處理「從輸入框中讀取文章，並注音」的輔助函式

function makeTooltip(pronunciation, ress) {
  const tooltipItem = document.createElement('p');
  tooltipItem.classList.add('tooltip-item');

  const spanPronunciation = document.createElement('span');
  spanPronunciation.lang = 'och-Latn-fonipa';
  spanPronunciation.innerText = pronunciation;
  tooltipItem.appendChild(spanPronunciation);
  tooltipItem.appendChild(document.createTextNode(' '));

  for (const [i, { 字頭, 解釋, 音韻地位 }] of ress.entries()) {
    if (i !== 0) tooltipItem.appendChild(document.createTextNode('\n'));

    let 反切 = 音韻地位.反切(字頭);
    反切 = 反切 == null ? '' : `${反切}切 `;

    const spanCh = document.createElement('span');
    spanCh.classList.add('tooltip-ch');
    spanCh.innerText = 字頭;
    tooltipItem.appendChild(spanCh);
    tooltipItem.appendChild(document.createTextNode(' '));

    tooltipItem.appendChild(document.createTextNode(`${音韻地位.描述} ${反切}${解釋}`));
  }

  return tooltipItem;
}

function makeNoneEntry(ch) {
  return document.createTextNode(ch);
}

function makeSingleEntry(ch, pronunciationMap) {
  const [pronunciation, ress] = [...pronunciationMap][0];

  const outerContainer = document.createElement('span');
  outerContainer.classList.add('ruby-wrapper');

  const ruby = document.createElement('ruby');
  ruby.appendChild(document.createTextNode(ch));

  const tooltipItemsWrapper = document.createElement('div');
  tooltipItemsWrapper.classList.add('tooltip-items-wrapper');

  const rpLeft = document.createElement('rp');
  rpLeft.appendChild(document.createTextNode('('));
  ruby.appendChild(rpLeft);

  const rt = document.createElement('rt');
  rt.lang = 'och-Latn-fonipa';
  rt.innerText = pronunciation;
  ruby.appendChild(rt);

  const rpRight = document.createElement('rp');
  rpRight.appendChild(document.createTextNode(')'));
  ruby.appendChild(rpRight);

  const tooltip = makeTooltip(pronunciation, ress);
  tooltipItemsWrapper.appendChild(tooltip);

  outerContainer.appendChild(ruby);

  largeTooltip.addTooltip(tooltipItemsWrapper, outerContainer);

  return outerContainer;
}

function makeMultipleEntry(ch, pronunciationMap) {
  const outerContainer = document.createElement('span');
  outerContainer.classList.add('ruby-wrapper');

  const ruby = document.createElement('ruby');
  ruby.classList.add('entry-multiple');
  ruby.classList.add('entry-unresolved');
  ruby.appendChild(document.createTextNode(ch));

  const tooltipItemsWrapper = document.createElement('div');
  tooltipItemsWrapper.classList.add('tooltip-items-wrapper');

  const rpLeft = document.createElement('rp');
  rpLeft.appendChild(document.createTextNode('('));
  ruby.appendChild(rpLeft);

  const rt = document.createElement('rt');
  rt.lang = 'och-Latn-fonipa';
  ruby.appendChild(rt);

  const rpRight = document.createElement('rp');
  rpRight.appendChild(document.createTextNode(')'));
  ruby.appendChild(rpRight);

  const tooltipArray = [];

  for (const [i, [pronunciation, ress]] of [...pronunciationMap].entries()) {
    const tooltip = makeTooltip(pronunciation, ress);
    tooltip.addEventListener('click', () => {
      rt.innerText = pronunciation;

      ruby.classList.remove('entry-unresolved');

      tooltipArray.map((tooltipItem) => tooltipItem.classList.remove('selected'));
      tooltip.classList.add('selected');
    });
    tooltipItemsWrapper.appendChild(tooltip);
    tooltipArray.push(tooltip);

    if (i === 0) { // Select the first item by default
      rt.innerText = pronunciation;
      tooltip.classList.add('selected');
    }
  }

  outerContainer.appendChild(ruby);

  largeTooltip.addTooltip(tooltipItemsWrapper, outerContainer);

  return outerContainer;
}

function makeConversion(ch, shouldConvYitizi) {
  let 所有異體字;
  if (!shouldConvYitizi) {
    所有異體字 = [ch];
  } else {
    所有異體字 = Yitizi.get(ch);
    所有異體字.unshift(ch); // include ch itself
  }

  const pronunciationMap = new Map(); // { 擬音: [{ 字頭, 小韻號, 解釋, 音韻地位 }] }

  for (const 字頭 of 所有異體字) {
    for (const { 音韻地位, 解釋 } of Qieyun.query字頭(字頭)) {
      const 擬音 = callDeriver(音韻地位, 字頭);
      if (pronunciationMap.get(擬音) == null) pronunciationMap.set(擬音, []);
      pronunciationMap.get(擬音).push({ 字頭, 解釋, 音韻地位 });
    }
  }

  switch (pronunciationMap.size) {
    case 0: return makeNoneEntry(ch);
    case 1: return makeSingleEntry(ch, pronunciationMap);
    default: return makeMultipleEntry(ch, pronunciationMap);
  }
}

// 處理用户選擇的函式

function handleConvertArticle(shouldConvYitizi) {
  const outputArea = document.getElementById('outputArea');
  const articleInput = document.getElementById('articleInput');

  outputArea.innerHTML = ''; // 清除舊資料

  const fragment = document.createDocumentFragment();
  for (const ch of articleInput.value) {
    fragment.appendChild(makeConversion(ch, shouldConvYitizi));
  }
  outputArea.appendChild(fragment);
}

function handleConvertPresetArticle() {
  function inner(txt) {
    const outputArea = document.getElementById('outputArea');
    outputArea.innerHTML = '';

    // Load
    const { body } = (new DOMParser()).parseFromString(txt, 'text/html');

    // Convert
    body.querySelectorAll('ruby').forEach((ruby) => {
      const rt = ruby.querySelector('rt');
      const 漢字 = ruby.childNodes[0].textContent;
      const 描述 = rt.innerText;
      const 音韻地位 = Qieyun.音韻地位.from描述(描述);
      const 擬音 = callDeriver(音韻地位, 漢字);
      rt.lang = 'och-Latn-fonipa';
      rt.innerText = 擬音;
    });

    // Change h1 to h3
    body.querySelectorAll('h1').forEach((el) => {
      const dummy = document.createElement('h3');
      dummy.innerHTML = el.innerHTML;
      el.parentNode.replaceChild(dummy, el);
    });

    // insert rp
    body.querySelectorAll('rt').forEach((rt) => {
      const { parentNode } = rt;
      const rpLeft = document.createElement('rp');
      rpLeft.innerText = '(';
      parentNode.insertBefore(rpLeft, rt);
      const rpRight = document.createElement('rp');
      rpRight.innerText = ')';
      parentNode.appendChild(rpRight);
    });

    [...body.childNodes].slice(1).forEach((node) => {
      body.insertBefore(document.createTextNode('\n'), node);
    });

    // Push
    const fragment = document.createDocumentFragment();
    body.childNodes.forEach((node) => {
      fragment.appendChild(node);
    });
    outputArea.appendChild(fragment);
  }

  fetch('https://cdn.jsdelivr.net/gh/nk2028/qieyun-text-label@1150f08/index.html')
  .then((response) => response.text())
  .then((txt) => inner(txt))
  .catch((err) => notifyError(err));
}

function handleExportAllSmallRhymes() {
  const outputArea = document.getElementById('outputArea');
  outputArea.innerHTML = ''; // clear previous contents

  const fragment = document.createDocumentFragment();
  for (const 音韻地位 of Qieyun.iter音韻地位()) {
    const { 描述, 代表字 } = 音韻地位;

    // 音韻描述
    fragment.appendChild(document.createTextNode(`${描述} `));

    // 推導結果
    const span = document.createElement('span');
    span.lang = 'och-Latn-fonipa';
    span.appendChild(document.createTextNode(callDeriver(音韻地位, null)));
    fragment.appendChild(span);

    // 代表字 + 換行
    fragment.appendChild(document.createTextNode(` ${代表字}\n`));
  }
  outputArea.appendChild(fragment);
}

function handleExportAllSyllables() {
  const outputArea = document.getElementById('outputArea');
  outputArea.innerHTML = ''; // clear previous contents
  const span = document.createElement('span');
  span.lang = 'och-Latn-fonipa';

  const s = new Set();
  for (const 音韻地位 of Qieyun.iter音韻地位()) {
    const res = callDeriver(音韻地位, null);
    s.add(res);
  }

  span.innerText = [...s].join(', ');
  outputArea.appendChild(span);
}

function handleExportAllSyllablesWithCount() {
  const outputArea = document.getElementById('outputArea');
  outputArea.innerHTML = ''; // clear previous contents
  const span = document.createElement('span');
  span.lang = 'och-Latn-fonipa';

  const counter = new Map();
  for (const 音韻地位 of Qieyun.iter音韻地位()) {
    const k = callDeriver(音韻地位, null);
    const v = counter.get(k);
    counter.set(k, v == null ? 1 : v + 1);
  }

  const arr = [...counter];
  arr.sort((a, b) => b[1] - a[1]);

  span.innerText = arr.map(([k, v]) => `${k} (${v})`).join(', ');
  outputArea.appendChild(span);
}

export function handlePredefinedOptions() {
  loadSchema();
  const shouldConvertVariantChar = document.getElementById('convertVariantCharSwitch').checked;
  switch (document.getElementById('predefinedOptions').value) {
    case 'convertArticle': handleConvertArticle(shouldConvertVariantChar); break;
    case 'convertPresetArticle': handleConvertPresetArticle(); break;
    case 'exportAllSmallRhymes': handleExportAllSmallRhymes(); break;
    case 'exportAllSyllables': handleExportAllSyllables(); break;
    case 'exportAllSyllablesWithCount': handleExportAllSyllablesWithCount(); break;
    default: break;
  }
  document.getElementById('outputArea').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 處理匯出的函式

export function handleCopy() {
  const outputArea = document.getElementById('outputArea');
  const txt = outputArea.textContent;

  if (!txt) {
    notifyErrorWithoutStack(new Error('請先進行操作，再匯出結果'));
  } else {
    copyToClipboard(txt);
  }
}

// 處理「關於」

let modalAbout;

document.addEventListener('DOMContentLoaded', () => {
  modalAbout = new tingle.modal({ closeLabel: '' });
  modalAbout.setContent(document.getElementById('templateAbout').innerHTML);
}, false);

export function showAbout() {
  modalAbout.open();
}

// cookie

export function setOrRemoveCookie(key, value) {
  if (value === true) {
    document.cookie = `${key}=true; expires=Tue, 19 Jan 2038 03:14:07 GMT; secure; samesite=strict`;
  } else {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; samesite=strict`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cookieFound = document.cookie.split('; ').find((row) => row.startsWith('variantCharSwitch'));
  if (cookieFound != null) {
    document.getElementById('convertVariantCharSwitch').checked = true;
  }
}, false);
