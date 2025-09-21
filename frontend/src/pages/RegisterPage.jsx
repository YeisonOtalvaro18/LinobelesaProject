import React, { useState } from "react";

const RegisterPage = ({ onSuccess }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  // Validaciones dinámicas
// reglas de la contraseña
const rules = {
  length: password.length >= 8,
  lowercase: /[a-z]/.test(password),
  uppercase: /[A-Z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[!@#$%^&*(),.?":{}|<>._]/.test(password), // ahora incluye "."
};


  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !nombre ||
      !apellido ||
      !email ||
      !rules.letra ||
      !rules.mayuscula ||
      !rules.numero ||
      !rules.especial ||
      !rules.longitud ||
      !rules.espacios ||
      !rules.coincide
    ) {
      setError("Revisa los requisitos de la contraseña.");
      return;
    }

    setError("");
    onSuccess(); // abre modal éxito
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Registro</h2>
      <p>Crea tu nueva cuenta</p>

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Contraseña */}
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      {/* Confirmar */}
      <div className="password-wrapper">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowConfirm(!showConfirm)}
        >
          {showConfirm ? "🙈" : "👁️"}
        </button>
      </div>

      {/* Bloque de validaciones */}
      <div className="password-rules">
        <p><strong>La contraseña debe cumplir:</strong></p>
        <ul>
          <li className={rules.letra ? "valid" : "invalid"}>Al menos una letra minúscula</li>
          <li className={rules.mayuscula ? "valid" : "invalid"}>Al menos una letra mayúscula</li>
          <li className={rules.numero ? "valid" : "invalid"}>Al menos un número</li>
          <li className={rules.especial ? "valid" : "invalid"}>Al menos un carácter especial (!@#$%^&*)</li>
          <li className={rules.longitud ? "valid" : "invalid"}>Mínimo 8 caracteres</li>
          <li className={rules.espacios ? "valid" : "invalid"}>No debe contener espacios</li>
          <li className={rules.coincide ? "valid" : "invalid"}>Las contraseñas coinciden</li>
        </ul>
      </div>

      {error && <p className="error">{error}</p>}

      <button type="submit" className="auth-button">
        Registrarme
      </button>
    </form>
  );
};

export default RegisterPage;
