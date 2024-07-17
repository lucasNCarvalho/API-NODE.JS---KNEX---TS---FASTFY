import { FastifyInstance } from "fastify"
import {z} from 'zod'
import { knex } from "../database"
import { randomUUID } from "crypto"

export async function transactionsRoutes(app: FastifyInstance) {

    app.get('/', async () => {
        const transactions = await knex('transactions').select()

        return {transactions}
    })

    app.get('/:id', async (request) => {
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid()
        })
        
        const {id} = getTransactionParamsSchema.parse(request.params)

        const transaction = await knex('transactions').where('id', id).first()

        return {transaction}
    })

    app.get('/summary', async () => {
        const summary = await knex("transactions").sum('amount', {as: 'amount'}).first()

        return {summary}
    })

    app.post('/', async (req, res) => {
    
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })

        console.log('req', req.body)
        const {title, amount, type } = createTransactionBodySchema.parse(req.body)

        let sessionId = req.cookies.sessionId

        if(!sessionId) {
            sessionId = randomUUID()

            res.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('transactions')
        .insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId
        })

       return res.status(201).send()
    })
}