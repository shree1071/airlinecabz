const nodemailer = require("nodemailer");

async function test() {
  const user = "airlinecabz@gmail.com";
  const pass = "airlinecabz@123";

  console.log("Testing with:", user, pass);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: user,
      to: user,
      subject: "Test Email from Airlinecabz App",
      text: "If you are seeing this, the email credentials are correct and working!",
    });
    console.log("Email sent successfully! ID:", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error.message);
    if (error.response) console.error(error.response);
  }
}

test();
