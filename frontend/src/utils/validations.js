// Validaciones para formularios
export const validationRules = {
  // Validar solo letras y espacios
  isOnlyLetters: (value) => {
    if (!value || typeof value !== 'string') return false;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim());
  },

  // Validar solo números
  isOnlyNumbers: (value) => {
    if (!value || typeof value !== 'string') return false;
    return /^\d+$/.test(value.trim());
  },

  // Validar formato de dirección
  isValidAddress: (value) => {
    if (!value || typeof value !== 'string') return false;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\-\.,]+$/.test(value.trim());
  },

  // Validar descripción (texto con puntuación básica)
  isValidDescription: (value) => {
    if (!value || typeof value !== 'string') return false;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.,\-()]+$/.test(value.trim());
  },

  // Validar pasaporte (alfanumérico)
  isValidPassport: (value) => {
    if (!value || typeof value !== 'string') return false;
    return /^[A-Z0-9]{6,12}$/i.test(value.trim());
  },

  // Validar longitud mínima
  minLength: (value, min) => {
    if (!value || typeof value !== 'string') return false;
    return value.trim().length >= min;
  },

  // Validar longitud máxima
  maxLength: (value, max) => {
    if (!value || typeof value !== 'string') return false;
    return value.trim().length <= max;
  },

  // Validar rango de longitud
  lengthRange: (value, min, max) => {
    if (!value || typeof value !== 'string') return false;
    const length = value.trim().length;
    return length >= min && length <= max;
  }
};

// Validadores específicos por campo
export const validators = {
  // Validar nombre
  validateName: (name) => {
    const errors = [];
    
    if (!name || !name.trim()) {
      errors.push("El nombre es obligatorio");
      return errors;
    }

    if (!validationRules.minLength(name, 2)) {
      errors.push("El nombre debe tener al menos 2 caracteres");
    }

    if (!validationRules.isOnlyLetters(name)) {
      errors.push("El nombre solo puede contener letras");
    }

    return errors;
  },

  // Validar apellido
  validateLastName: (lastName) => {
    const errors = [];
    
    if (!lastName || !lastName.trim()) {
      errors.push("El apellido es obligatorio");
      return errors;
    }

    if (!validationRules.minLength(lastName, 2)) {
      errors.push("El apellido debe tener al menos 2 caracteres");
    }

    if (!validationRules.isOnlyLetters(lastName)) {
      errors.push("El apellido solo puede contener letras");
    }

    return errors;
  },

  // Validar dirección
  validateAddress: (address) => {
    const errors = [];
    
    if (!address || !address.trim()) {
      errors.push("La dirección es obligatoria");
      return errors;
    }

    if (!validationRules.minLength(address, 8)) {
      errors.push("La dirección debe ser más específica (ej: Calle 25 # 21 12)");
    }

    if (!validationRules.isValidAddress(address)) {
      errors.push("La dirección contiene caracteres no válidos");
    }

    return errors;
  },

  // Validar descripción de dirección
  validateAddressDescription: (description) => {
    const errors = [];
    
    // Campo opcional, solo validar si tiene contenido
    if (description && description.trim()) {
      if (!validationRules.isValidDescription(description)) {
        errors.push("La descripción solo puede contener letras, números y signos de puntuación");
      }
    }

    return errors;
  },

  // Validar número de identificación según tipo
  validateIdNumber: (idNumber, idType) => {
    const errors = [];
    
    if (!idNumber || !idNumber.trim()) {
      errors.push("El número de identificación es obligatorio");
      return errors;
    }

    const cleanId = idNumber.trim();

    switch (idType) {
      case "Cédula de ciudadanía":
        if (!validationRules.isOnlyNumbers(cleanId)) {
          errors.push("La cédula solo puede contener números");
        } else if (!validationRules.lengthRange(cleanId, 6, 10)) {
          errors.push("La cédula debe tener entre 6 y 10 dígitos");
        }
        break;

      case "NIT":
        if (!validationRules.isOnlyNumbers(cleanId)) {
          errors.push("El NIT solo puede contener números");
        } else if (!validationRules.lengthRange(cleanId, 8, 11)) {
          errors.push("El NIT debe tener entre 8 y 11 dígitos");
        }
        break;

      case "Cédula extranjera":
        if (!validationRules.isOnlyNumbers(cleanId)) {
          errors.push("La cédula extranjera solo puede contener números");
        } else if (!validationRules.lengthRange(cleanId, 6, 12)) {
          errors.push("La cédula extranjera debe tener entre 6 y 12 dígitos");
        }
        break;

      case "Pasaporte":
        if (!validationRules.isValidPassport(cleanId)) {
          errors.push("El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos");
        }
        break;

      default:
        errors.push("Tipo de documento no válido");
    }

    return errors;
  },

  // Validar carrito de compras
  validateCart: (cart) => {
    const errors = [];
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      errors.push("No hay productos en el carrito");
      return errors;
    }

    const invalidItems = cart.filter(item => !item.qty || item.qty < 1);
    if (invalidItems.length > 0) {
      errors.push("Todas las cantidades deben ser mayores a 0");
    }

    return errors;
  }
};

// Función principal para validar todo el formulario de checkout
export const validateCheckoutForm = (formData) => {
  const { firstName, lastName, address, addressDesc, idNumber, idType, cart } = formData;
  
  const allErrors = {
    firstName: validators.validateName(firstName),
    lastName: validators.validateLastName(lastName),
    address: validators.validateAddress(address),
    addressDesc: validators.validateAddressDescription(addressDesc),
    idNumber: validators.validateIdNumber(idNumber, idType),
    cart: validators.validateCart(cart)
  };

  // Filtrar solo los campos que tienen errores
  const fieldsWithErrors = {};
  Object.keys(allErrors).forEach(field => {
    if (allErrors[field].length > 0) {
      fieldsWithErrors[field] = allErrors[field][0]; // Solo el primer error
    }
  });

  return {
    isValid: Object.keys(fieldsWithErrors).length === 0,
    errors: fieldsWithErrors,
    allErrors // Para debugging si se necesita
  };
};

// Funciones para filtrar entrada en tiempo real
export const inputFilters = {
  // Filtrar solo letras para nombre/apellido
  filterLettersOnly: (value) => {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  },

  // Filtrar solo números para cédula/NIT
  filterNumbersOnly: (value) => {
    return value.replace(/\D/g, '');
  },

  // Filtrar caracteres válidos para dirección
  filterAddressChars: (value) => {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\-\.,]/g, '');
  },

  // Filtrar caracteres válidos para descripción
  filterDescriptionChars: (value) => {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.,\-()]/g, '');
  },

  // Filtrar alfanumérico para pasaporte
  filterAlphanumeric: (value) => {
    return value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  }
};