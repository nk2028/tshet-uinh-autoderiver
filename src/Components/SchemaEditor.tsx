import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useTranslation } from "react-i18next";

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
import {
  codeFontFamily,
  invalidCharsRegex,
  newFileTemplate,
  noop,
  sampleNamesMap,
  tshetUinhExamplesURLPrefix,
} from "../consts";
import "../editor/setup";
import {
  displaySchemaLoadingErrors,
  fetchFile,
  memoize,
  normalizeFileName,
  notifyError,
  settleAndGroupPromise,
  showLoadingModal,
} from "../utils";

import type { UseMainState, ReactNode, Sample } from "../consts";
import type { MouseEvent, MutableRefObject } from "react";

const TabBar = styled.div`
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
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
  min-height: 2rem;
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
  margin: 0.125rem 0 0.125rem 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  min-height: 1.75rem;
  padding: 0 0.5rem 0 0.375rem;
  gap: 0.25rem;
  font-size: 1rem;
  color: #555;
  transition: background-color 150ms;
  &:hover,
  &:focus {
    background-color: #ccc;
  }
  & > .fa-fw {
    width: 1em;
  }
`;
const EditorArea = styled.div`
  position: relative;
`;
const ResetButton = styled.button`
  transition: color 0.2s;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  &:hover,
  &:focus {
    color: #0078e7;
  }
  &.rotate svg {
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
  & div {
    font-size: initial;
    font-weight: initial;
  }
`;
const Parameters = styled.p`
  margin: 0.35rem 0 1rem;
`;
const NoParameters = styled.p`
  margin: 0.35rem 0 0.875rem;
  font-size: 0.875rem;
  color: #888;
  &:not(:lang(zh-HK)) {
    font-style: italic;
  }
`;
const ParameterErrorHint = styled.p`
  margin: -0.5rem 0 0.875rem;
  font-size: 0.875rem;
  color: red;
  gap: 0.5rem;
`;
const Divider = styled.div<{ isDragging: boolean }>`
  background-color: #c4c6c8;
  height: 0.2rem;
  position: relative;
  cursor: ns-resize;
  &::after {
    content: "";
    position: absolute;
    top: -0.1rem;
    bottom: -0.1rem;
    left: 0;
    right: 0;
    background-color: ${({ isDragging }) => (isDragging ? "#0078e7" : "transparent")};
    transition: background-color 150ms;
  }
  &:hover::after,
  &:focus::after {
    background-color: #0078e7;
  }
`;
const DividerShadow = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 6px;
  box-shadow: #ddd 0 -6px 6px -6px inset;
`;
const Options = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.17rem 1rem;
  overflow-y: auto;
`;
const OptionsTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0;
  gap: 1rem;
`;
const OptionsSeparator = styled.hr`
  margin: 0 -1rem;
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
  generalOptions: ReactNode;
  evaluateHandlerRef: MutableRefObject<() => void>;
}

export default function SchemaEditor({ state, setState, generalOptions, evaluateHandlerRef }: SchemaEditorProps) {
  const { t } = useTranslation();

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
      memoize((name: string) => {
        name = name ? name.replace(/^直接標註|^推導|《|》|（.*）|擬音$|轉寫$/g, "").trim() : t("app.defaultFileName");
        const indices = schemaNames
          .map(oldName => {
            if (oldName === name) return 0;
            if (!oldName.startsWith(name + "-")) return -1;
            const start = name.length + 1;
            for (let i = start; i < oldName.length; i++)
              if (oldName[i] < +(i === start) + "" || oldName[i] > "9") return -1;
            return +oldName.slice(start);
          })
          .sort((a, b) => a - b);
        indices[-1] = -1;
        let i = 0;
        while (indices[i] - indices[i - 1] <= 1) i++;
        return name + (~indices[i - 1] || "");
      }),
    [t],
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
      const { fulfilled: fileNamesAndContents, rejected: errors } = await settleAndGroupPromise(
        Array.from(files, async file => [file.name, await file.text()] as const),
      );
      setState(newState => {
        const currSchemaNames = schemas.map(({ name }) => name);
        for (const [name, content] of fileNamesAndContents) {
          // POSIX allows all characters other than `\0` and `/` in file names,
          // this is necessary to ensure that the file name is valid on all platforms.
          const formattedName = getDefaultFileNameWithSchemaNames(currSchemaNames)(
            normalizeFileName(name).replace(invalidCharsRegex, "_"),
          );
          currSchemaNames.push(formattedName);
          newState = actions.addSchema({ name: formattedName, input: content })(newState);
        }
        return newState;
      });
      return errors;
    },
    [schemas, setState, getDefaultFileNameWithSchemaNames],
  );

  useEffect(() => {
    async function loadSchemas() {
      const query = new URLSearchParams(location.search);
      history.replaceState(null, document.title, location.pathname); // Remove query
      const schemasToLoad: { type: "href" | "sample"; value: string }[] = [];
      for (const [key, value] of query) {
        switch (key) {
          case "script": {
            schemasToLoad.push({ type: "href", value });
            break;
          }
          case "schema": {
            schemasToLoad.push({ type: "sample", value });
            break;
          }
          default:
            break;
        }
      }
      if (!schemasToLoad.length && schemas.length) return;
      const abortController = new AbortController();
      const { signal } = abortController;
      showLoadingModal(abortController, schemasToLoad.length || 1);
      if (!schemasToLoad.length) {
        try {
          setState(
            actions.addSchema({
              name: sampleNamesMap.get("tupa")!,
              input: await fetchFile(tshetUinhExamplesURLPrefix + "tupa.js", signal),
            }),
          );
        } catch {
          setState(
            actions.addSchema({
              name: t("app.defaultFileName"),
              input: newFileTemplate,
            }),
          );
        }
        Swal.close();
        return;
      }
      const names = query.getAll("name");
      let i = 0;
      const { fulfilled: files, rejected: errors } = await settleAndGroupPromise(
        schemasToLoad.map(async ({ type, value }) => {
          let url: string | URL;
          let name: string;

          switch (type) {
            case "href": {
              // Adds a protocol if the input seems to lack one
              // This also prevents `example.com:` from being treated as a protocol if the input is `example.com:8080`
              url = new URL(/^[a-z]+:/i.test(value) ? value : `https://${value}`);
              name =
                i < names.length
                  ? names[i++] // Use user-specified name
                  : url.protocol === "data:"
                    ? "" // Let `getDefaultFileName` name it
                    : /([^/]*)\/*$/.exec(url.pathname)![1]; // Use the last segment of the path as name
              if (url.hostname === "github.com") {
                url.searchParams.append("raw", "true"); // Fetch raw file content for GitHub files
              } else if (url.hostname === "gist.github.com" && !url.pathname.endsWith("/raw")) {
                url.pathname += "/raw"; // Fetch raw file content for GitHub gists
              }
              break;
            }
            case "sample": {
              value = normalizeFileName(value);
              url = tshetUinhExamplesURLPrefix + value + ".js";
              const sampleName = sampleNamesMap.get(value as Sample);
              if (!sampleName) throw new Error(t("dialog.error.message.schema.sample.invalid") + value);
              name = i < names.length ? names[i++] : sampleName;
              break;
            }
          }

          const response = await fetch(url, {
            headers: {
              Accept: "text/javascript, text/plain", // githubusercontent.com always responses with `Content-Type: text/plain`
            },
            cache: "no-cache",
            signal,
          });
          if (!response.ok) throw new Error(await response.text());
          const blob = await response.blob();
          return new File([blob], name);
        }),
      );
      // The file names may be incorrect in strict mode, but are fine in production build
      errors.push(...(await addFilesToSchema(files)));
      // Add `tupa.js` if all fetches failed and no schemas present
      if (errors.length === schemasToLoad.length && !schemas.length) await loadSchemas();
      Swal.close();
      signal.aborted || displaySchemaLoadingErrors(errors, schemasToLoad.length);
    }
    loadSchemas();
  }, [schemas, setState, addFilesToSchema, t]);

  const deleteSchema = useCallback(
    async (name: string) => {
      if (
        (
          await Swal.fire({
            title: t("dialog.deleteSchema.title"),
            text: t("dialog.deleteSchema.message"),
            icon: "warning",
            showConfirmButton: false,
            focusConfirm: false,
            showDenyButton: true,
            showCancelButton: true,
            focusCancel: true,
            denyButtonText: t("dialog.action.confirm"),
            cancelButtonText: t("dialog.action.cancel"),
          })
        ).isDenied
      )
        setState(actions.deleteSchema(name));
    },
    [setState, t],
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
          const { fulfilled: files, rejected: errors } = await settleAndGroupPromise(
            handles.map(handle => handle.getFile()),
          );
          errors.push(...(await addFilesToSchema(files)));
          displaySchemaLoadingErrors(errors, handles.length);
        } catch (error) {
          if ((error as Error | null)?.name !== "AbortError") {
            notifyError(t("dialog.error.message.file.open"), error);
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
        const { files } = input;
        document.body.removeChild(input);
        files && displaySchemaLoadingErrors(await addFilesToSchema(files), files.length);
      });
      input.showPicker();
    }
  }, [addFilesToSchema, t]);

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
            notifyError(t("dialog.error.message.file.save"), error);
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
  }, [activeSchema, t]);

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
    document.body.classList.add("dragging");
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

      document.body.classList.remove("dragging");
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
    if (!name) return t("dialog.createSchema.schemaName.validation.empty");
    if (invalidCharsRegex.test(name)) return t("dialog.createSchema.schemaName.validation.invalidChars");
    if (hasSchemaName(name)) return t("dialog.createSchema.schemaName.validation.duplicate");
    return "";
  }

  async function mouseUp(name: string, { button }: { button: number }) {
    if (button === 1) deleteSchema(name);
    else if (button === 2) {
      const promise = Swal.fire({
        title: t("dialog.renameSchema.title"),
        input: "text",
        inputPlaceholder: t("dialog.createSchema.schemaName.placeholder"),
        inputValue: name,
        inputAttributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          spellcheck: "false",
        },
        showCancelButton: true,
        confirmButtonText: t("dialog.action.confirm"),
        cancelButtonText: t("dialog.action.cancel"),
      });
      const confirmButton = Swal.getConfirmButton() as HTMLButtonElement;
      confirmButton.disabled = true;
      confirmButton.style.pointerEvents = "none";
      const input = Swal.getInput() as HTMLInputElement;
      input.addEventListener("input", () => {
        const newName = normalizeFileName(input.value);
        const validation = validateFileName(newName);
        if (validation) {
          if (newName !== name) {
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
        if (!validateFileName(newName)) setState(actions.renameSchema(name, newName));
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
      const { files } = event.dataTransfer;
      displaySchemaLoadingErrors(await addFilesToSchema(files), files.length);
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

  const [isDividerDragging, setIsDividerDragging] = useState(false);
  function dividerDrag({ target, clientY }: { target: EventTarget; clientY: number }, isMouse?: boolean) {
    document.body.classList.add("dragging");
    document.body.style.cursor = "ns-resize";
    setIsDividerDragging(true);
    const dividerElement = target as HTMLDivElement;
    const container = dividerElement.parentElement!;
    const editorElement = container.children[2];

    const offsetY = clientY - dividerElement.getBoundingClientRect().top;

    function move(event: { clientY: number } | TouchEvent) {
      clientY = "clientY" in event ? event.clientY : (event.touches?.[0]?.clientY ?? clientY);
      const editorTop = editorElement.getBoundingClientRect().top;
      const numerator = clientY - offsetY - editorTop;
      const denominator =
        container.getBoundingClientRect().height - dividerElement.getBoundingClientRect().height - editorTop;
      setState(state => ({ ...state, optionPanelHeight: Math.min(Math.max(1 - numerator / denominator, 0.1), 0.9) }));
    }

    function end() {
      document.body.classList.remove("dragging");
      document.body.style.cursor = "";
      setIsDividerDragging(false);
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

  const [editorArea, setEditorArea] = useState<HTMLDivElement | null>(null);
  const [optionPanel, setOptionPanel] = useState<HTMLFormElement | null>(null);
  useLayoutEffect(() => {
    if (!editorArea || !optionPanel) return;
    function setOptionPanelHeight() {
      editorArea!.style.height =
        (1 - state.optionPanelHeight) *
          (editorArea!.getBoundingClientRect().height + optionPanel!.getBoundingClientRect().height) +
        "px";
    }
    setOptionPanelHeight();
    addEventListener("resize", setOptionPanelHeight);
    return () => {
      removeEventListener("resize", setOptionPanelHeight);
    };
  }, [editorArea, optionPanel, state.optionPanelHeight]);

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
            <DeleteButton title={t("action.deleteSchema")} onClick={() => deleteSchema(name)}>
              <FontAwesomeIcon icon={faXmark} size="sm" fixedWidth />
            </DeleteButton>
            <Separator visible={activeSchemaName !== schemas[index + 1]?.name && activeSchemaName !== name} />
          </Tab>
        ))}
        <CreateSchemaButton onClick={createSchema.current}>
          <FontAwesomeIcon icon={faPlus} fixedWidth />
          <div>{t("action.createSchema")}</div>
        </CreateSchemaButton>
      </TabBar>
      <EditorArea ref={setEditorArea} lang="en-x-code">
        <Editor
          path={activeSchema?.name || ""}
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
                label: t("action.editor.createFile"),
                // Ctrl/Cmd + N cannot be overridden in browsers
                keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyN],
                run() {
                  createSchema.current();
                },
              });
              editor.addAction({
                id: "delete-file",
                label: t("action.editor.deleteFile"),
                // Ctrl/Cmd + W cannot be overridden in browsers
                keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyW],
                run() {
                  deleteActiveSchema.current();
                },
              });
              editor.addAction({
                id: "open-file-from-disk",
                label: t("action.editor.openFileFromDisk"),
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO],
                run() {
                  openFileFromDisk.current();
                },
              });
              editor.addAction({
                id: "save-file-to-disk",
                label: t("action.editor.saveFileToDisk"),
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
            [saveFileToDisk, evaluateHandlerRef, t],
          )}
          onChange={useCallback(
            input => {
              if (typeof input !== "undefined" && activeSchema)
                setState(actions.setSchemaInput(activeSchemaName, input));
            },
            [activeSchema, activeSchemaName, setState],
          )}
        />
        <DividerShadow />
      </EditorArea>
      <Divider
        isDragging={isDividerDragging}
        onMouseDown={event => dividerDrag(event, true)}
        onTouchStart={event => dividerDrag(event.touches[0])}
      />
      <Options ref={setOptionPanel} className="pure-form">
        <OptionsTitle>
          <span>{t("options.title")}</span>
          {activeSchema?.parameters.size || activeSchema?.parameters.errors.length ? (
            <ResetButton onClick={resetParameters}>
              <FontAwesomeIcon icon={faRotateLeft} size="sm" />
              <div>{t("options.general.resetAllOptions")}</div>
            </ResetButton>
          ) : null}
        </OptionsTitle>
        {activeSchema?.parameters.size ? (
          <Parameters>
            {activeSchema.parameters.render(parameters =>
              setState(actions.setSchemaParameters(activeSchemaName, parameters)),
            )}
          </Parameters>
        ) : (
          <NoParameters>{t("options.parameters.noneRequired")}</NoParameters>
        )}
        {activeSchema?.parameters.errors.length ? (
          <ParameterErrorHint>
            {t("options.parameters.validation.unparsable")}
            <button
              type="button"
              className="pure-button pure-button-danger-secondary"
              onClick={() =>
                notifyError(t("options.parameters.validation.unparsable"), activeSchema.parameters.errors.join("\n"))
              }>
              {t("options.parameters.validation.unparsable.showDetails")}
            </button>
          </ParameterErrorHint>
        ) : null}
        <OptionsSeparator />
        {generalOptions}
      </Options>
      <CreateSchemaDialog
        ref={dialogRef}
        schemaLoaded={useCallback(schema => setState(actions.addSchema(schema)), [setState])}
        getDefaultFileName={getDefaultFileName}
        hasSchemaName={useCallback(name => !!schemas.find(schema => schema.name === name), [schemas])}
      />
      {createPortal(
        <DropContainer ref={dropContainerRef} isDragging={isDragging}>
          <DropArea>
            <div>{t("action.loadSchemaByDragAndDrop")}</div>
          </DropArea>
        </DropContainer>,
        document.body,
      )}
    </>
  );
}
