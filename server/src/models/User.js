const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },
    bio: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    id: this._id.toString(),
    name: this.name,
    full_name: this.name,
    email: this.email,
    role: this.role,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    avatar_url: this.avatarUrl,
    isActive: this.isActive,
    is_active: this.isActive,
    lastLoginAt: this.lastLoginAt,
    last_login_at: this.lastLoginAt,
    createdAt: this.createdAt,
    created_at: this.createdAt,
    updatedAt: this.updatedAt,
    updated_at: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);
