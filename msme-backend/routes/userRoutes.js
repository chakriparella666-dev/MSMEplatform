const express = require('express')
const router = express.Router()
const { getWishlist, toggleWishlist, removeFromWishlist, addAddress, getAddresses } = require('../controllers/userController')
const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.get('/wishlist', getWishlist)
router.post('/wishlist/toggle', toggleWishlist)
router.delete('/wishlist/:id', removeFromWishlist)

router.get('/addresses', getAddresses)
router.post('/addresses', addAddress)

module.exports = router
