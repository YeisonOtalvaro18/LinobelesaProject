const express = require("express");
const router = express.Router();
const connectDB = require("../db");

// Helper: sanea objetos de imágenes (elimina data: URIs)
function sanitizeOrderPayload(order) {
  const items = (order.items || []).map((it) => {
    const imgs = (it.images || []).filter(
      (img) => typeof img === "string" && !img.startsWith("data:")
    );
    const image = imgs[0] || "";
    return { ...it, images: imgs, image };
  });
  return { ...order, items };
}

// POST /api/orders - crear un pedido
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (
      !payload.customer ||
      !Array.isArray(payload.items) ||
      payload.items.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Payload inválido" });
    }

    const order = sanitizeOrderPayload({
      ...payload,
      status: payload.status || "Pendiente",
      createdAt: new Date().toISOString(),
    });

    const db = await connectDB();
    if (!db) throw new Error("DB no disponible");

    const result = await db.collection("orders").insertOne(order);
    return res.json({
      success: true,
      insertedId: result.insertedId,
      order: { ...order, _id: result.insertedId },
    });
  } catch (err) {
    console.error("Error saving order:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error al guardar pedido" });
  }
});

// GET /api/orders - listar pedidos (opcionalmente ?limit=10)
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) throw new Error("DB no disponible");
    const limit = parseInt(req.query.limit || "0", 10) || 0;
    const cursor = db.collection("orders").find({}).sort({ createdAt: -1 });
    if (limit > 0) cursor.limit(limit);
    const items = await cursor.toArray();
    return res.json(items);
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error al obtener pedidos" });
  }
});

// GET /api/orders/:id - obtener pedido por id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
    if (!db) throw new Error("DB no disponible");
    const ObjectId = require("mongodb").ObjectId;
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;
    const order = await db.collection("orders").findOne({ _id });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Pedido no encontrado" });
    return res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error al obtener pedido" });
  }
});

module.exports = router;
