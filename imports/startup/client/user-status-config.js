import { Tracker } from 'meteor/tracker';
import { UserStatus } from 'meteor/mizzao:user-status';

Tracker.autorun(computation => {
  try {
    UserStatus.startMonitor();
    computation.stop();
  }
  catch (error) {
    if (error.message != 'Can\'t start idle monitor until synced to server')
      throw error;
  }
});
