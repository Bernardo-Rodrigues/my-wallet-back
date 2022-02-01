import express, {json} from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from 'joi'
dotenv.config()

const app = express()
app.use(cors())
app.use(json())

const mongoClient = new MongoClient(process.env.MONGO_URI);

await mongoClient.connect()

const db = mongoClient.db("api-my-wallet");


app.post("/signup", async (req, res) => {

    const userSchema = joi.object({
        name: joi.required(),
        email: joi.string().email().required(),
        password: joi.required(),
        passwordConfirm: joi.valid(req.body.password).required().error(new Error("Passwords must be equal"))
    });
    
    const validation = userSchema.validate(req.body, { abortEarly: false })
    
    if(validation.error){
        res.status(422).send(validation.error.message)
        return
    }
    
    try {
        const usersCollection = db.collection("users")
        const participantExists = await usersCollection.findOne({email:req.body.email})

        if(participantExists){
            res.status(401).send("Participant already registered")
            return
        }

        await usersCollection.insertOne(req.body)
        res.sendStatus(201)
    } catch (error) {
        res.status(500).send(error)
    }
})

app.listen(5000, ()=>{
    console.log("Server listening on Port 5000")
}) 