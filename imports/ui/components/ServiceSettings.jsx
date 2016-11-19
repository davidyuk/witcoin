import React from 'react';
import { Meteor } from 'meteor/meteor';

import { capitalize } from '../../helpers/capitalize';

const ServiceSettings = ({ user }) => {
  const getServiceAccountInfo = serviceData => {
    const res = [];
    if (serviceData.name) res.push(serviceData.name);
    else {
      const r = [];
      r.push(serviceData.first_name || serviceData.given_name);
      r.push(serviceData.last_name || serviceData.family_name);
      res.push(r.filter(a => a).join(' '));
    }
    res.push(serviceData.email);
    return res.filter(a => a).join(', ');
  };

  const getServiceButtons = () => AccountsTemplates.oauthServices()
    .filter(service => !user.services[service._id])
    .map((service, i) =>
      <button className="btn at-social-btn" id={'at-' + service._id} key={service._id}
              onClick={() => Meteor['linkWith' + capitalize(service._id)]()}>
        <i className={'fa fa-' + service._id} /> Подключить {AccountsTemplates.getServiceVerboseName(service._id)}
      </button>
    );

  const genServiceUnlinkHandler = serviceName => event => {
    event.preventDefault();
    Meteor.call('user.service.remove', serviceName);
  };

  return <div>
    <h2>Аккаунты сторонних сервисов</h2>
    Указанные ниже аккаунты сторонних сервисов можно использовать для входа в систему
    {window.location.host != 'witcoin.ru'
      ? <span> (сейчас работает только на <a href="http://witcoin.ru/">witcoin.ru</a>)</span> : null}.
    <table className="table table-noTopBorder">
      <tbody>
      {user.services && Object.keys(user.services).length ? Object.keys(user.services).map((name, i) =>
        <tr key={name}>
          <td>
            {`${AccountsTemplates.getServiceVerboseName(name)} (${getServiceAccountInfo(user.services[name])})`}
          </td>
          <td style={{textAlign: 'right'}}>
            <a href="#" title="Отключить аккаунт" onClick={genServiceUnlinkHandler(name)}>
              <span className="glyphicon glyphicon-remove text-danger"/>
            </a>
          </td>
        </tr>
      ) :
        <tr>
          <td>
            <i>Нет подключенных аккаунтов сторонних сервисов</i>
          </td>
        </tr>
      }
      </tbody>
    </table>

    <div className="btn-group-justified hidden-xs">
      {getServiceButtons().map((button, i, array) =>
        <div className="btn-group" key={i} style={i == array.length - 1 ? {} : {paddingRight: '5px'}}>
          {button}
        </div>
      )}
    </div>
    <div className="hidden-sm hidden-md hidden-lg">
      {getServiceButtons()}
    </div>
  </div>;
};

ServiceSettings.propTypes = {
  user: React.PropTypes.object.isRequired,
};

export default ServiceSettings;
