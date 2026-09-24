const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const connectDB = require("./config/db");

const createAdminUser = async () => {
  try {
    await connectDB();

    const adminEmail = process.argv[2] || "admin@certverify.com";
    const adminPassword = process.argv[3] || "admin123456";
    const adminName = process.argv[4] || "System Admin";
    const institution = process.argv[5] || "Global Technology University";

    // Check if user exists
    let existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      console.log(`\nUser with email [${adminEmail}] already exists.`);
      console.log(`Updating role to Admin and resetting password...`);
      existingUser.password = adminPassword;
      existingUser.role = "Admin";
      await existingUser.save();
      console.log(`✔ Updated admin credentials successfully!`);
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "Admin",
        institution: institution,
      });
      console.log(`✔ Created new Admin account successfully!`);
    }

    console.log(`--------------------------------------------------`);
    console.log(` Admin Credentials:`);
    console.log(` Email:    ${adminEmail}`);
    console.log(` Password: ${adminPassword}`);
    console.log(` Role:     Admin`);
    console.log(`--------------------------------------------------\n`);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error.message);
    process.exit(1);
  }
};

createAdminUser();
