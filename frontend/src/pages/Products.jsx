import React, { useState, useEffect } from "react";
import "../styles/products.css";

function Products({ addToCart, isAdmin = false, isAuthenticated = false }) {
  // 🧩 Estados
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: null,
  });
  // No usamos estado local de carrito: App.jsx gestiona el carrito global

  // 🔄 Cargar productos desde MongoDB
  const fetchProducts = async () => {
    try {
      // intentar leer cache corta en sessionStorage
      const cacheKey = "products_cache_v1";
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const age = Date.now() - (parsed.ts || 0);
          // TTL 10 minutos
          if (age < 1000 * 60 * 10 && Array.isArray(parsed.data)) {
            setProducts(parsed.data);
            return;
          }
        } catch {
          // invalid cache -> continue
        }
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/all`
      );
      const data = await response.json();
      setProducts(data);
      try {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ ts: Date.now(), data })
        );
      } catch {
        /* no-fatal */
      }
    } catch (error) {
      console.error("❌ Error al cargar productos:", error);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  // 🖼️ Imagen preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        // 1MB
        alert("La imagen es demasiado grande. Elige una menor a 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setForm((f) => ({ ...f, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // 📦 Agregar producto al backend
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const { name, price, description, category, image } = form;
    if (!name || !price || !description || !category || !image) {
      alert("Todos los campos son obligatorios");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, price, description, category, image }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setForm({
          name: "",
          price: "",
          description: "",
          category: "",
          image: null,
        });
        await fetchProducts();
      } else {
        alert("Error al guardar: " + (data.error || "Error desconocido"));
      }
    } catch (err) {
      alert("Error de conexión: " + err.message);
    }
  };

  // 🛒 Añadir al carrito
  const handleAddToCart = (product) => {
    if (addToCart) {
      // Usar la función del carrito global desde App.jsx
      addToCart(product);
    } else {
      // Fallback mínimo: si no hay addToCart disponible, notificamos
      alert("Función de carrito no disponible en este contexto");
    }
  };

  // ...carrito gestionado globalmente en App.jsx

  return (
    <section className="products">
      <h2>Nuestros Productos</h2>

      {/* 📝 Formulario - Solo para Administradores */}
      {isAdmin && (
        <form className="product-form" onSubmit={handleAddProduct}>
          <input
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            type="number"
            placeholder="Precio"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <textarea
            placeholder="Descripción"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            required
          />
          <input
            type="text"
            placeholder="Categoría"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          <button type="submit">Agregar producto</button>
        </form>
      )}

      {/* 🧾 Vista de productos */}
      <div className="product-grid">
        {products.map((prod) => (
          <div key={prod._id} className="product-card">
            {prod.images?.[0] && <img src={prod.images[0]} alt={prod.name} />}
            <h3>{prod.name}</h3>
            <p className="desc">{prod.description}</p>
            <p className="price">
              ${parseFloat(prod.price).toLocaleString("es-CO")}
            </p>
            {/* Botón carrito solo para clientes autenticados (no admin) */}
            {isAuthenticated && !isAdmin && (
              <button onClick={() => handleAddToCart(prod)}>
                Añadir al carrito
              </button>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => alert("Debes iniciar sesión para comprar")}
              >
                Iniciar sesión para comprar
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Carrito local eliminado de la vista de Productos (se gestiona desde Header/App) */}
    </section>
  );
}

export default Products;
