import request from 'supertest'
import { getApp, shutdownApp } from './utils/testApp'

describe('Unlimited Orders E2E Tests', () => {
    let app, ownerToken, ownerRestaurants

    const setOwnerRestaurants = async () => {
        const response = await request(app).get('/users/myRestaurants').set('Authorization', `Bearer ${ownerToken}`).send()
        ownerRestaurants = response.body
    }

    beforeAll(async () => {
        app = await getApp()
        // Login as the owner created in the seeder
        const ownerLogin = await request(app).post('/users/loginOwner').send({ email: 'unlimited@owner.com', password: 'secret' })
        ownerToken = ownerLogin.body.token
        await setOwnerRestaurants()
    })

    describe('RF2: Virtual attributes and saturation logic', () => {
        it('TC-Unlimited 1 should be unlimited and not closed by limit', async () => {
            const restaurant = ownerRestaurants.find(r => r.name === 'TC-Unlimited 1')
            expect(restaurant.isUnlimited).toBeTruthy()
            expect(restaurant.ordersInLastTwoHours).toBe(0)
            expect(restaurant.isClosedByLimit).toBe(false)
        })

        it('TC-Standard Saturated should NOT be unlimited and SHOULD be closed by limit (1 order in last 2h)', async () => {
            const restaurant = ownerRestaurants.find(r => r.name === 'TC-Standard Saturated')
            expect(restaurant.isUnlimited).toBeFalsy()
            expect(restaurant.ordersInLastTwoHours).toBe(1)
            expect(restaurant.isClosedByLimit).toBe(true)
        })

        it('TC-Standard Free should NOT be unlimited and should NOT be closed by limit', async () => {
            const restaurant = ownerRestaurants.find(r => r.name === 'TC-Standard Free')
            expect(restaurant.isUnlimited).toBeFalsy()
            expect(restaurant.ordersInLastTwoHours).toBe(0)
            expect(restaurant.isClosedByLimit).toBe(false)
        })
    })

    describe('RF1: Limit of 3 unlimited restaurants per owner', () => {
        it('Should be able to mark a 3rd restaurant as unlimited', async () => {
            const standardFree = ownerRestaurants.find(r => r.name === 'TC-Standard Free')
            const response = await request(app)
                .put(`/restaurants/${standardFree.id}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: standardFree.name,
                    address: standardFree.address,
                    postalCode: standardFree.postalCode,
                    shippingCosts: standardFree.shippingCosts,
                    restaurantCategoryId: standardFree.restaurantCategoryId,
                    isUnlimited: true
                })

            expect(response.status).toBe(200)
            expect(response.body.isUnlimited).toBeTruthy()
            await setOwnerRestaurants() // State changed
        })

        it('Should NOT be able to mark a 4th restaurant as unlimited (should return 409)', async () => {
            const standardSaturated = ownerRestaurants.find(r => r.name === 'TC-Standard Saturated')
            const response = await request(app)
                .put(`/restaurants/${standardSaturated.id}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: standardSaturated.name,
                    address: standardSaturated.address,
                    postalCode: standardSaturated.postalCode,
                    shippingCosts: standardSaturated.shippingCosts,
                    restaurantCategoryId: standardSaturated.restaurantCategoryId,
                    isUnlimited: true
                })

            expect(response.status).toBe(409)
        })

        it('Should be able to update an unlimited restaurant (staying at total 3)', async () => {
            const unlimited1 = ownerRestaurants.find(r => r.name === 'TC-Unlimited 1')
            const response = await request(app)
                .put(`/restaurants/${unlimited1.id}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: 'TC-Unlimited 1 Updated',
                    address: unlimited1.address,
                    postalCode: unlimited1.postalCode,
                    shippingCosts: unlimited1.shippingCosts,
                    restaurantCategoryId: unlimited1.restaurantCategoryId,
                    isUnlimited: true
                })

            expect(response.status).toBe(200)
            expect(response.body.name).toBe('TC-Unlimited 1 Updated')
            await setOwnerRestaurants() // State changed
        })
    })

    describe('RF1: Limit of 3 unlimited restaurants per owner (Creation)', () => {
        it('Should NOT be able to create a 4th unlimited restaurant (should return 409)', async () => {
            const newRestaurantData = {
                name: 'New Unlimited',
                address: 'address',
                postalCode: '12345',
                shippingCosts: 1.0,
                restaurantCategoryId: 1,
                isUnlimited: true
            }
            const response = await request(app)
                .post('/restaurants')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(newRestaurantData)

            expect(response.status).toBe(409)
        })

        it('Should be able to create a standard restaurant (isUnlimited: false)', async () => {
            const newRestaurantData = {
                name: 'New Standard',
                address: 'address',
                postalCode: '12345',
                shippingCosts: 1.0,
                restaurantCategoryId: 1,
                isUnlimited: false
            }
            const response = await request(app)
                .post('/restaurants')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(newRestaurantData)

            expect(response.status).toBe(200)
            await setOwnerRestaurants()
        })
    })

    describe('RF1: Limit of 3 unlimited restaurants per owner (toggleIsUnlimited)', () => {
        it('Should be able to toggle isUnlimited to false', async () => {
            const unlimited1 = ownerRestaurants.find(r => r.name === 'TC-Unlimited 1 Updated')
            const response = await request(app)
                .patch(`/restaurants/${unlimited1.id}/toggleIsUnlimited`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send()

            expect(response.status).toBe(200)
            expect(response.body.isUnlimited).toBeFalsy()
            await setOwnerRestaurants() // State changed
        })

        it('Should be able to toggle isUnlimited back to true', async () => {
            const unlimited1 = ownerRestaurants.find(r => r.name === 'TC-Unlimited 1 Updated')
            const response = await request(app)
                .patch(`/restaurants/${unlimited1.id}/toggleIsUnlimited`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send()

            expect(response.status).toBe(200)
            expect(response.body.isUnlimited).toBeTruthy()
            await setOwnerRestaurants() // State changed
        })

        it('Should NOT be able to toggle a 4th restaurant to unlimited (should return 409)', async () => {
            const standardSaturated = ownerRestaurants.find(r => r.name === 'TC-Standard Saturated')
            const response = await request(app)
                .patch(`/restaurants/${standardSaturated.id}/toggleIsUnlimited`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send()

            expect(response.status).toBe(409)
            await setOwnerRestaurants() // State changed
        })
    })

    afterAll(async () => {
        await shutdownApp()
    })
})