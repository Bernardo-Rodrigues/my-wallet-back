import joi from "joi"

export const transactionSchema = joi.object({
    value: joi.number().required(),
    desc: joi.string().required(),
    type: joi.string().valid("entry", "output").required()
});

export default transactionSchema