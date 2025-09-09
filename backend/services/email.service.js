import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    // Verificamos si tenemos credenciales reales o usamos una simulación
    const hasRealCredentials =
      process.env.EMAIL_PASSWORD &&
      process.env.EMAIL_PASSWORD !== "your_email_password_here";

    if (hasRealCredentials) {
      console.log("Usando credenciales reales para el servicio de correo");
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      console.log(
        "ADVERTENCIA: Usando modo de simulación para correos electrónicos"
      );
      // En modo desarrollo sin credenciales, creamos una simulación del servicio
      this.useMockService = true;
    }
  }

 async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset?token=${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Recuperación de Contraseña - TidyTasks",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4a6ee0;">Recuperación de Contraseña</h1>
                <p>Has solicitado restablecer tu contraseña en TidyTasks.</p>
                <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4a6ee0; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Restablecer Contraseña</a>
                <p style="margin-top: 20px;">Este enlace expirará en 1 hora por seguridad.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            </div>
        `
    };

    try {
      console.log("Sending email to:", email);
      console.log("Reset URL:", resetUrl);

      if (this.useMockService) {
        // Simulamos el envío en modo desarrollo sin credenciales
        console.log("SIMULACIÓN: Correo enviado con éxito (modo desarrollo)");
        console.log("Contenido del correo:", mailOptions);
        console.log(`En un entorno real, se enviaría un enlace a: ${resetUrl}`);
        // Simulamos un retraso
        await new Promise((resolve) => setTimeout(resolve, 500));
        return true;
      } else {
        // Envío real del correo
        await this.transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
        return true;
      }
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
}

export default new EmailService();
