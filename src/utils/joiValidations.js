import joi from 'joi'

export const signUpSchema = joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().alphanum().required()
});

export const signInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().alphanum().required()
});

export const transactionSchema = joi.object({
    value: joi.string().required(),
    desc: joi.string().required(),
    type: joi.string().valid("entry", "output").required()
});