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
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.83 9L15 12.16C15 12.11 15 12.05 15 12C15 10.34 13.66 9 12 9C11.94 9 11.89 9 11.83 9ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.77 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.09L19.73 22L21 20.73L3.27 3L2 4.27ZM12 7C14.76 7 17 9.24 17 12C17 12.64 16.87 13.26 16.64 13.82L19.57 16.75C21.07 15.5 22.27 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8.04 5.21L10.17 7.34C10.76 7.13 11.37 7 12 7Z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"/>
            </svg>
          )}
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
          {showConfirm ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.83 9L15 12.16C15 12.11 15 12.05 15 12C15 10.34 13.66 9 12 9C11.94 9 11.89 9 11.83 9ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.77 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.09L19.73 22L21 20.73L3.27 3L2 4.27ZM12 7C14.76 7 17 9.24 17 12C17 12.64 16.87 13.26 16.64 13.82L19.57 16.75C21.07 15.5 22.27 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8.04 5.21L10.17 7.34C10.76 7.13 11.37 7 12 7Z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"/>
            </svg>
          )}
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
