// Coupons.jsx
import React, { useEffect, useState } from "react";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons`);
        const data = await res.json();
        if (res.ok) setCoupons(data || []);
      } catch (err) {
        console.error("Error fetching coupons:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h3>Cupones disponibles</h3>
      {loading ? (
        <p>Cargando...</p>
      ) : coupons.length === 0 ? (
        <p>No hay cupones disponibles</p>
      ) : (
        <ul>
          {coupons.map((c) => (
            <li key={c._id || c.code}>
              <strong>{c.code}</strong> - {Math.round((c.discount || 0) * 100)}%{" "}
              {c.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
