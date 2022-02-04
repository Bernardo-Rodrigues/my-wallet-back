import joi from "joi"

export const transactionSchema = joi.object({
    value: joi.number().max(100000).required(),
    desc: joi.string().max(16).required(),
    type: joi.string().valid("entry", "output").required()
});

export default transactionSchema