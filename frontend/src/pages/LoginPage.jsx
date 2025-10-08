import React, { useState } from "react";
import AuthSuccessModal from "../components/AuthSuccessModal";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import "../styles/login.css";

const API_URL = "http://localhost:8000/api/auth";

const LoginPage = ({ onNavigate, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  // Estados para login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  // Estados para registro
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("login"); // "login" o "register"
  const [currentUser, setCurrentUser] = useState(null);

  // Validaciones registro
  const rules = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>._]/.test(password),
    noSpaces: !/\s/.test(password),
    match: password === confirm && password.length > 0,
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Completa todos los campos");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        // Guardar token en localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Llamar callback de login exitoso desde App.jsx
        if (onLoginSuccess) {
          onLoginSuccess(data.data.user);
        }
        
        // Configurar y mostrar modal
        setCurrentUser(data.data.user);
        setModalType("login");
        setShowModal(true);
        setLoginError("");
      } else {
        setLoginError(data.message || "Error en el login");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setLoginError("Error de conexión con el servidor");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nombre || !apellido || !email) {
      setRegisterError("Completa todos los campos");
      return;
    }
    if (!rules.length || !rules.lowercase || !rules.uppercase || !rules.number || !rules.special || !rules.noSpaces || !rules.match) {
      setRegisterError("Revisa los requisitos de la contraseña.");
      return;
    }

    setRegisterLoading(true);
    setRegisterError("");

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nombre,
          lastName: apellido,
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Guardar token en localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Llamar callback de login exitoso desde App.jsx
        if (onLoginSuccess) {
          onLoginSuccess(data.data.user);
        }
        
        // Configurar y mostrar modal
        setCurrentUser(data.data.user);
        setModalType("register");
        setShowModal(true);
        setRegisterError("");
        
        // Limpiar formulario
        setNombre("");
        setApellido("");
        setEmail("");
        setPassword("");
        setConfirm("");
      } else {
        if (data.errors && data.errors.length > 0) {
          setRegisterError(data.errors.map(err => err.msg).join(", "));
        } else {
          setRegisterError(data.message || "Error en el registro");
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setRegisterError("Error de conexión con el servidor");
    } finally {
      setRegisterLoading(false);
    }
  };

  // Función para manejar la navegación desde el modal
  const handleModalContinue = () => {
    setShowModal(false);
    // Navegar según el rol del usuario
    if (currentUser) {
      const isAdmin = currentUser.rol && (currentUser.rol.name === 'admin' || currentUser.rol.name === 'administrador');
      if (isAdmin) {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('bienvenida');
      }
    } else {
      onNavigate('inicio');
    }
  };

  // Función para cerrar el modal
  const handleModalClose = () => {
    setShowModal(false);
    onNavigate('inicio'); // Navegar al inicio o quedarse en la página actual
  };

  return (
    <div className="auth-container">
      {/* Sección de marca */}
      <div className="brand-section">
        <img src="../src/IMG/logoheader.png" alt="Logo" className="brand-image" />
        <h2>Bienvenido a Linobelesa</h2>
        <p>Descubre lo mejor de nuestra tienda online.</p>
      </div>

      {/* Sección de formularios */}
      <div className="forms-section">
        {isLogin ? (
          <form className="login-form" onSubmit={handleLogin}>
            <h3>Iniciar sesión</h3>
            <input
              type="text"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loginLoading}>
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>
            {loginError && <p className="error">{loginError}</p>}
            {successMessage && <p className="success">{successMessage}</p>}
            <p
              className="auth-switch"
              onClick={() => setIsLogin(false)}
              style={{ marginTop: "16px", cursor: "pointer" }}
            >
              ¿No tienes cuenta? Regístrate
            </p>
          </form>
        ) : (
          <form className="register-form" onSubmit={handleRegister}>
            <h3>Registro</h3>
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="password-rules">
              <p><strong>La contraseña debe cumplir:</strong></p>
              <ul>
                <li className={rules.lowercase ? "valid" : "invalid"}>Al menos una letra minúscula</li>
                <li className={rules.uppercase ? "valid" : "invalid"}>Al menos una letra mayúscula</li>
                <li className={rules.number ? "valid" : "invalid"}>Al menos un número</li>
                <li className={rules.special ? "valid" : "invalid"}>Al menos un carácter especial (!@#$%^&*)</li>
                <li className={rules.length ? "valid" : "invalid"}>Mínimo 8 caracteres</li>
                <li className={rules.noSpaces ? "valid" : "invalid"}>No debe contener espacios</li>
                <li className={rules.match ? "valid" : "invalid"}>Las contraseñas coinciden</li>
              </ul>
            </div>
            {registerError && <p className="error">{registerError}</p>}
            {successMessage && <p className="success">{successMessage}</p>}
            <button type="submit" className="auth-button" disabled={registerLoading}>
              {registerLoading ? "Registrando..." : "Registrarme"}
            </button>
            <p
              className="auth-switch"
              onClick={() => setIsLogin(true)}
              style={{ marginTop: "16px", cursor: "pointer" }}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </p>
          </form>
        )}
      </div>

      {/* Modal de éxito */}
      <AuthSuccessModal
        isOpen={showModal}
        type={modalType}
        userName={currentUser?.name}
        onContinue={handleModalContinue}
        onClose={handleModalClose}
      />

      {showModal && modalType === "login" && (
        <LoginModal 
          open={showModal} 
          onClose={() => setShowModal(false)}
        />
      )}

      {showModal && modalType === "register" && (
        <RegisterModal 
          open={showModal} 
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default LoginPage;
