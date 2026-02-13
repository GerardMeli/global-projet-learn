import * as yup from 'yup';

export const emailSchema = yup
  .string()
  .email('Email invalide')
  .required('Email requis')
  .max(255, 'Email trop long');

export const passwordSchema = yup
  .string()
  .required('Mot de passe requis')
  .min(6, 'Minimum 6 caractères')
  .max(128, 'Mot de passe trop long')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Doit contenir au moins une majuscule, une minuscule et un chiffre'
  );

export const usernameSchema = yup
  .string()
  .required('Nom d\'utilisateur requis')
  .min(3, 'Minimum 3 caractères')
  .max(50, 'Trop long')
  .matches(
    /^[a-zA-Z0-9_-]+$/,
    'Seulement lettres, chiffres, tirets et underscores'
  );

export const chatRoomNameSchema = yup
  .string()
  .required('Nom du salon requis')
  .min(3, 'Minimum 3 caractères')
  .max(100, 'Trop long');

export const messageSchema = yup
  .string()
  .required('Message requis')
  .min(1, 'Message trop court')
  .max(2000, 'Message trop long');

// Schémas complets
export const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Confirmation requise')
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
});

export const chatRoomCreateSchema = yup.object({
  name: chatRoomNameSchema,
  type: yup
    .string()
    .oneOf(['PRIVATE', 'GROUP', 'CHANNEL'])
    .required('Type de salon requis'),
  userIds: yup.array().of(yup.number().positive()).default([]),
});

export const messageCreateSchema = yup.object({
  content: messageSchema,
  chatRoomId: yup.number().positive().required('Salon requis'),
  messageType: yup
    .string()
    .oneOf(['TEXT', 'IMAGE', 'FILE', 'SYSTEM'])
    .default('TEXT'),
});

// Fonctions de validation
export const validateEmail = async (email: string): Promise<boolean> => {
  try {
    await emailSchema.validate(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = async (password: string): Promise<boolean> => {
  try {
    await passwordSchema.validate(password);
    return true;
  } catch {
    return false;
  }
};

export const validateMessage = async (message: string): Promise<boolean> => {
  try {
    await messageSchema.validate(message);
    return true;
  } catch {
    return false;
  }
};