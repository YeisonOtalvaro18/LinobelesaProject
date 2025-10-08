const express = require('express');
const router = express.Router();
const connectDB = require('../db');
const { ObjectId } = require('mongodb');

// Obtener todos los reviews
router.get('/', async (req, res) => {
  try {
    console.log('🔍 GET /api/reviews - Solicitando todas las reseñas');
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }

    const reviews = db.collection('reviews');
    const reviewCount = await reviews.countDocuments();
    console.log(`📊 Total de reseñas en la colección: ${reviewCount}`);

    const reviewsList = await reviews.find().sort({ createdAt: -1 }).toArray();
    console.log(`📦 Reseñas obtenidas: ${reviewsList.length}`);
    
    res.json(reviewsList);
  } catch (err) {
    console.error('Error al obtener reviews:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Obtener reviews por producto
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`🔍 GET /api/reviews/product/${productId} - Solicitando reseñas del producto`);
    
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }

    const reviews = db.collection('reviews');
    const reviewsList = await reviews.find({ productId: new ObjectId(productId) }).sort({ createdAt: -1 }).toArray();
    console.log(`📦 Reseñas del producto obtenidas: ${reviewsList.length}`);
    
    res.json(reviewsList);
  } catch (err) {
    console.error('Error al obtener reviews del producto:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Crear un nuevo review con estructura actualizada
router.post('/', async (req, res) => {
  try {
    const { productId, usuario, texto, rating = 5, userId, userName, comment } = req.body;
    
    // Aceptar tanto la nueva estructura como la antigua para compatibilidad
    const finalUsuario = usuario || userName;
    const finalTexto = texto || comment;
    
    if (!productId || !finalUsuario || !finalTexto) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan campos requeridos: productId, usuario, texto' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'La calificación debe estar entre 1 y 5' });
    }

    console.log('📝 POST /api/reviews - Creando nueva reseña');
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }

    const newReview = {
      productId: new ObjectId(productId),
      usuario: finalUsuario,
      texto: finalTexto.trim(),
      fecha: new Date(),
      rating: parseInt(rating),
      imagenes: req.body.imagenes || [],
      respuestas: [],
      reacciones: {
        corazon: 0,
        like: 0,
        risa: 0,
        triste: 0
      }
    };

    const reviews = db.collection('reviews');
    const result = await reviews.insertOne(newReview);
    
    const savedReview = { ...newReview, _id: result.insertedId };
    console.log(`✅ Reseña creada exitosamente con ID: ${result.insertedId}`);
    
    res.json({ success: true, review: savedReview });
  } catch (err) {
    console.error('Error al crear review:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Eliminar un review por ID
router.delete('/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    console.log(`🗑️ DELETE /api/reviews/${reviewId} - Eliminando reseña`);
    
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }

    const reviews = db.collection('reviews');
    const result = await reviews.deleteOne({ _id: new ObjectId(reviewId) });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Reseña eliminada exitosamente`);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Review no encontrado' });
    }
  } catch (err) {
    console.error('Error al eliminar review:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Actualizar un review
router.put('/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'La calificación debe estar entre 1 y 5' });
    }

    console.log(`✏️ PUT /api/reviews/${reviewId} - Actualizando reseña`);
    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }

    const reviews = db.collection('reviews');
    const result = await reviews.findOneAndUpdate(
      { _id: new ObjectId(reviewId) },
      { 
        $set: { 
          rating: parseInt(rating), 
          texto: comment.trim(), 
          fecha: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    if (result.value) {
      console.log(`✅ Reseña actualizada exitosamente`);
      res.json({ success: true, review: result.value });
    } else {
      res.status(404).json({ success: false, error: 'Review no encontrado' });
    }
  } catch (err) {
    console.error('Error al actualizar review:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Agregar o actualizar reacciones
router.post('/:id/reaccion', async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { tipo } = req.body; // tipo: 'corazon', 'like', 'risa', 'triste'
    
    console.log(`❤️ POST /api/reviews/${reviewId}/reaccion - Agregando reacción: ${tipo}`);
    
    if (!['corazon', 'like', 'risa', 'triste'].includes(tipo)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tipo de reacción no válido' 
      });
    }

    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }

    const reviews = db.collection('reviews');
    const result = await reviews.findOneAndUpdate(
      { _id: new ObjectId(reviewId) },
      { 
        $inc: { [`reacciones.${tipo}`]: 1 }
      },
      { returnDocument: 'after' }
    );

    if (result.value) {
      console.log(`✅ Reacción ${tipo} agregada exitosamente`);
      res.json({ success: true, review: result.value });
    } else {
      res.status(404).json({ success: false, error: 'Review no encontrado' });
    }
  } catch (err) {
    console.error('Error al agregar reacción:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Agregar respuesta a un review
router.post('/:id/respuesta', async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { usuario, texto } = req.body;
    
    console.log(`💬 POST /api/reviews/${reviewId}/respuesta - Agregando respuesta`);
    
    if (!usuario || !texto) {
      return res.status(400).json({ 
        success: false, 
        error: 'Usuario y texto son requeridos' 
      });
    }

    const db = await connectDB();
    if (!db) {
      return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    }

    const nuevaRespuesta = {
      _id: new ObjectId(),
      usuario: usuario,
      texto: texto,
      fecha: new Date()
    };

    const reviews = db.collection('reviews');
    const result = await reviews.findOneAndUpdate(
      { _id: new ObjectId(reviewId) },
      { 
        $push: { respuestas: nuevaRespuesta }
      },
      { returnDocument: 'after' }
    );

    if (result.value) {
      console.log(`✅ Respuesta agregada exitosamente`);
      res.json({ success: true, review: result.value, respuesta: nuevaRespuesta });
    } else {
      res.status(404).json({ success: false, error: 'Review no encontrado' });
    }
  } catch (err) {
    console.error('Error al agregar respuesta:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
