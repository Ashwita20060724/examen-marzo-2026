import { Model, Op } from 'sequelize'
import moment from 'moment'
import {Order} from '../models'

const loadModel = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Restaurant.belongsTo(models.RestaurantCategory, { foreignKey: 'restaurantCategoryId', as: 'restaurantCategory' })
      Restaurant.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
      Restaurant.hasMany(models.Product, { foreignKey: 'restaurantId', as: 'products' })
      Restaurant.hasMany(models.Order, { foreignKey: 'restaurantId', as: 'orders' })
    }

    async getAverageServiceTime () {
      try {
        const orders = await this.getOrders()
        const serviceTimes = orders.filter(o => o.deliveredAt).map(o => moment(o.deliveredAt).diff(moment(o.createdAt), 'minutes'))
        return serviceTimes.reduce((acc, serviceTime) => acc + serviceTime, 0) / serviceTimes.length
      } catch (err) {
        return err
      }
    }

    
    //TENEMOS QUE OBTENER LOS PEDIDOS
    //QUE SE REALIZARON EN LAS ÚLTIMAS 2 HORAS
    //PARA ESO CONTAMOS LOS PEDIDOS QUE TENGAN
    // EL ID QUE NECESITAMOS + CREADO >= 2 HORAS
    async getOrdersInLastTwoHours () {
      try{
        const restaurantId = this.id
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
        const pedidosHace2Horas = await Order.count({
          where: {
            restaurantId,
            createdAt: {[Op.gte]: twoHoursAgo}
          }
        }
        )
        return pedidosHace2Horas
      } catch(err){
        return err
      }
    }

    async getIsClosedByLimit () {
        try{
          if(this.isUnlimited){
            return false
          }
          const pedidos = this.getOrdersInLastTwoHours
          if(pedidos > 0){
            return true
          } else{
            false
          }
        } catch(error){
          return error
        }
      }

    
      //EJERCICIOS NUEVOS: 1. SABER SI ES DE ALTA DEMANDA
      async getIsHighDemand() {
        if(this.isUnlimited){
          return false
        }
        //CONTAMOS LOS PEDIDOS DE LAS ÚLTIMAS 2 HORAS
        const ordersInLastTwoHours = await this.getOrdersInLastTwoHours();
        return ordersInLastTwoHours > 3
      }
  }
  Restaurant.init({
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    description: DataTypes.TEXT,
    address: {
      allowNull: false,
      type: DataTypes.STRING
    },
    postalCode: {
      allowNull: false,
      type: DataTypes.STRING
    },
    url: DataTypes.STRING,
    shippingCosts: {
      allowNull: false,
      type: DataTypes.DOUBLE
    },
    averageServiceMinutes: DataTypes.DOUBLE,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    logo: DataTypes.STRING,
    heroImage: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM,
      values: [
        'online',
        'offline',
        'closed',
        'temporarily closed'
      ]
    },
    restaurantCategoryId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    ordersInLastTwoHours: {
      type: DataTypes.VIRTUAL
    },
    isClosedByLimit: {
      type: DataTypes.VIRTUAL
    },
    //HAY QUE AÑADIR isUnlimited
    isUnlimited: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Restaurant'
  })

  // Código proporcionado. No borrar.
  Restaurant.addHook('afterFind', async (results) => {
    if (!results) return
    const isArray = Array.isArray(results)
    const instances = isArray ? results : [results]
    for (const instance of instances) {
      if (instance !== undefined && instance !== null && instance instanceof Restaurant) {
        const ordersCount = await instance.getOrdersInLastTwoHours()
        const closed = await instance.getIsClosedByLimit()

        instance.setDataValue('ordersInLastTwoHours', ordersCount)
        instance.setDataValue('isClosedByLimit', closed)
      }
    }
  })

  return Restaurant
}
export default loadModel
