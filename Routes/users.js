import express, { json } from "express";
import { userModel } from "../mongoose/models.js";
import { v4 } from "uuid";
import jwt from "jsonwebtoken"
import { transporter, mailOptions } from "./mail.js";
const userRoutes = express.Router();
import bcrypt from "bcrypt"

userRoutes.use(json());

userRoutes.post("/register", async (req, res) => {
    try {
        const payload = req.body;
        const isUser = await userModel.findOne({ email: payload.email }, { id: 1, name: 1, email: 1, password: 1, isVerified: 1, verifyToken: 1, _id: 0 })
        if (isUser) {
            return res.status(409).send("user already exist")
        }
        bcrypt.hash(payload.password, 10, async (err, hash) => {
            if (err) {
                res.status(400).send(err)
            } else {
                const token = jwt.sign({ email: payload.email }, process.env.JWT_KEY, { expiresIn: "1d" })
                const user = new userModel({ ...payload, id: v4(), password: hash, isVerified: false, verifyToken: token });
                await user.save()
                const link = `https://bucolic-dusk-b4fca9.netlify.app?token=${token}`
                transporter.sendMail({ ...mailOptions, to: payload.email, text: `click this link: ${link}` }, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                res.send("user registered successfully")
            }
        })

    } catch (err) {
        res.status(500).send(err)
    }

})

userRoutes.post("/login", async (req, res) => {
    try {
        const payload = req.body;
        const isUser = await userModel.findOne({ email: payload.email }, { id: 1, name: 1, email: 1, password:1, isVerified: 1, verifyToken: 1, _id: 0 });
        if (isUser && isUser.isVerified) {
            bcrypt.compare(payload.password, isUser.password, async (_err, result) => {
                if (!result) {
                    
                    res.status(401).send("invalid password")
                } else {
                    res.send(isUser)
                }
            })
        }else{
            return res.status(409).send("no user found")
        }
    } catch (err) {
        res.status(500).send(err)
    }
})


userRoutes.post("/resetPass", async (req, res) => {
    try {
        const {email} = req.body;
        

        const isUser = await userModel.findOne({ email });

        if (isUser) {
            const token = jwt.sign({ email }, process.env.JWT_KEY);
            await userModel.updateOne({ email }, { $set: { passwordToken: token } })
            const link=`https://bucolic-dusk-b4fca9.netlify.app/verifyPass?token=${token}`
            transporter.sendMail({ ...mailOptions, to:email, text: `Copy this text and paste in token input: ${link}` }, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            res.send("password token added")
            
        } else {
            res.status(409).send("no user found")
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }


})

userRoutes.post("/tokenVerify", async (req, res) => {
    try {
        const token = req.body.token;

        const isToken = await userModel.findOne({ passwordToken:token });

        if (isToken) {
            res.send("token verified")
        } else {
            res.status(401).send("invalid token")
        }
    } catch (err) {
        
        res.status(500).send(err)
        
    }

})

userRoutes.put("/updateUser",async(req,res)=>{
try{
    const {passwordToken}=req.body
    bcrypt.hash(payload.password,10,async(err,hash)=>{
        if(err){
            res.status(401).send(err)
        }else{
            const user = await userModel.updateOne({ email: payload.email }, { $set: { password: hash } })
            if (passwordToken) {
                userUpdate.$unset = { passwordToken };
            }

            res.send("password updated")
        }   
    })
  
}catch(err){
    res.status(500).send(err)
}
})


userRoutes.post("/loginVerify",async(req,res)=>{
    try{
        const payload=req.body;

        jwt.verify(payload.verifyToken,process.env.JWT_KEY,async(err,result)=>{
        
            await userModel.updateOne({ email: result.email }, { '$set': { isVerified: true } });
        })
        res.send({ msg: 'User Verified' });
    }catch (err) {
        console.log(err);
        res.status(500).send({ msg: 'Error occuerred while fetching users' });
      }
})




export default userRoutes


