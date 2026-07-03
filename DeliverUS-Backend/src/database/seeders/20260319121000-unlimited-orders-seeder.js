'use strict'
const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(5)

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const ownerId = 100 // Even higher to be safe
        const customerId = 101

        await queryInterface.bulkInsert('Users', [
            { id: ownerId, firstName: 'Unlimited', lastName: 'Owner', email: 'unlimited@owner.com', password: bcrypt.hashSync('secret', salt), phone: '123456789', address: 'Test St', postalCode: '12345', userType: 'owner', createdAt: new Date(), updatedAt: new Date() },
            { id: customerId, firstName: 'Test', lastName: 'Customer', email: 'test@customer.com', password: bcrypt.hashSync('secret', salt), phone: '123456789', address: 'Test St', postalCode: '12345', userType: 'customer', createdAt: new Date(), updatedAt: new Date() }
        ], {})

        await queryInterface.bulkInsert('Restaurants', [
            { id: 100, name: 'TC-Unlimited 1', description: 'desc', address: 'addr', postalCode: '12345', restaurantCategoryId: 1, shippingCosts: 1.0, email: 'u1@res.com', phone: '123', isUnlimited: true, userId: ownerId, status: 'online', createdAt: new Date(), updatedAt: new Date() },
            { id: 101, name: 'TC-Unlimited 2', description: 'desc', address: 'addr', postalCode: '12345', restaurantCategoryId: 1, shippingCosts: 1.0, email: 'u2@res.com', phone: '123', isUnlimited: true, userId: ownerId, status: 'online', createdAt: new Date(), updatedAt: new Date() },
            { id: 102, name: 'TC-Standard Saturated', description: 'desc', address: 'addr', postalCode: '12345', restaurantCategoryId: 1, shippingCosts: 1.0, email: 'ss@res.com', phone: '123', isUnlimited: false, userId: ownerId, status: 'online', createdAt: new Date(), updatedAt: new Date() },
            { id: 103, name: 'TC-Standard Free', description: 'desc', address: 'addr', postalCode: '12345', restaurantCategoryId: 1, shippingCosts: 1.0, email: 'sf@res.com', phone: '123', isUnlimited: false, userId: ownerId, status: 'online', createdAt: new Date(), updatedAt: new Date() }
        ], {})

        const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000)
        await queryInterface.bulkInsert('Orders', [
            { id: 100, price: 10.0, address: 'addr', shippingCosts: 0, restaurantId: 102, userId: customerId, createdAt: oneHourAgo, updatedAt: oneHourAgo }
        ], {})
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Orders', { id: 100 }, {})
        await queryInterface.bulkDelete('Restaurants', { id: [100, 101, 102, 103] }, {})
        await queryInterface.bulkDelete('Users', { id: [100, 101] }, {})
    }
}
