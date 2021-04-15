const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const avatarSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    info: {
      type: String,
      default: 'Input details on the Avatar. ex: Avatar background story',
    },
    stats: {
      health: { type: Number },
      mana: { type: Number },
      attack: { type: Number },
      defence: { type: Number },
      spclAttack: { type: Number },
      spclDefence: { type: Number },
      exp: { type: Number, default: 50 },
    },
    img: { type: String },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    personality: { type: String, default: '1,1,1,1,1,1' },
  },

  { timestamps: true }
);

module.exports = mongoose.model('Avatar', avatarSchema);
