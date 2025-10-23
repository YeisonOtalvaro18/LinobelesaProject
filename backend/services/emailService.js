const mailjet = require('node-mailjet');

// Configurar Mailjet
const mailjetClient = mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
);

class EmailService {
    static async sendPasswordResetEmail(email, resetToken, userName) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?page=reset-password&token=${resetToken}`;
            
            const request = mailjetClient
                .post("send", { 'version': 'v3.1' })
                .request({
                    'Messages': [
                        {
                            'From': {
                                'Email': process.env.FROM_EMAIL || 'noreply@linobelesa.com',
                                'Name': process.env.FROM_NAME || 'Linobelesa'
                            },
                            'To': [
                                {
                                    'Email': email,
                                    'Name': userName || 'Usuario'
                                }
                            ],
                            'Subject': '🔐 Restablece tu contraseña - Linobelesa',
                            'HTMLPart': `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Restablecer Contraseña</title>
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            line-height: 1.6;
                                            color: #333;
                                            background-color: #f4f4f4;
                                            margin: 0;
                                            padding: 0;
                                        }
                                        .container {
                                            max-width: 600px;
                                            margin: 0 auto;
                                            background-color: #ffffff;
                                            padding: 20px;
                                            border-radius: 10px;
                                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                                        }
                                        .header {
                                            background: linear-gradient(135deg, #a749eb 0%, #bd46b7 100%);
                                            color: white;
                                            padding: 30px;
                                            text-align: center;
                                            border-radius: 10px 10px 0 0;
                                            margin: -20px -20px 20px -20px;
                                        }
                                        .header h1 {
                                            margin: 0;
                                            font-size: 28px;
                                        }
                                        .content {
                                            padding: 20px 0;
                                        }
                                        .button {
                                            display: inline-block;
                                            background: linear-gradient(135deg, #a749eb 0%, #bd46b7 100%);
                                            color: white;
                                            text-decoration: none;
                                            padding: 15px 30px;
                                            border-radius: 5px;
                                            font-weight: bold;
                                            margin: 20px 0;
                                        }
                                        .footer {
                                            margin-top: 30px;
                                            padding-top: 20px;
                                            border-top: 1px solid #eee;
                                            font-size: 12px;
                                            color: #666;
                                        }
                                        .warning {
                                            background: #fff3cd;
                                            border: 1px solid #ffeaa7;
                                            color: #856404;
                                            padding: 15px;
                                            border-radius: 5px;
                                            margin: 20px 0;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <h1>🔐 Restablecer Contraseña</h1>
                                            <p>Linobelesa - Tu belleza, nuestra pasión</p>
                                        </div>
                                        
                                        <div class="content">
                                            <h2>Hola ${userName || 'Usuario'},</h2>
                                            
                                            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Linobelesa.</p>
                                            
                                            <p>Si solicitaste este cambio, haz clic en el siguiente botón para crear una nueva contraseña:</p>
                                            
                                            <div style="text-align: center;">
                                                <a href="${resetUrl}" class="button">Restablecer mi Contraseña</a>
                                            </div>
                                            
                                            <div class="warning">
                                                <strong>⚠️ Importante:</strong>
                                                <ul>
                                                    <li>Este enlace expirará en 1 hora por seguridad</li>
                                                    <li>Si no solicitaste este cambio, puedes ignorar este email</li>
                                                    <li>Tu contraseña actual seguirá siendo válida hasta que la cambies</li>
                                                </ul>
                                            </div>
                                            
                                            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                                            <p style="word-break: break-all; color: #a749eb;">${resetUrl}</p>
                                        </div>
                                        
                                        <div class="footer">
                                            <p>Este correo fue enviado automáticamente, por favor no respondas a esta dirección.</p>
                                            <p>Si necesitas ayuda, contacta con nuestro equipo de soporte.</p>
                                            <p>&copy; ${new Date().getFullYear()} Linobelesa. Todos los derechos reservados.</p>
                                        </div>
                                    </div>
                                </body>
                                </html>
                            `,
                            'TextPart': `
                                Hola ${userName || 'Usuario'},
                                
                                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Linobelesa.
                                
                                Si solicitaste este cambio, visita el siguiente enlace para crear una nueva contraseña:
                                ${resetUrl}
                                
                                IMPORTANTE:
                                - Este enlace expirará en 1 hora por seguridad
                                - Si no solicitaste este cambio, puedes ignorar este email
                                - Tu contraseña actual seguirá siendo válida hasta que la cambies
                                
                                Si necesitas ayuda, contacta con nuestro equipo de soporte.
                                
                                Saludos,
                                El equipo de Linobelesa
                            `
                        }
                    ]
                });

            const result = await request;
            console.log('✅ Email de restablecimiento enviado exitosamente:', result.body);
            return { success: true, messageId: result.body.Messages[0].Status };
            
        } catch (error) {
            console.error('❌ Error enviando email de restablecimiento:', error);
            throw new Error('Error al enviar el email de restablecimiento');
        }
    }

    static async sendPasswordChangedNotification(email, userName) {
        try {
            const request = mailjetClient
                .post("send", { 'version': 'v3.1' })
                .request({
                    'Messages': [
                        {
                            'From': {
                                'Email': process.env.FROM_EMAIL || 'noreply@linobelesa.com',
                                'Name': process.env.FROM_NAME || 'Linobelesa'
                            },
                            'To': [
                                {
                                    'Email': email,
                                    'Name': userName || 'Usuario'
                                }
                            ],
                            'Subject': '✅ Contraseña cambiada exitosamente - Linobelesa',
                            'HTMLPart': `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Contraseña Cambiada</title>
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            line-height: 1.6;
                                            color: #333;
                                            background-color: #f4f4f4;
                                            margin: 0;
                                            padding: 0;
                                        }
                                        .container {
                                            max-width: 600px;
                                            margin: 0 auto;
                                            background-color: #ffffff;
                                            padding: 20px;
                                            border-radius: 10px;
                                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                                        }
                                        .header {
                                            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                                            color: white;
                                            padding: 30px;
                                            text-align: center;
                                            border-radius: 10px 10px 0 0;
                                            margin: -20px -20px 20px -20px;
                                        }
                                        .header h1 {
                                            margin: 0;
                                            font-size: 28px;
                                        }
                                        .content {
                                            padding: 20px 0;
                                        }
                                        .success-box {
                                            background: #d4edda;
                                            border: 1px solid #c3e6cb;
                                            color: #155724;
                                            padding: 15px;
                                            border-radius: 5px;
                                            margin: 20px 0;
                                        }
                                        .footer {
                                            margin-top: 30px;
                                            padding-top: 20px;
                                            border-top: 1px solid #eee;
                                            font-size: 12px;
                                            color: #666;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <h1>✅ Contraseña Actualizada</h1>
                                            <p>Linobelesa - Tu belleza, nuestra pasión</p>
                                        </div>
                                        
                                        <div class="content">
                                            <h2>Hola ${userName || 'Usuario'},</h2>
                                            
                                            <div class="success-box">
                                                <strong>¡Tu contraseña ha sido cambiada exitosamente!</strong>
                                            </div>
                                            
                                            <p>Te confirmamos que la contraseña de tu cuenta en Linobelesa ha sido actualizada correctamente.</p>
                                            
                                            <p><strong>Detalles del cambio:</strong></p>
                                            <ul>
                                                <li>Fecha: ${new Date().toLocaleString('es-CO')}</li>
                                                <li>Cuenta: ${email}</li>
                                            </ul>
                                            
                                            <p>Si no realizaste este cambio, contacta inmediatamente con nuestro equipo de soporte para proteger tu cuenta.</p>
                                        </div>
                                        
                                        <div class="footer">
                                            <p>Este correo fue enviado automáticamente, por favor no respondas a esta dirección.</p>
                                            <p>Si necesitas ayuda, contacta con nuestro equipo de soporte.</p>
                                            <p>&copy; ${new Date().getFullYear()} Linobelesa. Todos los derechos reservados.</p>
                                        </div>
                                    </div>
                                </body>
                                </html>
                            `,
                            'TextPart': `
                                Hola ${userName || 'Usuario'},
                                
                                Te confirmamos que la contraseña de tu cuenta en Linobelesa ha sido actualizada correctamente.
                                
                                Detalles del cambio:
                                - Fecha: ${new Date().toLocaleString('es-CO')}
                                - Cuenta: ${email}
                                
                                Si no realizaste este cambio, contacta inmediatamente con nuestro equipo de soporte.
                                
                                Saludos,
                                El equipo de Linobelesa
                            `
                        }
                    ]
                });

            const result = await request;
            console.log('✅ Notificación de cambio de contraseña enviada:', result.body);
            return { success: true, messageId: result.body.Messages[0].Status };
            
        } catch (error) {
            console.error('❌ Error enviando notificación de cambio:', error);
            // No lanzamos error aquí porque es solo una notificación
            return { success: false, error: error.message };
        }
    }

    static async sendActivationEmail(email, activationToken, userName) {
        try {
            const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/activate?token=${activationToken}`;
            const request = mailjetClient
                .post("send", { 'version': 'v3.1' })
                .request({
                    'Messages': [
                        {
                            'From': {
                                'Email': process.env.FROM_EMAIL || 'infolinobelesa@gmail.com',
                                'Name': process.env.FROM_NAME || 'Linobelesa'
                            },
                            'To': [
                                {
                                    'Email': email,
                                    'Name': userName || 'Usuario'
                                }
                            ],
                            'Subject': '🔑 Activa tu cuenta - Linobelesa',
                            'HTMLPart': `
                                <html>
                                <head><meta charset='UTF-8'></head>
                                <body style='font-family: Arial, sans-serif; background: #f8f9fa;'>
                                    <div style='max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:16px;box-shadow:0 0 10px #a749eb22;'>
                                        <div style='background:linear-gradient(135deg,#a749eb 0%,#bd46b7 100%);color:white;padding:24px 0;border-radius:12px 12px 0 0;text-align:center;'>
                                            <h1>Bienvenido a Linobelesa</h1>
                                        </div>
                                        <p>Hola <b>${userName || 'Usuario'}</b>,</p>
                                        <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente botón:</p>
                                        <div style='text-align:center;margin:24px 0;'>
                                            <a href='${activationUrl}' style='background:linear-gradient(135deg,#a749eb 0%,#bd46b7 100%);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;'>Activar Cuenta</a>
                                        </div>
                                        <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                                        <p style='word-break:break-all;color:#a749eb;'>${activationUrl}</p>
                                        <hr style='margin:32px 0;border:none;border-top:1px solid #eee;'>
                                        <p style='font-size:12px;color:#666;'>Este correo fue enviado automáticamente. Si tienes dudas, contacta con soporte.</p>
                                    </div>
                                </body>
                                </html>
                            `,
                            'TextPart': `Hola ${userName || 'Usuario'},\n\nActiva tu cuenta en Linobelesa usando este enlace: ${activationUrl}`
                        }
                    ]
                });
            const result = await request;
            console.log('✅ Email de activación enviado:', result.body);
            return { success: true, messageId: result.body.Messages[0].Status };
        } catch (error) {
            console.error('❌ Error enviando email de activación:', error);
            throw new Error('Error al enviar el email de activación');
        }
    }
}

module.exports = EmailService;