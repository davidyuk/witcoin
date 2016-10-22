import React from 'react';

export default class ShareButton extends React.Component {
  share() {
    Meteor.call('action.share', this.props.action._id, this._input.value);
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
    const modalId = 'share_modal_' + action._id;

    return (
      <span>
        <div className="modal fade" id={modalId} style={{textAlign: 'left'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
                <h4 className="modal-title">Поделиться действием</h4>
              </div>
              <div className="modal-body">
                <textarea ref={c => this._input = c} className="form-control" placeholder="Ваш комментарий" />
              </div>
              <div className="modal-footer">
                <button onClick={this.share.bind(this)} className="btn btn-primary" data-dismiss="modal">
                  Сохранить
                </button>
                <button className="btn btn-default" data-dismiss="modal">Отмена</button>
              </div>
            </div>
          </div>
        </div>
        <div className="btn-group btn-group-xs">
          {this.renderSharesCount()}
          <button title="Поделиться" data-toggle="modal" data-target={'#' + modalId}
                  className={'btn btn-default' + (shared ? ' active' : '')}>
            <span className="glyphicon glyphicon-share-alt" />
          </button>
        </div>
      </span>
    );
  }
}

ShareButton.propTypes = {
  action: React.PropTypes.object.isRequired,
};
