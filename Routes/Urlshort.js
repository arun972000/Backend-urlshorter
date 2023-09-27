import express, { json } from "express";
import { UrlModel } from "../mongoose/models.js";

import { nanoid } from 'nanoid'
import { model } from "mongoose";

const Urlroutes = express.Router();




Urlroutes.post("/UrlAdd", async (req, res) => {
    try {
        const payload = req.body
        const id = nanoid();
        const Url = new UrlModel({ ...payload, ShortenedUrl: `http://localhost:5173/short/${id}`, id });

        await Url.save()
        res.send(Url)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})

Urlroutes.post("/Urlverify", async (req, res) => {
    try {
        const payload = req.body;
        const isId = await UrlModel.findOne({ id: payload.id }, { id: 1, OriginalUrl: 1, ShortenedUrl: 1 });
        if (isId) {
            const isIdJSON = isId.toJSON(); // Convert the document to JSON
            res.json(isIdJSON); // Send the JSON object
        } else {
            res.status(404).send("not found");
        }
    } catch (err) {
        console.log(err);
        res.status(401).send(err);
    }
});

export default Urlroutes;
