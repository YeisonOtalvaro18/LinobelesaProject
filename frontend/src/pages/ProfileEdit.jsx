import React, { useState, useEffect } from "react";
import "../styles/profile-edit.css";
import Modal from "../components/Modal"; // Importar el componente Modal
import UpdateModal from "../components/UpdateModal"; // Importar el modal de actualización

const ProfileEdit = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar el modal
  
  // Estados para departamentos y ciudades
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    profile: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      address: "", // Nuevo campo
      city: "",    // Nuevo campo
      department: "", // Nuevo campo
      country: "Colombia"  
    }
  });

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    cargarPerfil();
    cargarDepartamentos();
  }, []);

  // Cargar ciudades cuando se carga un departamento existente
  useEffect(() => {
    if (profileData.profile.department && !loading) {
      cargarCiudades(profileData.profile.department);
    }
  }, [profileData.profile.department, loading]);

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

        let formattedDate = "";
        if (userData.profile?.dateOfBirth) {
          const date = new Date(userData.profile.dateOfBirth);
          if (!isNaN(date.getTime())) { // Verificar si la fecha es válida
            formattedDate = date.toISOString().split('T')[0];
          } else {
            console.warn("Fecha inválida detectada en userData.profile.dateOfBirth:", userData.profile.dateOfBirth);
            formattedDate = ""; // Asignar un valor predeterminado válido
          }
        }

        const formattedData = {
          name: userData.name || "",
          lastName: userData.profile?.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          profile: {
            firstName: userData.profile?.firstName || userData.name || "",
            lastName: userData.profile?.lastName || "",
            dateOfBirth: formattedDate,
            gender: userData.profile?.gender || "",
            address: userData.profile?.address || "", // Nuevo campo
            city: userData.profile?.city || "",       // Nuevo campo
            department: userData.profile?.department || "", // Nuevo campo
            country: userData.profile?.country || "Colombia"  // Siempre Colombia
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

  // Función para cargar departamentos
  const cargarDepartamentos = async () => {
    try {
      setLoadingDepartamentos(true);
      const response = await fetch('http://localhost:8000/api/departamentos/list');
      const data = await response.json();
      
      if (data.success) {
        setDepartamentos(data.data);
      } else {
        console.error("Error al cargar departamentos:", data.message);
      }
    } catch (error) {
      console.error("Error cargando departamentos:", error);
    } finally {
      setLoadingDepartamentos(false);
    }
  };

  // Función para cargar ciudades de un departamento
  const cargarCiudades = async (departamento) => {
    if (!departamento) {
      setCiudades([]);
      return;
    }

    try {
      setLoadingCiudades(true);
      const response = await fetch(`http://localhost:8000/api/departamentos/${encodeURIComponent(departamento)}/ciudades`);
      const data = await response.json();
      
      if (data.success) {
        setCiudades(data.data);
      } else {
        console.error("Error al cargar ciudades:", data.message);
        setCiudades([]);
      }
    } catch (error) {
      console.error("Error cargando ciudades:", error);
      setCiudades([]);
    } finally {
      setLoadingCiudades(false);
    }
  };

  // Función para manejar cambio de departamento
  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    
    // Actualizar el departamento en el estado
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        department: selectedDepartment,
        city: "" // Limpiar la ciudad cuando cambia el departamento
      }
    }));

    // Cargar las ciudades del departamento seleccionado
    cargarCiudades(selectedDepartment);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si es un cambio de departamento, usar la función específica
    if (name === 'profile.department') {
      handleDepartmentChange(e);
      return;
    }

    if (name.startsWith('profile.')) {
      const profileField = name.replace('profile.', '');
      
      setProfileData(prev => {
        const newData = {
          ...prev,
          profile: {
            ...prev.profile,
            [profileField]: value
          }
        };

        // Sincronizar firstName con name
        if (profileField === 'firstName') {
          newData.name = value;
        }
        // Sincronizar lastName entre profile.lastName y lastName principal
        if (profileField === 'lastName') {
          newData.lastName = value;
        }

        return newData;
      });
    } else {
      setProfileData(prev => {
        const newData = {
          ...prev,
          [name]: value
        };

        // Sincronizar name con profile.firstName
        if (name === 'name') {
          newData.profile = {
            ...prev.profile,
            firstName: value
          };
        }
        // Sincronizar lastName con profile.lastName
        if (name === 'lastName') {
          newData.profile = {
            ...prev.profile,
            lastName: value
          };
        }

        return newData;
      });
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
        setIsModalVisible(true); // Mostrar el modal

        localStorage.setItem('user', JSON.stringify(data.data.user));

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

          {/* Información Personal */}
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

          {/* Información de Dirección */}
          <div className="form-section">
            <h2>Información de Dirección</h2>
            <div className="form-group">
              <label htmlFor="profile.address">Dirección</label>
              <input
                type="text"
                id="profile.address"
                name="profile.address"
                value={profileData.profile.address}
                onChange={handleInputChange}
                placeholder="Calle Principal 123"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="profile.department">Departamento</label>
                <select
                  id="profile.department"
                  name="profile.department"
                  value={profileData.profile.department}
                  onChange={handleInputChange}
                  disabled={loadingDepartamentos}
                >
                  <option value="">
                    {loadingDepartamentos ? "Cargando..." : "Seleccionar departamento"}
                  </option>
                  {departamentos.map((dept) => (
                    <option key={dept.id} value={dept.departamento}>
                      {dept.departamento}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="profile.city">Ciudad</label>
                <select
                  id="profile.city"
                  name="profile.city"
                  value={profileData.profile.city}
                  onChange={handleInputChange}
                  disabled={!profileData.profile.department || loadingCiudades}
                >
                  <option value="">
                    {!profileData.profile.department 
                      ? "Primero selecciona un departamento" 
                      : loadingCiudades 
                      ? "Cargando ciudades..." 
                      : "Seleccionar ciudad"}
                  </option>
                  {ciudades.map((ciudad, index) => (
                    <option key={index} value={ciudad}>
                      {ciudad}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>País</label>
              <input
                type="text"
                value="Colombia"
                disabled
                className="country-readonly"
                style={{ 
                  backgroundColor: '#f8f9fa', 
                  color: '#6c757d',
                  border: '1px solid #e9ecef',
                  cursor: 'not-allowed'
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                Actualmente solo disponible para Colombia
              </small>
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

      {/* Modal de éxito */}
      {isModalVisible && (
        <UpdateModal 
          open={isModalVisible} // Usar el modal de actualización
          onClose={() => setIsModalVisible(false)}
        />
      )}
    </div>
  );
};

export default ProfileEdit;