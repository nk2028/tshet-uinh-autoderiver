import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styled from "@emotion/styled";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useTranslation } from "react-i18next";

import SchemaEditor from "./SchemaEditor";
import Spinner from "./Spinner";
import { listenTooltip } from "./TooltipChar";
import Swal from "../Classes/SwalReact";
import { allOptions, defaultArticle } from "../consts";
import evaluate from "../evaluate";
import { listenArticle } from "../options";
import initialState, { stateStorageLocation } from "../state";
import TooltipLabel from "./TooltipLabel";
import { stopPropagation } from "../utils";

import type { MainState, Option, ReactNode } from "../consts";
import type { MutableRefObject } from "react";

const dummyOutput = document.createElement("output");

const ArticleInput = styled.textarea`
  line-height: 1.6;
  resize: none;
  width: 100%;
`;
const OutputContainer = styled.dialog`
  transform: translateY(10%);
  @starting-style {
    transform: translateY(10%);
  }
  &[open] {
    transform: translateY(0);
  }
  &::backdrop {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;
const OutputPopup = styled.div`
  height: fit-content;
  box-sizing: border-box;
  margin-top: auto;
  background-color: white;
  border-top: 0.25rem solid #ccc;
  position: relative;
  overflow: auto;
  padding: 1rem;
`;
const OutputContent = styled.output`
  display: block;
  font-size: 105%;
  margin-top: 0.75rem;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  h3,
  p {
    margin: 0;
    line-height: 1.2;
  }
  :not(rt):lang(och-Latn-fonipa) {
    white-space: initial;
  }
  ruby {
    margin: 0 3px;
    display: inline-flex;
    flex-direction: column-reverse;
    align-items: center;
    vertical-align: bottom;
  }
  rt {
    font-size: 82.5%;
    line-height: 1.1;
    text-align: center;
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
  &:hover,
  &:focus {
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

export default function Main({ evaluateHandlerRef }: { evaluateHandlerRef: MutableRefObject<() => void> }) {
  const { t } = useTranslation();
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

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);
  evaluateHandlerRef.current = useCallback(async () => {
    evaluationResult = [];
    dialogRef.current?.showModal();
    setLoading(true);
    try {
      evaluationResult = await evaluate(state);
      increaseOperation();
    } catch {
      closeDialog();
    } finally {
      setLoading(false);
    }
  }, [state, closeDialog]);

  const [loading, setLoading] = useState(false);

  const [copyTooltipText, setCopyTooltipText] = useState(t("copyToClipboard"));
  const copyEvaluationResult = useCallback(async () => {
    const content = ref.current.textContent?.trim();
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        setCopyTooltipText(t("copySuccess"));
      } catch {
        setCopyTooltipText(t("copyFailed"));
      }
    }
  }, []);
  const onHideTooltip = useCallback(() => setCopyTooltipText(t("copyToClipboard")), []);

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
                onClick={evaluateHandlerRef.current}
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
        evaluateHandlerRef={evaluateHandlerRef}
      />
      {createPortal(
        <OutputContainer onClick={closeDialog} ref={dialogRef}>
          <OutputPopup onClick={stopPropagation}>
            <Title>
              <span>推導結果</span>
              {!loading && (
                <>
                  <TooltipLabel description={copyTooltipText} onHideTooltip={onHideTooltip}>
                    <CopyButton onClick={copyEvaluationResult}>
                      <FontAwesomeIcon icon={faCopy} size="sm" />
                    </CopyButton>
                  </TooltipLabel>
                  <form method="dialog">
                    <CloseButton type="submit" className="swal2-close" title="關閉">
                      ×
                    </CloseButton>
                  </form>
                </>
              )}
            </Title>
            <OutputContent key={operation} ref={ref}>
              {evaluationResult}
            </OutputContent>
            {loading && (
              <Loading>
                <Spinner />
              </Loading>
            )}
          </OutputPopup>
        </OutputContainer>,
        document.body,
      )}
    </>
  );
}
