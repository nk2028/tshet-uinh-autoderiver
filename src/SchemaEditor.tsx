import React, { Fragment } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { JSHINT } from "jshint";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/display/placeholder";
import "codemirror/addon/display/fullscreen";
import "codemirror/addon/display/fullscreen.css";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/comment-fold";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/lint/lint";
import "codemirror/addon/lint/javascript-lint";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";
import "codemirror/addon/selection/active-line";
import "codemirror/mode/javascript/javascript";

import { Pos, ShowHintOptions } from "codemirror";
import Swal from "sweetalert2";
import { fetchFile, schemas, SchemaState } from "./Main";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";

import * as Qieyun from "qieyun";
import { 音韻地位 } from "qieyun";
import { 推導方案, 推導選項 } from "tshet-uinh-deriver-tools";
import type { 原始推導函數 } from "tshet-uinh-deriver-tools";

(window as any).JSHINT = JSHINT;

interface SchemaProps extends SchemaState {
  setSchemaState: (state: SchemaState) => void;
  deleteSchema: (state: SchemaState) => void;
  single: boolean;
  autocomplete: boolean;
}

const 音韻地位example = 音韻地位.from描述("幫三凡入");
const 音韻地位properties = Object.getOwnPropertyNames(音韻地位example).concat(
  Object.getOwnPropertyNames(Object.getPrototypeOf(音韻地位example)).slice(1)
);
const deriverParameters = ["音韻地位", "字頭"];

class SchemaEditor extends React.Component<SchemaProps, any> {
  constructor(props: SchemaProps) {
    super(props);
    const settings = this.getNewSettings(props.input);
    if (settings) props.setSchemaState({ ...props, settings });
  }

  componentDidMount() {
    this.loadSchema();
  }

  autocomplete(cm: CodeMirror.Editor, options: ShowHintOptions) {
    if (!this?.props.autocomplete) return;

    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    let list: string[];
    let from = Pos(cursor.line, token.start);
    let to = Pos(cursor.line, token.end);
    const filter = () => (list = list.filter(prop => prop.startsWith(token.string) && prop !== token.string));

    switch (cm.getTokenAt(Pos(cursor.line, token.start - 1)).string) {
      case "音韻地位":
        list = 音韻地位properties;
        break;
      case "選項":
        list = Object.keys(this.props.settings.預設選項);
        break;
      default:
        list = deriverParameters.concat(this.props.settings.項目數 ? ["選項"] : []);
        if (cursor.ch === token.end && /[\s!-#%-/:-@[-^`{-~]$/.test(token.string)) from = to;
        else filter();
        return { list, from, to };
    }
    if (token.string === ".") from = to;
    else if (cm.getTokenAt(from).string === ".") filter();
    else return;
    return { list, from, to };
  }

  loadSchema(event?: any) {
    if (event) event.preventDefault();
    // TODO restore after new qieyun-examples deployment
    //fetchFile(`https://nk2028-1305783649.file.myqcloud.com/qieyun-examples/${this.props.name}.js`, input => {
    fetchFile(`https://cdn.jsdelivr.net/gh/nk2028/qieyun-examples@main/${this.props.name}.js`, input => {
      if (event && this.props.input && this.props.input !== this.props.original) {
        Swal.fire({
          showClass: { popup: "" },
          hideClass: { popup: "" },
          title: "是否確定載入？",
          text: "您會遺失所有變更。",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "確定",
          cancelButtonText: "取消",
        }).then(result => {
          if (result.isConfirmed) {
            this.props.setSchemaState({
              ...this.props,
              input,
              original: input,
              settings: this.getNewSettings(input, new 推導選項()) ?? new 推導選項(),
            });
          }
        });
      } else {
        const newProp = { ...this.props, original: input };
        if (event || !this.props.input) {
          newProp.input = input;
          newProp.settings = this.getNewSettings(input, new 推導選項()) ?? new 推導選項();
        }
        this.props.setSchemaState(newProp);
      }
    });
  }

  changeSchema(event: any) {
    this.props.setSchemaState({ ...this.props, name: event.target.value });
  }

  deleteSchema() {
    if (this.props.input && this.props.input !== this.props.original) {
      Swal.fire({
        showClass: { popup: "" },
        hideClass: { popup: "" },
        title: "是否確定刪除？",
        text: "您會遺失所有變更。",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
      }).then(result => {
        if (result.isConfirmed) {
          this.props.deleteSchema(this.props);
        }
      });
    } else {
      this.props.deleteSchema(this.props);
    }
  }

  getNewSettings(input: string, oldSettings: 推導選項 = this.props.settings): 推導選項 | null {
    const oldOptions = oldSettings.預設選項;
    let settings: 推導選項;
    try {
      settings = new 推導方案(
        // eslint-disable-next-line no-new-func
        new Function("Qieyun", "選項", "音韻地位", "字頭", input).bind(null, Qieyun) as 原始推導函數<string>
      ).方案選項(oldOptions);
    } catch {
      return null;
    }
    return settings.combine(oldSettings);
  }

  resetParameters() {
    this.props.setSchemaState({
      ...this.props,
      settings: this.getNewSettings(this.props.input, new 推導選項()) ?? new 推導選項(),
    });
  }

  render() {
    const changeParameter = (key: string, value: any) => {
      this.props.setSchemaState({
        ...this.props,
        settings: this.getNewSettings(this.props.input, this.props.settings.set(key, value)) ?? new 推導選項(),
      });
    };

    const formatCode = (cm: CodeMirror.Editor) => {
      const cursor = cm.getCursor();
      const { left, top } = cm.getScrollInfo();
      const line = cm.lineAtHeight(top, "local");
      const offset = top - cm.heightAtLine(line, "local");
      const { formatted, cursorOffset } = prettier.formatWithCursor(cm.getValue(), {
        cursorOffset: cm.indexFromPos(cursor),
        parser: "babel",
        plugins: [parserBabel],
      });
      cm.setValue(formatted);
      const position = cm.posFromIndex(cursorOffset);
      cm.scrollTo(left, cm.heightAtLine(position.line - cursor.line + line, "local") + offset);
      cm.setCursor(position);
    };

    let parameters = this.props.settings.列表
      .map((item, index) => {
        if (!Array.isArray(item) || item.length < 2) {
          return !!item ? (
            <Fragment key={index}>
              <br />
              <b>〔{String(item)}〕</b>
            </Fragment>
          ) : (
            <br key={index} />
          );
        }
        const [key, value] = item;
        if (Array.isArray(value))
          return (
            <label key={index}>
              <span className="select-label">{key}</span>
              <select
                onChange={event => changeParameter(key, JSON.parse(event.target.value))}
                value={JSON.stringify(value[0])}>
                {value.slice(1).map((option, i) => (
                  <option key={i + 1} value={JSON.stringify(option)}>
                    {option + ""}
                  </option>
                ))}
              </select>
            </label>
          );
        else
          switch (typeof value) {
            case "boolean":
              return (
                <label key={index}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={event => changeParameter(key, event.target.checked)}
                  />
                  {key}
                </label>
              );
            case "number":
              return (
                <label key={index}>
                  {key}
                  <input
                    type="number"
                    value={value}
                    step="any"
                    onChange={event => changeParameter(key, +event.target.value)}
                  />
                </label>
              );
            case "string":
              return (
                <label key={index}>
                  {key}
                  <input type="text" value={value} onChange={event => changeParameter(key, event.target.value)} />
                </label>
              );
            default:
              return null;
          }
      })
      .filter(parameter => parameter);
    parameters.push(
      parameters.length ? (
        <input
          className="pure-button"
          type="button"
          value="恢復預設值"
          onClick={() => this.resetParameters()}
          key="reset"
        />
      ) : (
        <span key="hint" className="hint">
          此推導方案無可用選項，請於推導程式中回傳 Object.entries() 形式的陣列以使用「選項」功能。
        </span>
      )
    );

    return (
      <div className="schema-editor">
        <form className="delete-schema">
          <input type="button" title="刪除方案" disabled={this.props.single} onClick={() => this.deleteSchema()} />
        </form>
        <form className="pure-form" onSubmit={event => this.loadSchema(event)}>
          <p>
            <b>預設推導方案：</b>
            {Object.entries(schemas).map(([value, label], index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="schema"
                  value={value}
                  checked={this.props.name === value}
                  onChange={event => this.changeSchema(event)}
                />
                {label}
              </label>
            ))}
            <input className="pure-button" type="submit" value="載入" />
          </p>
        </form>
        <div lang="en-x-code" id="schemaInput">
          <CodeMirror
            value={this.props.input}
            options={{
              mode: "javascript",
              lineNumbers: true,
              scrollbarStyle: "overlay",
              extraKeys: {
                F11: cm => cm.setOption("fullScreen", !cm.getOption("fullScreen")),
                Esc: cm => cm.setOption("fullScreen", false),
                F9: formatCode,
              },
              maxHighlightLength: Infinity,
              viewportMargin: 16,
              placeholder: "以 JavaScript 輸入推導方案……",
              styleActiveLine: true,
              autoCloseBrackets: true,
              matchBrackets: true,
              foldGutter: true,
              lint: { esversion: Infinity } as any,
              gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
              hintOptions: { hint: this.autocomplete.bind(this), completeSingle: false },
            }}
            onBeforeChange={(cm, data, input) => {
              const newProp = { ...this.props, input };
              const settings = this.getNewSettings(input);
              if (settings) newProp.settings = settings;
              this.props.setSchemaState(newProp);
            }}
            onCursorActivity={cm => cm.hasFocus() && cm.showHint()}
            onFocus={cm => setTimeout(() => cm.showHint(), 100)}
          />
        </div>
        <form className="pure-form">
          <p className="schema-settings">
            <b>選項：</b>
            {parameters}
          </p>
        </form>
      </div>
    );
  }
}

export default SchemaEditor;
