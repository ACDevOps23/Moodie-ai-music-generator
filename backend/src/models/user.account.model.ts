import  mongoose, { Document } from "mongoose";
import { IUserAccount } from "../types/user.types.js";

const userAccount_schema = new mongoose.Schema<IUserAccount>({ // user account db schema
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 50
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
    refresh_token: {
        type: String,
    },
    token_expires: {
      type: Date,
      required: true
    }

}, { timestamps: true });

const userAccount_model = mongoose.model<IUserAccount>("User", userAccount_schema);

export default userAccount_model;