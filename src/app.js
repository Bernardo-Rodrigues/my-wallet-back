import express, {json} from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import joi from 'joi'
import bcrypt from "bcrypt"
import { v4 as tokenGenerator} from "uuid"
import dotenv from "dotenv"
dotenv.config()

const app = express()
app.use(cors())
app.use(json())

const mongoClient = new MongoClient(process.env.MONGO_URI);

await mongoClient.connect()

const db = mongoClient.db("api-my-wallet");

app.post("/signup", async (req, res) => {
    const user = req.body

    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().alphanum().required(),
        passwordConfirm: joi.valid(user.password).required().error(new Error("Passwords must be equal"))
    });
    
    const validation = userSchema.validate(user, { abortEarly: false })
    
    if(validation.error){
        res.status(422).send(validation.error.message)
        return
    }
    
    try {
        const usersCollection = db.collection("users")
        const participantExists = await usersCollection.findOne({email:user.email})

        if(participantExists){
            res.status(401).send("Participant already registered")
            return
        }

        delete user.passwordConfirm

        await usersCollection.insertOne({...user, password: bcrypt.hashSync(user.password, 10)})
        res.sendStatus(201)
    } catch (error) {
        res.status(500).send(error)
    }
})

app.post("/signin", async (req, res) => {
    const user = req.body

    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.required()
    });
    
    const validation = userSchema.validate(user, { abortEarly: false })
    
    if(validation.error){
        res.status(422).send(validation.error.message)
        return
    }
    
    try {
        const usersCollection = db.collection("users")
        const participantExists = await usersCollection.findOne({email:user.email})

        if(participantExists && bcrypt.compareSync(user.password, participantExists.password)){
            const token = tokenGenerator();
        
				await db.collection("sessions").insertOne({
					userId: participantExists._id,
					token
				})

            return res.send({token, name:participantExists.name});
        }else{
            return res.status(401).send("Participant dont exists")
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
})

app.get("/transactions", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if(!token) res.sendStatus(401)

    const sessionsCollection = db.collection("sessions")
    const sessionExists = await sessionsCollection.findOne({token})

    if(!sessionExists) res.sendStatus(401)

    const transactionsCollection = db.collection("transactions")
    const userTransactions = await transactionsCollection.find({userId: sessionExists.userId}).toArray()
    
    res.send(userTransactions)
})

app.post("/transactions", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const transaction = req.body

    if(!token) res.sendStatus(401)

    const sessionsCollection = db.collection("sessions")
    const sessionExists = await sessionsCollection.findOne({token})

    if(!sessionExists) res.sendStatus(401)

    const transactionSchema = joi.object({
        value: joi.number().required(),
        desc: joi.string().required(),
        type: joi.string().valid("entry", "output")
    });
    
    const validation = transactionSchema.validate(transaction, { abortEarly: false })
    
    if(validation.error){
        res.status(422).send(validation.error.message)
        return
    }

    const transactionsCollection = db.collection("transactions")
    await transactionsCollection.insertOne({...transaction, userId:sessionExists.userId})

    res.send({...transaction, userId:sessionExists.userId})
})

app.listen(5000, ()=>{
    console.log("Server listening on Port 5000")
}) 