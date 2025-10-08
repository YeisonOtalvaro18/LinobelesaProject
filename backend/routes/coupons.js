const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const {
  verificarToken,
  verificarAdmin,
} = require("../middleware/autenticacion");

// GET /api/coupons - listar cupones activos
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    if (!db) throw new Error("DB no disponible");
    const items = await db
      .collection("coupons")
      .find({ active: true })
      .toArray();
    return res.json(items);
  } catch (err) {
    console.error("Error fetching coupons:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error al obtener cupones" });
  }
});

// POST /api/coupons - crear un cupón (protegido, admin)
router.post("/", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const payload = req.body || {};
    const code = (payload.code || "").trim().toUpperCase();
    const discount = Number(payload.discount) || 0;
    if (!code || discount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Código o descuento inválido" });
    }

    const coupon = {
      code,
      discount,
      description: payload.description || "",
      active: payload.active !== false,
      createdAt: new Date().toISOString(),
    };

    const db = await connectDB();
    if (!db) throw new Error("DB no disponible");
    const existing = await db.collection("coupons").findOne({ code });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Cupón ya existe" });
    }
    const result = await db.collection("coupons").insertOne(coupon);
    return res.json({
      success: true,
      insertedId: result.insertedId,
      coupon: { ...coupon, _id: result.insertedId },
    });
  } catch (err) {
    console.error("Error creating coupon:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error al crear cupón" });
  }
});

// POST /api/coupons/validate - validar código de cupón
router.post("/validate", async (req, res) => {
  try {
    const code = (req.body?.code || "").trim().toUpperCase();
    if (!code)
      return res
        .status(400)
        .json({ success: false, valid: false, message: "Código requerido" });
    const db = await connectDB();
    if (!db) throw new Error("DB no disponible");
    const coupon = await db
      .collection("coupons")
      .findOne({ code, active: true });
    if (!coupon) return res.json({ success: true, valid: false });
    // posible chequeo de expiración en coupon.expiresAt si se añade en el futuro
    return res.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        description: coupon.description || "",
      },
    });
  } catch (err) {
    console.error("Error validating coupon:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error al validar cupón" });
  }
});

module.exports = router;
