const ActiveCampaignApi = require("activecampaign-api");
const constants = require('../utils/constants')
const client = new ActiveCampaignApi.ApiClient({
  accountName: constants.key.activename,
  key: constants.key.activekey
});

const helper = new ActiveCampaignApi.ApiHelper(client);

module.exports = {
  subscribeUser: async (email, firstName, lastName) => {
    try {
      return await helper.subscribe(
        { email, first_name: firstName, last_name: lastName },
        { listIds: [1] }
      );
    } catch (err) {
      return { error: err };
    }
  }
};
