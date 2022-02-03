import dayjs from "dayjs"
import db from '../dbConfig.js'
import { ObjectId } from 'bson'
import validToken from '../utils/validToken.js'
import { transactionSchema } from '../utils/joiValidations.js'

export async function getUserTransactions(req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "")
    let balance = 0

    try {
        const session = await validToken(token)
        if(!session) return res.sendStatus(401)

        const userTransactions = await db.collection("transactions").find({userId: session.userId}).toArray()
    
        userTransactions.forEach( transaction => {
            const parseTransaction = parseFloat(transaction.value.replace(",","."))
            delete transaction.userId
    
            if(transaction.type === "entry") balance += parseTransaction
            else balance -= parseTransaction
        })
        balance = balance.toFixed(2).replace(".",",")
    
        res.status(200).send({userTransactions, balance})
    } catch (error) {
        res.status(500).send(error.message)
    }
}

export async function postNewTransaction(req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "")
    const transaction = req.body
    
    try {
        const session =  await validToken(token)
        if(!session) return res.sendStatus(401)
        
        const validation = transactionSchema.validate(transaction, { abortEarly: false })
        if(validation.error) return res.status(422).send(validation.error.message)
        if(!/\,[0-9]{2}$/.test(transaction.value)) transaction.value += ",00"
    
        await db.collection("transactions").insertOne({...transaction, date:dayjs().format("DD/MM"), userId:session.userId})
    
        res.sendStatus(201)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

export async function deleteTransaction(req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "")
    const { id } = req.params

    try {
        const session =  await validToken(token)
        if(!session) return res.sendStatus(401)

        const transaction = await db.collection("transactions").findOne({_id: new ObjectId(id)})
        if(!transaction) return res.status(404).send("Transaction not found")

        if(session.userId.toString() !== transaction.userId.toString()) return res.status(401).send("This transaction is not yours")

        await db.collection("transactions").deleteOne({_id: new ObjectId(id)})
        return res.sendStatus(200)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

export async function updateTransaction(req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "")
    const { id } = req.params
    const editTransaction = req.body

    try {
        const session = await validToken(token)
        if(!session) return res.sendStatus(401)
        
        const transaction = await db.collection("transactions").findOne({_id: new ObjectId(id)})
        if(!transaction) return res.status(404).send("Transaction not found")

        if(session.userId.toString() !== transaction.userId.toString()) return res.status(401).send("This transaction is not yours")
        
        const validation = transactionSchema.validate(editTransaction, { abortEarly: false })
        if(validation.error) return res.status(422).send(validation.error.message)
        if(!/\,[0-9]{2}$/.test(editTransaction.value)) editTransaction.value += ",00"
        
        await db.collection("transactions").updateOne({
            _id: new ObjectId(id)
        },{
            $set: editTransaction
        })

        return res.sendStatus(200)
    } catch (error) {
        res.status(500).send(error.message)
    }
}