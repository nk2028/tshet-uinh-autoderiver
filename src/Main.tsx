import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";

import { query字頭, 音韻地位 as class音韻地位, iter音韻地位 } from "qieyun";
import Yitizi from "yitizi";
import { notifyErrorWithoutStack, notifyError, notifyErrorWithError } from "./swal-utils";
import copyToClipboard from "./to-clipboard";
import LargeTooltip from "./large-tooltip";
import Entry from "./Entry";

const schemas = {
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
  schema: Schema;
  input: string;
  article: string;
  option: Option;
  convertVariant: boolean;
  output: React.ReactElement[];
  isApplied: boolean;
}

class Main extends React.Component<any, MainState> {
  constructor(props: any) {
    super(props);
    this.state = {
      schema: (localStorage.getItem("schema") as Schema) || "baxter",
      input: localStorage.getItem("input") || "",
      article:
        localStorage.getItem("article") ||
        "遙襟甫暢，逸興遄飛。爽籟發而清風生，纖歌凝而白雲遏。睢園綠竹，氣凌彭澤之樽；鄴水朱華，光照臨川之筆。四美具，二難并。窮睇眄於中天，極娛遊於暇日。天高地迥，覺宇宙之無窮；興盡悲來，識盈虛之有數。望長安於日下，目吳會於雲間。地勢極而南溟深，天柱高而北辰遠。關山難越，誰悲失路之人。萍水相逢，盡是他鄉之客。懷帝閽而不見，奉宣室以何年？",
      option: (localStorage.getItem("option") as Option) || "convertArticle",
      convertVariant: localStorage.getItem("convertVariant") === "true" || false,
      output: [],
      isApplied: false
    };
  }

  largeTooltip: any;

  componentDidMount() {
    if (!this.state.input) this.loadSchema(null);
    this.largeTooltip = LargeTooltip.init();
  }

  loadSchema(event: any) {
    if (event) event.preventDefault();
    fetch(`https://cdn.jsdelivr.net/gh/nk2028/qieyun-examples@1d44643/${this.state.schema}.js`)
      .then(response => response.text())
      .then(input => this.setState({ input }))
      .catch(err => notifyError(err));
  }

  makeConversion() {}

  outputArea?: HTMLElement;

  handlePredefinedOptions() {
    let userInput: Function;

    let callDeriver = (音韻地位: class音韻地位, 字頭: string | null) => {
      try {
        return userInput(音韻地位, 字頭);
      } catch (err) {
        notifyErrorWithError(`音韻地位：${音韻地位.描述}`, err);
        throw err;
      }
    };

    let handles = {
      convertArticle: () => {
        let output: React.ReactElement[] = [];
        let i = 0;

        for (const ch of this.state.article) {
          let 所有異體字 = [ch].concat(this.state.convertVariant ? Yitizi.get(ch) : []);
          const pronunciationMap = new Map();

          for (const 字頭 of 所有異體字) {
            for (const { 音韻地位, 解釋 } of query字頭(字頭)) {
              let 擬音 = callDeriver(音韻地位, 字頭);
              if (pronunciationMap.get(擬音) == null) pronunciationMap.set(擬音, []);
              pronunciationMap.get(擬音).push({ 字頭, 解釋, 音韻地位 });
            }
          }

          output.push(<Entry key={i++} ch={ch} pronunciationMap={pronunciationMap} tooltip={this.largeTooltip}></Entry>);
        }

        this.setState({ output, isApplied: true });
      },
      convertPresetArticle: () => {
        fetch(`https://raw.githubusercontent.com/graphemecluster/qieyun-text-label/main/index.txt`)
          .then(response => response.text())
          .then(txt => {
            this.setState({
              output: txt.split("\n\n").map((passage, key) =>
                React.createElement(
                  React.Fragment,
                  { key },
                  passage.split("\n").map((line, key) => {
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
                          <ruby key={j}>
                            {字頭}
                            <rp>(</rp>
                            <rt lang="och-Latn-fonipa">{擬音}</rt>
                            <rp>)</rp>
                          </ruby>
                        );
                      } else output.push(<React.Fragment key={i}>{chs[i]}</React.Fragment>);
                    }
                    return React.createElement(key ? "p" : "h3", { key }, output);
                  })
                )
              ),
              isApplied: true
            });
          })
          .catch(err => notifyError(err));
      },
      exportAllSmallRhymes: () => {
        this.setState({
          output: Array.from(iter音韻地位()).map((音韻地位, key) => (
            <p key={key}>
              {音韻地位.描述} <span lang="och-Latn-fonipa">{callDeriver(音韻地位, null)}</span> {音韻地位.代表字}
            </p>
          )),
          isApplied: true
        });
      },
      exportAllSyllables: () => {
        this.setState({
          output: [
            <span lang="och-Latn-fonipa">{Array.from(new Set(Array.from(iter音韻地位()).map(音韻地位 => callDeriver(音韻地位, null)))).join(", ")}</span>
          ],
          isApplied: true
        });
      },
      exportAllSyllablesWithCount: () => {
        const counter = new Map();
        Array.from(iter音韻地位()).forEach(音韻地位 => {
          const 擬音 = callDeriver(音韻地位, null);
          counter.set(擬音, -~counter.get(擬音));
        });
        const arr = Array.from(counter);
        arr.sort((a, b) => b[1] - a[1]);
        this.setState({
          output: [<span lang="och-Latn-fonipa">{arr.map(([k, v]) => `${k} (${v})`).join(", ")}</span>],
          isApplied: true
        });
      }
    };

    try {
      // eslint-disable-next-line no-new-func
      userInput = new Function("音韻地位", "字頭", this.state.input);
    } catch (err) {
      notifyError(err);
      return;
    }
    try {
      handles[this.state.option]();
    } catch (err) {
      return;
    }
  }

  handleCopy() {
    if (this.outputArea) {
      const txt = this.outputArea.textContent;
      txt ? copyToClipboard(txt) : notifyErrorWithoutStack(new Error("請先進行操作，再匯出結果"));
    }
  }

  render() {
    let changeValue = (key: string) => (event: any) => {
      this.setState({ [key]: event.target.value } as MainState);
      localStorage.setItem(key, event.target.value);
    };

    let changeConvertVariant = (event: any) => {
      this.setState({ convertVariant: event.target.checked } as MainState);
      localStorage.setItem("convertVariant", event.target.checked);
    };

    return (
      <div className="main-container">
        <form className="pure-form" onSubmit={event => this.loadSchema(event)}>
          <p>
            <b>預設推導方案：</b>
            {Object.entries(schemas).map(([value, label], index) => (
              <label className="pure-radio" key={index}>
                <input type="radio" name="schema" value={value} checked={this.state.schema === value} onChange={changeValue("schema")} />
                {label}
              </label>
            ))}
            <input className="pure-button" type="submit" value="載入" />
          </p>
        </form>
        <div lang="en-x-code" id="schemaInput">
          <CodeMirror
            value={this.state.input}
            options={{
              mode: "javascript",
              lineNumbers: true
            }}
            onBeforeChange={(_editor, _data, input) => {
              this.setState({ input });
              localStorage.setItem("input", input);
            }}
          />
        </div>

        <form className="pure-form">
          <p>
            <textarea
              id="articleInput"
              placeholder="輸入框"
              rows={5}
              spellCheck="false"
              required
              onChange={changeValue("article")}
              value={this.state.article}
            />
          </p>

          <p>
            <label>
              <select onChange={changeValue("option")} value={this.state.option}>
                {Object.entries(options).map(([value, label], index) => (
                  <option key={index} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input type="checkbox" checked={this.state.convertVariant} onChange={changeConvertVariant} />
              轉換異體字
            </label>
            <input className="pure-button pure-button-primary" type="button" value="適用" onClick={() => this.handlePredefinedOptions()} />
            <input className="pure-button" type="button" value="匯出至剪貼簿" onClick={() => this.handleCopy()} />
          </p>
        </form>

        <output
          ref={element => {
            if (this.state.isApplied) {
              if (element) {
                this.outputArea = element;
                element.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
              this.setState({ isApplied: false });
            }
          }}
        >
          {this.state.output}
        </output>
      </div>
    );
  }
}

export default Main;
