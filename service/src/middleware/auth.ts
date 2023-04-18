import { isNotEmptyString } from '../utils/is'

const ipAccessCache = {}

const auth = async (req, res, next) => {
  const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  if (isNotEmptyString(AUTH_SECRET_KEY)) {
    try {
      const Authorization = req.header('Authorization')
      if (!Authorization || Authorization.replace('Bearer ', '').trim() !== AUTH_SECRET_KEY.trim()) {
        if (ipAccessCache[clientIp] === undefined)
          ipAccessCache[clientIp] = 1
        else
          ipAccessCache[clientIp]++

        if (ipAccessCache[clientIp] > 5)
          throw new Error('Error: 无访问权限 | No access rights')
      }
      next()
    }
    catch (error) {
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
    }
  }
  else {
    next()
  }
}

export { auth }
