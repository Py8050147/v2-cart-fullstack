import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    // username: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   lowercase: true,
    //   trim: true,
    //   index: true
    // },
    fullname: {
      type: String,
      required: true,
      trim: true
    },
  
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      unique: true
    },
    // avatar: {
    //   type: String, // cloudnary url
    //   required: true,
    // },
    // coverImage: {
    //   type: String, // cloudnary url
    // },
    refreshToken: {
      type: String,
    },
    // address: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Address",
    //   required: true
    // },
    // phone: {
    //   type: String,
    //   required: true
    // },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
      },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// genertae access token
userSchema.methods.generateAccessToken =  function () {
  return  jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken =  function () {
  return  jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
      
  )

}

// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
//     }
//   );
// };

// genertae refresh token


export const User = mongoose.model("User", userSchema);
