import * as Qieyun from "qieyun";
import { 音韻地位 as class音韻地位, 資料 } from "qieyun";
import { 推導方案 } from "tshet-uinh-deriver-tools";
import type { 推導函數, 原始推導函數 } from "tshet-uinh-deriver-tools";

import React from "react";
import Yitizi from "yitizi";
import LargeTooltip from "./large-tooltip";
import Entry from "./Entry";
import SchemaEditor from "./SchemaEditor";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const { query字頭, iter音韻地位, query音韻地位 } = 資料;

function get代表字(地位: class音韻地位): string[] {
  const by反切 = new Map();
  for (const { 字頭, 反切 } of query音韻地位(地位)) {
    if (!by反切.has(反切)) {
      by反切.set(反切, 字頭);
    }
  }
  return Array.from(by反切.values());
}

const SwalReact = withReactContent(Swal);

function notifyError(msg: string, err?: unknown) {
  if (!(err instanceof Error)) {
    throw err;
  }
  if (err?.stack)
    SwalReact.fire({
      showClass: { popup: "" },
      hideClass: { popup: "" },
      icon: "error",
      title: "錯誤",
      customClass: "error-with-stack" as any,
      html: (
        <>
          <p>{msg}</p>
          <pre lang="en-x-code">{err.stack.replace(/\n +at eval[^]+/, "")}</pre>
        </>
      ),
      confirmButtonText: "確定",
    });
  else
    Swal.fire({
      showClass: { popup: "" },
      hideClass: { popup: "" },
      icon: "error",
      title: "錯誤",
      text: msg,
      confirmButtonText: "確定",
    });
}

function copyFailed() {
  notifyError("瀏覽器不支援匯出至剪貼簿，操作失敗");
}

function copySuccess() {
  Swal.fire({
    showClass: { popup: "" },
    hideClass: { popup: "" },
    icon: "success",
    title: "成功",
    text: "已成功匯出至剪貼簿",
    confirmButtonText: "確定",
  });
}

function copyFallback(txt: string) {
  const textArea = document.createElement("textarea");
  textArea.value = txt;
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy") ? copySuccess() : copyFailed();
  } catch (err) {
    copyFailed();
  }
  document.body.removeChild(textArea);
}

export const schemas = {
  tupa: "切韻拼音",
  baxter: "白一平轉寫",
  blankego: "有女羅馬字",
  kyonh: "古韻羅馬字",
  zyepheng: "隋拼",
  sliark_peengqvim: "Sliark 拼音",
  panwuyun: "潘悟雲擬音",
  unt: "unt 切韻擬音",
  msoeg_v8: "msoeg 中古拟音 V8",
  mid_tang: "推導盛中唐擬音",
  chiangxhua: "推導《聲音唱和圖》擬音",
  fanwan: "推導《分韻撮要》擬音",
  putonghua: "推導普通話",
  gwongzau: "推導廣州音",
  zaonhe: "推導上海話",
  langjin: "推導南京話",
  taibu: "推導大埔話",
  ayaka_v8: "綾香思考音系",
};

const options = {
  convertArticle: "從輸入框中讀取文章，並注音",
  convertPresetArticle: "為預設文章注音",
  exportAllSmallRhymes: "導出所有小韻",
  exportAllSyllables: "導出所有音節",
  exportAllSyllablesWithCount: "導出所有音節，並計數",
};

type Schema = keyof typeof schemas;
type Option = keyof typeof options;

interface MainState {
  schemas: SchemaState[];
  article: string;
  option: Option;
  convertVariant: boolean;
  autocomplete: boolean;
  output: JSX.Element[];
  isApplied: boolean;
}

export interface SchemaState {
  name: Schema;
  input: string;
  original: string;
  parameters: Parameter;
  id: number;
}

export type Entries = [string[], { 字頭: string; 反切: string | null; 解釋: string; 音韻地位: class音韻地位 }[]][];

export type Parameter = { [parameter: string]: any };

export function fetchFile(input: string, callback: (text: string) => void) {
  fetch(input)
    .then(response => response.text())
    .then(callback)
    .catch(err => notifyError("載入檔案失敗", err));
}

function schemaCopy(): SchemaState {
  return { name: "tupa", input: "", original: "", parameters: {}, id: +new Date() };
}

export function joinWithBr(array: (string | JSX.Element)[]) {
  return array.map((item, index) => (
    <React.Fragment key={index}>
      {index !== 0 && <br />}
      {item}
    </React.Fragment>
  ));
}

let presetArticle: string;

class Main extends React.Component<any, MainState> {
  largeTooltip?: any;

  outputArea?: HTMLElement;

  constructor(props: any) {
    super(props);

    const schemaNames: Schema[] = JSON.parse(localStorage.getItem("schemas") || "[]");
    const schemaInputs: string[] = JSON.parse(localStorage.getItem("inputs") || "[]");
    const schemaParameters: Parameter[] = JSON.parse(localStorage.getItem("parameters") || "[]");

    this.state = {
      schemas: schemaNames.length
        ? schemaNames.map((name, id) => ({
            name,
            input: schemaInputs[id],
            original: "",
            parameters: schemaParameters[id],
            id,
          }))
        : [schemaCopy()],
      article:
        localStorage.getItem("article") ||
        "遙襟甫暢，逸興遄飛。爽籟發而清風生，纖歌凝而白雲遏。睢園綠竹，氣凌彭澤之樽；鄴水朱華，光照臨川之筆。" +
          "四美具，二難并。窮睇眄於中天，極娛遊於暇日。天高地迥，覺宇宙之無窮；興盡悲來，識盈虛之有數。望長安於日下，目吳會於雲間。" +
          "地勢極而南溟深，天柱高而北辰遠。關山難越，誰悲失路之人。萍水相逢，盡是他鄉之客。懷帝閽而不見，奉宣室以何年？",
      option: (localStorage.getItem("option") as Option) || "convertArticle",
      convertVariant: localStorage.getItem("convertVariant") === "true",
      autocomplete: localStorage.getItem("autocomplete") !== "false",
      output: [],
      isApplied: false,
    };
  }

  componentDidMount() {
    this.largeTooltip = LargeTooltip.init();
  }

  handlePredefinedOptions() {
    const id = +new Date() + ":";

    let userInputs: 推導函數<string>[];
    const parameters = this.state.schemas.map(({ parameters }) => {
      const pass = { ...parameters };
      Object.keys(pass).forEach(key => {
        if (Array.isArray(pass[key])) pass[key] = pass[key][0];
      });
      return pass;
    });

    let callDeriver = (音韻地位: class音韻地位, 字頭: string | null) => {
      try {
        return userInputs.map(input => input(音韻地位, 字頭));
      } catch (err) {
        notifyError(
          字頭
            ? `推導「${字頭}」字（音韻地位：${音韻地位.描述}）時發生錯誤`
            : `推導「${音韻地位.描述}」音韻地位（字為 null）時發生錯誤`,
          err
        );
        throw err;
      }
    };

    if (this.state.option === "convertPresetArticle" && !presetArticle) {
      fetchFile("https://cdn.jsdelivr.net/gh/nk2028/qieyun-text-label@main/index.txt", article => {
        presetArticle = article;
        this.handlePredefinedOptions();
      });
      return;
    }

    let handles = {
      convertArticle: () =>
        Array.from(this.state.article).map((ch, i) => {
          const 所有異體字 = [ch].concat(this.state.convertVariant ? Yitizi.get(ch) : []);
          const entries: Entries = [];

          for (const 字頭 of 所有異體字) {
            for (const { 音韻地位, 反切, 解釋 } of query字頭(字頭)) {
              let 擬音 = callDeriver(音韻地位, 字頭);
              const entry = entries.find(key => key[0].every((pronunciation, i) => pronunciation === 擬音[i]));
              if (entry) entry[1].push({ 字頭, 反切, 解釋, 音韻地位 });
              else entries.push([擬音, [{ 字頭, 反切, 解釋, 音韻地位 }]]);
            }
          }
          return <Entry key={id + i} ch={ch} entries={entries} tooltip={this.largeTooltip}></Entry>;
        }),

      convertPresetArticle: () =>
        presetArticle.split("\n\n").map((passage, i) => (
          <React.Fragment key={i}>
            {passage.split("\n").map((line, key) => {
              let output: React.ReactElement[] = [];
              const chs = Array.from(line);

              for (let i = 0; i < chs.length; i++) {
                if (chs[i + 1] === "(") {
                  const j = i;
                  while (chs[++i] !== ")" && i < chs.length);

                  const 字頭 = chs[j];
                  const 描述 = chs.slice(j + 2, i).join("");
                  const 音韻地位 = class音韻地位.from描述(描述);
                  const 擬音 = callDeriver(音韻地位, 字頭);

                  output.push(
                    <ruby key={id + j}>
                      {字頭}
                      <rp>(</rp>
                      <rt lang="och-Latn-fonipa">{joinWithBr(擬音)}</rt>
                      <rp>)</rp>
                    </ruby>
                  );
                } else output.push(<React.Fragment key={id + i}>{chs[i]}</React.Fragment>);
              }

              return React.createElement(key ? "p" : "h3", { key }, output);
            })}
          </React.Fragment>
        )),

      exportAllSmallRhymes: () =>
        Array.from(iter音韻地位()).map((音韻地位, i) => {
          const 代表字s = get代表字(音韻地位);
          return (
            <p key={id + i}>
              {音韻地位.描述} <span lang="och-Latn-fonipa">{callDeriver(音韻地位, 代表字s[0]).join(" / ")}</span>{" "}
              {代表字s.join("")}
            </p>
          );
        }),

      exportAllSyllables: () => [
        <span lang="och-Latn-fonipa" key={id + 0}>
          {Array.from(
            new Set(Array.from(iter音韻地位()).map(音韻地位 => callDeriver(音韻地位, null).join(" / ")))
          ).join(", ")}
        </span>,
      ],

      exportAllSyllablesWithCount: () => [
        <span lang="och-Latn-fonipa" key={id + 0}>
          {Array.from(
            Array.from(iter音韻地位()).reduce((counter, 音韻地位) => {
              const 擬音 = callDeriver(音韻地位, null).join(" / ");
              counter.set(擬音, -~counter.get(擬音));
              return counter;
            }, new Map())
          )
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => `${k} (${v})`)
            .join(", ")}
        </span>,
      ],
    };

    try {
      userInputs = this.state.schemas.map(({ input }, i) =>
        new 推導方案(
          // eslint-disable-next-line no-new-func
          new Function("Qieyun", "選項", "音韻地位", "字頭", input).bind(null, Qieyun) as 原始推導函數<string>
        )(parameters[i])
      );
    } catch (err) {
      notifyError("程式碼錯誤", err);
      return;
    }
    try {
      this.setState({ output: handles[this.state.option](), isApplied: true });
    } catch (err) {}
  }

  handleCopy() {
    const txt = this.outputArea?.textContent;
    if (txt) {
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(copySuccess, () => copyFallback(txt));
      else copyFallback(txt);
    } else notifyError("請先進行操作，再匯出結果");
  }

  scrollToOutput(element: HTMLElement) {
    this.outputArea = element;
    if (this.state.isApplied) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      this.setState({ isApplied: false });
    }
  }

  render() {
    const changeValue = (key: keyof MainState, value: any) => {
      this.setState({ [key]: value } as MainState, () => {
        localStorage.setItem(key, this.state[key] + "");
      });
    };

    const storeSchemas = () => {
      localStorage.setItem("schemas", JSON.stringify(this.state.schemas.map(schema => schema.name)));
      localStorage.setItem("inputs", JSON.stringify(this.state.schemas.map(schema => schema.input)));
      localStorage.setItem("parameters", JSON.stringify(this.state.schemas.map(schemas => schemas.parameters)));
    };

    const addSchema = (id: number | null) => {
      this.setState(({ schemas }) => {
        schemas = [...schemas];
        schemas.splice(schemas.findIndex(schema => schema.id === id) + 1, 0, schemaCopy());
        return { schemas };
      }, storeSchemas);
    };

    const setSchemaState = (state: SchemaState) => {
      this.setState(({ schemas }) => {
        schemas = [...schemas];
        schemas[schemas.findIndex(schema => schema.id === state.id)] = state;
        return { schemas };
      }, storeSchemas);
    };

    const deleteSchema = (state: SchemaState) => {
      this.setState(({ schemas }) => ({ schemas: schemas.filter(schema => schema.id !== state.id) }), storeSchemas);
    };

    return (
      <div className="main-container">
        <form className="add-schema">
          <input type="button" title="新增方案" onClick={() => addSchema(null)} />
        </form>
        {this.state.schemas.map((schema, index, array) => (
          <React.Fragment key={schema.id}>
            <SchemaEditor
              name={schema.name}
              input={schema.input}
              original={schema.original}
              id={schema.id}
              parameters={schema.parameters}
              setSchemaState={setSchemaState}
              deleteSchema={deleteSchema}
              single={array.length === 1}
              autocomplete={this.state.autocomplete}
            />
            <form className="add-schema">
              <input type="button" title="新增方案" onClick={() => addSchema(schema.id)} />
            </form>
          </React.Fragment>
        ))}

        <form className="pure-form">
          <p>
            <textarea
              id="articleInput"
              placeholder="輸入框"
              rows={5}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              required
              onChange={event => changeValue("article", event.target.value)}
              value={this.state.article}
            />
          </p>
          <p>
            <label>
              <select onChange={event => changeValue("option", event.target.value)} value={this.state.option}>
                {Object.entries(options).map(([value, label], index) => (
                  <option key={index} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={this.state.option === "convertArticle" ? "" : "hidden"}>
              <input
                type="checkbox"
                checked={this.state.convertVariant}
                onChange={event => changeValue("convertVariant", event.target.checked)}
              />
              轉換異體字
            </label>
            <input
              className="pure-button pure-button-primary"
              type="button"
              value="適用"
              onClick={() => this.handlePredefinedOptions()}
            />
            <input className="pure-button" type="button" value="匯出至剪貼簿" onClick={() => this.handleCopy()} />
            <label>
              <input
                type="checkbox"
                checked={this.state.autocomplete}
                onChange={event => changeValue("autocomplete", event.target.checked)}
              />
              編輯推導方案時顯示自動完成
            </label>
          </p>
        </form>

        <output ref={element => element && this.scrollToOutput(element)}>{this.state.output}</output>
      </div>
    );
  }
}

export default Main;
