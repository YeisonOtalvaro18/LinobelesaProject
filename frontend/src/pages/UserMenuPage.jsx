import React, { useState } from "react";

export default function UserMenuPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="user-menu">
      <button onClick={() => setOpen(!open)}>Usuario</button>
      {open && (
        <ul>
          <li>Perfil</li>
          <li>Mis pedidos</li>
          <li>Cerrar sesión</li>
        </ul>
      )}
    </div>
  );
}