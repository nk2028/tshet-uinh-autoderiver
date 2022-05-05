import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { faFile, faFileCode, faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { qieyunExamplesURLPrefix } from "../consts";
import samples from "../samples";
import { fetchFile, normalizeFileName } from "../utils";
import ExplorerFolder from "./ExplorerFolder";
import Spinner from "./Spinner";

import type { Folder, Sample, SchemaState } from "../consts";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  box-sizing: border-box;
  transition: background-color 0.2s;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  z-index: 1024;
  @media (max-width: 720px) {
    padding: 0;
  }
`;
const Popup = styled.div`
  display: grid;
  grid-template: auto 1fr auto auto / 1fr auto;
  width: min(36vw + 360px, 960px, 100%);
  height: 100%;
  padding: 0;
  overflow: hidden;
  // overflow-y: scroll;
  @media (max-width: 720px) {
    width: 100%;
    border-radius: 0;
  }
`;
const Title = styled.h2`
  grid-area: 1 / 1 / 2 / 3;
  text-align: left;
  color: #111;
`;
const Explorer = styled.div`
  grid-area: 2 / 1 / 3 / 2;
  overflow-y: scroll;
  user-select: none;
  line-height: 1.625;
  color: #111;
  border: 1px solid #aaa;
  margin: 1rem 0 1rem 1.6rem;
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
  margin: 1rem 1.6rem 1rem 1rem;
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
const Action = styled.div`
  grid-area: 3 / 1 / 4 / 3;
  display: flex;
  align-items: center;
  margin: 0 1.6rem;
  button {
    margin: 0 0 0 0.5rem;
    padding: 0 1.1rem;
    height: 100%;
    transition: opacity 200ms, background-image 200ms;
    &:disabled {
      opacity: 0.8;
      pointer-events: none;
    }
  }
`;
const Rename = styled.div<{ invalid: boolean }>`
  display: contents;
  form {
    display: contents;
  }
  label {
    display: contents;
  }
  svg {
    color: #222;
    margin: 0 0.375rem 0 0.125rem;
  }
  input[type="text"] {
    display: block;
    width: 100%;
    height: 2.25rem;
    flex: 1;
    ${({ invalid }) =>
      invalid &&
      css`
        border-color: red;
      `}
  }
`;
const Validation = styled.div`
  grid-area: 4 / 1 / 5 / 3;
  font-size: 0.75rem;
  color: red;
  margin: 0.625rem 3.85rem;
  line-height: 1;
`;
const Loading = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.6);
`;

interface CreateSchemaDialogProps {
  visible: boolean;
  uncancellable: boolean;
  closeDialog: () => void;
  getDefaultFileName: (sample: Sample | "") => string;
  schemaLoaded: (schema: Omit<SchemaState, "parameters">) => void;
  hasSchemaName: (name: string) => boolean;
}

export default function CreateSchemaDialog({
  visible,
  uncancellable,
  closeDialog,
  getDefaultFileName,
  schemaLoaded,
  hasSchemaName,
}: CreateSchemaDialogProps) {
  const [createSchemaName, setCreateSchemaName] = useState(() => getDefaultFileName("") + ".js");
  const [createSchemaSample, setCreateSchemaSample] = useState<Sample | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCreateSchemaName(getDefaultFileName("") + ".js");
    setCreateSchemaSample("");
    setLoading(false);
  }, [visible]);

  const validation = useMemo(() => {
    const name = normalizeFileName(createSchemaName);
    if (!name) return "檔案名稱為空";
    if (/[\0-\037"*/:<>?\\|\177-\237]/.test(name)) return "檔案名稱含有特殊字元";
    if (hasSchemaName(name + ".js")) return "檔案名稱與現有檔案重複";
    return "";
  }, [createSchemaName]);

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
        input: createSchemaSample && (await fetchFile(qieyunExamplesURLPrefix + createSchemaSample + ".js")),
      });
    } catch {
      setLoading(false);
    }
  }, [createSchemaName, createSchemaSample]);

  const inputChange = useCallback(event => setCreateSchemaName(event.target.value), []);

  return visible
    ? createPortal(
        <Container className="swal2-center swal2-backdrop-show">
          <Popup className="swal2-popup swal2-modal" tabIndex={-1} role="dialog" aria-live="assertive" aria-modal>
            <Title className="swal2-title">新增方案</Title>
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
            <Preview>
              <PreviewFrame>
                <div>
                  <ruby>
                    遙<rp>(</rp>
                    <rt lang="och-Latn-fonipa">yeu</rt>
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
                    <rt lang="och-Latn-fonipa">chang</rt>
                    <rp>)</rp>
                  </ruby>
                </div>
              </PreviewFrame>
              <Description>yeu kim pu chang, it kyong sen pi.</Description>
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
            <Action>
              <Rename invalid={!!validation}>
                <form className="pure-form">
                  <label>
                    <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                    <input
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
                </form>
              </Rename>
              <button className="swal2-cancel swal2-styled" disabled={uncancellable} onClick={closeDialog}>
                取消
              </button>
              <button className="swal2-confirm swal2-styled" disabled={!!validation} onClick={addSchema}>
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
        document.body
      )
    : null;
}
