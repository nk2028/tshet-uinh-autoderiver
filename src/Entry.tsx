import React from "react";
import { EntryItem } from "./Main";

interface EntryProps {
  ch: string;
  pronunciationMap: Map<string[], EntryItem[]>;
  tooltip: any;
}

interface EntryState {
  rubyClass: string;
  pronunciation: string[];
}

class Entry extends React.Component<EntryProps, EntryState> {
  constructor(props: any) {
    super(props);
    if (this.props.pronunciationMap.size) {
      this.state = {
        rubyClass: this.props.pronunciationMap.size > 1 ? "entry-multiple entry-unresolved" : "",
        pronunciation: this.props.pronunciationMap.keys().next().value,
      };
    }
  }

  handleClick(pronunciation: string[]) {
    this.setState((state: any) => ({
      pronunciation,
      rubyClass: state.rubyClass.replace(" entry-unresolved", ""),
    }));
  }

  render() {
    if (!this.props.pronunciationMap.size) return <>{this.props.ch}</>;

    const tooltip = (
      <div className="tooltip-items-wrapper">
        {Array.from(this.props.pronunciationMap).map(([pronunciation, ress], i) => (
          <p
            key={i}
            className={
              "tooltip-item" +
              (this.props.pronunciationMap.size > 1 && pronunciation === this.state.pronunciation ? " selected" : "")
            }
            onClick={() => this.handleClick(pronunciation)}>
            <span className="nowrap" lang="och-Latn-fonipa">
              {pronunciation.join(" / ")}
            </span>{" "}
            {ress.map((res, index) => {
              const { 字頭, 解釋, 音韻地位 } = res;
              let 反切 = 音韻地位.反切(字頭);
              反切 = 反切 == null ? "" : `${反切}切 `;
              return (
                <React.Fragment key={index}>
                  {index !== 0 && <br />}
                  <span className="tooltip-ch">{字頭}</span> {音韻地位.描述} {反切 + 解釋}
                </React.Fragment>
              );
            })}
          </p>
        ))}
      </div>
    );

    return (
      <span className="ruby-wrapper" ref={element => element && this.props.tooltip.addTooltip(tooltip, element)}>
        <ruby className={this.state.rubyClass}>
          {this.props.ch}
          <rp>(</rp>
          <rt lang="och-Latn-fonipa">{this.state.pronunciation.join("\n")}</rt>
          <rp>)</rp>
        </ruby>
      </span>
    );
  }
}

export default Entry;
