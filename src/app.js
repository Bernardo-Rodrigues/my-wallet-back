import express, {json} from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
dotenv.config()

const app = express()
app.use(cors())
app.use(json())

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db("api-my-wallet");
});

app.listen(5000, ()=>{
    console.log("Server listening on Port 5000")
}) 