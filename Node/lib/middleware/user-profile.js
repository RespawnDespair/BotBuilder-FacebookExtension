"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise");
const graphApiUrl = 'https://graph.facebook.com/v2.6';
const defaultFields = ['first_name', 'last_name', 'profile_pic', 'locale', 'timezone', 'gender', 'is_payment_enabled', 'last_ad_referral'];
exports.RetrieveUserProfile = (options) => {
    return {
        botbuilder: (session, next) => {
            if (session.message.source !== 'facebook') {
                next();
                return;
            }
            const expireMinutes = (options.expireMinutes !== undefined ? options.expireMinutes : 60 * 24) * 1000 * 60;
            const currentTime = new Date().getTime();
            const lastUpdated = session.userData.facebook_last_updated;
            if (session.userData.facebook_last_updated !== undefined && (lastUpdated + expireMinutes) >= currentTime) {
                next();
                return;
            }
            const fields = ((options.fields !== undefined && options.fields.length > 0) ? options.fields : defaultFields);
            const userProfileRequest = {
                url: `${graphApiUrl}/${session.message.address.user.id}?fields=${fields.join()}`,
                qs: { access_token: options.accessToken },
                method: 'GET',
                json: true
            };
            request(userProfileRequest)
                .then((user) => {
                session.userData.facebook = {};
                for (let field of fields) {
                    if (user[field] === undefined) {
                        continue;
                    }
                    session.userData.facebook[field] = user[field];
                }
                session.userData.facebook_last_updated = currentTime;
                next();
            })
                .catch((response) => {
                session.userData.facebook = {};
                for (let field of fields) {
                    session.userData.facebook[field] = '';
                }
                if (response.error !== undefined) {
                    console.error(response.error);
                }
                else {
                    console.log(response);
                }
                next();
            });
        }
    };
};
