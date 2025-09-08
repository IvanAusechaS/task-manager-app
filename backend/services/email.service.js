import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/recovery?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recuperación de Contraseña - TidyTasks",
      html: `
                <h1>Has solicitado un cambio de contraseña</h1>
                <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4a6ee0; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            `,
    };

    try {
      console.log("Sending email to:", email);
      console.log("Reset URL:", resetUrl);
      await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
}

export default new EmailService();
