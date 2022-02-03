import db from "../dbConfig.js"

export default async function validToken(token){
    if(!token) return false

    const sessionExists = await db.collection("sessions").findOne({token})

    if(!sessionExists) return false
    
    return sessionExists
}