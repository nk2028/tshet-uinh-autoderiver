import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useTranslation } from "react-i18next";

import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { faFile, faFileCode } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ExplorerFolder from "./ExplorerFolder";
import Spinner from "./Spinner";
import { invalidCharsRegex, newFileTemplate, tshetUinhExamplesURLPrefix } from "../consts";
import { localizedSampleCategoryName, localizedSampleName, samples } from "../samples";
import { fetchFile, normalizeFileName, stopPropagation } from "../utils";

import type { ChangeEventHandler, FormEvent, RefObject } from "react";

import type { SchemaState } from "../consts";
import type { SampleDirTree, SampleId } from "../samples";

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
  outline: none;
  ul {
    padding: 0;
    margin: 0;
    margin-left: 2rem;
    list-style-type: none;
  }
  > ul {
    margin-left: 0;
  }
`;
const SchemaItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  * {
    transition:
      color 100ms,
      background-color 100ms;
  }
  &:hover *,
  &:focus * {
    color: #0078e7;
  }
`;
const SchemaName = styled.div<{ selected: boolean }>`
  flex: 1;
  color: #333;
  margin-left: 0.125rem;
  padding: 0 0.125rem;
  ${({ selected }) =>
    selected &&
    css`
      background-color: #0078e7;
      color: white !important;
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
  // Ensure specificity
  button[type] {
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
    div {
      margin-right: 0.5rem;
    }
    input[type="text"] {
      display: block;
      width: 100%;
      height: 2.25rem;
      margin: 0;
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
  margin: -0.375rem 0 -0.25rem;
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

interface CreateSchemaDialogProps {
  getDefaultFileName(sample: string): string;
  schemaLoaded(schema: Omit<SchemaState, "parameters">): void;
  hasSchemaName(name: string): boolean;
}

const CreateSchemaDialog = forwardRef<HTMLDialogElement, CreateSchemaDialogProps>(function CreateSchemaDialog(
  { getDefaultFileName, schemaLoaded, hasSchemaName },
  ref,
) {
  const { t } = useTranslation();

  const [createSchemaName, setCreateSchemaName] = useState(getDefaultFileName(""));
  const [createSchemaSample, setCreateSchemaSample] = useState<SampleId | "">("");
  const [loading, setLoading] = useState(false);

  const resetDialog = useCallback(() => {
    setCreateSchemaName(getDefaultFileName(""));
    setCreateSchemaSample("");
    setLoading(false);
  }, [getDefaultFileName]);
  useEffect(resetDialog, [resetDialog]);

  const validation = useMemo(() => {
    const name = normalizeFileName(createSchemaName);
    if (!name) return t("dialog.createSchema.schemaName.validation.empty");
    if (invalidCharsRegex.test(name)) return t("dialog.createSchema.schemaName.validation.invalidChars");
    if (hasSchemaName(name)) return t("dialog.createSchema.schemaName.validation.duplicate");
    return "";
  }, [createSchemaName, hasSchemaName, t]);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.setCustomValidity(validation);
  }, [validation]);

  function sampleDirTree(tree: SampleDirTree) {
    return tree.map(entry => {
      if (typeof entry === "string") {
        const name = localizedSampleName(entry);
        return (
          <li key={entry}>
            <SchemaItem
              onClick={() => {
                setCreateSchemaName(getDefaultFileName(name));
                setCreateSchemaSample(entry);
              }}>
              <FontAwesomeIcon icon={faFileCode} fixedWidth />
              <SchemaName selected={createSchemaSample === entry}>{name}</SchemaName>
            </SchemaItem>
          </li>
        );
      } else {
        const [name, ...entries] = entry;
        return (
          <ExplorerFolder key={name} name={localizedSampleCategoryName(name)}>
            {sampleDirTree(entries)}
          </ExplorerFolder>
        );
      }
    });
  }

  const closeDialog = useCallback(() => {
    (ref as RefObject<HTMLDialogElement>).current?.close();
  }, [ref]);

  const addSchema = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      try {
        schemaLoaded({
          name: normalizeFileName(createSchemaName),
          input: createSchemaSample
            ? await fetchFile(tshetUinhExamplesURLPrefix + createSchemaSample + ".js")
            : newFileTemplate,
        });
      } catch {
        setLoading(false);
      } finally {
        closeDialog();
      }
    },
    [createSchemaName, createSchemaSample, schemaLoaded, closeDialog],
  );

  const inputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => setCreateSchemaName(event.target.value),
    [],
  );

  return createPortal(
    <Container ref={ref} onClick={closeDialog} onClose={resetDialog}>
      <Popup onClick={stopPropagation}>
        <Title>{t("dialog.createSchema.title")}</Title>
        <Explorer>
          <ul>
            <li>
              <SchemaItem
                onClick={() => {
                  setCreateSchemaName(getDefaultFileName(""));
                  setCreateSchemaSample("");
                }}>
                <FontAwesomeIcon icon={faFile} fixedWidth />
                <SchemaName selected={!createSchemaSample}>{t("dialog.createSchema.addBlank")}</SchemaName>
              </SchemaItem>
            </li>
            {sampleDirTree(samples)}
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
        <Action method="dialog" className="pure-form" onSubmit={addSchema}>
          <Rename>
            <label>
              <div>{t("dialog.createSchema.schemaName.label")}</div>
              <input
                ref={inputRef}
                type="text"
                placeholder={t("dialog.createSchema.schemaName.placeholder")}
                value={createSchemaName}
                onChange={inputChange}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </label>
          </Rename>
          <button type="reset" className="pure-button" onClick={closeDialog}>
            {t("dialog.action.cancel")}
          </button>
          <button type="submit" className="pure-button pure-button-primary">
            {t("dialog.action.create")}
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
