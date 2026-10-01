const express = require('express');
const router = express.Router();
const { getGeneralMessages, getDivisionMessages, postMessage } = require('../controllers/socialController');
const { optionalProtect } = require('../middleware/authMiddleware');

// Standard chat endpoints
router.get('/general', optionalProtect, getGeneralMessages);
router.get('/division/:divId', optionalProtect, getDivisionMessages);

// Frontend exact endpoints: /api/social/messages/general & /api/social/messages
router.get('/messages/general', optionalProtect, getGeneralMessages);
router.get('/messages/division', optionalProtect, getDivisionMessages);
router.get('/messages/:channel', optionalProtect, (req, res, next) => {
  if (req.params.channel === 'general') return getGeneralMessages(req, res);
  return getDivisionMessages(req, res);
});

router.post('/messages', optionalProtect, postMessage);
router.post('/send', optionalProtect, postMessage);

module.exports = router;