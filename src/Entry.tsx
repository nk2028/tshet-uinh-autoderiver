import React from "react";
import { Entries, joinWithBr } from "./Main";

interface EntryProps {
  ch: string;
  entries: Entries;
  tooltip: any;
}

interface EntryState {
  rubyClass: string;
  pronunciation: string[];
}

class Entry extends React.Component<EntryProps, EntryState> {
  constructor(props: any) {
    super(props);
    if (this.props.entries.length) {
      this.state = {
        rubyClass: this.props.entries.length > 1 ? "entry-multiple entry-unresolved" : "",
        pronunciation: this.props.entries[0][0],
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
    if (!this.props.entries.length) return <>{this.props.ch}</>;

    const tooltip = (
      <div className="tooltip-items-wrapper">
        {this.props.entries.map(([pronunciation, ress], i) => (
          <p
            key={i}
            className={
              "tooltip-item" +
              (this.props.entries.length > 1 && pronunciation === this.state.pronunciation ? " selected" : "")
            }
            onClick={() => this.handleClick(pronunciation)}>
            <span className="nowrap" lang="och-Latn-fonipa">
              {pronunciation.join(" / ")}
            </span>{" "}
            {ress.map((res, index) => {
              const { 字頭, 解釋, 音韻地位 } = res;
              let { 反切 } = res;
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
          <rt lang="och-Latn-fonipa">{joinWithBr(this.state.pronunciation)}</rt>
          <rp>)</rp>
        </ruby>
      </span>
    );
  }
}

export default Entry;
