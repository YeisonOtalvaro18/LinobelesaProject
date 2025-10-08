import React, { useState, useEffect } from "react";
import "../styles/checkout.css";
import { validateCheckoutForm, inputFilters } from "../utils/validations";

// Props:
// - cart: array de productos { _id, name, price, qty, images }
// - onSubmit(order): optional callback cuando se finaliza la compra
// - clearCart(): optional callback para limpiar el carrito
// - user: datos del usuario logueado
export default function Checkout({ cart = [], onSubmit, clearCart, user }) {
  const [localCart, setLocalCart] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [addressDesc, setAddressDesc] = useState("");
  const [idType, setIdType] = useState("Cédula de ciudadanía");
  const [idNumber, setIdNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // inicializar copia local del carrito (para editar cantidades sin tocar global)
    setLocalCart(cart.map((p) => ({ ...p, qty: p.qty || 1 })));
  }, [cart]);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    // COMENTADO TEMPORALMENTE - La ruta /api/users/profile no existe
    /*
    const loadUserData = async () => {
      if (user?.email) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const userData = await response.json();
            // Pre-llenar formulario con datos del usuario
            setFirstName(userData.nombre || userData.firstName || "");
            setLastName(userData.apellido || userData.lastName || "");
            setAddress(userData.direccion || userData.address || "");
            setAddressDesc(userData.descripcionDireccion || userData.addressDesc || "");
            setIdType(userData.tipoDocumento || userData.idType || "Cédula de ciudadanía");
            setIdNumber(userData.numeroDocumento || userData.idNumber || "");
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          // Si no se pueden cargar los datos del servidor, usar los datos básicos del user
          if (user) {
            setFirstName(user.nombre || user.firstName || "");
            setLastName(user.apellido || user.lastName || "");
            setIdNumber(user.numeroDocumento || user.idNumber || "");
          }
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
    */
    
    // Funcionalidad simplificada: usar datos básicos del usuario si están disponibles
    if (user) {
      setFirstName(user.nombre || user.firstName || "");
      setLastName(user.apellido || user.lastName || "");
      setIdNumber(user.numeroDocumento || user.idNumber || "");
    }
  }, [user]);

  const changeQty = (id, qty) => {
    if (qty < 1) qty = 1;
    setLocalCart((c) => c.map((it) => (it._id === id ? { ...it, qty } : it)));
  };

  // Función para validar todos los campos del formulario usando validaciones externas
  const validateForm = () => {
    const formData = {
      firstName,
      lastName,
      address,
      addressDesc,
      idNumber,
      idType,
      cart: localCart
    };

    const validation = validateCheckoutForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const subtotal = localCart.reduce(
    (acc, it) => acc + (Number(it.price) || 0) * (it.qty || 1),
    0
  );
  const discount = subtotal * couponDiscount;
  const total = subtotal - discount;

  const applyCoupon = () => {
    const code = (coupon || "").trim().toUpperCase();
    if (!code) {
      setCouponDiscount(0);
      alert("Ingrese un código de cupón");
      return;
    }

    // Intentar validar en backend; si falla, usar reglas locales como fallback
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/coupons/validate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          }
        );
        const data = await res.json();
        if (res.ok && data.success && data.valid) {
          const discountRate = Number(data.coupon.discount) || 0;
          setCouponDiscount(discountRate);
          alert(
            `Cupón aplicado: ${Math.round(discountRate * 100)}% de descuento`
          );
          return;
        }
        // Si no es válido según el backend, fallback a reglas locales
      } catch (err) {
        console.error("Error validando cupón en backend:", err);
      }

      // Reglas sencillas locales como respaldo
      if (code === "LINO10" || code === "DISCOUNT10") {
        setCouponDiscount(0.1);
        alert("Cupón aplicado: 10% de descuento");
      } else if (code === "SUMMER15") {
        setCouponDiscount(0.15);
        alert("Cupón aplicado: 15% de descuento");
      } else {
        setCouponDiscount(0);
        alert("Cupón no válido");
      }
    })();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      alert(`Error en el formulario: ${firstError}`);
      return;
    }

    const order = {
      customer: { firstName, lastName, address, addressDesc, idType, idNumber },
      paymentMethod,
      coupon: coupon || null,
      items: localCart.map((it) => ({
        _id: it._id,
        name: it.name,
        price: it.price,
        qty: it.qty,
        // incluir imágenes si existen para que el seguimiento pueda mostrarlas
        images: it.images || (it.image ? [it.image] : []),
      })),
      subtotal,
      discount,
      total,
      createdAt: new Date().toISOString(),
      status: "Pendiente",
    };

    // Función para sanear imágenes antes de persistir: evitar grandes data URLs (base64)
    const sanitizeOrder = (ord) => {
      const items = (ord.items || []).map((it) => {
        const imgs = (it.images || []).filter(
          (img) => typeof img === "string" && !img.startsWith("data:")
        );
        const image =
          it.image &&
          typeof it.image === "string" &&
          !it.image.startsWith("data:")
            ? it.image
            : imgs[0] || "";
        return { ...it, images: imgs, image };
      });
      return { ...ord, items };
    };

    setSending(true);
    try {
      // Si el consumidor de este componente provee onSubmit, lo usamos.
      const orderToSend = sanitizeOrder(order);
      if (onSubmit) {
        await onSubmit(orderToSend);
      } else {
        // Intentar enviar al backend
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/orders`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderToSend),
            }
          );
          const data = await res.json();
          if (res.ok && data.success) {
            alert("Pedido enviado al servidor: " + (data.insertedId || "OK"));
            if (clearCart) clearCart();
          } else {
            // fallback a localStorage
            const existing = JSON.parse(localStorage.getItem("orders") || "[]");
            const id = `ORD-${Date.now()}`;
            const toSave = { ...orderToSend, _id: id };
            existing.push(toSave);
            localStorage.setItem("orders", JSON.stringify(existing));
            alert(
              "No se pudo guardar en servidor, pedido guardado localmente: " +
                id
            );
            if (clearCart) clearCart();
          }
        } catch (err) {
          console.error("Error enviando pedido al servidor:", err);
          const existing = JSON.parse(localStorage.getItem("orders") || "[]");
          const id = `ORD-${Date.now()}`;
          const toSave = { ...orderToSend, _id: id };
          existing.push(toSave);
          localStorage.setItem("orders", JSON.stringify(existing));
          alert("Error de red, pedido guardado localmente: " + id);
          if (clearCart) clearCart();
        }
      }
      // limpiar formulario
      setFirstName("");
      setLastName("");
      setAddress("");
      setAddressDesc("");
      setIdNumber("");
      setCoupon("");
      setCouponDiscount(0);
      setLocalCart([]);
    } catch (err) {
      console.error(err);
      alert("Error al enviar el pedido: " + (err.message || err));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="checkout">
      <h2>Finalizar compra</h2>

      <div className="checkout-grid">
        <div className="checkout-cart">
          <h3>Productos en el carrito</h3>
          {localCart.length === 0 ? (
            <p>Tu carrito está vacío</p>
          ) : (
            <ul>
              {localCart.map((it) => (
                <li key={it._id} className="checkout-item">
                  <img src={it.images?.[0] || it.image || ""} alt={it.name} />
                  <div className="checkout-item-info">
                    <strong>{it.name}</strong>
                    <span className="small">
                      ${Number(it.price).toLocaleString("es-CO")}
                    </span>
                    <div className="qty">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={it.qty}
                        onChange={(e) =>
                          changeQty(it._id, Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="summary">
            <div>Subtotal: ${subtotal.toLocaleString("es-CO")}</div>
            {discount > 0 && (
              <div>Descuento: -${discount.toLocaleString("es-CO")}</div>
            )}
            <div className="total">Total: ${total.toLocaleString("es-CO")}</div>
          </div>

          <div className="coupon">
            <input
              placeholder="Cupón (ej: LINO10)"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button type="button" onClick={applyCoupon}>
              Aplicar
            </button>
          </div>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Datos de envío</h3>
          {loading && <div className="loading">Cargando datos del usuario...</div>}
          
          <div className="row">
            <div className="input-group">
              <input
                placeholder="Nombre"
                value={firstName}
                onChange={(e) => {
                  const value = inputFilters.filterLettersOnly(e.target.value);
                  setFirstName(value);
                  if (errors.firstName) {
                    setErrors(prev => ({ ...prev, firstName: null }));
                  }
                }}
                className={errors.firstName ? 'error' : ''}
                required
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            
            <div className="input-group">
              <input
                placeholder="Apellido"
                value={lastName}
                onChange={(e) => {
                  const value = inputFilters.filterLettersOnly(e.target.value);
                  setLastName(value);
                  if (errors.lastName) {
                    setErrors(prev => ({ ...prev, lastName: null }));
                  }
                }}
                className={errors.lastName ? 'error' : ''}
                required
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="input-group">
            <input
              placeholder="Dirección (ej: Calle 25 # 21 12)"
              value={address}
              onChange={(e) => {
                const value = inputFilters.filterAddressChars(e.target.value);
                setAddress(value);
                if (errors.address) {
                  setErrors(prev => ({ ...prev, address: null }));
                }
              }}
              className={errors.address ? 'error' : ''}
              required
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>
          
          <div className="input-group">
            <input
              placeholder="Descripción de la casa (piso, referencia)"
              value={addressDesc}
              onChange={(e) => {
                const value = inputFilters.filterDescriptionChars(e.target.value);
                setAddressDesc(value);
                if (errors.addressDesc) {
                  setErrors(prev => ({ ...prev, addressDesc: null }));
                }
              }}
              className={errors.addressDesc ? 'error' : ''}
            />
            {errors.addressDesc && <span className="error-message">{errors.addressDesc}</span>}
          </div>

          <div className="row">
            <select 
              value={idType} 
              onChange={(e) => {
                setIdType(e.target.value);
                if (errors.idNumber) {
                  setErrors(prev => ({ ...prev, idNumber: null }));
                }
              }}
            >
              <option>Cédula de ciudadanía</option>
              <option>NIT</option>
              <option>Cédula extranjera</option>
              <option>Pasaporte</option>
            </select>
            
            <div className="input-group">
              <input
                placeholder="Número de identificación"
                value={idNumber}
                onChange={(e) => {
                  let value = e.target.value;
                  
                  // Usar filtros externos según el tipo de documento
                  if (idType === "Cédula de ciudadanía" || idType === "NIT" || idType === "Cédula extranjera") {
                    value = inputFilters.filterNumbersOnly(value);
                  } else if (idType === "Pasaporte") {
                    value = inputFilters.filterAlphanumeric(value);
                  }
                  
                  setIdNumber(value);
                  if (errors.idNumber) {
                    setErrors(prev => ({ ...prev, idNumber: null }));
                  }
                }}
                className={errors.idNumber ? 'error' : ''}
                required
                maxLength={idType === "Pasaporte" ? 12 : (idType === "Cédula extranjera" ? 12 : (idType === "NIT" ? 11 : 10))}
              />
              {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}
            </div>
          </div>
          
          {errors.cart && <div className="error-message cart-error">{errors.cart}</div>}

          <h4 style={{ margin: "8px 0 6px 0", color: "#a749eb", fontSize: "1rem" }}>Método de pago</h4>
          <div className="payment">
            <label>
              <input
                type="radio"
                name="pay"
                value="Efectivo"
                checked={paymentMethod === "Efectivo"}
                onChange={() => setPaymentMethod("Efectivo")}
              />{" "}
              Efectivo
            </label>
            <label>
              <input
                type="radio"
                name="pay"
                value="Transferencia"
                checked={paymentMethod === "Transferencia"}
                onChange={() => setPaymentMethod("Transferencia")}
              />{" "}
              Transferencia
            </label>
          </div>

          <button
            className="send"
            type="submit"
            disabled={sending || localCart.length === 0}
          >
            {sending
              ? "Enviando..."
              : `Enviar pedido - Total: $${total.toLocaleString("es-CO")}`}
          </button>
        </form>
      </div>
    </section>
  );
}
