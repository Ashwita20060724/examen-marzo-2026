import { Restaurant, Order } from '../models/models.js'

const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if (req.user.id === restaurant.userId) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This entity does not belong to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}
const restaurantHasNoOrders = async (req, res, next) => {
  try {
    const numberOfRestaurantOrders = await Order.count({
      where: { restaurantId: req.params.restaurantId }
    })
    if (numberOfRestaurantOrders === 0) {
      return next()
    }
    return res.status(409).send('Some orders belong to this restaurant.')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}


const checkUnlimitedLimitCreate = async (req, res, next) => {
  try{
    //si no es ilimitado:
    if(!req.body.isUnlimited) return next()

    const numberUnlimitedRestaurant = await Restaurant.count({
      where: {
        userId: req.user.id,
        isUnlimited: true
      }
    })
    if(numberUnlimitedRestaurant >= 3){
      res.status(409).send('El propietario no puede tener más de 3 restaurantes ilimitados')
    }
    return next()
  } catch(error){
    res.status(500).send(error)
  }
}

const checkUnlimitedLimitUpdate = async(req, res, next) => {
  try{
    //si no es ilimitado:
    if(!req.body.isUnlimited) return next()
    //añadimos esta opción para verificar si el restaurante ya tiene ilimitados o no
    const restaurante = await Restaurant.findByPk(res.params.restaurantId)
    if(restaurant.isUnlimited) return next()
    const numberUnlimitedRestaurant = await Restaurant.count({
      where: {
        userId: req.user.id,
        isUnlimited: true
      }
    })
    if(numberUnlimitedRestaurant >= 3){
      res.status(409).send('El propietario no puede tener más de 3 restaurantes ilimitados')
    }
    return next()
  } catch(error) {
    res.status(500).send(error)
  }
}

const checkUnlimitedLimitToggle = async (req, res, next) => {
  try{
    const restaurante = await Restaurant.findByPk(res.params.restaurantId)
    if(restaurant.isUnlimited) return next()
    const numberUnlimitedRestaurant = await Restaurant.count({
      where: {
        userId: req.user.id,
        isUnlimited: true
      }
    })
    if(numberUnlimitedRestaurant >= 3){
      res.status(409).send('El propietario no puede tener más de 3 restaurantes ilimitados')
    }
    return next()
  } catch(error){
    res.status(500).send(error)
  }
}

export { checkRestaurantOwnership, restaurantHasNoOrders, checkUnlimitedLimitCreate, checkUnlimitedLimitUpdate, checkUnlimitedLimitToggle }
