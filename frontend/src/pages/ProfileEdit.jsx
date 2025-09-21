import React, { useState, useEffect } from "react";
import "../styles/profile-edit.css";

const ProfileEdit = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Estados para los datos del perfil
  const [profileData, setProfileData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    profile: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: ""
    }
  });

  // Estado para los datos originales (para comparar cambios)
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No se encontró token de autenticación");
        onNavigate('login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        const userData = data.data.user;
        
        // Formatear fecha para input date
        let formattedDate = "";
        if (userData.profile?.dateOfBirth) {
          const date = new Date(userData.profile.dateOfBirth);
          formattedDate = date.toISOString().split('T')[0];
        }

        const formattedData = {
          name: userData.name || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          profile: {
            firstName: userData.profile?.firstName || userData.name || "",
            lastName: userData.profile?.lastName || userData.lastName || "",
            dateOfBirth: formattedDate,
            gender: userData.profile?.gender || ""
          }
        };

        setProfileData(formattedData);
        setOriginalData(formattedData);
      } else {
        setError(data.message || "Error al cargar el perfil");
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('profile.')) {
      const profileField = name.replace('profile.', '');
      setProfileData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const hasChanges = () => {
    return JSON.stringify(profileData) !== JSON.stringify(originalData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      setError("No se han realizado cambios");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Perfil actualizado exitosamente");
        setOriginalData(profileData);
        
        // Actualizar localStorage con los nuevos datos
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Redirigir después de un momento
        setTimeout(() => {
          onNavigate('welcome');
        }, 2000);
      } else {
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.map(err => err.msg).join(", "));
        } else {
          setError(data.message || "Error al actualizar el perfil");
        }
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-header">
        <button className="back-btn" onClick={() => onNavigate('welcome')}>
          ← Volver
        </button>
        <h1>Editar Mi Perfil</h1>
      </div>

      <div className="profile-edit-content">
        <form onSubmit={handleSubmit} className="profile-form">
          
          {/* Información Básica */}
          <div className="form-section">
            <h2>Información Básica</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Apellido *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>

          {/* Información del Perfil */}
          <div className="form-section">
            <h2>Información Personal</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="profile.firstName">Primer Nombre</label>
                <input
                  type="text"
                  id="profile.firstName"
                  name="profile.firstName"
                  value={profileData.profile.firstName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="profile.lastName">Apellido</label>
                <input
                  type="text"
                  id="profile.lastName"
                  name="profile.lastName"
                  value={profileData.profile.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="profile.dateOfBirth">Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="profile.dateOfBirth"
                  name="profile.dateOfBirth"
                  value={profileData.profile.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="profile.gender">Género</label>
                <select
                  id="profile.gender"
                  name="profile.gender"
                  value={profileData.profile.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Botones */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => onNavigate('welcome')}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={saving || !hasChanges()}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;