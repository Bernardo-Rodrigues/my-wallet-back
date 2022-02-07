import signUpSchema from "../schemas/signUpSchema.js"
import signInSchema from "../schemas/signInSchema.js"
import transactionSchema from "../schemas/transationSchema.js"
import trim from "trim"
import { stripHtml } from "string-strip-html"

function sanitizeString(string){
    return trim(stripHtml(string).result)
}

const schemas = {
    "/signup": signUpSchema,
    "/signin": signInSchema,
    "/transactions": transactionSchema
}

export default async function validateSchemaMiddleware(req, res, next){
    const { body } = req
    const schema = schemas["/"+req.path.split("/")[1]]
    
    Object.keys(body).forEach( key => {
        if(typeof(body[key]) === "string") body[key] = sanitizeString(body[key])
    })

    const validation = schema.validate(body, { abortEarly: false })
    if(validation.error) return res.status(422).send(validation.error.message)

    next()
}
