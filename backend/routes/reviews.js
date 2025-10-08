const express = require('express');
const router = express.Router();
// Eliminar un review por ID
router.delete('/:id', async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    const reviews = db.collection('reviews');
    const reviewId = req.params.id;
    const ObjectId = require('mongodb').ObjectId;
    const result = await reviews.deleteOne({ _id: ObjectId(reviewId) });
    if (result.deletedCount === 1) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Review no encontrado' });
    }
  } catch (err) {
    console.error('Error al eliminar review:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});
const connectDB = require('../db');

// Obtener todos los reviews
router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    const reviews = db.collection('reviews');
    const allReviews = await reviews.find().toArray();
    res.json(allReviews);
  } catch (err) {
    console.error('Error al obtener reviews:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Crear un nuevo review
router.post('/', async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    const reviews = db.collection('reviews');
    const { usuario, texto, fecha, respuestas, reacciones } = req.body;
    if (!usuario || !texto || !fecha) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
    }
    const newReview = { usuario, texto, fecha, respuestas: respuestas || [], reacciones: reacciones || {} };
    const result = await reviews.insertOne(newReview);
    res.json(result.ops ? result.ops[0] : newReview);
  } catch (err) {
    console.error('Error al crear review:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});


// Agregar una respuesta a un review
router.post('/:id/reply', async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) return res.status(500).json({ success: false, error: 'No se pudo conectar a la base de datos' });
    const reviews = db.collection('reviews');
    const reviewId = req.params.id;
    const { usuario, texto, fecha } = req.body;
    if (!usuario || !texto || !fecha) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios en la respuesta' });
    }
  const ObjectId = require('mongodb').ObjectId;
  const respuesta = { _id: new ObjectId(), usuario, texto, fecha };
    const result = await reviews.updateOne(
      { _id: require('mongodb').ObjectId(reviewId) },
      { $push: { respuestas: respuesta } }
    );
    if (result.modifiedCount === 1) {
      // Devuelve el review actualizado
      const reviewActualizado = await reviews.findOne({ _id: require('mongodb').ObjectId(reviewId) });
      res.json(reviewActualizado);
    } else {
      res.status(404).json({ success: false, error: 'Review no encontrado' });
    }
  } catch (err) {
    console.error('Error al agregar respuesta:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
