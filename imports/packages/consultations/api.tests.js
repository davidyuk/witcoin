import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { expect, assert } from 'meteor/practicalmeteor:chai';

import { Actions } from '../../api/actions';
import { FeedItems } from '../../api/feeds';

import { createConsultation, setConsultationActual, createSuggestion } from './api';

if (Meteor.isServer) {
  describe('consultations', () => {
    describe('methods', () => {
      describe('consultation.create', () => {
        const defaultParams = {
          description: 'test',
          canParticipateForFree: false,
          canParticipateWithPaid: false,
        };

        it('fail when try to create consultation without description', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => {
            createConsultation._execute({userId}, {
              canParticipateForFree: true,
            });
          }, Meteor.Error, 'Description is required [validation-error]');
        });

        it('fail when try to create consultation disallowed to participate', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => {
            createConsultation._execute({userId}, {
              ...defaultParams,
            });
          }, Meteor.Error, 'should-be-allowed-to-participate');
        });

        it('fail when try to create consultation with fixedCoinsPerHour and minCoinsPerHour', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => {
            createConsultation._execute({userId}, {
              ...defaultParams,
              canParticipateWithPaid: true,
              fixedCoinsPerHour: 1,
              minCoinsPerHour: 1,
            });
          }, Meteor.Error, 'should-set-one-of-fixedCoinsPerHour-and-minCoinsPerHour');
        });

        it('fail when try to create consultation with disabled payments and minCoinsPerHour', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => {
            createConsultation._execute({userId}, {
              ...defaultParams,
              canParticipateForFree: true,
              minCoinsPerHour: 1,
            });
          }, Meteor.Error, 'when-participate-not-with-paid-cannot-set-fixedCoinsPerHour-or-minCoinsPerHour');
        });

        it('create', () => {
          const description = 'Test consultation.';
          const userId = Factory.create('user')._id;
          createConsultation._execute({userId}, {
            description,
            canParticipateForFree: true,
            canParticipateWithPaid: true,
            fixedCoinsPerHour: 1,
          });

          const action = Actions.findOne({userId});
          expect(action.type).to.equal(Actions.types.CONSULTATION);
          expect(action.description).to.equal(description);
          console.log(JSON.stringify(action.extra));
          expect(action.extra).to.eql({
            canParticipateForFree: true,
            canParticipateWithPaid: true,
            fixedCoinsPerHour: 1,
            actual: true,
            suggestionsCount: 0,
          });
        });
      });

      describe('consultation.actual', () => {
        it('change consultation state', () => {
          const consultation = Factory.create('consultation', {extra: {actual: false}});
          setConsultationActual._execute({userId: consultation.userId}, {
            actionId: consultation._id,
            actual: true,
          });

          const action = Actions.findOne(consultation._id);
          expect(action.extra.actual).to.equal(true);
        });
      });

      describe('consultation.suggestion', () => {
        it('add suggestion', () => {
          const description = 'Test consultation suggestion.';
          const consultationId = Factory.create('consultation', {}, {canParticipateForFree: true})._id;
          const userId = Factory.create('user')._id;
          const suggestionId = createSuggestion._execute({userId}, {
            actionId: consultationId,
            description,
          });

          const suggestion = Actions.findOne(suggestionId);
          expect(suggestion.type).to.equal(Actions.types.CONSULTATION_SUGGESTION);
          expect(suggestion.description).to.equal(description);
          expect(suggestion.userId).to.equal(userId);
          expect(suggestion.objectId).to.equal(consultationId);
          expect(suggestion.extra).to.eql({actual: true});
        });

        it('add suggestion with minutes', () => {
          const consultationId = Factory.create('consultation', {}, {canParticipateForFree: true})._id;
          const userId = Factory.create('user')._id;
          const suggestionId = createSuggestion._execute({userId}, {
            actionId: consultationId,
            minutes: 42,
          });

          expect(Actions.findOne(suggestionId).extra.minutes).to.equal(42);
        });

        it('fail when cannot participate by free and no coinsPerHour supplied', () => {
          const actionId = Factory.create('consultation', {}, {
            canParticipateWithPaid: true,
            canParticipateForFree: false,
          })._id;
          assert.throws(() => {
            createSuggestion._execute({userId: Factory.create('user')._id}, {actionId});
          }, Meteor.Error, 'coinsPerHour-is-required');
        });

        it('fail when coinsPerHour not equal to fixedCoinsPerHour', () => {
          const actionId = Factory.create('consultation', {}, {
            canParticipateForFree: false,
            canParticipateWithPaid: true,
            fixedCoinsPerHour: 1,
          })._id;
          assert.throws(() => {
            createSuggestion._execute({userId: Factory.create('user')._id}, {actionId, coinsPerHour: 2});
          }, Meteor.Error, 'coinsPerHour-not-equal-to-fixedCoinsPerHour');
        });

        it('fail when coinsPerHour less than minCoinsPerHour', () => {
          const actionId = Factory.create('consultation', {}, {
            canParticipateForFree: false,
            canParticipateWithPaid: true,
            minCoinsPerHour: 2,
          })._id;
          assert.throws(() => {
            createSuggestion._execute({userId: Factory.create('user')._id}, {actionId, coinsPerHour: 1});
          }, Meteor.Error, 'coinsPerHour-should-be-above-or-equal-to-minCoinsPerHour');
        });

        it('change suggestions count', () => {
          const removeAction = Meteor.server.method_handlers['action.remove'];
          const consultationId = Factory.create('consultation')._id;
          const assertSuggestionCount = count =>
            expect(Actions.findOne(consultationId).extra.suggestionsCount).to.equal(count);

          assertSuggestionCount(0);
          const suggestion = Factory.create('consultation.suggestion', {objectId: consultationId});
          assertSuggestionCount(1);
          removeAction.call({userId: suggestion.userId}, suggestion._id);
          assertSuggestionCount(0);
        });
      });
    });

    it('create notification', () => {
      const suggestion = Factory.create('consultation.suggestion');
      const consultation = Actions.findOne(suggestion.objectId);
      const notification = FeedItems.findOne({userId: consultation.userId, isNotification: true});
      expect(notification).not.to.equal(undefined);
      expect(notification.actionId).to.equal(suggestion._id);
    });
  });
}
