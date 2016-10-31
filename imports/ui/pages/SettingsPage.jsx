import React from 'react';
import { Meteor } from 'meteor/meteor';

import EmailSettings from '../components/EmailSettings';
import ServiceSettings from '../components/ServiceSettings';
import { injectUser } from '../injectors';

const SettingsPage = ({ user }) => {
  if (!user) return <span>Загрузка</span>;

  const updatePersonalData = event => {
    event.preventDefault();
    Meteor.users.update(Meteor.userId(), {$set: {
      'profile.firstName': event.target.firstName.value,
      'profile.lastName': event.target.lastName.value,
      'profile.gender': event.target.gender.value,
    }});
  };

  const textField = (placeholder, fieldName) =>
    <div className="form-group">
      <label className="col-sm-3 control-label" htmlFor={fieldName}>{placeholder}</label>
      <div className="col-sm-9">
        <input className="form-control" id={fieldName} name={fieldName} placeholder={placeholder} required="required"
               defaultValue={user.profile[fieldName]} />
      </div>
    </div>;

  const radioButton = (placeholder, name, value) => {
    const checked = user.profile[name] == value;
    return (
      <label className={'btn btn-default' + (checked ? ' active' : '')}>
        <input type="radio" name={name} id={name + '-' + value} value={value} defaultChecked={checked}/>{placeholder}
      </label>
    );
  };

  return <div>
    <h2>Личные данные</h2>
    <form className="form-horizontal" onSubmit={updatePersonalData}>
      {textField('Имя', 'firstName')}
      {textField('Фамилия', 'lastName')}
      <div className="form-group">
        <label className="col-sm-3 control-label" htmlFor={'gender-' + Meteor.users.genderTypes.MALE}>Ваш пол</label>
        <div className="col-sm-9">
          <div className="btn-group" data-toggle="buttons">
            {radioButton('мужской', 'gender', Meteor.users.genderTypes.MALE)}
            {radioButton('женский', 'gender', Meteor.users.genderTypes.FEMALE)}
          </div>
        </div>
      </div>
      <div className="form-group">
        <div className="col-sm-offset-3 col-sm-9">
          <button className="btn btn-default" type="submit">Сохранить</button>
        </div>
      </div>
    </form>
    <EmailSettings user={user} />
    <ServiceSettings user={user} />
  </div>;
};

SettingsPage.propTypes = {
  user: React.PropTypes.object,
};

export default injectUser(SettingsPage);
