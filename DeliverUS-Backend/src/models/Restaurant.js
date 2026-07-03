import { Model, Op } from 'sequelize'
import moment from 'moment'

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
      const restaurantId = this.id
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      const { Order } = this.sequelize.models
      return await Order.count({
        where: {
          restaurantId: restaurantId,
          createdAt: { [Op.gte]:
            twoHoursAgo
          }
        }
      })
    }

    async getIsClosedByLimit () {
      //1. Miramos si es ilimitado:
      if(this.isUnlimited){
        return false;
      }
      //2. reutilizamos los métodos del ejercicio 2
      const ordersInLastTwoHours = await this.getOrdersInLastTwoHours();
      //3. El restaurante se satura si ha recibido 1
      // o más pedidos en las últimas 2 horas
      return ordersInLastTwoHours > 0;
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
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
