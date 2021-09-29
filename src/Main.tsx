import React from "react";
import { query字頭, 音韻地位 as class音韻地位, iter音韻地位 } from "qieyun";
import Yitizi from "yitizi";
import LargeTooltip from "./large-tooltip";
import Entry from "./Entry";
import SchemaEditor from "./SchemaEditor";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const SwalReact = withReactContent(Swal);

(window as any).__react_key__ = 0;

export function addKey(element: JSX.Element) {
  // return <React.Fragment key={++(window as any).__react_key__}>{element}</React.Fragment>;
  // element = Object.assign({}, element);
  // element.key = ++(window as any).__react_key__;
  // return Object.freeze(element);
  return React.cloneElement(element, { key: ++(window as any).__react_key__ });
}

function notifyError(msg: string, err?: Error) {
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
  baxter: "白一平轉寫",
  blankego: "有女羅馬字",
  kyonh: "古韻羅馬字",
  zyepheng: "隋拼",
  panwuyun: "潘悟雲擬音",
  unt_j: "unt 切韻擬音 J",
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
  compareSchemas: "比較多個方案，並導出相異小韻",
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

export type Entries = [string[], { 字頭: string; 解釋: string; 音韻地位: class音韻地位 }[]][];

export type Parameter = { [parameter: string]: unknown };

export async function fetchFile(input: string): Promise<string> {
  try {
    const text = await (await fetch(input)).text();
    if (text.startsWith("Failed to fetch")) throw new Error(text);
    return text;
  } catch (err) {
    notifyError("載入檔案失敗", err);
    throw err;
  }
}

function schemaCopy(): SchemaState {
  return { name: "baxter", input: "", original: "", parameters: {}, id: +new Date() };
}

export function makeRubyText(array: React.ReactNode[]) {
  const result: JSX.Element[] = [];
  array.forEach((item, index) => {
    if (index) {
      result.push(<span hidden> / </span>);
      result.push(<br />);
    }
    result.push(<>{item}</>);
  });
  return (
    <>
      <rp>(</rp>
      <rt lang="och-Latn-fonipa">{result.map(addKey)}</rt>
      <rp>)</rp>
    </>
  );
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
        "遙襟甫暢，逸興(曉開三蒸去)遄飛。爽籟發而清風(幫三東平)生(生開三庚平)，纖歌凝(疑開三蒸平)而白雲遏。" +
          "睢(心合三脂平)園綠竹，氣(溪開三微去)凌彭澤之樽；鄴水朱華(匣合二麻平)，光(見合一唐平)照臨(來開三侵平)川之筆。" +
          "四美具，二難(泥開一寒平)并(幫三A清去)。窮睇(定開四齊去)眄(明四先上/明四先去)於(影開三魚平)中(知三東平)天，極娛(疑三虞平)遊於(影開三魚平)暇日。" +
          "天高地迥，覺(見二江入)宇宙之無窮；興(曉開三蒸去)盡(從開三眞上)悲來，識(書開三蒸入)盈虛(曉開三魚平)之有數(生三虞去)。" +
          "望(明三陽平)長(澄開三陽平)安於(影開三魚平)日下(匣開二麻上)，目吳會(匣合一泰去)於(影開三魚平)雲間(見開二山平)。" +
          "地勢極而南溟(明四青平)深(書開三侵平)，天柱(澄三虞上)高而北辰遠(云合三元上)。關山難(泥開一寒平)越(云合三元入)，誰悲失路之人。" +
          "萍水相(心開三陽平)逢，盡(從開三眞上)是他鄉之客。懷帝閽而不(幫三文入)見(見開四先去)，奉宣室以何(匣開一歌平)年？",
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

  async handlePredefinedOptions() {
    let userInputs: Function[];
    const parameters = this.state.schemas.map(({ parameters }) => {
      const pass = { ...parameters };
      Object.keys(pass).forEach(key => {
        const passKey = pass[key];
        if (Array.isArray(passKey)) pass[key] = passKey[0];
      });
      return pass;
    });

    let callDeriver = (音韻地位: class音韻地位, 字頭: string | null) => {
      try {
        return userInputs.map((input, index) => input(音韻地位, 字頭, parameters[index]));
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

    if (this.state.option === "convertPresetArticle" && !presetArticle)
      presetArticle = await fetchFile("https://cdn.jsdelivr.net/gh/nk2028/qieyun-text-label@2a2aa89/index.txt");
    // else await new Promise(resolve => setTimeout(resolve));

    let handles = {
      convertArticle: () =>
        Array.from(this.state.article)
          .map(ch => {
            const 所有異體字 = [ch].concat(this.state.convertVariant ? Yitizi.get(ch) : []);
            const entries: Entries = [];

            for (const 字頭 of 所有異體字) {
              for (const { 音韻地位, 解釋 } of query字頭(字頭)) {
                let 擬音 = callDeriver(音韻地位, 字頭);
                const entry = entries.find(key => key[0].every((pronunciation, i) => pronunciation === 擬音[i]));
                if (entry) entry[1].push({ 字頭, 解釋, 音韻地位 });
                else entries.push([擬音, [{ 字頭, 解釋, 音韻地位 }]]);
              }
            }
            return <Entry ch={ch} entries={entries} tooltip={this.largeTooltip}></Entry>;
          })
          .map(addKey),

      convertPresetArticle: () =>
        presetArticle
          .split("\n\n")
          .map(passage => (
            <>
              {passage
                .split("\n")
                .map((line, index) => {
                  let output: JSX.Element[] = [];
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
                        <ruby>
                          {字頭}
                          {makeRubyText(擬音)}
                        </ruby>
                      );
                    } else output.push(<>{chs[i]}</>);
                  }

                  const Tag = index ? "p" : "h3";
                  return (
                    <>
                      <Tag>{output.map(addKey)}</Tag>
                      <span hidden>{"\n"}</span>
                    </>
                  );
                })
                .map(addKey)}
              <span hidden>{"\n"}</span>
            </>
          ))
          .map(addKey),

      exportAllSmallRhymes: () => [
        addKey(
          <table>
            {Array.from(iter音韻地位())
              .map(音韻地位 => (
                <tr>
                  <td>{音韻地位.描述}</td>
                  {"\t"}
                  <td lang="och-Latn-fonipa">{callDeriver(音韻地位, null).join(" / ")}</td>
                  {"\t"}
                  <td>{音韻地位.代表字}</td>
                  <span hidden>{"\n"}</span>
                </tr>
              ))
              .map(addKey)}
          </table>
        ),
      ],

      exportAllSyllables: () => [
        addKey(
          <span lang="och-Latn-fonipa">
            {Array.from(
              new Set(Array.from(iter音韻地位()).map(音韻地位 => callDeriver(音韻地位, null).join(" / ")))
            ).join(", ")}
          </span>
        ),
      ],

      exportAllSyllablesWithCount: () => [
        addKey(
          <span lang="och-Latn-fonipa">
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
          </span>
        ),
      ],

      compareSchemas: () => {
        if (userInputs.length < 2) {
          notifyError("此選項需要兩個或以上方案");
          return [];
        }
        const result = Array.from(iter音韻地位())
          .map(音韻地位 => ({ 描述: 音韻地位.描述, 擬音陣列: callDeriver(音韻地位, null), 代表字: 音韻地位.代表字 }))
          .filter(({ 擬音陣列 }) => 擬音陣列.some(擬音 => 擬音 !== 擬音陣列[0]))
          .map(({ 描述, 擬音陣列, 代表字 }) => (
            <tr>
              <td>{描述}</td>
              {"\t"}
              <td lang="och-Latn-fonipa">{擬音陣列.join(" / ")}</td>
              {"\t"}
              <td>{代表字}</td>
              <span hidden>{"\n"}</span>
            </tr>
          ));
        return result.length
          ? [
              addKey(
                <h3>
                  找到 {result.length} 個相異項目。
                  <span hidden>{"\n\n"}</span>
                </h3>
              ),
              addKey(<table>{result.map(addKey)}</table>),
            ]
          : [addKey(<h3>方案擬音結果相同。</h3>)];
      },
    };

    try {
      // eslint-disable-next-line no-new-func
      userInputs = this.state.schemas.map(({ input }) => new Function("音韻地位", "字頭", "選項", input));
    } catch (err) {
      notifyError("程式碼錯誤", err);
      return;
    }
    try {
      this.setState({ output: handles[this.state.option](), isApplied: true });
    } catch (err) {}
  }

  handleCopy() {
    const txt = this.outputArea?.textContent?.replace(/\n+$/, "");
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
    const changeValue = <T extends keyof MainState>(key: T, value: MainState[T]) => {
      this.setState({ [key]: value } as Pick<MainState, T>, () => {
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
        {this.state.schemas.map(schema => (
          <React.Fragment key={schema.id}>
            <SchemaEditor
              name={schema.name}
              input={schema.input}
              original={schema.original}
              id={schema.id}
              parameters={schema.parameters}
              setSchemaState={setSchemaState}
              deleteSchema={deleteSchema}
              single={this.state.schemas.length === 1}
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
              <select onChange={event => changeValue("option", event.target.value as Option)} value={this.state.option}>
                {Object.entries(options).map(([value, label]) => (
                  <option key={value} value={value}>
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
