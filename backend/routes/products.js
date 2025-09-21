const express = require('express');
const router = express.Router();
const connectDB = require('../db');


router.get('/all', async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }
    const products = db.collection('products');
    const allProducts = await products.find().toArray();
    res.json(allProducts);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.post('/add', async (req, res) => {
  try {
    console.log("[POST /add] Body recibido:", req.body);
    const db = await connectDB();
    if (!db) {
      console.error("No se pudo conectar a la base de datos");
      return res.status(500).json({ success: false, error: "Error de conexión a la base de datos" });
    }
    const products = db.collection("products");

    const { name, description, category, price, image } = req.body;

    if (!name || !description || !category || !price || !image) {
      console.error("Campos obligatorios faltantes", { name, description, category, price, image });
      return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
    }

    const newProduct = {
      name,
      description,
      category,
      price: parseFloat(price),
      images: [image]
    };

    const result = await products.insertOne(newProduct);

    if (result.insertedId) {
      console.log("Producto insertado:", newProduct);
      res.json({ success: true, productId: result.insertedId });
    } else {
      console.error("No se insertó el producto");
      res.status(500).json({ success: false, error: "No se insertó el producto" });
    }
  } catch (err) {
    console.error("Error al guardar producto:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
});

// Exportar el router
module.exports = router;
