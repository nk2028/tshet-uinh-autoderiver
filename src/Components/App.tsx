import "purecss/build/pure.css";

import { useCallback, useRef } from "react";

import { injectGlobal, css as stylesheet } from "@emotion/css";
import styled from "@emotion/styled";
import { faCirclePlay, faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Swal from "../Classes/SwalReact";
import Main from "./Main";

injectGlobal`
  html,
  body {
    line-height: 1.6;
    font-size: 16px;
    font-family: "Jomolhari", "Source Han Serif C", "Source Han Serif K", "Noto Serif CJK KR", "Source Han Serif SC",
      "Noto Serif CJK SC", "Source Han Serif", "Noto Serif CJK JP", "Source Han Serif TC", "Noto Serif CJK TC",
      "Noto Serif KR", "Noto Serif SC", "Noto Serif TC", "HanaMin", serif;
    font-language-override: "KOR";
  }
  :lang(och-Latn-fonipa) {
    font-family: "CharisSILW", serif;
  }
  br:first-child {
    display: none;
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
      width: 12.5rem;
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
  @media (max-width: 720px) {
    .swal2-container {
      padding: 0;
      .swal2-popup {
        width: 100%;
        border-radius: 0;
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
  }
  .swal2-html-container {
    text-align: left;
    margin: 1.5rem 3rem;
    line-height: 1.6;
    h2,
    b {
      color: black;
    }
    p {
      color: #5c5c5c;
      font-size: 1rem;
    }
    a:link {
      position: relative;
      color: inherit;
      text-decoration: none;
      transition: color 150ms;
      &:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0.125rem;
        border-bottom: 1px dashed currentColor;
      }
      &:hover {
        color: black;
      }
    }
  }
  .swal2-close {
    font-size: 3.5rem;
    &:focus {
      box-shadow: none;
    }
  }
`;

function showAbout() {
  Swal.fire({
    showClass: { popup: "" },
    hideClass: { popup: "" },
    customClass: { container: aboutModal },
    showCloseButton: true,
    showConfirmButton: false,
    html: (
      <>
        <h2>關於</h2>
        <p>
          切韻音系自動推導器（下稱「本頁面」）由 <a href="https://nk2028.shn.hk/">nk2028</a>{" "}
          開發。我們開發有關語言學的項目，尤其是有關歷史漢語語音學，異體字和日語語言學的項目。
        </p>
        <p>
          歡迎加入 QQ 音韻學答疑羣（羣號 526333751）和 Telegram nk2028 社羣（
          <a href="https://t.me/nk2028_discuss">@nk2028_discuss</a>）。
        </p>
        <p>
          本頁面原始碼公開於 <a href="https://github.com/nk2028/qieyun-autoderiver">GitHub</a>。
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
      </>
    ),
  });
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
const Title = styled.h1`
  font-size: 1.75rem;
  margin: 0;
  line-height: 1;
  padding: 0.625rem 0.625rem 0.5rem;
  border-bottom: 0.2rem solid #d0d2d4;
`;
const Version = styled.span`
  color: #888;
  font-size: 1rem;
  margin-left: 0.75rem;
`;
const ShowButton = styled.span`
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
  transition: color 150ms, border-color 150ms;
  &:hover {
    color: #0078e7;
    border-color: #0078e7;
  }
`;
const ApplyButton = styled.span`
  margin-left: 0.75rem;
  color: #0078e7;
  cursor: pointer;
  transition: color 150ms;
  &:hover {
    color: #339cff;
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
  const handleRef = useRef(() => {
    //
  });
  return (
    <Container>
      <Content>
        <header>
          <nav>
            <Title>
              <span>切韻音系自動推導器</span>
              <Version>v{process.env["NPM_PACKAGE_VERSION"]}</Version>
              <ApplyButton title="適用" onClick={useCallback(() => handleRef.current(), [])}>
                <FontAwesomeIcon icon={faCirclePlay} />
              </ApplyButton>
              <ShowButton title="關於" onClick={showAbout}>
                <FontAwesomeIcon icon={faInfo} fixedWidth />
              </ShowButton>
            </Title>
          </nav>
        </header>
        <Main handleRef={handleRef} />
      </Content>
      <FontPreload aria-hidden>結果</FontPreload>
    </Container>
  );
}
