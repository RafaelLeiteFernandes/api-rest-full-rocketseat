import { knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {

    transactions: {
            id: string
            title: string
            amout: number
            create_at: string
            session_id?: string
        }
    }
}