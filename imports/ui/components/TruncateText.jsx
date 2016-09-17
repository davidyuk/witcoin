import React from 'react';

export default class TruncateText extends React.Component {
  render() {
    let content = this.props.content;
    let subStr = content.substring(0, this.props.length);
    return (
      <span>
        {subStr}
        {subStr == content ? null : (
          <span>&hellip;</span>
        )}
      </span>
    );
  }
}

TruncateText.propTypes = {
  content: React.PropTypes.string,
  length: React.PropTypes.number,
};
