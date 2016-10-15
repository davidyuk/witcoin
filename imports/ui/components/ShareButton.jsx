import React from 'react';

export default class ShareButton extends React.Component {
  share() {
    Meteor.call('action.share', this.props.action._id);
  }

  renderSharesCount() {
    const action = this.props.action;

    if (!action.sharesCount) return null;
    return (
      <button className="btn btn-default disabled">{action.sharesCount}</button>
    );
  }

  render() {
    const action = this.props.action;
    const shared = action.currentUserShared;

    return (
      <div className="btn-group btn-group-xs">
        {this.renderSharesCount()}
        <button onClick={this.share.bind(this)} title="Поделиться"
                className={'btn btn-default' + (shared ? ' active' : '')}>
          <span className="glyphicon glyphicon-share-alt" />
        </button>
      </div>
    );
  }
}

ShareButton.propTypes = {
  action: React.PropTypes.object.isRequired,
};
