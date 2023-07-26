import { FastifyInstance } from "fastify"
import { knex } from "../database"
import { z } from "zod"
import { randomUUID } from "crypto"


// Rota para buscar todas as transações
export async function transactionsRoutes(app: FastifyInstance) {
    app.get('/', async () => {
        const transactions = await knex('transactions').select()

        return { transactions }
    })


// Rota para buscar uma unica transação
    app.get('/:id', async (request) => {
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getTransactionParamsSchema.parse(request.params)

        const transaction = await knex('transactions').where('id', id).first()

        return { transaction }
    })


// Rota para fazer a soma de todas as trnsações
    app.get('/summary', async () => {
        const summary = await knex('transactions')
        .sum('amout', {as: 'amount'})
        .first()

        return { summary }
    })


// Rota para inserir uma transação
    app.post('/', async (request, reply) => {
        
        const createTransactionBodySchema = z.object ({
            title: z.string(),
            amout: z.number(),
            type: z.enum(['credit', 'debit']),
        })
      
        const { title, amout, type } = createTransactionBodySchema.parse(
            request.body,
        )


        await knex ('transactions').insert({
                id: randomUUID(),
                title,
                amout: type === 'credit' ? amout : amout * -1,
            })
        

         return reply.status(201).send()
      })
}