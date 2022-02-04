import bcrypt from "bcrypt"
import { v4 as tokenGenerator} from "uuid"
import db from '../db.js'

export async function signUp (req, res)  {
    const user = req.body;
    
    try {
        const participant = await db.collection("users").findOne({email:user.email})
        if(participant) return res.status(409).send("Participant already registered")

        await db.collection("users").insertOne({...user, password: bcrypt.hashSync(user.password, 10)})
        res.sendStatus(201)
    } catch (error) {
        res.status(500).send(error)
    }
}

export async function signIn(req, res) {
    const user = req.body
    
    try {
        const participant = await db.collection("users").findOne({email:user.email})

        if(participant && bcrypt.compareSync(user.password, participant.password)){
            const token = tokenGenerator();
        
            await db.collection("sessions").insertOne({
                userId: participant._id,
                token
            })
            
            return res.status(200).send({token, username:participant.username});
        }else{
            return res.status(401).send("Participant dont exists")
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}