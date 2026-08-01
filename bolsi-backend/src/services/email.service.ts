import * as nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || '',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false, // port 587 uses STARTTLS (secure: false), port 465 uses SSL/TLS (secure: true)
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    });
  }

  async sendVerificationEmail(to: string, otp: string): Promise<void> {
    const mailOptions = {
      from: `"Bolsi" <${process.env.EMAIL_USER || ''}>`,
      to,
      subject: 'Verifica tu cuenta en Bolsi',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica tu cuenta en Bolsi</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f3f4f6;
              margin: 0;
              padding: 0;
              color: #1f2937;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              padding: 40px 20px;
              text-align: center;
              color: #ffffff;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .content {
              padding: 40px 30px;
              line-height: 1.6;
            }
            .content p {
              font-size: 16px;
              margin-bottom: 24px;
              color: #4b5563;
            }
            .otp-container {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-family: 'Courier New', Courier, monospace;
              font-size: 36px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #4f46e5;
              margin: 0 0 0 8px; /* Offset letter-spacing on right */
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
              border-top: 1px solid #f3f4f6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Te damos la bienvenida a Bolsi!</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>Gracias por registrarte en nuestra aplicación. Para completar la verificación de tu cuenta y empezar a gestionar tus finanzas de manera inteligente, por favor introduce el siguiente código de verificación de 6 dígitos en la aplicación:</p>
              <div class="otp-container">
                <h2 class="otp-code">${otp}</h2>
              </div>
              <p>Este código vencerá en 24 horas. Si no has creado una cuenta en Bolsi, puedes ignorar este correo de forma segura.</p>
              <p>Atentamente,<br>El equipo de Bolsi</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Bolsi. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Could not send verification email. Please try again later.');
    }
  }
}
