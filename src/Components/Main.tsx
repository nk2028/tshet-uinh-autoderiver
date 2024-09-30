import { MutableRefObject, useCallback, useEffect, useReducer, useRef, useState } from "react";

import styled from "@emotion/styled";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SchemaEditor from "./SchemaEditor";
import Spinner from "./Spinner";
import { listenTooltip } from "./TooltipChar";
import Swal from "../Classes/SwalReact";
import { allOptions, defaultArticle } from "../consts";
import evaluate from "../evaluate";
import { listenArticle } from "../options";
import initialState, { stateStorageLocation } from "../state";
import { copy, notifyError } from "../utils";

import type { MainState, Option, ReactNode } from "../consts";

const dummyOutput = document.createElement("output");

const ArticleInput = styled.textarea`
  line-height: 1.6;
  resize: none;
  width: 100%;
`;
const OutputBackdrop = styled.div`
  position: fixed;
  z-index: 500;
  background-color: rgba(0, 0, 0, 0.1);
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  border: none;
`;
const OutputArea = styled.div`
  display: flex;
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  max-height: 100%;
  background-color: white;
  border-top: 0.375rem solid #ccc;
  transition: bottom 0.5s;
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
  margin-top: 0.875rem;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
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
    margin-top: -0.5rem;
    margin-left: 0.25rem;
    border-spacing: 0;
    thead {
      position: sticky;
      top: -2px;
      background-color: white;
      height: 2.5rem;
      vertical-align: bottom;
    }
    th,
    td {
      border-left: 0.5px solid #aaa;
      padding: 0 0.5rem;
      &:first-child {
        border-left: none;
        padding-left: 0.25rem;
      }
    }
    th {
      text-align: left;
      border-bottom: 0.5px solid #aaa;
      padding-right: 1.25rem;
    }
    tbody > tr:first-child > td {
      padding-top: 0.25rem;
    }
  }
`;
const Title = styled.h1`
  display: flex;
  align-items: center;
  margin: 0 0.25rem;
  font-size: 1.75rem;
`;
const CopyButton = styled.button`
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

let evaluationResult: ReactNode = [];

export default function Main({ handleRef }: { handleRef: MutableRefObject<() => void> }) {
  const [state, setState] = useState(initialState);
  const { article, option, convertVariant, syncCharPosition } = state;
  useEffect(() => {
    localStorage.setItem(stateStorageLocation, JSON.stringify(state));
  }, [state]);

  function useHandle<T extends keyof MainState, E>(key: T, handler: (event: E) => MainState[T]): (event: E) => void {
    return useCallback(event => setState(state => ({ ...state, [key]: handler(event) })), [handler, key]);
  }

  const [syncedArticle, setSyncedArticle] = useState<string[]>([]);

  useEffect(() => {
    if (syncCharPosition && syncedArticle.length) setState(state => ({ ...state, article: syncedArticle.join("") }));
  }, [syncCharPosition, syncedArticle]);

  const ref = useRef(dummyOutput);
  const [operation, increaseOperation] = useReducer((operation: number) => operation + 1, 0);

  handleRef.current = useCallback(async () => {
    evaluationResult = [];
    setVisible(true);
    setLoading(true);
    try {
      evaluationResult = await evaluate(state);
      increaseOperation();
    } catch {
      setVisible(false);
    } finally {
      setLoading(false);
    }
  }, [state]);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = useCallback(() => {
    const txt = ref.current.textContent?.trim();
    if (txt) copy(txt);
    else notifyError("請先進行操作，再匯出結果");
  }, []);

  // XXX Please Rewrite
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

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      if (!event.altKey && !event.ctrlKey && !event.metaKey && event.key === "Escape") {
        event.preventDefault();
        setVisible(false);
      } else if (event.altKey && !event.ctrlKey && !event.metaKey && event.key === "s") {
        // TODO Test on macOS.
        // AFAIK it might be more appropriate to use something like "⌥⌘" (option+command) instead,
        // because "⌥S" on macOS is supposed to behave more like "AltGr+S" on a PC.
        event.preventDefault();
        handleRef.current();
      } else if (!event.ctrlKey && !event.metaKey && event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        handleRef.current();
      }
    }
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  }, [handleRef]);

  const resetArticle = useCallback(async () => {
    if (
      !article ||
      (article !== defaultArticle &&
        (
          await Swal.fire({
            title: "要恢復成預設文本嗎？",
            text: "此動作無法復原。",
            icon: "warning",
            showConfirmButton: false,
            focusConfirm: false,
            showDenyButton: true,
            showCancelButton: true,
            focusCancel: true,
            denyButtonText: "確定",
            cancelButtonText: "取消",
          })
        ).isDenied)
    )
      setState({ ...state, article: defaultArticle });
  }, [article, state]);

  return (
    <>
      <SchemaEditor
        state={state}
        setState={setState}
        commonOptions={
          <>
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
              <input
                className="pure-button pure-button-primary"
                type="button"
                value="適用"
                onClick={handleRef.current}
              />
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
              <input
                hidden={option !== "convertArticle"}
                disabled={article === defaultArticle}
                className="pure-button pure-button-danger"
                type="button"
                value="恢復成預設文本"
                onClick={resetArticle}
              />
            </p>
            <p>
              <ArticleInput
                disabled={option !== "convertArticle"}
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
          </>
        }
      />
      <OutputBackdrop hidden={!visible}>
        <OutputArea>
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
              <OutputContent key={operation} ref={ref}>
                {evaluationResult}
              </OutputContent>
              {loading && (
                <Loading>
                  <Spinner />
                </Loading>
              )}
            </OutputWrapper>
          </OutputContainer>
        </OutputArea>
      </OutputBackdrop>
    </>
  );
}
