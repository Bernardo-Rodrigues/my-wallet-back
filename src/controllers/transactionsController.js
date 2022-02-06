import dayjs from "dayjs"
import db from '../db.js'
import { ObjectId } from 'mongodb';

export async function getTransactions(req, res) {
    let balance = 0
    const { session } = res.locals

    try {
        const userTransactions = await db.collection("transactions").find({userId: session.userId}).toArray()
    
        userTransactions.forEach( transaction => {
            const parseTransaction = parseFloat(transaction.value)
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

export async function postTransaction(req, res) {
    const transaction = req.body
    const { session } = res.locals
    
    try {
        if(!/\.[0-9]{2}$/.test(transaction.value)) transaction.value += ",00"
    
        await db.collection("transactions").insertOne({...transaction, date:dayjs().format("DD/MM"), userId:session.userId})
    
        res.sendStatus(201)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

export async function deleteTransaction(req, res) {
    const { id } = req.params
    const { session } = res.locals

    try {
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
    const { id } = req.params
    const editTransaction = req.body
    const { session } = res.locals

    try {
        const transaction = await db.collection("transactions").findOne({_id: new ObjectId(id)})
        if(!transaction) return res.status(404).send("Transaction not found")

        if(session.userId.toString() !== transaction.userId.toString()) return res.status(401).send("This transaction is not yours")
        
        if(!/\.[0-9]{2}$/.test(editTransaction.value)) editTransaction.value = parseFloat(editTransaction.value).toFixed(2)
        
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