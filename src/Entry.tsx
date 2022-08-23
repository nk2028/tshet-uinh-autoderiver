import React from "react";
import { Entries, joinWithBr } from "./Main";

interface EntryProps {
  ch: string;
  entries: Entries;
  tooltip: any;
  preselect?: number;
}

interface EntryState {
  rubyClass: string;
  selected: number;
}

class Entry extends React.Component<EntryProps, EntryState> {
  constructor(props: any) {
    super(props);
    const { entries, preselect } = this.props;
    const selected = preselect ?? 0;
    if (entries.length) {
      this.state = {
        rubyClass: entries[selected][1].some(({ 解釋 }) => !解釋)
          ? "entry-special"
          : entries.length === 1
          ? ""
          : preselect == null
          ? "entry-unresolved"
          : "entry-multiple",
        selected,
      };
    }
  }

  handleClick(index: number) {
    if (this.props.entries.length >= 2) {
      this.setState((state: EntryState) => ({
        selected: index,
        rubyClass: this.props.entries[index][1].some(({ 解釋 }) => !解釋) ? "entry-special" : "entry-multiple",
      }));
    }
  }

  render() {
    if (!this.props.entries.length) return <>{this.props.ch}</>;

    const tooltip = (
      <div className="tooltip-items-wrapper">
        {this.props.entries.map(([pronunciation, ress], i) => (
          <p
            key={i}
            className={"tooltip-item" + (this.props.entries.length > 1 && i === this.state.selected ? " selected" : "")}
            onClick={() => this.handleClick(i)}>
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
          <rt lang="och-Latn-fonipa">{joinWithBr(this.props.entries[this.state.selected][0])}</rt>
          <rp>)</rp>
        </ruby>
      </span>
    );
  }
}

export default Entry;
