import dotenv from "dotenv";
dotenv.config();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const resetUrl = `${frontendUrl}/reset?token=testtoken123`;
const recoveryUrl = `${frontendUrl}/recovery?token=testtoken123`;

console.log("FRONTEND_URL:", frontendUrl);
console.log("URL de reset:", resetUrl);
console.log("URL de recovery:", recoveryUrl);
