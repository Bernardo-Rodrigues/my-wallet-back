import signUpSchema from "../schemas/signUpSchema.js"
import signInSchema from "../schemas/signInSchema.js"
import transactionSchema from "../schemas/transationSchema.js"

const schemas = {
    "/signup": signUpSchema,
    "/signin": signInSchema,
    "/transactions": transactionSchema
}

export default async function validateSchemaMiddleware(req, res, next){
    const { body } = req
    const schema = schemas["/"+req.path.split("/")[1]]

    const validation = schema.validate(body, { abortEarly: false })
    if(validation.error) return res.status(422).send(validation.error.message)

    next()
}
