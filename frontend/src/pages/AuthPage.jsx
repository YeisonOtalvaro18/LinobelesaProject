import React, { useState } from "react";
import LoginForm from "./LoginPage";
import RegisterForm from "./RegisterForm";
import Modal from "./Modal";
import "../styles/login.css";

const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [modal, setModal] = useState({ open: false, message: "", loading: false });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState(false);

  const toggleForm = () => setShowLogin(!showLogin);

  const validatePassword = (pwd, confirmPwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push("Al menos 8 caracteres");
    if (!/[A-Z]/.test(pwd)) errors.push("Al menos una mayúscula");
    if (!/[a-z]/.test(pwd)) errors.push("Al menos una minúscula");
    if (!/\d/.test(pwd)) errors.push("Al menos un número");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push("Al menos un carácter especial");
    if (pwd !== confirmPwd) errors.push("Las contraseñas no coinciden");
    return errors;
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    const errors = validatePassword(password, confirmPassword);
    setPasswordError(errors.join(", "));
    if (errors.length === 0) {
      setModal({ open: true, message: "Procesando...", loading: true });
      setTimeout(() => {
        setModal({ open: true, message: "¡Registro exitoso! 🎉", loading: false });
        setPassword("");
        setConfirmPassword("");
        setTouched(false);
      }, 1800);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setModal({ open: true, message: "Procesando...", loading: true });
    setTimeout(() => {
      setModal({ open: true, message: "¡Inicio de sesión exitoso! 🎉", loading: false });
    }, 1800);
  };

  return (
    <div className="auth-container">
      <div className="brand-section">
        <img
          src="../src/IMG/logovertical-removebg-preview.png"
          alt="Productos de belleza"
          className="brand-image"
        />
      </div>

      <div className="forms-section">
        {showLogin ? (
          <LoginForm onSubmit={handleLoginSubmit} toggleForm={toggleForm} />
        ) : (
          <RegisterForm
            onSubmit={handleRegisterSubmit}
            toggleForm={toggleForm}
            password={password}
            confirmPassword={confirmPassword}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}
            touched={touched}
            setTouched={setTouched}
            passwordError={passwordError}
          />
        )}
      </div>

      {/* Modal reutilizable */}
      <Modal
        open={modal.open}
        message={modal.message}
        loading={modal.loading}
        onClose={() => setModal({ open: false, message: "", loading: false })}
      />
    </div>
  );
};

export default AuthPage;
