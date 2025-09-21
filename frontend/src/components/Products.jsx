import React, { useState, useEffect } from "react";
import "../styles/products.css";

function Products() {
  // 🧩 Estados
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: null
  });
  const [cart, setCart] = useState([]);

  // 🔄 Cargar productos desde MongoDB
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/all`);
      const data = await response.json();
      setProducts(data);
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
      const reader = new FileReader();
      reader.onloadend = () => setForm(f => ({ ...f, image: reader.result }));
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, description, category, image }),
      });
      const data = await response.json();
      if (data.success) {
        setForm({ name: "", price: "", description: "", category: "", image: null });
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
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      setCart(cart.map((item) =>
        item._id === product._id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // ❌ Eliminar del carrito
  const handleRemoveFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  return (
    <section className="products">
      <h2>Nuestros Productos</h2>

      {/* 📝 Formulario */}
      <form className="product-form" onSubmit={handleAddProduct}>
        <input
          type="text"
          placeholder="Nombre"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          required
        />
        <textarea
          placeholder="Descripción"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Categoría"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
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
            <button onClick={() => handleAddToCart(prod)}>Añadir al carrito</button>
          </div>
        ))}
      </div>

      {/* 🛍️ Carrito */}
      <div className="cart">
        <h3>🛒 Carrito</h3>
        {cart.length === 0 ? (
          <p>El carrito está vacío</p>
        ) : (
          <ul>
            {cart.map((item) => (
              <li key={item._id}>
                {item.name} x{item.qty} - $
                {(item.price * item.qty).toLocaleString("es-CO")}
                <button onClick={() => handleRemoveFromCart(item._id)}>❌</button>
              </li>
            ))}
          </ul>
        )}
        {cart.length > 0 && (
          <p className="total">
            Total: $
            {cart.reduce((acc, item) => acc + item.price * item.qty, 0).toLocaleString("es-CO")}
          </p>
        )}
      </div>
    </section>
  );
}

export default Products;
