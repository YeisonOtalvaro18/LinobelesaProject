const { ObjectId } = require("mongodb");

function createProductSchema(data) {
  return {
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    category: data.category || "general",
    stock: parseInt(data.stock),
    image: data.image || "",
    createdAt: new Date(),
  };
}

module.exports = { createProductSchema };
