import express, {json} from "express"
import cors from "cors"
import { signIn, signUp } from "./controllers/authController.js"
import { getUserTransactions, postNewTransaction } from "./controllers/transactionsController.js"

const app = express()
app.use(cors())
app.use(json())

app.post("/signup", signUp)

app.post("/signin", signIn)

app.get("/transactions", getUserTransactions)

app.post("/transactions", postNewTransaction)

app.listen(5000, ()=>{
    console.log("Server listening on Port 5000")
}) 