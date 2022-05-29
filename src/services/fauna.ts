import { Client } from "faunadb"

export const fauna = new Client({
    secret: process.env.FAUNADB_kEY,
    domain: 'db.us.fauna.com'
})