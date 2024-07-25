import { beforeAll, afterAll, describe, it, expect} from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import {app} from '../src/app'



describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })

    beforeAll(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })
    
    it('should be able to create a new transaction', async() => {
       await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit'
        })
        .expect(201)
       
    })

    it('should be able to list all transactions', async () => {
        const createTransactionsResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit'
        })
        
        const cookies = createTransactionsResponse.get('Set-Cookie') ?? []

        const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            })
        ])
    })
})

