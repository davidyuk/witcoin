import React from 'react';
import Helmet from 'react-helmet';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { FormattedPlural } from 'react-intl';

import { Actions } from '../../../api/actions';
import Action from '../../../ui/components/Action';
import RemoveButton from '../../../ui/components/RemoveButton';

import CurrentUserBalance from './CurrentUserBalance';
import CoinsAmount from './CoinsAmount';
import { Reserves } from '../reserves';
import { PRECISION_FACTOR } from '../constants';

const ReserveListPage = ({ reserves }) => <div>
  <Helmet title="Зарезервированные кленинки" />

  {!reserves.length && <i>Зарезервированных кленинок не найдено</i>}

  <div className="list-group">
    {reserves.map(reserve => <div className="list-group-item">
      <FormattedPlural value={reserve.amount / PRECISION_FACTOR}
                       one="Зарезервирована"
                       other="Зарезервировано" />
      &nbsp;<CoinsAmount value={reserve.amount} />
      {reserve.action && <div className="pull-right">
        <RemoveButton action={reserve.action} />
      </div>}
      {reserve.action && <Action action={reserve.action} isShared />}
    </div>)}
  </div>

  <CurrentUserBalance />
</div>;

ReserveListPage.propTypes = {
  reserves: React.PropTypes.arrayOf(React.PropTypes.object),
};

export default createContainer(
  ({}) => {
    Meteor.subscribe('reserves');
    const reserves = Reserves.find({userId: Meteor.userId()}).fetch();
    reserves.forEach(reserve => reserve.action = Actions.findOne({'extra.reserveId': reserve._id}));
    return {reserves};
  },
  ReserveListPage
);
