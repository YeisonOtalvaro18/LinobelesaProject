const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-admin/${token}`;
  
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Verificación de Cuenta de Administrador - Linobelesa',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6a0dad;">Verificación de Cuenta de Administrador</h2>
        <p>Has sido registrado como administrador en Linobelesa. Por favor, verifica tu cuenta haciendo clic en el siguiente enlace:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #6a0dad; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Verificar cuenta
        </a>
        <p>Si no solicitaste este acceso, puedes ignorar este correo.</p>
        <p>Este enlace expirará en 24 horas por seguridad.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail
};