import React, { useState, useEffect } from "react";
import "../styles/checkout.css";
import { validateCheckoutForm, inputFilters } from "../utils/validations";
import { formatPrice } from '../utils/formatPrice';

// Props:
// - cart: array de productos { _id, name, price, qty, images }
// - onSubmit(order): optional callback cuando se finaliza la compra
// - clearCart(): optional callback para limpiar el carrito
// - user: datos del usuario logueado
export default function Checkout({ cart = [], onSubmit, clearCart, user }) {
  const [sending, setSending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [idNumber, setIdNumber] = useState("");
  const [idType, setIdType] = useState("Cédula de ciudadanía");
  const [addressDesc, setAddressDesc] = useState("");
  const [address, setAddress] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState({});
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  // Aplica el cupón ingresado y actualiza el descuento
  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setCouponDiscount(0);
      alert("Ingresa un cupón válido");
      return;
    }
    // Simulación de cupones válidos
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
  };
  const [coupon, setCoupon] = useState("");
  const [localCart, setLocalCart] = useState([]);
  const [couponDiscount, setCouponDiscount] = useState(0);
  // Calcular subtotal, descuento y total
  const subtotal = localCart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  const discount = Math.round(subtotal * (couponDiscount || 0));
  const total = subtotal - discount;
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          if (data && (data.success === undefined || data.success === true)) {
            // El endpoint devuelve directamente los datos del usuario
            setFirstName(data.nombre || data.firstName || data.profile?.firstName || "");
            setLastName(data.apellidos || data.lastName || data.profile?.lastName || "");
            setAddress(data.address || data.direccion || data.profile?.address || "");
            setAddressDesc(data.addressDesc || data.descripcionDireccion || data.profile?.addressDesc || "");
            setMunicipio(data.municipio || data.profile?.municipio || data.city || "");
            setDepartamento(data.departamento || data.profile?.departamento || data.state || "");
            setIdType(data.tipoDocumento || data.idType || data.profile?.idType || "Cédula de ciudadanía");
            setIdNumber(data.numeroDocumento || data.idNumber || data.profile?.idNumber || "");
          } else if (user) {
            setFirstName(user.nombre || user.firstName || "");
            setLastName(user.apellido || user.lastName || "");
            setAddress(user.direccion || user.address || "");
            setAddressDesc(user.descripcionDireccion || user.addressDesc || "");
            setMunicipio(user.municipio || user.city || "");
            setDepartamento(user.departamento || user.state || "");
            setIdType(user.tipoDocumento || user.idType || "Cédula de ciudadanía");
            setIdNumber(user.numeroDocumento || user.idNumber || "");
          }
        } catch (error) {
          console.error("Error cargando datos de usuario:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserProfile();
  }, [user]);
  const changeQty = (id, qty) => {
    setLocalCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, qty: Math.max(1, qty) } : item
      )
    );
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
      customer: { firstName, lastName, address, addressDesc, municipio, departamento, idType, idNumber },
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
                  {(it.images?.[0] || it.image) ? (
                    <img src={it.images?.[0] || it.image} alt={it.name} />
                  ) : null}
                  <div className="checkout-item-info">
                    <strong>{it.name}</strong>
                      <span className="small">
                      ${formatPrice(it.price)}
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
            <div>Subtotal: ${formatPrice(subtotal)}</div>
            {discount > 0 && (
              <div>Descuento: -${formatPrice(discount)}</div>
            )}
            <div className="total">Total: ${formatPrice(total)}</div>
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
          <div className="row">
            <div className="input-group">
              <input
                placeholder="Municipio"
                value={municipio}
                onChange={e => setMunicipio(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                placeholder="Departamento"
                value={departamento}
                onChange={e => setDepartamento(e.target.value)}
                required
              />
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
              : `Enviar pedido - Total: $${formatPrice(total)}`}
          </button>
        </form>
      </div>
    </section>
  );
}
