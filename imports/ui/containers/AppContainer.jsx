import { createContainer } from 'meteor/react-meteor-data';
import App from '../layouts/App.jsx';

export default createContainer(() => {
  const user = Meteor.user();
  return {
    user,
  };
}, App);