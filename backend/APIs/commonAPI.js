import exp from "express";
import { userModel } from "../models/userModel.js";
import { hash, compare } from "bcryptjs";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/verifyToken.js";
const { sign } = jwt;

export const commonApp = exp.Router();

import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

config();

// Route for register
commonApp.post(
  "/users",
  upload.single("profileImageUrl"),
  async (req, res, next) => {
    let cloudinaryResult;

    try {
      let allowedRoles = ["USER", "AUTHOR"];

      // get user from req
      const newUser = req.body;
      newUser.email = String(newUser.email || "")
        .trim()
        .toLowerCase();

      console.log(newUser);
      console.log(req.file);

      // check role
      if (!allowedRoles.includes(newUser.role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Upload image to cloudinary
      if (req.file) {
        if (!isCloudinaryConfigured) {
          return res.status(500).json({
            error:
              "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend .env",
          });
        }

        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      }

      // add image url
      newUser.profileImageUrl = cloudinaryResult?.secure_url;

      // hash password
      newUser.password = await hash(newUser.password, 12);

      // create user
      const newUserDoc = new userModel(newUser);

      // save
      await newUserDoc.save();

      // response
      res.status(201).json({ message: "User created" });
    } catch (err) {
      console.log("err is ", err);

      // delete uploaded image if error
      if (cloudinaryResult?.public_id) {
        try {
          await cloudinary.uploader.destroy(
            cloudinaryResult.public_id
          );
        } catch (cleanupErr) {
          console.log(
            "cloudinary cleanup failed",
            cleanupErr.message
          );
        }
      }

      next(err);
    }
  }
);

// Route for Login
commonApp.post("/login", async (req, res) => {
  try {
    // get credentials
    const { email, password } = req.body;

    const emailInput = String(email || "")
      .trim()
      .toLowerCase();

    const passwordInput = String(password || "");

    // find user
    const user = await userModel.findOne({
      email: emailInput,
    });

    // user not found
    if (!user) {
      return res.status(400).json({
        message: "Account not found. Please register first.",
      });
    }

    // compare password
    let isMatched = await compare(
      passwordInput,
      user.password
    );

    // ADMIN fallback login
    if (!isMatched && user.role === "ADMIN") {
      const envAdminEmail = process.env.ADMIN_EMAIL?.trim();
      const envAdminPassword =
        process.env.ADMIN_PASSWORD?.trim();

      if (
        envAdminEmail &&
        envAdminPassword &&
        emailInput === envAdminEmail.toLowerCase() &&
        passwordInput === envAdminPassword
      ) {
        user.password = await hash(passwordInput, 12);

        await user.save();

        isMatched = true;
      }
    }

    // invalid password
    if (!isMatched) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // inactive user
    if (user.role !== "ADMIN" && !user.isUserActive) {
      return res.status(403).json({
        message: "Account is inactive. Contact admin.",
      });
    }

    // create jwt
    const signedToken = sign(
      {
        id: user._id,
        email: emailInput,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    // COOKIE FIX FOR PRODUCTION
    res.cookie("token", signedToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // remove password
    let userObj = user.toObject();
    delete userObj.password;

    // send response
    res.status(200).json({
      message: "login success",
      payload: userObj,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Route for Logout
commonApp.get("/logout", (req, res) => {
  // clear cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  // send response
  res.status(200).json({
    message: "Logout success",
  });
});

// Check auth on refresh
commonApp.get(
  "/check-auth",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  (req, res) => {
    res.status(200).json({
      message: "authenticated",
      payload: req.user,
    });
  }
);

// Change password
commonApp.put(
  "/password",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  async (req, res) => {
    res.status(200).json({
      message: "Change password route",
    });
  }
);