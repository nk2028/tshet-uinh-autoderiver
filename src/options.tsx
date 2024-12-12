import { Fragment } from "react";

import { 資料, 音韻地位 } from "tshet-uinh";
import Yitizi from "yitizi";

import styled from "@emotion/styled";

import CustomElement from "./Classes/CustomElement";
import Ruby from "./Components/Ruby";
import Table from "./Components/Table";
import TooltipChar from "./Components/TooltipChar";
import { noop } from "./consts";

import i18n from "./i18n";
import type { CustomNode } from "./Classes/CustomElement";
import type { Entry, MainState, Option, ReactNode, SchemaState } from "./consts";

const Title = styled.h3`
  padding: 0 0 1rem 0.25rem;
`;

const 所有地位 = Array.from(資料.iter音韻地位());
type Deriver = (音韻地位: 音韻地位, 字頭?: string | null) => CustomNode[];
type Handler = (state: MainState, callDeriver: Deriver) => ReactNode;

function title(schemas: SchemaState[]) {
  return schemas.map(({ name }) => name);
}

function serialize(callDeriver: Deriver): [string, CustomNode[]][] {
  return 所有地位.map(音韻地位 => callDeriver(音韻地位)).map(擬音陣列 => [CustomElement.stringify(擬音陣列), 擬音陣列]);
}

function iterate(callDeriver: Deriver) {
  return 所有地位.map(音韻地位 => {
    const 各條目 = 資料.query音韻地位(音韻地位);
    const 代表字 = 各條目.find(({ 來源 }) => 來源?.文獻 === "廣韻")?.字頭 ?? 各條目[0]?.字頭;
    return {
      描述: 音韻地位.描述,
      擬音陣列: callDeriver(音韻地位),
      代表字,
    };
  });
}

function finalize(result: ReturnType<typeof iterate>) {
  return result.map(({ 描述, 擬音陣列, 代表字 }) => [描述, ...wrap(擬音陣列), 代表字 || ""]);
}

function wrap(擬音陣列: CustomNode[]) {
  return CustomElement.render(擬音陣列).map((擬音, index) => (
    <span key={index} lang="och-Latn-fonipa">
      {擬音}
    </span>
  ));
}

let presetArticle = "";

export function getArticle() {
  return presetArticle;
}

export function setArticle(article: string) {
  presetArticle = article;
}

type ArticleListener = (syncedArticle: string[]) => void;
let articleListener: ArticleListener = noop;
export function listenArticle(listener: ArticleListener) {
  articleListener = listener;
}

export const evaluateOption: Record<Option, Handler> = {
  convertArticle({ article, convertVariant }, callDeriver) {
    const syncedArticle: string[] = [];
    const result: ReactNode[] = [];
    const chs = Array.from(article);

    for (let i = 0; i < chs.length; i++) {
      let pushed = false;
      const ch = chs[i];
      const 所有異體字 = [ch, null].concat(Yitizi.get(ch));
      const entries: Entry[] = [];
      let preselected = -1;

      for (const 字頭 of 所有異體字) {
        if (!字頭) {
          if (convertVariant) continue;
          if (!entries.length) continue;
          break;
        }
        for (const 條目 of 資料.query字頭(字頭)) {
          const { 音韻地位 } = 條目;
          const 擬音 = callDeriver(音韻地位, 字頭);
          let entry = entries.find(key => CustomElement.isEqual(key.擬音, 擬音));
          if (!entry) entries.push((entry = { 擬音, 結果: [] }));
          entry.結果.push(條目);
        }
      }

      if (chs[i + 1] === "(") {
        let j = i;
        while (chs[++j] !== ")" && j < chs.length);

        if (j < chs.length) {
          const 描述 = chs.slice(i + 2, j).join("");
          const 地位 = (() => {
            try {
              return 音韻地位.from描述(描述, true);
            } catch {
              return undefined;
            }
          })();
          if (地位) {
            preselected = entries.findIndex(({ 結果 }) => 結果.some(({ 音韻地位 }) => 音韻地位.等於(地位)));
            if (preselected === -1) {
              const 擬音 = callDeriver(地位, ch);
              preselected = entries.findIndex(key => CustomElement.isEqual(key.擬音, 擬音));
              if (preselected === -1) preselected = entries.push({ 擬音, 結果: [] }) - 1;
              entries[preselected].結果.push({ 字頭: ch, 釋義: "", 音韻地位: 地位 });
            }
            syncedArticle.push(chs.slice(i, j + 1).join(""));
            i = j;
            pushed = true;
          }
        }
      }
      if (!pushed) syncedArticle.push(chs[i]);
      const id = syncedArticle.length - 1;
      result.push(entries.length ? <TooltipChar key={id} {...{ id, ch, entries, preselected }} /> : ch);
    }
    articleListener(syncedArticle);
    return result;
  },

  convertPresetArticle(_, callDeriver) {
    return presetArticle.split("\n\n").map((passage, index) => (
      <Fragment key={index}>
        {passage.split("\n").map((line, index) => {
          const output: ReactNode[] = [];
          const chs = Array.from(line);

          for (let i = 0; i < chs.length; i++) {
            if (chs[i + 1] === "(") {
              const j = i;
              while (chs[++i] !== ")" && i < chs.length);

              const 字頭 = chs[j];
              const 描述 = chs.slice(j + 2, i).join("");
              const 地位 = 音韻地位.from描述(描述);
              const 擬音 = callDeriver(地位, 字頭);

              output.push(<Ruby key={i} rb={字頭} rt={CustomElement.render(擬音)} />);
            } else output.push(chs[i]);
          }

          const Tag = index ? "p" : "h3";
          return (
            <Fragment key={index}>
              <Tag>{output}</Tag>
              <span hidden>{"\n"}</span>
            </Fragment>
          );
        })}
        <span hidden>{"\n"}</span>
      </Fragment>
    ));
  },

  exportAllPositions({ schemas }, callDeriver) {
    return <Table head={["音韻地位", ...title(schemas), "代表字"]} body={finalize(iterate(callDeriver))} />;
  },

  exportAllSyllables({ schemas }, callDeriver) {
    return <Table head={title(schemas)} body={Array.from(new Map(serialize(callDeriver)).values()).map(wrap)} />;
  },

  exportAllSyllablesWithCount({ schemas }, callDeriver) {
    type Data = [serialized: string, 擬音陣列: CustomNode[], count: number];
    const result: Data[] = [];
    serialize(callDeriver)
      .sort(([a], [b]) => +(a > b) || -(a < b))
      .reduce<Data | null>((previous, [serialized, 擬音陣列]) => {
        if (previous && previous[0] === serialized) {
          previous[2]++;
          return previous;
        }
        const temp: Data = [serialized, 擬音陣列, 1];
        result.push(temp);
        return temp;
      }, null);
    return (
      <Table
        head={[...title(schemas), "計數"]}
        body={result.sort((a, b) => b[2] - a[2]).map(([, 擬音陣列, count]) => [...wrap(擬音陣列), count + ""])}
      />
    );
  },

  compareSchemas({ schemas }, callDeriver) {
    const result = iterate(callDeriver).filter(({ 擬音陣列 }) =>
      擬音陣列.some(擬音 => !CustomElement.isEqual(擬音, 擬音陣列[0])),
    );
    return result.length ? (
      <>
        <Title>
          {i18n.t("schemaCompareDifferent", { count: result.length })}
          <span hidden>{"\n\n"}</span>
        </Title>
        <Table
          head={[i18n.t("phonologicalPosition"), ...title(schemas), i18n.t("representativeCharacter")]}
          body={finalize(result)}
        />
      </>
    ) : (
      <h3>{i18n.t("schemaCompareSame")}</h3>
    );
  },
};
