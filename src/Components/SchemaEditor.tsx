import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";

import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { faFileCode } from "@fortawesome/free-regular-svg-icons";
import { faChevronDown, faChevronUp, faPlus, faRotateLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Editor from "@monaco-editor/react";

import CreateSchemaDialog from "./CreateSchemaDialog";
import Spinner from "./Spinner";
import actions from "../actions";
import Swal from "../Classes/SwalReact";
import { codeFontFamily } from "../consts";
import "../editor/setup";
import { memoize, normalizeFileName } from "../utils";

import type { Sample, UseMainState, ReactNode } from "../consts";

const TabBar = styled.div`
  display: flex;
  align-items: flex-end;
  user-select: none;
  color: #333;
  background-color: #eaecee;
  white-space: nowrap;
  min-height: 2.25rem;
  padding: 0 0.375rem;
  overflow: hidden;
`;
const Tab = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  height: 100%;
  padding-left: 0.5rem;
  ${({ checked }) =>
    checked &&
    css`
      z-index: 8;
      border-radius: 0.5rem 0.5rem 0 0;
      background-color: white;
      &:before,
      &:after {
        content: "";
        position: absolute;
        bottom: 0;
        background-color: white;
        width: 0.5rem;
        height: 0.5rem;
      }
      &:before {
        left: -0.5rem;
      }
      &:after {
        right: -0.5rem;
      }
    `}
  > svg {
    z-index: 2;
    color: #666;
  }
`;
const Name = styled.div<{ checked: boolean }>`
  margin: 0 0.4rem;
  ${({ checked }) =>
    checked &&
    css`
      &:before,
      &:after {
        content: "";
        position: absolute;
        bottom: 0;
        background-color: #eaecee;
        width: 0.5rem;
        height: 0.5rem;
        z-index: 1;
      }
      &:before {
        border-radius: 0 0 0.5rem 0;
        left: -0.5rem;
      }
      &:after {
        border-radius: 0 0 0 0.5rem;
        right: -0.5rem;
      }
    `}
`;
const DeleteButton = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.0625rem;
  height: 1.0625rem;
  border-radius: 9999px;
  color: #666;
  transition: background-color 150ms;
  &:hover {
    background-color: #ccc;
  }
`;
const Separator = styled.div<{ visible: boolean }>`
  width: 0.5px;
  height: 1.375rem;
  margin-left: 0.5rem;
  ${({ visible }) =>
    visible &&
    css`
      background-color: #888;
    `}
`;
const CreateSchemaButton = styled.div`
  align-self: center;
  margin-left: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  min-width: 1.75rem;
  min-height: 1.75rem;
  font-size: 1rem;
  color: #555;
  transition: background-color 150ms;
  &:hover {
    background-color: #ccc;
  }
`;
const EditorArea = styled.div`
  flex: 1;
  position: relative;
  min-height: calc(6rem + 20vh);
`;
const ResetButton = styled.div`
  display: inline-block;
  margin-left: 0.75rem;
  transition: color 0.2s;
  color: #555;
  cursor: pointer;
  &:hover {
    color: #0078e7;
  }
  &.rotate {
    animation: rotate 0.3s;
  }
  @keyframes rotate {
    0% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`;
const Parameters = styled.p`
  margin: -0.75rem 0 0;
`;
const NoParameters = styled.p`
  margin: -1.25rem 0 -0.5rem;
  font-size: 0.875rem;
  color: #888;
`;
const Options = styled.form`
  padding: 0 1rem;
  overflow-y: auto;
  border-top: 0.2rem solid #c4c6c8;
`;
const SeparatorShadow = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 6px;
  box-shadow: #ddd 0 -6px 6px -6px inset;
`;
const ToggleButton = styled.div<{ collapsed: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 0.5rem;
  bottom: calc(1px - 0.2rem);
  width: 3rem;
  height: 1.75rem;
  border-radius: 0.5rem 0.5rem 0 0;
  background-color: #c4c6c8;
  color: white;
  &:hover {
    transition:
      background-color 150ms,
      height 150ms;
    height: 2.125rem;
    background-color: #a2a4a6;
  }
  ${({ collapsed }) =>
    collapsed &&
    css`
      bottom: 0rem;
      background-color: #a2a4a6;
      &:hover {
        background-color: #409bf0;
      }
    `}
`;

interface SchemaEditorProps extends UseMainState {
  commonOptions: ReactNode;
}

export default function SchemaEditor({ state, setState, commonOptions }: SchemaEditorProps) {
  const { schemas, activeSchemaName } = state;
  const activeSchema = useMemo(
    () => schemas.find(({ name }) => name === activeSchemaName),
    [schemas, activeSchemaName],
  );

  const getDefaultFileName: (sample: Sample | "") => string = useMemo(
    () =>
      memoize((sample: string) => {
        sample ||= "untitled";
        const indices = schemas
          .map(({ name }) => {
            if (name === sample + ".js") return 0;
            if (!name.startsWith(sample + "-") || !name.endsWith(".js")) return -1;
            const start = sample.length + 1;
            for (let i = start; i < name.length - 3; i++) if (name[i] < +(i === start) + "" || name[i] > "9") return -1;
            return +name.slice(start, -3);
          })
          .sort((a, b) => a - b);
        indices[-1] = -1;
        let i = 0;
        while (indices[i] - indices[i - 1] <= 1) i++;
        return sample + (~indices[i - 1] || "");
      }),
    [schemas],
  );
  const [dialogVisible, setDialogVisible] = useState(false);

  async function deleteSchema(name: string) {
    if (
      (
        await Swal.fire({
          title: "要刪除此方案嗎？",
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
      ).isDenied
    )
      setState(actions.deleteSchema(name));
  }

  const resetParameters = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      setState(actions.resetSchemaParameters(activeSchemaName));
      const element = event.currentTarget;
      element.classList.remove("rotate");
      element.offsetWidth; // Trigger DOM reflow
      element.classList.add("rotate");
    },
    [activeSchemaName],
  );

  const [optionsVisible, setOptionsVisible] = useState(true);

  const tabBarRef = useRef<HTMLDivElement>(null);
  function drag(name: string, { clientX: startX }: { clientX: number }, isMouse?: boolean) {
    if (activeSchemaName !== name) setState(state => ({ ...state, activeSchemaName: name }));
    const { length } = schemas;
    if (length <= 1 || tabBarRef.current?.childElementCount !== length + 1) return;

    const index = schemas.findIndex(schema => schema.name === name);
    const children = [].slice.call(tabBarRef.current.children, 0, -1) as HTMLElement[];
    const widths = children.map(element => element.getBoundingClientRect().width);
    const currentWidth = widths[index] + "px";
    const threshold: number[] = [];
    threshold[index] = 0;

    for (let sum = 0, i = index - 1; i >= 0; i--) {
      threshold[i] = sum + widths[i] / 2;
      sum += widths[i];
    }
    for (let sum = 0, i = index + 1; i < length; i++) {
      threshold[i] = sum + widths[i] / 2;
      sum += widths[i];
    }

    let clientX = startX;

    function move(event: { clientX: number } | TouchEvent) {
      clientX = "clientX" in event ? event.clientX : (event.touches?.[0]?.clientX ?? clientX);
      let value = clientX - startX;
      children[index].style.left = value + "px";
      if (value < 0) {
        value = -value;
        for (let i = 0; i < index; i++) children[i].style.left = value >= threshold[i] ? currentWidth : "";
        for (let i = length - 1; i > index; i--) children[i].style.left = "";
      } else {
        for (let i = 0; i < index; i++) children[i].style.left = "";
        for (let i = length - 1; i > index; i--)
          children[i].style.left = value >= threshold[i] ? "-" + currentWidth : "";
      }
    }

    function end(event: { clientX: number } | TouchEvent) {
      clientX = "clientX" in event ? event.clientX : (event.touches?.[0]?.clientX ?? clientX);
      let value = clientX - startX;
      children.forEach(element => (element.style.left = ""));
      let i: number;
      if (value < 0) {
        value = -value;
        for (i = 0; i < index; i++) if (value >= threshold[i]) break;
      } else {
        for (i = length - 1; i > index; i--) if (value >= threshold[i]) break;
      }
      if (i !== index) setState(actions.moveSchema(name, i));

      if (isMouse) {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", end);
      } else {
        document.removeEventListener("touchmove", move);
        document.removeEventListener("touchend", end);
        document.removeEventListener("touchcancel", end);
      }
    }

    if (isMouse) {
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", end);
    } else {
      document.addEventListener("touchmove", move);
      document.addEventListener("touchend", end);
      document.addEventListener("touchcancel", end);
    }
  }

  function validateFileName(name: string) {
    const hasSchemaName = (name: string) => schemas.find(schema => schema.name === name);
    if (!name) return "檔案名稱為空";
    // eslint-disable-next-line no-control-regex
    if (/[\0-\x1f"*/:<>?\\|\x7f-\x9f]/.test(name)) return "檔案名稱含有特殊字元";
    if (hasSchemaName(name + ".js")) return "檔案名稱與現有檔案重複";
    return "";
  }

  async function mouseUp(name: string, { button }: { button: number }) {
    if (button === 1) deleteSchema(name);
    else if (button === 2) {
      const promise = Swal.fire({
        title: "重新命名方案",
        input: "text",
        inputPlaceholder: "輸入方案名稱……",
        inputValue: name,
        inputAttributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          spellcheck: "false",
        },
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
      });
      const confirmButton = Swal.getConfirmButton() as HTMLButtonElement;
      confirmButton.disabled = true;
      confirmButton.style.pointerEvents = "none";
      const input = Swal.getInput() as HTMLInputElement;
      input.addEventListener("input", () => {
        const newName = normalizeFileName(input.value);
        const validation = validateFileName(newName);
        if (validation) {
          if (newName + ".js" !== name) {
            const { selectionStart, selectionEnd, selectionDirection } = input;
            Swal.showValidationMessage(validation);
            input.setSelectionRange(selectionStart, selectionEnd, selectionDirection || undefined);
          }
          confirmButton.disabled = true;
          confirmButton.style.pointerEvents = "none";
        } else {
          Swal.resetValidationMessage();
          confirmButton.disabled = false;
          confirmButton.style.pointerEvents = "";
        }
      });
      const { isConfirmed, value } = await promise;
      if (isConfirmed) {
        const newName = normalizeFileName(value);
        if (!validateFileName(newName)) setState(actions.renameSchema(name, newName + ".js"));
      }
    }
  }

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      if (!event.altKey && event.ctrlKey && event.key === "`") {
        event.preventDefault();
        setOptionsVisible(optionsVisible => !optionsVisible);
      }
    }
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  }, []);

  return (
    <>
      <TabBar ref={tabBarRef}>
        {schemas.map(({ name }, index) => (
          <Tab
            key={name}
            checked={activeSchemaName === name}
            onMouseDown={event => !event.button && drag(name, event, true)}
            onMouseUp={event => mouseUp(name, event)}
            onTouchStart={event => drag(name, event.touches[0])}
            onContextMenu={event => event.preventDefault()}>
            <FontAwesomeIcon icon={faFileCode} fixedWidth />
            <Name checked={activeSchemaName === name}>{name}</Name>
            <DeleteButton title="刪除方案" onClick={() => deleteSchema(name)}>
              <FontAwesomeIcon icon={faXmark} size="sm" fixedWidth />
            </DeleteButton>
            <Separator visible={activeSchemaName !== schemas[index + 1]?.name && activeSchemaName !== name} />
          </Tab>
        ))}
        <CreateSchemaButton title="新增方案" onClick={useCallback(() => setDialogVisible(true), [])}>
          <FontAwesomeIcon icon={faPlus} fixedWidth />
        </CreateSchemaButton>
      </TabBar>
      <EditorArea lang="en-x-code">
        <Editor
          path={activeSchema?.name || ".js"}
          language="javascript"
          value={activeSchema?.input || ""}
          loading={<Spinner />}
          options={{
            fontFamily: codeFontFamily,
            scrollbar: {
              horizontalScrollbarSize: 10,
              verticalScrollbarSize: 10,
            },
          }}
          onChange={useCallback(
            input => {
              if (typeof input !== "undefined" && activeSchema)
                setState(actions.setSchemaInput(activeSchemaName, input));
            },
            [activeSchemaName],
          )}
        />
        {optionsVisible && <SeparatorShadow />}
        <ToggleButton
          title={optionsVisible ? "隱藏選項" : "顯示選項"}
          collapsed={!optionsVisible}
          onClick={useCallback(() => setOptionsVisible(!optionsVisible), [optionsVisible])}>
          <FontAwesomeIcon icon={optionsVisible ? faChevronDown : faChevronUp} size="lg" />
        </ToggleButton>
      </EditorArea>
      {optionsVisible && (
        <Options className="pure-form">
          {activeSchema?.parameters.size ? (
            <>
              <h3>
                <span>選項</span>
                <ResetButton title="恢復成預設值" onClick={resetParameters}>
                  <FontAwesomeIcon icon={faRotateLeft} size="sm" />
                </ResetButton>
              </h3>
              <Parameters>
                {activeSchema.parameters.render(parameters =>
                  setState(actions.setSchemaParameters(activeSchemaName, parameters)),
                )}
              </Parameters>
            </>
          ) : (
            <>
              <h3>選項</h3>
              <NoParameters>此推導方案無可用自訂選項。</NoParameters>
            </>
          )}
          <hr />
          {commonOptions}
        </Options>
      )}
      <CreateSchemaDialog
        state={state}
        setState={setState}
        visible={dialogVisible}
        closeDialog={useCallback(() => setDialogVisible(false), [])}
        schemaLoaded={useCallback(schema => {
          setState(actions.addSchema(schema));
          setDialogVisible(false);
        }, [])}
        getDefaultFileName={getDefaultFileName}
        hasSchemaName={useCallback(name => !!schemas.find(schema => schema.name === name), [schemas])}
      />
    </>
  );
}
