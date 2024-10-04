import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { faFileCode } from "@fortawesome/free-regular-svg-icons";
import { faPlus, faRotateLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Editor, { useMonaco } from "@monaco-editor/react";

import CreateSchemaDialog from "./CreateSchemaDialog";
import Spinner from "./Spinner";
import actions from "../actions";
import Swal from "../Classes/SwalReact";
import { codeFontFamily, invalidCharsRegex, noop } from "../consts";
import "../editor/setup";
import { memoize, normalizeFileName, notifyError, showLoadingDialog } from "../utils";

import type { UseMainState, ReactNode } from "../consts";
import type { MouseEvent, MutableRefObject } from "react";

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
const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.0625rem;
  height: 1.0625rem;
  border-radius: 9999px;
  color: #666;
  transition: background-color 150ms;
  &:hover,
  &:focus {
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
const CreateSchemaButton = styled.button`
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
  &:hover,
  &:focus {
    background-color: #ccc;
  }
`;
const EditorArea = styled.div`
  flex: 1;
  position: relative;
  min-height: calc(6rem + 20vh);
`;
const ResetButton = styled.button`
  display: inline-block;
  margin-left: 0.75rem;
  transition: color 0.2s;
  color: #555;
  cursor: pointer;
  &:hover,
  &:focus {
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
const ParameterErrorHint = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: red;
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
const OptionsSeparator = styled.hr`
  margin: 1rem -1rem;
`;
const DropContainer = styled.div<{ isDragging: boolean }>`
  position: fixed;
  inset: 0;
  display: ${({ isDragging }) => (isDragging ? "grid" : "none")};
  background-color: rgba(127, 127, 127, 0.7);
  padding: 3rem;
  z-index: 2147483647;
`;
const DropArea = styled.div`
  border: 0.5rem dashed #ccc;
  border-radius: 2.5rem;
  font-size: 4rem;
  display: grid;
  place-items: center;
  color: white;
  background-color: rgba(191, 191, 191, 0.7);
`;

interface SchemaEditorProps extends UseMainState {
  commonOptions: ReactNode;
  evaluateHandlerRef: MutableRefObject<() => void>;
}

export default function SchemaEditor({ state, setState, commonOptions, evaluateHandlerRef }: SchemaEditorProps) {
  const { schemas, activeSchemaName } = state;
  const activeSchema = useMemo(
    () => schemas.find(({ name }) => name === activeSchemaName),
    [schemas, activeSchemaName],
  );

  const monaco = useMonaco();
  useEffect(() => {
    if (!monaco) return;
    // Clean up deleted schemata
    const schemaUris = new Set(schemas.map(({ name }) => monaco.Uri.parse(name).toString()));
    for (const model of monaco.editor.getModels()) {
      if (!schemaUris.has(model.uri.toString())) {
        model.dispose();
      }
    }
  }, [monaco, schemas]);

  const getDefaultFileNameWithSchemaNames = useCallback(
    (schemaNames: string[]) =>
      memoize((sample: string) => {
        sample ||= "untitled";
        const indices = schemaNames
          .map(name => {
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
    [],
  );
  const getDefaultFileName = useMemo(
    () => getDefaultFileNameWithSchemaNames(schemas.map(({ name }) => name)),
    [getDefaultFileNameWithSchemaNames, schemas],
  );

  const dialogRef = useRef<HTMLDialogElement>(null);

  const createSchema = useRef(noop);
  createSchema.current = useCallback(() => dialogRef.current?.showModal(), []);

  const addFilesToSchema = useCallback(
    async (files: Iterable<File>) => {
      const contents = await Promise.all(Array.from(files, file => file.text()));
      const currSchemaNames = schemas.map(({ name }) => name);
      setState(currState => {
        let newState = currState;
        let i = 0;
        for (const file of files) {
          // POSIX allows all characters other than `\0` and `/` in file names,
          // this is necessary to ensure that the file name is valid on all platforms.
          const name =
            getDefaultFileNameWithSchemaNames(currSchemaNames)(
              normalizeFileName(file.name).replace(invalidCharsRegex, "_"),
            ) + ".js";
          currSchemaNames.push(name);
          newState = actions.addSchema({ name, input: contents[i++] })(newState);
        }
        return newState;
      });
    },
    [schemas, setState, getDefaultFileNameWithSchemaNames],
  );

  useEffect(() => {
    async function fetchQueryFiles() {
      const query = new URLSearchParams(location.search);
      history.replaceState(null, document.title, location.pathname); // Remove query
      const hrefs = query.getAll("script");
      if (!hrefs.length) return;
      const abortController = new AbortController();
      const { signal } = abortController;
      showLoadingDialog("正在載入檔案，請稍候……", abortController);
      const names = query.getAll("name");
      let i = 0;
      const fetchResults = await Promise.allSettled(
        hrefs.map(async href => {
          // Adds a protocol if the input seems to lack one
          // This also prevents `example.com:` from being treated as a protocol if the input is `example.com:8080`
          const url = new URL(/^[a-z]+:/i.test(href) ? href : `https://${href}`);
          const name =
            i < names.length
              ? names[i++] // Use user-specified name
              : url.protocol === "data:"
                ? "" // Let `getDefaultFileName` name it
                : /([^/]*)\/*$/.exec(url.pathname)![1]; // Use the last segment of the path as name
          if (url.hostname === "github.com") {
            url.searchParams.append("raw", "true"); // Fetch raw file content for GitHub files
          } else if (url.hostname === "gist.github.com") {
            url.pathname += "/raw"; // Fetch raw file content for GitHub gists
          }
          const response = await fetch(url, {
            headers: {
              Accept: "text/javascript, text/plain", // githubusercontent.com always responses with `Content-Type: text/plain`
            },
            cache: "no-cache",
            signal,
          });
          const blob = await response.blob();
          return new File([blob], name);
        }),
      );
      const files: File[] = [];
      const errors: unknown[] = [];
      for (const result of fetchResults) {
        if (result.status === "fulfilled") {
          files.push(result.value);
        } else {
          errors.push(result.reason);
        }
      }
      await addFilesToSchema(files);
      Swal.close();
      if (!signal.aborted) {
        if (errors.length > 1) {
          notifyError(`${errors.length} 個檔案無法載入`, new AggregateError(errors));
        } else if (errors.length === 1) {
          notifyError(fetchResults.length === 1 ? "無法載入檔案" : "1 個檔案無法載入", errors[0]);
        }
      }
    }
    fetchQueryFiles();
  }, [addFilesToSchema]);

  const deleteSchema = useCallback(
    async (name: string) => {
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
    },
    [setState],
  );

  const deleteActiveSchema = useRef(noop);
  deleteActiveSchema.current = useCallback(() => {
    deleteSchema(activeSchemaName);
  }, [deleteSchema, activeSchemaName]);

  const openFileFromDisk = useRef(noop);
  openFileFromDisk.current = useCallback(() => {
    if ("showOpenFilePicker" in window) {
      (async () => {
        try {
          const handles = await showOpenFilePicker({
            id: "autoderiver-open-file",
            types: [
              {
                description: "JavaScript file",
                accept: { "text/javascript": [".js"] },
              },
            ],
            multiple: true,
          });
          addFilesToSchema(await Promise.all(handles.map(handle => handle.getFile())));
        } catch (error) {
          if ((error as Error | null)?.name !== "AbortError") {
            notifyError("開啟檔案時發生錯誤", error);
          }
        }
      })();
    } else {
      const input = document.createElement("input");
      input.hidden = true;
      input.type = "file";
      input.multiple = true;
      document.body.appendChild(input);
      input.addEventListener("change", async () => {
        document.body.removeChild(input);
        if (input.files) {
          addFilesToSchema(input.files);
        }
      });
      input.showPicker();
    }
  }, [addFilesToSchema]);

  const saveFileToDisk = useRef(noop);
  saveFileToDisk.current = useCallback(() => {
    if (!activeSchema?.input) return;
    const file = new Blob([activeSchema.input], { type: "text/javascript" });
    if ("showSaveFilePicker" in window) {
      (async () => {
        try {
          const handle = await showSaveFilePicker({
            id: "autoderiver-save-file",
            types: [
              {
                description: "JavaScript file",
                accept: { "text/javascript": [".js"] },
              },
            ],
            suggestedName: activeSchema.name,
          });
          const writable = await handle.createWritable();
          await writable.write(file);
          await writable.close();
        } catch (error) {
          if ((error as Error | null)?.name !== "AbortError") {
            notifyError("儲存檔案時發生錯誤", error);
          }
        }
      })();
    } else {
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = activeSchema.name;
      anchor.hidden = true;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }
  }, [activeSchema]);

  const resetParameters = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setState(actions.resetSchemaParameters(activeSchemaName));
      const element = event.currentTarget;
      element.classList.remove("rotate");
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- Trigger DOM reflow
      element.offsetWidth;
      element.classList.add("rotate");
    },
    [activeSchemaName, setState],
  );

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
    if (invalidCharsRegex.test(name)) return "檔案名稱含有特殊字元";
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

  const dropContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    function onDragStart(event: DragEvent) {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    }

    function onDragEnd(event: DragEvent) {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.target === dropContainerRef.current) setIsDragging(false);
    }

    async function onDrop(event: DragEvent) {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      addFilesToSchema(event.dataTransfer.files);
    }

    window.addEventListener("dragenter", onDragStart);
    window.addEventListener("dragover", onDragStart);
    window.addEventListener("dragend", onDragEnd);
    window.addEventListener("dragleave", onDragEnd);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragStart);
      window.removeEventListener("dragover", onDragStart);
      window.removeEventListener("dragend", onDragEnd);
      window.removeEventListener("dragleave", onDragEnd);
      window.removeEventListener("drop", onDrop);
    };
  }, [addFilesToSchema]);

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
        <CreateSchemaButton title="新增方案" onClick={createSchema.current}>
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
            unicodeHighlight: {
              nonBasicASCII: false,
              invisibleCharacters: false,
              ambiguousCharacters: false,
            },
          }}
          onMount={useCallback(
            (editor, monaco) => {
              editor.addAction({
                id: "create-file",
                label: "新增檔案……",
                // Ctrl/Cmd + N cannot be overridden in browsers
                keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyN],
                run() {
                  createSchema.current();
                },
              });
              editor.addAction({
                id: "delete-file",
                label: "刪除檔案……",
                // Ctrl/Cmd + W cannot be overridden in browsers
                keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyW],
                run() {
                  deleteActiveSchema.current();
                },
              });
              editor.addAction({
                id: "open-file-from-disk",
                label: "從本機開啟檔案……",
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO],
                run() {
                  openFileFromDisk.current();
                },
              });
              editor.addAction({
                id: "save-file-to-disk",
                label: "儲存檔案至本機……",
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
                run() {
                  saveFileToDisk.current();
                },
              });

              function evaluate() {
                evaluateHandlerRef.current();
              }
              // Using `addCommand` instead of `addAction`
              // as this does not need to be in the command palette
              editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyR, evaluate);
              editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, evaluate);
            },
            [saveFileToDisk, evaluateHandlerRef],
          )}
          onChange={useCallback(
            input => {
              if (typeof input !== "undefined" && activeSchema)
                setState(actions.setSchemaInput(activeSchemaName, input));
            },
            [activeSchema, activeSchemaName, setState],
          )}
        />
        <SeparatorShadow />
      </EditorArea>
      <Options className="pure-form">
        <h3>
          <span>選項</span>
          {activeSchema?.parameters.size || activeSchema?.parameters.errors.length ? (
            <ResetButton title="恢復成預設值" onClick={resetParameters}>
              <FontAwesomeIcon icon={faRotateLeft} size="sm" />
            </ResetButton>
          ) : null}
        </h3>
        {activeSchema?.parameters.size ? (
          <Parameters>
            {activeSchema.parameters.render(parameters =>
              setState(actions.setSchemaParameters(activeSchemaName, parameters)),
            )}
          </Parameters>
        ) : (
          <NoParameters>此推導方案無可用自訂選項。</NoParameters>
        )}
        {activeSchema?.parameters.errors.length ? (
          <ParameterErrorHint>
            部分設定項目無法解析{" "}
            <button
              type="button"
              className="pure-button"
              onClick={() => notifyError("部分設定項目無法解析", activeSchema.parameters.errors.join("\n"))}>
              檢視問題詳情
            </button>
          </ParameterErrorHint>
        ) : null}
        <OptionsSeparator />
        {commonOptions}
      </Options>
      <CreateSchemaDialog
        ref={dialogRef}
        state={state}
        setState={setState}
        schemaLoaded={useCallback(schema => setState(actions.addSchema(schema)), [setState])}
        getDefaultFileName={getDefaultFileName}
        hasSchemaName={useCallback(name => !!schemas.find(schema => schema.name === name), [schemas])}
      />
      {createPortal(
        <DropContainer ref={dropContainerRef} isDragging={isDragging}>
          <DropArea>
            <div>將檔案拖曳至此</div>
          </DropArea>
        </DropContainer>,
        document.body,
      )}
    </>
  );
}
