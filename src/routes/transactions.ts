import { FastifyInstance } from "fastify"
import { knex } from "../database"
import { z } from "zod"
import { randomUUID } from "crypto"
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// Rota para buscar todas as transações
export async function transactionsRoutes(app: FastifyInstance) {
    app.addHook('preHandler', async (request) => {
        console.log(`[${request.method}] ${request.url}`)
    })

    app.get(
         '/',
        { 
            preHandler: [checkSessionIdExists] 
        },
        async (request, reply) => {
            const { sessionId } = request.cookies


            const transactions = await knex('transactions')
            .where('session_id', sessionId)
            .select()

            return { transactions }
        }
)


// Rota para buscar uma unica transação
    app.get(
        '/:id',
        { 
            preHandler: [checkSessionIdExists] 
        }
        , async (request, reply) => {
            const getTransactionParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = getTransactionParamsSchema.parse(request.params)
            const { sessionId } = request.cookies

            const transaction = await knex('transactions')
            .where('id', id)
            .andWhere('session_id', sessionId)
            .first()

            return { transaction }
    }
)


// Rota para fazer a soma de todas as trnsações
    app.get(
        '/summary',
        { 
            preHandler: [checkSessionIdExists] 
        },
        async (request) => {
            const { sessionId } = request.cookies
            const summary = await knex('transactions')
            .where('session_id', sessionId)
            .sum('amout', {as: 'amount'})
            .first()

            return { summary }
    }
)


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
        
        let sessionId = request.cookies.sessionId

        if(!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            })
        }

        await knex ('transactions').insert({
                id: randomUUID(),
                title,
                amout: type === 'credit' ? amout : amout * -1,
                session_id: sessionId
            })
        

         return reply.status(201).send()
      }
    )
}