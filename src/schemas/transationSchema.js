import joi from "joi"

export const transactionSchema = joi.object({
    value: joi.number().max(999999).required(),
    desc: joi.string().max(25).required(),
    type: joi.string().valid("entry", "output").required()
});

export default transactionSchema