import React from 'react';

export default class VoteButton extends React.Component {
  getVoteHandler(rate) {
    return () => {
      Meteor.call('action.rate', this.props.action._id, rate);
    }
  }

  renderRating() {
    const action = this.props.action;

    if (!action.rates.up && !action.rates.down) return null;
    return (
      <button className="btn btn-default disabled"
              title={`Нравится: ${action.rates.up}, не нравится: ${action.rates.down}`}>
        {action.rates.up - action.rates.down}
      </button>
    );
  }

  render() {
    const action = this.props.action;
    const rate = action.currentUserRate;

    return (
      <div className="btn-group btn-group-xs">
        {this.renderRating()}
        <button onClick={this.getVoteHandler(rate == 1 ? 0 : 1)} title="Нравится"
                className={'btn btn-default' + (rate == 1 ? ' active' : '')}>
          <span className="glyphicon glyphicon-arrow-up" />
        </button>
        <button onClick={this.getVoteHandler(rate == -1 ? 0 : -1)} title="Не нравится"
                className={'btn btn-default' + (rate == -1 ? ' active' : '')}>
          <span className="glyphicon glyphicon-arrow-down" />
        </button>
      </div>
    );
  }
}

VoteButton.propTypes = {
  action: React.PropTypes.object.isRequired,
};
