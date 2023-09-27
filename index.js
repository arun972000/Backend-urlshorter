import express, { json } from 'express';
import DBclient from './mongoose/connect.js';
import userRoutes from './Routes/users.js';
import cors from "cors"
import Urlroutes from './Routes/Urlshort.js';

const app = express();

await DBclient();

app.use(cors({
    origin:"*"
}))

app.use("/api",userRoutes)

app.use("/api",Urlroutes)

app.use(json())

const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    res.json({ status: true, message: "Our node.js app works" })
});

app.listen(PORT, () => console.log(`App listening at port ${PORT}`));