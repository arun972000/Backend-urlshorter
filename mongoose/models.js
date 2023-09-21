import mongoose from "mongoose";


const userShema= new mongoose.Schema({
    id: {
        type: "string",
        required: true
    },
    name: {
        type: "string",
        required: true
    },
    email: {
        type: "string",
        required: true
    },
    password: {
        type: "string",
        required: true
    },
    isVerified:{
        type:"boolean",
        required:true
    },
    verifyToken:{
        type:"string"
    },
    passwordToken:{
        type:"string"
    }

})

export const userModel=mongoose.model("users",userShema)