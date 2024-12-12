import { useCallback, useEffect, useRef } from "react";

import "purecss/build/pure.css";
// NOTE sweetalert2's ESM export does not setup styles properly, manually importing
import "sweetalert2/dist/sweetalert2.css";

import { injectGlobal, css as stylesheet } from "@emotion/css";
import styled from "@emotion/styled";
import { faCirclePlay, faExternalLink, faInfo, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Main from "./Main";
import Swal from "../Classes/SwalReact";
import { codeFontFamily, noop } from "../consts";
import { useTranslation } from "react-i18next";

import i18n from "../i18n";

injectGlobal`
  html,
  body {
    line-height: 1.6;
    font-size: 16px;
    font-family: "Source Han Serif C", "Source Han Serif K", "Noto Serif CJK KR", "Source Han Serif SC",
      "Noto Serif CJK SC", "Source Han Serif", "Noto Serif CJK JP", "Source Han Serif TC", "Noto Serif CJK TC",
      "Noto Serif KR", "Noto Serif SC", "Noto Serif TC", "Jomolhari", "HanaMin", "CharisSILW", serif;
    font-language-override: "KOR";
    overflow: hidden;
    touch-action: none;
  }
  body.dragging {
    user-select: none;
  }
  :lang(och-Latn-fonipa) {
    font-family: "CharisSILW", serif;
  }
  br:first-child {
    display: none;
  }
  dialog {
    position: fixed;
    inset: 0;
    margin: 0;
    padding: 0;
    background: none;
    border: none;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    opacity: 0;
    transition:
      opacity 200ms ease-out,
      transform 200ms ease-out,
      overlay 200ms ease-out allow-discrete,
      display 200ms ease-out allow-discrete;
    @starting-style {
      opacity: 0;
    }
    &[open] {
      display: grid;
      grid-template: 1fr / 1fr;
      opacity: 1;
    }
    &::backdrop {
      opacity: 0;
      transition:
        opacity 200ms ease-out,
        overlay 200ms ease-out allow-discrete,
        display 200ms ease-out allow-discrete;
      @starting-style {
        opacity: 0;
      }
    }
    &[open]::backdrop {
      opacity: 1;
    }
  }
  button {
    box-sizing: inherit;
    appearance: none;
    outline: none;
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    line-height: inherit;
  }
  button::-moz-focus-inner {
    border: none;
    padding: 0;
  }
  hr {
    border: none;
    border-top: 1px solid #d4d6d8;
  }
  body .pure-button {
    padding-top: 0.2em;
    padding-bottom: 0.2em;
    margin-right: 0.3em;
    vertical-align: baseline;
    &.pure-button-danger {
      background-color: #dc3741;
      color: white;
    }
  }
  .pure-form p {
    line-height: 2.5;
  }
  body .pure-form {
    select {
      padding: 0 0.8rem 0 0.4rem;
      height: 2rem;
      vertical-align: baseline;
      margin-right: 0.125rem;
    }
    input[type="radio"],
    input[type="checkbox"] {
      margin-right: 0.3rem;
      vertical-align: -0.0625rem;
    }
    input[type="text"],
    input[type="number"] {
      width: 6.25rem;
      height: 2rem;
      vertical-align: baseline;
      margin-right: 0.125rem;
      padding: 0 0.6rem;
    }
    input[type="button"] {
      margin-right: 1.125rem;
    }
    label {
      display: inline;
      margin-right: 1.125rem;
      white-space: nowrap;
    }
  }
  .swal2-close {
    font-family: unset;
  }
  @media (max-width: 640px) {
    .swal2-container {
      padding: 2rem 0 0;
      .swal2-popup {
        width: 100%;
        border-radius: 0.5rem 0.5rem 0 0;
      }
    }
  }
`;

const aboutModal = stylesheet`
  &.swal2-container.swal2-backdrop-show {
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(18px);
  }
  .swal2-popup {
    width: min(36vw + 360px, 960px, 100%);
    padding: 0;
  }
  .swal2-html-container {
    text-align: left;
    margin: 0;
    padding: 1.5rem 3rem 2rem;
    line-height: 1.6;
    h2,
    b {
      color: black;
    }
    p, li {
      color: #5c5c5c;
      font-size: 1rem;
    }
    a:link {
      position: relative;
      color: #315177;
      text-decoration: none;
      transition: color 150ms;
      &:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 1px;
        border-bottom: 1px dashed currentColor;
      }
      &:hover,
      &:focus {
        color: black;
      }
    }
    a:visited {
      color: #5c4c86;
      &:hover,
      &:focus {
        color: black;
      }
    }
    kbd, code {
      font-family: ${codeFontFamily};
    }
    kbd:not(kbd kbd) {
      display: inline-flex;
      gap: 2.5px;
      font-size: 0.8125em;
      padding: 0 0.375em;
      background-color: #f4f6f8;
      border: 1px solid #d8e2e4;
      border-bottom-width: 2px;
      border-radius: 0.5em;
      color: #333;
      vertical-align: middle;
    }
    code:not(code code) {
      font-size: 0.875em;
      padding: 0.1875em 0.25em;
      background-color: #f4f4f4;
      border-radius: 0.375em;
      color: #f0506e;
      vertical-align: middle;
    }
  }
  .swal2-close {
    font-size: 3.5rem;
    padding: 0.5rem 0.5rem 0 0;
    &:focus {
      box-shadow: none;
    }
  }
  @media (max-width: 640px) {
    grid-template: unset;
    .swal2-popup {
      overflow-y: auto;
      width: 100%;
      height: 100%;
    }
    .swal2-html-container {
      padding: 0.25rem 2rem 0.75rem;
    }
    .swal2-close {
      font-size: 3rem;
    }
  }
`;

function showInfoBox(content: JSX.Element) {
  return Swal.fire({
    showClass: { popup: "" },
    hideClass: { popup: "" },
    customClass: { container: aboutModal },
    showCloseButton: true,
    showConfirmButton: false,
    html: content,
  });
}

function showAbout() {
  return showInfoBox(
    <>
      <h2>關於</h2>
      <p>
        切韻音系自動推導器（下稱「本頁面」）由{" "}
        <a target="_blank" rel="noreferrer" href="https://nk2028.shn.hk/">
          nk2028
        </a>{" "}
        開發。我們開發有關語言學的項目，尤其是有關歷史漢語語音學，異體字和日語語言學的項目。
      </p>
      <p>
        歡迎加入 QQ 音韻學答疑羣（羣號 526333751）和{" "}
        <a target="_blank" rel="noreferrer" href="https://t.me/nk2028_discuss">
          Telegram nk2028 社羣（@nk2028_discuss）
        </a>
        。
      </p>
      <p>
        <a target="_blank" rel="noreferrer" href="https://github.com/nk2028/tshet-uinh-autoderiver">
          本頁面原始碼
        </a>
        公開於 GitHub。
      </p>
      <p>
        推導器預置的
        <a target="_blank" rel="noreferrer" href="https://github.com/nk2028/tshet-uinh-examples">
          樣例推導方案程式碼
        </a>
        及
        <a target="_blank" rel="noreferrer" href="https://github.com/nk2028/obsolete-romanizations-examples">
          過時推導方案
        </a>
        亦可於 GitHub 瀏覽。
      </p>
      <h2>私隱權政策</h2>
      <p>
        本頁面是一項開放原始碼的網絡服務。作為本頁面的開發者，我們對您的私隱非常重視。本頁面的開發者不會透過本頁面收集您的任何資料。
      </p>
      <p>下面將具體介紹本頁面能在何種程度上保障您的私隱權。</p>
      <b>您鍵入的內容</b>
      <p>
        本頁面的開發者不會收集您在本頁面中鍵入的任何內容。任何與您鍵入的內容相關的運算全部在您的系統中完成。本頁面不會將包括待標註的文本、標註結果在內的任何資料傳送至任何伺服器。
      </p>
      <b>您的其他資料</b>
      <p>
        本頁面使用的內容託管於以下站點：GitHub Pages、jsDelivr、Google
        Fonts。在您訪問本頁面時，您的瀏覽器將與這些站點交互。本頁面的開發者並不能讀取您訪問這些站點時產生的資料，亦無法控制這些站點如何使用您訪問時產生的資料。
      </p>
    </>,
  );
}

function showHelp() {
  return showInfoBox(
    <>
      <h2>使用說明</h2>
      <h3>快速鍵</h3>
      <p>快速鍵僅在編輯器處於焦點狀態時有效。</p>
      <ul>
        <li>
          <kbd>
            <kbd>Alt</kbd>+<kbd>N</kbd>
          </kbd>{" "}
          或{" "}
          <kbd>
            <kbd>Option</kbd>+<kbd>N</kbd>
          </kbd>{" "}
          (
          <kbd>
            <kbd>⌥</kbd>
            <kbd>N</kbd>
          </kbd>
          )：新增檔案
        </li>
        <li>
          <kbd>
            <kbd>Alt</kbd>+<kbd>S</kbd>
          </kbd>{" "}
          或{" "}
          <kbd>
            <kbd>Option</kbd>+<kbd>S</kbd>
          </kbd>{" "}
          (
          <kbd>
            <kbd>⌥</kbd>
            <kbd>S</kbd>
          </kbd>
          )：刪除檔案
        </li>
        <li>
          <kbd>
            <kbd>Ctrl</kbd>+<kbd>O</kbd>
          </kbd>{" "}
          或{" "}
          <kbd>
            <kbd>Cmd</kbd>+<kbd>O</kbd>
          </kbd>{" "}
          (
          <kbd>
            <kbd>⌘</kbd>
            <kbd>O</kbd>
          </kbd>
          )：從本機開啟檔案
        </li>
        <li>
          <kbd>
            <kbd>Ctrl</kbd>+<kbd>S</kbd>
          </kbd>{" "}
          或{" "}
          <kbd>
            <kbd>Cmd</kbd>+<kbd>S</kbd>
          </kbd>{" "}
          (
          <kbd>
            <kbd>⌘</kbd>
            <kbd>S</kbd>
          </kbd>
          )：儲存檔案至本機
        </li>
        <li hidden>
          <kbd>
            <kbd>Ctrl</kbd>+<kbd>`</kbd>
          </kbd>{" "}
          或{" "}
          <kbd>
            <kbd>Cmd</kbd>+<kbd>`</kbd>
          </kbd>{" "}
          (
          <kbd>
            <kbd>⌘</kbd>
            <kbd>`</kbd>
          </kbd>
          )：隱藏或顯示推導操作面板
        </li>
        <li>
          <kbd>
            <kbd>Alt</kbd>+<kbd>R</kbd>
          </kbd>{" "}
          或{" "}
          <kbd>
            <kbd>Option</kbd>+<kbd>R</kbd>
          </kbd>{" "}
          (
          <kbd>
            <kbd>⌥</kbd>
            <kbd>R</kbd>
          </kbd>
          ) 或{" "}
          <kbd>
            <kbd>Shift</kbd>+<kbd>Enter</kbd>
          </kbd>{" "}
          (
          <kbd>
            <kbd>⇧</kbd>
            <kbd>↩</kbd>
          </kbd>
          )：執行推導並顯示推導結果
        </li>
        <li>
          <kbd>Esc</kbd> (<kbd>⎋</kbd>)：關閉「新增方案」或「推導結果」面板
        </li>
      </ul>
      <p>此外，檔案亦可透過拖曳載入。</p>
      <h3>指定個別字音</h3>
      <p>
        推導自訂文章時，若某字有多個音，且推導結果不同，則在推導結果介面上，該字會被著色。指標移至其上（或觸控螢幕上點按）會出現選單，可以點選想要的字音。
      </p>
      <p>
        若「同步音韻地位選擇至輸入框」已勾選，則選擇的字音會被記住於文章中（詳見下段所述格式），下次推導會預設選擇同一字音。
      </p>
      <p>
        此外，若希望自訂某字需按某音推導，可在其後緊接一對半形圓括號「<code>()</code>
        」，當中寫下想要的音韻地位描述（格式可參見推導結果中的音韻地位顯示，或參見{" "}
        <a target="_blank" rel="noreferrer" href="https://nk2028.shn.hk/tshet-uinh-js/">
          TshetUinh.js 文檔
        </a>
        ）
      </p>
      <h3>編寫推導方案</h3>
      <p>
        推導方案代碼會作為函數執行，用 <code>return</code> 回傳結果。函數有兩個執行模式：「推導」與「方案設定」。
      </p>
      <p>在「推導」模式下，會對推導的每個字/音韻地位執行一次函數，需回傳推導結果，可用的引數有：</p>
      <ul>
        <li>
          <code>音韻地位: TshetUinh.音韻地位</code>：待推導之音韻地位，詳見{" "}
          <a target="_blank" rel="noreferrer" href="https://nk2028.shn.hk/tshet-uinh-js/">
            TshetUinh.js 文檔
          </a>
        </li>
        <li>
          <code>字頭: string | null</code>：當前被推導的字
        </li>
        <li>
          <code>選項: Record&lt;String, unknown&gt;</code>：物件，包含用戶指定的各項方案參數（詳見下述「方案設定模式」）
        </li>
      </ul>
      <p>在「方案設定」模式下，會在建立方案時、改變代碼後或用戶調整/重置參數選項後執行，需回傳方案支援的可調整參數。</p>
      <p>
        該模式下僅 <code>選項</code> 引數會被傳入，<code>音韻地位</code> 與 <code>字頭</code> 均為{" "}
        <code>undefined</code>，可以透過 <code>if (!音韻地位)</code> 判斷處於哪一模式。<code>選項</code>{" "}
        引數格式與「推導」模式基本一致：剛建立方案時或重置選項後為空物件（<code>{"{}"}</code>
        ），其餘情形則為包含當前選項各參數的物件。
      </p>
      <p>
        「方案設定」模式需回傳方案各設定項的列表（<code>Array</code>），各項格式請參見{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/nk2028/tshet-uinh-deriver-tools/wiki/%E6%8E%A8%E5%B0%8E%E6%96%B9%E6%A1%88%E8%A8%AD%E5%AE%9A%E9%A0%85%E5%88%97%E8%A1%A8%E6%A0%BC%E5%BC%8F">
          tshet-uinh-deriver-tools 文檔
        </a>
        。如果方案不需可變參數，可回傳空列表（<code>[]</code>）。
      </p>
    </>,
  );
}

const Container = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: #fbfbfb;
`;
const Content = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
`;
const Heading = styled.h1`
  font-size: 1.75rem;
  margin: 0;
  line-height: 1;
  padding: 0 0.125rem 0.5rem 0.625rem;
  border-bottom: 0.2rem solid #d0d2d4;
  > * {
    margin: 0.625rem 0.75rem 0 0;
  }
`;
const Title = styled.span`
  display: inline-block;
`;
const Version = styled.span`
  display: inline-block;
  color: #888;
  font-size: 1rem;
`;
const Buttons = styled.span`
  display: inline-block;
`;
const ShowButton = styled.button`
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1.25rem;
  color: #666;
  border: 0.125rem solid #666;
  margin-left: 0.5rem;
  cursor: pointer;
  transition:
    color 150ms,
    border-color 150ms;
  &:hover,
  &:focus {
    color: #0078e7;
    border-color: #0078e7;
  }
`;
const ApplyButton = styled.button`
  color: #0078e7;
  cursor: pointer;
  transition: color 150ms;
  &:hover,
  &:focus {
    color: #339cff;
  }
`;
const LinkToLegacy = styled.span`
  font-size: 0.875rem;
  float: right;
  line-height: 1.75rem;
  a {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    text-decoration: none;
    color: hsl(210, 16%, 40%);
    transition: color 150ms;
    &:hover,
    &:focus {
      color: hsl(210, 8%, 50%);
    }
    svg {
      font-size: 0.75rem;
    }
  }
`;
const FontPreload = styled.span`
  position: absolute;
  top: -9999px;
  left: -9999px;
  width: 0;
  height: 0;
  overflow: hidden;
`;

export default function App() {
  const { t } = useTranslation();
  const evaluateHandlerRef = useRef(noop);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on("languageChanged", lng => {
      document.documentElement.lang = lng;
    });

    document.title = t("tshetUinhAutoderiver");
  }, []);

  return (
    <Container>
      <Content>
        <header>
          <nav>
            <Heading>
              <Title>{t("tshetUinhAutoderiver")}</Title>
              <Version>v{__APP_VERSION__}</Version>
              <LinkToLegacy>
                <a href="//nk2028.shn.hk/qieyun-autoderiver-legacy/">
                  前往舊版
                  <FontAwesomeIcon icon={faExternalLink} />
                </a>
              </LinkToLegacy>
              <Buttons>
                <ApplyButton title="適用" onClick={useCallback(() => evaluateHandlerRef.current(), [])}>
                  <FontAwesomeIcon icon={faCirclePlay} />
                </ApplyButton>
                <ShowButton title="關於" onClick={showAbout}>
                  <FontAwesomeIcon icon={faInfo} fixedWidth />
                </ShowButton>
                <ShowButton title="使用說明" onClick={showHelp}>
                  <FontAwesomeIcon icon={faQuestion} fixedWidth />
                </ShowButton>
              </Buttons>
            </Heading>
          </nav>
        </header>
        <Main evaluateHandlerRef={evaluateHandlerRef} />
      </Content>
      <FontPreload aria-hidden>結果</FontPreload>
    </Container>
  );
}
