import React from 'react';

export default class EmailSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }

  addEmailHandler(event) {
    event.preventDefault();
    Meteor.call('user.email.add', event.target.email.value, error => {
      if (error)
        this.setState({
          error: EmailSettings.prototype._addEmailErrorMessages[error.error] || 'Произошла неизвестная ошибка',
        });
      else {
        this.setState({error: null});
        this.input.value = '';
      }
    });
  }

  static registerCanRemoveEmailChecker(checker) {
    EmailSettings.prototype._canRemoveEmailCheckers.push(checker);
  }

  static registerAddEmailErrorMessage(error, message) {
    EmailSettings.prototype._addEmailErrorMessages[error] = message;
  }

  static registerNoticeComponent(component) {
    EmailSettings.prototype._noticeComponents.push(component);
  }

  genHandler(method, email) {
    return event => {
      event.preventDefault();
      Meteor.call(method, email);
    }
  }

  renderEmailAction(email) {
    if (email.verified && email.primary) return null;
    if (email.verified) return (
      <a onClick={this.genHandler('user.email.markAsPrimary', email.address)} href="#">
        Отметить как основной
      </a>
    );
    return <span>
      {email.verifyEmailSend ? 'Письмо отправленно. ' : null}
      <a onClick={this.genHandler('user.email.sendVerification', email.address)} href="#">
        {email.verifyEmailSend ? 'Переотправить' : 'Отправить письмо'}
      </a>
    </span>;
  }

  render() {
    const user = this.props.user;

    return <div>
      <h2>Адреса электронной почты</h2>
      Указанные ниже email адреса можно использовать для входа в систему.
      <table className="table table-noTopBorder">
        <tbody>
        {user.emails && user.emails.length ? user.emails.map((email, i) =>
          <tr key={email.address}>
            <td>
              {email.address}
              &nbsp;
              {email.verified ? null : <span className="label label-default">Не подтверждён</span>}
              {email.primary ? <span className="label label-success">Основной</span> : null}
            </td>
            <td style={{textAlign: 'right'}}>
              {this.renderEmailAction(email)}&nbsp;
              {!this._canRemoveEmailCheckers.find(c => !c(email)) ? (
                <a onClick={this.genHandler('user.email.remove', email.address)} href="#" title="Удалить email">
                  <span className="glyphicon glyphicon-remove text-danger" />
                </a>
              ) : null}
            </td>
          </tr>
        ) :
          <tr>
            <td>
              <i>Нет указанных email адресов</i>
            </td>
          </tr>
        }
        </tbody>
      </table>
      {EmailSettings.prototype._noticeComponents.map((Component, i) =>
        <Component key={i} {...this.props} />
      )}
      <form className="form-horizontal" onSubmit={this.addEmailHandler.bind(this)}>
        <div className={'form-group' + (this.state.error ? ' has-error' : '')}>
          <label className="col-sm-3 control-label" htmlFor="email">Добавить email адрес</label>
          <div className="col-sm-9">
            <input type="email" name="email" placeholder="Email" id="email" className="form-control" required
                   ref={c => this.input = c} />
            {this.state.error ? <span className="help-block">{this.state.error}</span> : null}
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-3 col-sm-9">
            <button className="btn btn-default" type="submit">Добавить</button>
          </div>
        </div>
      </form>
    </div>;
  }
}

EmailSettings.prototype._canRemoveEmailCheckers = [];
EmailSettings.prototype._addEmailErrorMessages = {
  403: 'Этот email уже зарегистрирован другим пользователем',
};
EmailSettings.prototype._noticeComponents = [];

EmailSettings.propTypes = {
  user: React.PropTypes.object.isRequired,
};
