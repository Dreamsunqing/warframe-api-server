const { getwg } = require("../utils/getWg.js");
const { success, error } = require("../utils/apiResponse.js");

const wgController = {
  getAll: async (req, res) => {
    const data = await getwg();
    res.json(success(data.data));
  },
};
module.exports = wgController;
