import { ChangeEventHandler, forwardRef, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { faFile, faFileCode, faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ExplorerFolder from "./ExplorerFolder";
import Spinner from "./Spinner";
import actions from "../actions";
import Swal from "../Classes/SwalReact";
import { newFileTemplate, tshetUinhExamplesURLPrefix, UseMainState } from "../consts";
import samples from "../samples";
import { fetchFile, normalizeFileName } from "../utils";

import type { Folder, Sample, SchemaState } from "../consts";

const Container = styled.dialog`
  transform: scale(0.9);
  @starting-style {
    transform: scale(0.9);
  }
  &[open] {
    transform: scale(1);
  }
  &::backdrop {
    background-color: rgba(0, 0, 0, 0.4);
  }
`;
const Popup = styled.div`
  background-color: #f9fafb;
  display: grid;
  grid-template: auto 1fr auto auto / 1fr auto;
  // width: min(36vw + 360px, 960px, 100%); // with preview
  width: min(22vw + 360px, 960px, 100%); // without preview
  // gap: 1rem; // with preview
  row-gap: 1rem; // without preview
  height: calc(100% - 3rem);
  box-sizing: border-box;
  margin: auto;
  padding: 1rem 1.625rem;
  border-radius: 0.5rem;
  overflow: hidden;
  // @media (max-width: 720px) { // with preview
  @media (max-width: 640px) {
    width: 100%;
    margin-bottom: 0;
    border-radius: 1rem 1rem 0 0;
  }
`;
const Title = styled.h2`
  grid-area: 1 / 1 / 2 / 3;
  text-align: left;
  color: #111;
  margin: 0;
`;
const Explorer = styled.div`
  grid-area: 2 / 1 / 3 / 2;
  overflow-y: scroll;
  user-select: none;
  line-height: 1.625;
  background-color: white;
  color: #111;
  border: 1px solid #aaa;
  padding: 0.5rem;
  ul {
    padding: 0;
    margin: 0;
    margin-left: 2rem;
    list-style-type: none;
  }
  > ul {
    margin-left: 0;
  }
  div {
    display: flex;
    align-items: center;
  }
`;
const FileName = styled.div<{ selected: boolean }>`
  flex: 1;
  color: #333;
  margin-left: 0.125rem;
  padding: 0 0.125rem;
  ${({ selected }) =>
    selected &&
    css`
      background-color: #0078e7;
      color: white;
    `}
`;
const Preview = styled.div`
  grid-area: 2 / 2 / 3 / 3;
  color: #333;
`;
const PreviewFrame = styled.div`
  border: 1px solid #aaa;
  font-size: 3rem;
  height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;
const Description = styled.div`
  color: #555;
  margin: 1rem 0.25rem;
  align-items: center;
`;
const Metadata = styled.div`
  th {
    text-align: right;
    padding: 0 1rem 0 2rem;
  }
`;
const Action = styled.form`
  grid-area: 3 / 1 / 4 / 3;
  display: flex;
  align-items: center;
  button {
    margin: 0 0 0 0.5rem;
    padding: 0 1.1rem;
    height: 100%;
    transition:
      opacity 200ms,
      background-image 200ms;
  }
  &:invalid button[value="confirm"] {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`;
const Rename = styled.div`
  display: contents;
  .pure-form & label {
    display: contents;
    svg {
      color: #222;
      margin: 0 0.375rem 0 0.125rem;
    }
    input[type="text"] {
      display: block;
      width: 100%;
      height: 2.25rem;
      flex: 1;
      &:invalid {
        color: red;
        border-color: red;
      }
    }
  }
`;
const Validation = styled.div`
  grid-area: 4 / 1 / 5 / 3;
  font-size: 0.75rem;
  font-weight: bold;
  color: red;
  margin: -0.375rem 2.25rem -0.25rem;
  line-height: 1;
`;
const Loading = styled.div`
  grid-area: 1 / 1 / -1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(249, 250, 251, 0.6);
  margin: -2rem;
`;
const LoadModal = styled.div`
  margin-top: 3rem;
  color: #bbb;
`;

interface CreateSchemaDialogProps extends UseMainState {
  getDefaultFileName: (sample: Sample | "") => string;
  schemaLoaded: (schema: Omit<SchemaState, "parameters">) => void;
  hasSchemaName: (name: string) => boolean;
}

const CreateSchemaDialog = forwardRef<HTMLDialogElement, CreateSchemaDialogProps>(function CreateSchemaDialog(
  { state: { schemas }, setState, getDefaultFileName, schemaLoaded, hasSchemaName },
  ref,
) {
  const [createSchemaName, setCreateSchemaName] = useState(() => getDefaultFileName("") + ".js");
  const [createSchemaSample, setCreateSchemaSample] = useState<Sample | "">("");
  const [loading, setLoading] = useState(false);

  const resetDialog = useCallback(() => {
    setCreateSchemaName(getDefaultFileName("") + ".js");
    setCreateSchemaSample("");
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDefaultFileName, schemas]);
  useEffect(resetDialog, [resetDialog]);

  const validation = useMemo(() => {
    const name = normalizeFileName(createSchemaName);
    if (!name) return "檔案名稱為空";
    // eslint-disable-next-line no-control-regex
    if (/[\0-\x1f"*/:<>?\\|\x7f-\x9f]/.test(name)) return "檔案名稱含有特殊字元";
    if (hasSchemaName(name + ".js")) return "檔案名稱與現有檔案重複";
    return "";
  }, [createSchemaName, hasSchemaName]);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.setCustomValidity(validation);
  }, [validation]);

  function recursiveFolder(folder: Folder) {
    return Object.entries(folder).map(([name, sample]) => {
      return typeof sample === "string" ? (
        <li
          key={name}
          onClick={() => {
            const name = normalizeFileName(createSchemaName);
            if (!name || name === getDefaultFileName(createSchemaSample))
              setCreateSchemaName(getDefaultFileName(sample) + ".js");
            setCreateSchemaSample(sample);
          }}>
          <div>
            <FontAwesomeIcon icon={faFileCode} fixedWidth />
            <FileName selected={createSchemaSample === sample}>{name}</FileName>
          </div>
        </li>
      ) : (
        <ExplorerFolder key={name} name={name}>
          {recursiveFolder(sample)}
        </ExplorerFolder>
      );
    });
  }

  const addSchema = useCallback(async () => {
    setLoading(true);
    try {
      schemaLoaded({
        name: normalizeFileName(createSchemaName) + ".js",
        input: createSchemaSample
          ? await fetchFile(tshetUinhExamplesURLPrefix + createSchemaSample + ".js")
          : newFileTemplate,
      });
    } catch {
      setLoading(false);
    } finally {
      (ref as RefObject<HTMLDialogElement>).current?.close();
    }
  }, [createSchemaName, createSchemaSample, schemaLoaded, ref]);

  useEffect(() => {
    if (schemas.length) return;
    Swal.fire({
      html: (
        <LoadModal>
          <Spinner />
          <h2>載入中……</h2>
        </LoadModal>
      ),
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
    });
    (async () => {
      try {
        setState(
          actions.addSchema({
            name: "tupa.js",
            input: await fetchFile(tshetUinhExamplesURLPrefix + "tupa.js"),
          }),
        );
        Swal.close();
      } catch {
        setState(
          actions.addSchema({
            name: "untitled.js",
            input: newFileTemplate,
          }),
        );
      }
    })();
  }, [schemas, setState]);

  const inputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => setCreateSchemaName(event.target.value),
    [],
  );

  return createPortal(
    <Container ref={ref}>
      <Popup>
        <Title>新增方案</Title>
        <Explorer>
          <ul>
            <li
              onClick={() => {
                const name = normalizeFileName(createSchemaName);
                if (!name || name === getDefaultFileName(createSchemaSample))
                  setCreateSchemaName(getDefaultFileName("") + ".js");
                setCreateSchemaSample("");
              }}>
              <div>
                <FontAwesomeIcon icon={faFile} fixedWidth />
                <FileName selected={!createSchemaSample}>新增空白方案……</FileName>
              </div>
            </li>
            {recursiveFolder(samples)}
          </ul>
        </Explorer>
        {/* TODO preview disabled for now */}
        <Preview hidden>
          <PreviewFrame>
            <div>
              <ruby>
                遙<rp>(</rp>
                <rt lang="och-Latn-fonipa">eu</rt>
                <rp>)</rp>
              </ruby>
              <ruby>
                襟<rp>(</rp>
                <rt lang="och-Latn-fonipa">kim</rt>
                <rp>)</rp>
              </ruby>
              <ruby>
                甫<rp>(</rp>
                <rt lang="och-Latn-fonipa">pu</rt>
                <rp>)</rp>
              </ruby>
              <ruby>
                暢<rp>(</rp>
                <rt lang="och-Latn-fonipa">tyang</rt>
                <rp>)</rp>
              </ruby>
            </div>
          </PreviewFrame>
          <Description>eu kim pu tyang, it kyong sen pi.</Description>
          <Metadata>
            <table>
              <tbody>
                <tr>
                  <th>作者</th>
                  <td>nk2028</td>
                </tr>
                <tr>
                  <th>版本</th>
                  <td>0.0.0</td>
                </tr>
                <tr>
                  <th>日期</th>
                  <td>2028-01-01</td>
                </tr>
              </tbody>
            </table>
          </Metadata>
        </Preview>
        <Action method="dialog" className="pure-form">
          <Rename>
            <label>
              <FontAwesomeIcon icon={faPenToSquare} size="lg" />
              <input
                ref={inputRef}
                type="text"
                placeholder="輸入方案名稱……"
                value={createSchemaName}
                onChange={inputChange}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </label>
          </Rename>
          <button type="submit" className="pure-button" formNoValidate onClick={resetDialog}>
            取消
          </button>
          <button type="button" className="pure-button pure-button-primary" onClick={addSchema}>
            新增
          </button>
        </Action>
        <Validation>{validation || "\xa0"}</Validation>
        {loading && (
          <Loading>
            <Spinner />
          </Loading>
        )}
      </Popup>
    </Container>,
    document.body,
  );
});

export default CreateSchemaDialog;
