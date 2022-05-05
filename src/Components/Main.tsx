import { useCallback, useEffect, useRef, useState } from "react";

import { listenArticle, listenTooltip, setClassName } from "qieyun-autoderiver-evaluate";

import { css as stylesheet } from "@emotion/css";
import styled from "@emotion/styled";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { allOptions } from "../consts";
import evaluate from "../evaluate";
import initialState from "../state";
import { copy, notifyError } from "../utils";
import SchemaEditor from "./SchemaEditor";
import Spinner from "./Spinner";

import type { MainState, Option } from "../consts";

const dummyOutput = document.createElement("output");

const ArticleInput = styled.textarea`
  line-height: 1.6;
  resize: none;
  width: 100%;
`;
const OutputArea = styled.div`
  display: flex;
  position: absolute;
  left: -1rem;
  bottom: -1rem;
  right: -1rem;
  max-height: calc(100% - 1rem);
  background-color: white;
  border-top: 0.375rem solid #ccc;
  transition: bottom 0.5s;
  z-index: 5;
`;
const OutputContainer = styled.div`
  position: relative;
  flex: 1;
  overflow: auto;
`;
const OutputWrapper = styled.div`
  padding: 1rem;
`;
const OutputContent = styled.output`
  display: block;
  font-size: 105%;
  overflow-wrap: break-word;
  margin-top: 0.875rem;
  white-space: pre-line;
  h3,
  p {
    margin: 0;
    line-height: 1.4;
  }
  :not(rt):lang(och-Latn-fonipa) {
    white-space: initial;
  }
  ruby {
    margin: 0 3px;
  }
  rt {
    font-size: 82.5%;
    line-height: 1.1;
  }
  table {
    margin-left: 0.25rem;
    border-collapse: collapse;
    th {
      text-align: left;
      border-bottom: 0.5px solid #aaa;
    }
    th,
    td {
      border-left: 0.5px solid #aaa;
      padding: 0 0.5rem;
      &:first-child {
        border-left: none;
        padding-left: 0;
      }
    }
  }
`;
const Title = styled.h1`
  display: flex;
  align-items: center;
  margin: 0 0.25rem;
  font-size: 1.75rem;
`;
const CopyButton = styled.div`
  margin-left: 1rem;
  transition: color 0.2s;
  color: #888;
  cursor: pointer;
  &:hover {
    color: #0078e7;
  }
`;
const CloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  font-size: 3.5rem;
  margin: 0;
  &:focus {
    box-shadow: none;
  }
`;
const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
`;

setClassName(stylesheet`
  position: absolute;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
  box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.37);
  color: #333;
  width: 25rem;
  max-width: calc(100vw - 2rem);
  z-index: 10;
  &:hover {
    display: block !important;
  }
  p:not(:only-child) {
    cursor: pointer;
    &:hover {
      color: #0078e7 !important;
    }
  }
`);

let evaluationResult: (Node | string)[] = [];

export default function Main() {
  const [state, setState] = useState(initialState);
  const { article, option, convertVariant, syncCharPosition } = state;
  useEffect(() => {
    localStorage.setItem("state", JSON.stringify(state));
  }, [state]);

  function useHandle<T extends keyof MainState, E>(key: T, handler: (event: E) => MainState[T]): (event: E) => void {
    return useCallback(event => setState(state => ({ ...state, [key]: handler(event) })), [state[key]]);
  }

  const [syncedArticle, setSyncedArticle] = useState<string[]>([]);
  useEffect(() => {
    if (syncCharPosition && syncedArticle.length) setState(state => ({ ...state, article: syncedArticle.join("") }));
  }, [syncCharPosition && syncedArticle]);

  const ref = useRef(dummyOutput);

  function renderResult() {
    ref.current.textContent = "";
    ref.current.append(...evaluationResult);
    setLoading(!evaluationResult.length);
  }

  const onReferenceChange = useCallback((element: HTMLOutputElement | null) => {
    if (!element) return;
    ref.current = element;
    renderResult();
  }, []);

  const handleClick = useCallback(async () => {
    evaluationResult = [];
    ref.current.textContent = "";
    setVisible(true);
    setLoading(true);
    try {
      evaluationResult = evaluationResult.concat(await evaluate(state));
      renderResult();
    } catch {
      setVisible(false);
    } finally {
      setLoading(false);
    }
  }, [state]);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = useCallback(() => {
    const txt = ref.current.textContent?.normalize("NFC").trim();
    if (txt) copy(txt);
    else notifyError("請先進行操作，再匯出結果");
  }, []);

  useEffect(() => {
    listenArticle(setSyncedArticle);
    listenTooltip((id, ch, 描述) => {
      setSyncedArticle(syncedArticle => {
        syncedArticle = [...syncedArticle];
        syncedArticle[id] = `${ch}(${描述})`;
        return syncedArticle;
      });
    });
  }, []);

  return (
    <>
      <SchemaEditor
        state={state}
        setState={setState}
        otherOptions={
          <>
            <p>
              <ArticleInput
                placeholder="輸入框"
                rows={5}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
                onChange={useHandle("article", event => event.target.value)}
                value={article}
              />
            </p>
            <p>
              <label>
                <select onChange={useHandle("option", event => event.target.value as Option)} value={option}>
                  {allOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label hidden={option !== "convertArticle"}>
                <input
                  type="checkbox"
                  checked={convertVariant}
                  onChange={useHandle("convertVariant", event => event.target.checked)}
                />
                轉換異體字
              </label>
              <label hidden={option !== "convertArticle"}>
                <input
                  type="checkbox"
                  checked={syncCharPosition}
                  onChange={useHandle("syncCharPosition", event => event.target.checked)}
                />
                同步音韻地位選擇至輸入框
              </label>
              <input className="pure-button pure-button-primary" type="button" value="適用" onClick={handleClick} />
            </p>
          </>
        }
      />
      <OutputArea hidden={!visible}>
        <OutputContainer>
          <OutputWrapper>
            <Title>
              <span>推導結果</span>
              <CopyButton title="匯出至剪貼簿" hidden={loading} onClick={handleCopy}>
                <FontAwesomeIcon icon={faCopy} size="sm" />
              </CopyButton>
              <CloseButton
                type="button"
                className="swal2-close"
                title="關閉"
                hidden={loading}
                onClick={useCallback(() => setVisible(false), [])}>
                ×
              </CloseButton>
            </Title>
            <OutputContent ref={onReferenceChange} />
            {loading && (
              <Loading>
                <Spinner />
              </Loading>
            )}
          </OutputWrapper>
        </OutputContainer>
      </OutputArea>
    </>
  );
}
