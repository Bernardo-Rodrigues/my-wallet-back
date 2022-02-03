import bcrypt from "bcrypt"
import { v4 as tokenGenerator} from "uuid"
import db from '../dbConfig.js'
import { signInSchema, signUpSchema } from '../utils/joiValidations.js'

export async function signUp (req, res)  {
    const user = req.body
    const validation = signUpSchema.validate(user, { abortEarly: false })
    if(validation.error) return res.status(422).send(validation.error.message)
    
    try {
        const participantExists = await db.collection("users").findOne({email:user.email})
        if(participantExists) return res.status(409).send("Participant already registered")

        await db.collection("users").insertOne({...user, password: bcrypt.hashSync(user.password, 10)})
        res.sendStatus(201)
    } catch (error) {
        res.status(500).send(error)
    }
}

export async function signIn(req, res) {
    const user = req.body
    const validation = signInSchema.validate(user, { abortEarly: false })
    if(validation.error) return res.status(422).send(validation.error.message)
    
    try {
        const participantExists = await db.collection("users").findOne({email:user.email})

        if(participantExists && bcrypt.compareSync(user.password, participantExists.password)){
            const token = tokenGenerator();
        
            await db.collection("sessions").insertOne({
                userId: participantExists._id,
                token
            })

            return res.status(200).send({token, username:participantExists.username});
        }else{
            return res.status(401).send("Participant dont exists")
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}