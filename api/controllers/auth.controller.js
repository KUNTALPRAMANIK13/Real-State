import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPass = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPass });

  try {
    await newUser.save();
    res.status(201).json("User created");
  } catch (e) {
    next(e);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(401, "User not found"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(401, "Wrong Creds!"));
    }

    const token = jwt.sign(
      { id: validUser._id },
      process.env.JWT_SECRET || "mern"
    );

    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
      .status(200)
      .json(rest);
  } catch (e) {
    next(e);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "mern"
      );
      const { password: pass, ...rest } = user._doc;
      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET || "mern"
      );
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

// New endpoint for Firebase auth integration
export const firebaseAuth = async (req, res, next) => {
  try {
    const { firebaseUser } = req.user; // From Firebase token verification middleware

    if (!firebaseUser) {
      return next(errorHandler(400, "Firebase user data not found"));
    }

    // Check if user exists in MongoDB
    let user = await User.findOne({ email: firebaseUser.email });

    if (user) {
      // Update existing user if needed
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUser.uid;
        user.emailVerified = firebaseUser.email_verified;
        if (firebaseUser.picture && !user.avatar.includes("thenounproject")) {
          user.avatar = firebaseUser.picture;
        }
        await user.save();
      }
    } else {
      // Create new user from Firebase data
      const username = firebaseUser.name
        ? firebaseUser.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4)
        : firebaseUser.email.split("@")[0] +
          Math.random().toString(36).slice(-4);

      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      user = new User({
        username,
        email: firebaseUser.email,
        password: hashedPassword,
        avatar:
          firebaseUser.picture ||
          "https://static.thenounproject.com/png/363640-200.png",
        firebaseUid: firebaseUser.uid,
        emailVerified: firebaseUser.email_verified || false,
      });

      await user.save();
    }

    // Generate JWT token for our app
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "mern");

    const { password: pass, ...rest } = user._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token");

    res.status(200).json("Signed Out");
  } catch (error) {
    next(error);
  }
};
