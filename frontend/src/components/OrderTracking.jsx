import React, { useEffect, useState } from "react";
import "../styles/orderTracking.css";

// Props:
// - orders: optional array de pedidos
// Si no se pasan, intenta leer desde localStorage "orders"
export default function OrderTracking({ orders: propOrders }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadAndEnrich = async () => {
      // obtener pedidos (prop o localStorage)
      let current = [];
      if (propOrders && Array.isArray(propOrders)) {
        current = propOrders.slice();
      } else {
        const stored = JSON.parse(localStorage.getItem("orders") || "[]");
        current = (stored || []).slice().reverse();
      }

      // intentar cargar productos del catálogo para recuperar imágenes originales
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/all`
        );
        if (res.ok) {
          const products = await res.json();
          const byId = new Map(products.map((p) => [p._id, p]));
          const byName = new Map(products.map((p) => [p.name, p]));

          current = current.map((o) => {
            const items = (o.items || []).map((it) => {
              // resolver imagen preferida
              let img =
                it.image ||
                (it.images && it.images[0]) ||
                it.productImage ||
                it.img ||
                it.imageUrl ||
                it.thumbnail ||
                "";
              if (!img) {
                const prod = byId.get(it._id) || byName.get(it.name);
                if (prod) {
                  img = prod.image || (prod.images && prod.images[0]) || "";
                }
              }
              return {
                ...it,
                image: img,
                images: it.images || (img ? [img] : []),
              };
            });
            return { ...o, items };
          });
        }
      } catch (err) {
        // si falla la petición, dejamos los pedidos tal cual
        console.error(
          "No se pudo cargar productos para enriquecer imágenes:",
          err
        );
      }

      if (mounted) setOrders(current);
    };

    loadAndEnrich();
    return () => {
      mounted = false;
    };
  }, [propOrders]);

  if (!orders || orders.length === 0) {
    return (
      <section className="order-tracking">
        <h2>Seguimiento de pedidos</h2>
        <p>No se encontraron pedidos.</p>
      </section>
    );
  }

  return (
    <section className="order-tracking">
      <h2>Seguimiento de pedidos</h2>
      <div className="orders-list">
        {orders.map((o) => (
          <article className="order-card" key={o._id}>
            <div className="order-header">
              <div>
                <strong>ID:</strong> {o._id}
              </div>
              <div className={`status ${o.status?.toLowerCase()}`}>
                {o.status}
              </div>
            </div>
            <div className="order-body">
              <ul>
                {o.items?.map((it) => (
                  <li key={it._id} className="order-item">
                    <img
                      src={
                        it.images?.[0] ||
                        it.image ||
                        "/src/IMG/logolinobelesa.jpg"
                      }
                      alt={it.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/src/IMG/logolinobelesa.jpg";
                      }}
                    />
                    <div className="info">
                      <div className="name">{it.name}</div>
                      <div className="meta">
                        Cantidad: {it.qty} • $
                        {Number(it.price).toLocaleString("es-CO")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-footer">
              <div>
                Total pagado:{" "}
                <strong>${Number(o.total).toLocaleString("es-CO")}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
