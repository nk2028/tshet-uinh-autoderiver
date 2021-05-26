import React from "react";
import { query字頭, 音韻地位 as class音韻地位, iter音韻地位 } from "qieyun";
import Yitizi from "yitizi";
import copyToClipboard from "./to-clipboard";
import LargeTooltip from "./large-tooltip";
import Entry from "./Entry";
import SchemaEditor from "./SchemaEditor";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const SwalReact = withReactContent(Swal);

export function notifyError(msg: string, err?: Error) {
  SwalReact.fire({
    showClass: { popup: "" },
    hideClass: { popup: "" },
    icon: "error",
    title: "錯誤",
    customClass: (err?.stack ? "error-with-stack" : "") as any,
    html: (
      <>
        <p>{msg}</p>
        {!!err?.stack && <pre lang="en-x-code">{err.stack}</pre>}
      </>
    ),
    confirmButtonText: "確定"
  });
}

export const schemas = {
  baxter: "白一平轉寫",
  blankego: "有女羅馬字",
  kyonh: "古韻羅馬字",
  zyepheng: "隋拼",
  panwuyun: "潘悟雲擬音",
  unt_j: "unt 切韻擬音 J",
  msoeg_v8: "msoeg 中古拟音 V8",
  chiangxhua: "推導《聲音唱和圖》擬音",
  fanwan: "推導《分韻撮要》擬音",
  putonghua: "推導普通話",
  gwongzau: "推導廣州音",
  ayaka_v8: "綾香思考音系"
};

const options = {
  convertArticle: "從輸入框中讀取文章，並注音",
  convertPresetArticle: "為預設文章注音",
  exportAllSmallRhymes: "導出所有小韻",
  exportAllSyllables: "導出所有音節",
  exportAllSyllablesWithCount: "導出所有音節，並計數"
};

type Schema = keyof typeof schemas;
type Option = keyof typeof options;

interface MainState {
  schemas: SchemaState[];
  article: string;
  option: Option;
  convertVariant: boolean;
  autocomplete: boolean;
  output: React.ReactElement[];
  isApplied: boolean;
}

export interface SchemaState {
  name: Schema;
  input: string;
  original: string;
  parameters: { [parameter: string]: any };
}

export function fetchFile(input: string, callback: (text: string) => void) {
  fetch(input, { cache: "no-cache" })
    .then(response => response.text())
    .then(callback)
    .catch(err => notifyError("載入檔案失敗", err));
}

let presetArticle: string;

class Main extends React.Component<any, MainState> {
  largeTooltip?: any;

  outputArea?: HTMLElement;

  constructor(props: any) {
    super(props);

    const schemaNames: Schema[] = JSON.parse(localStorage.getItem("schemas") || "[]");
    const schemaInputs: string[] = JSON.parse(localStorage.getItem("inputs") || "[]");
    const schemaParameters: { [parameter: string]: any }[] = JSON.parse(localStorage.getItem("parameters") || "[]");

    this.state = {
      schemas: schemaNames.length
        ? schemaNames.map((name, index) => ({ name, input: schemaInputs[index], original: "", parameters: schemaParameters[index] }))
        : [{ name: "baxter", input: "", original: "", parameters: [] }],
      article:
        localStorage.getItem("article") ||
        "遙襟甫暢，逸興遄飛。爽籟發而清風生，纖歌凝而白雲遏。睢園綠竹，氣凌彭澤之樽；鄴水朱華，光照臨川之筆。" +
          "四美具，二難并。窮睇眄於中天，極娛遊於暇日。天高地迥，覺宇宙之無窮；興盡悲來，識盈虛之有數。望長安於日下，目吳會於雲間。" +
          "地勢極而南溟深，天柱高而北辰遠。關山難越，誰悲失路之人。萍水相逢，盡是他鄉之客。懷帝閽而不見，奉宣室以何年？",
      option: (localStorage.getItem("option") as Option) || "convertArticle",
      convertVariant: localStorage.getItem("convertVariant") === "true",
      autocomplete: localStorage.getItem("autocomplete") !== "false",
      output: [],
      isApplied: false
    };
  }

  componentDidMount() {
    this.largeTooltip = LargeTooltip.init();
  }

  addSchema() {
    this.setState(({ schemas }) => ({ schemas: [...schemas, { name: "baxter", input: "", original: "", parameters: [] }] }));
  }

  handlePredefinedOptions() {
    const id = +new Date() + ":";

    let userInputs: Function[];
    const parameters = this.state.schemas.map(({ parameters }) => {
      const pass = { ...parameters };
      Object.keys(pass).forEach(key => {
        if (Array.isArray(pass[key])) pass[key] = pass[key][0];
      });
      return pass;
    });

    let callDeriver = (音韻地位: class音韻地位, 字頭: string | null) => {
      try {
        return userInputs.map((input, index) => input(音韻地位, 字頭, parameters[index]));
      } catch (err) {
        notifyError(`推導「${字頭}」字（音韻地位：${音韻地位.描述}）時發生錯誤`, err);
        throw err;
      }
    };

    if (this.state.option === "convertPresetArticle" && !presetArticle) {
      fetchFile("https://raw.githubusercontent.com/graphemecluster/qieyun-text-label/main/index.txt", article => {
        presetArticle = article;
        this.handlePredefinedOptions();
      });
      return;
    }

    let handles = {
      convertArticle: () =>
        Array.from(this.state.article).map((ch, i) => {
          let 所有異體字 = [ch].concat(this.state.convertVariant ? Yitizi.get(ch) : []);
          const pronunciations = new Map();
          const pronunciationMap = new Map();

          for (const 字頭 of 所有異體字) {
            for (const { 音韻地位, 解釋 } of query字頭(字頭)) {
              let 擬音 = JSON.stringify(callDeriver(音韻地位, 字頭));
              if (pronunciations.get(擬音) == null) pronunciationMap.set(擬音, []);
              pronunciationMap.get(擬音).push({ 字頭, 解釋, 音韻地位 });
            }
          }

          const map = new Map(Array.from(pronunciationMap).map(([key, value]) => [JSON.parse(key), value]));
          return <Entry key={id + i} ch={ch} pronunciationMap={map} tooltip={this.largeTooltip}></Entry>;
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
                      <rt lang="och-Latn-fonipa">{擬音.join("\n")}</rt>
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
        Array.from(iter音韻地位()).map((音韻地位, i) => (
          <p key={id + i}>
            {音韻地位.描述} <span lang="och-Latn-fonipa">{callDeriver(音韻地位, null).join(" / ")}</span> {音韻地位.代表字}
          </p>
        )),

      exportAllSyllables: () => [
        <span lang="och-Latn-fonipa" key={id + 0}>
          {Array.from(new Set(Array.from(iter音韻地位()).map(音韻地位 => callDeriver(音韻地位, null).join(" / ")))).join(", ")}
        </span>
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
        </span>
      ]
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
    const txt = this.outputArea?.textContent;
    txt
      ? copyToClipboard(txt)
      : Swal.fire({
          showClass: { popup: "" },
          hideClass: { popup: "" },
          icon: "error",
          title: "錯誤",
          text: "請先進行操作，再匯出結果",
          confirmButtonText: "確定"
        });
  }

  scrollToOutput(element: HTMLElement | null) {
    if (this.state.isApplied) {
      if (element) {
        this.outputArea = element;
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
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

    const setSchemaState = (index: number) => (state: SchemaState) => {
      this.setState(({ schemas }) => {
        schemas[index] = state;
        return { schemas };
      }, storeSchemas);
    };

    const deleteSchema = (index: number) => () => {
      this.setState(({ schemas }) => ({ schemas: schemas.filter((schema, i) => index !== i) }), storeSchemas);
    };

    return (
      <div className="main-container">
        {this.state.schemas.map((state, index, array) => (
          <SchemaEditor
            name={state.name}
            input={state.input}
            original={state.original}
            parameters={state.parameters}
            setSchemaState={setSchemaState(index)}
            deleteSchema={deleteSchema(index)}
            single={array.length === 1}
            autocomplete={this.state.autocomplete}
            key={index}
          />
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
            <label>
              <input type="checkbox" checked={this.state.convertVariant} onChange={event => changeValue("convertVariant", event.target.checked)} />
              轉換異體字
            </label>
            <label>
              <input type="checkbox" checked={this.state.autocomplete} onChange={event => changeValue("autocomplete", event.target.checked)} />
              顯示自動完成
            </label>
            <input className="pure-button pure-button-primary" type="button" value="適用" onClick={() => this.handlePredefinedOptions()} />
            <input className="pure-button" type="button" value="匯出至剪貼簿" onClick={() => this.handleCopy()} />
            <input className="pure-button" type="button" value="新增方案" onClick={() => this.addSchema()} />
          </p>
        </form>

        <output ref={element => this.scrollToOutput(element)}>{this.state.output}</output>
      </div>
    );
  }
}

export default Main;
