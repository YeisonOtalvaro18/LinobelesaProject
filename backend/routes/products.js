const express = require('express');
const router = express.Router();
const connectDB = require('../db');
const { ObjectId } = require('mongodb');

// Ruta de debug para verificar la base de datos
router.get('/debug', async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ error: 'No se pudo conectar a la base de datos' });
    }

    const collections = await db.listCollections().toArray();
    const products = db.collection('products');
    const productCount = await products.countDocuments();
    const sampleProducts = await products.find().limit(3).toArray();

    res.json({
      message: 'Debug de base de datos',
      database: 'DataLinobelesa',
      collections: collections.map(c => c.name),
      productCount,
      sampleProducts
    });
  } catch (err) {
    console.error('Error en debug:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para crear productos de prueba
router.post('/seed', async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ error: 'No se pudo conectar a la base de datos' });
    }

    const products = db.collection('products');
    const existingCount = await products.countDocuments();

    if (existingCount > 0) {
      return res.json({ message: `Ya existen ${existingCount} productos en la base de datos` });
    }

    const sampleProducts = [
      {
        name: 'Champú Reparador',
        description: 'Champú especial para cabello dañado',
        category: 'Cuidado Capilar',
        price: 25000,
        images: ['/src/IMG/CHAMPUS-AROMINA-BIO.jpg'],
        stock: 10,
        createdAt: new Date()
      },
      {
        name: 'Cepillo Desenredante',
        description: 'Cepillo suave para todo tipo de cabello',
        category: 'Accesorios',
        price: 15000,
        images: ['/src/IMG/cepillo.jpg'],
        stock: 20,
        createdAt: new Date()
      },
      {
        name: 'Tratamiento Keratina',
        description: 'Tratamiento profesional con keratina brasileña',
        category: 'Tratamientos',
        price: 85000,
        images: ['/src/IMG/brazilianKeratina.jpg'],
        stock: 5,
        createdAt: new Date()
      }
    ];

    const result = await products.insertMany(sampleProducts);
    
    res.json({ 
      message: 'Productos de prueba creados exitosamente',
      insertedCount: result.insertedCount,
      products: sampleProducts
    });
  } catch (err) {
    console.error('Error al crear productos de prueba:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/all', async (req, res) => {
  try {
    console.log('🔍 GET /api/products/all - Solicitando todos los productos');
    
    const db = await connectDB();
    if (!db) {
      console.error('❌ No se pudo conectar a la base de datos');
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }
    
    console.log('✅ Conexión a DB exitosa, accediendo a colección products');
    const products = db.collection('products');
    
    // Contar productos antes de obtenerlos
    const productCount = await products.countDocuments();
    console.log(`📊 Total de productos en la colección: ${productCount}`);
    
    const allProducts = await products.find().toArray();
    console.log(`📦 Productos obtenidos: ${allProducts.length}`);
    console.log('📋 Primeros productos:', allProducts.slice(0, 2));
    
    res.json(allProducts);
  } catch (err) {
    console.error('❌ Error al obtener productos:', err);
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
      images: [image],
      imageUrl: image
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

// Ruta para actualizar un producto (datos generales y imagen)
router.put('/:id', async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }

    const products = db.collection('products');
    const productId = req.params.id;
    const { name, description, category, price, stock, image, removeImage } = req.body;

    const updateFields = {};
    if (typeof name !== 'undefined') updateFields.name = name;
    if (typeof description !== 'undefined') updateFields.description = description;
    if (typeof category !== 'undefined') updateFields.category = category;
    if (typeof price !== 'undefined') updateFields.price = parseFloat(price);
    if (typeof stock !== 'undefined') updateFields.stock = Number(stock);

    if (removeImage) {
      // Clear any stored image references
      updateFields.images = [];
      updateFields.imageUrl = null;
    }

    if (typeof image !== 'undefined' && image) {
      // keep compatibility with front-end which may expect imageUrl or images[0]
      updateFields.images = [image];
      updateFields.imageUrl = image;
    }

    const result = await products.updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Ruta para actualizar el stock de un producto
router.put('/:id/stock', async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }

    const products = db.collection('products');
    const inventory = db.collection('inventory');

    const productId = req.params.id;
    const { newStock, reason, action, quantity } = req.body;

    // Actualizar el stock del producto
    const result = await products.updateOne(
      { _id: new ObjectId(productId) },
      { $set: { stock: newStock } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    // Registrar el movimiento en el inventario
    const inventoryEntry = {
      productId: new ObjectId(productId),
      action,
      quantity,
      previousStock: req.body.previousStock,
      newStock,
      reason,
      createdAt: new Date()
    };

    await inventory.insertOne(inventoryEntry);

    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar stock:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Ruta para eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }

    const products = db.collection('products');
    const productId = req.params.id;

    const result = await products.deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Exportar el router
module.exports = router;
