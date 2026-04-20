const User = require('../models/User')
const Product = require('../models/Product')

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist')
    res.json({ success: true, data: user.wishlist })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body
    const user = await User.findById(req.user.id)
    
    // Check if moving to/from wishlist
    const isWished = user.wishlist.includes(productId)
    
    if (isWished) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString())
    } else {
      user.wishlist.push(productId)
    }
    
    await user.save()
    res.json({ success: true, isWished: !isWished, data: user.wishlist })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.id)
    await user.save()
    res.json({ success: true, data: user.wishlist })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.addAddress = async (req, res) => {
  try {
    const { name, phone, pincode, locality, street, city, state, landmark, altPhone, type } = req.body
    const user = await User.findById(req.user.id)
    
    user.savedAddresses.push({
      name, phone, pincode, locality, street, city, state, landmark, altPhone, type
    })
    
    await user.save()
    res.json({ success: true, data: user.savedAddresses })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json({ success: true, data: user.savedAddresses })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
