const Category = require("../models/Category");

async function listCategories() {
  return await Category.findAll({
    attributes: ["id_category", "name_category"],
    order: [["id_category", "ASC"]],
  });
}

module.exports = {
  listCategories,
};
