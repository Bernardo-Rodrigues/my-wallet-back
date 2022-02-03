import joi from 'joi'
import dayjs from "dayjs"
import db from '../dbConfig.js'

export async function getUserTransactions(req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if(!token) return res.sendStatus(401)

    const sessionExists = await db.collection("sessions").findOne({token})

    if(!sessionExists) return res.sendStatus(401)

    const userTransactions = await db.collection("transactions").find({userId: sessionExists.userId}).toArray()

    userTransactions.forEach( transaction => {
        delete transaction.userId
        delete transaction._id
    })
    
    res.status(200).send(userTransactions)
}

export async function postNewTransaction(req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "")
    const transaction = req.body

    if(!token) return res.sendStatus(401)

    const sessionExists = await db.collection("sessions").findOne({token})

    if(!sessionExists) return res.sendStatus(401)

    const transactionSchema = joi.object({
        value: joi.number().required(),
        desc: joi.string().required(),
        type: joi.string().valid("entry", "output").required()
    });
    
    const validation = transactionSchema.validate(transaction, { abortEarly: false })
    
    if(validation.error) return res.status(422).send(validation.error.message)

    await db.collection("transactions").insertOne({...transaction, date:dayjs().format("DD/MM"), userId:sessionExists.userId})

    res.sendStatus(201)
}