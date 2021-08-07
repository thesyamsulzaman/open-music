const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required().min(3),
});

const SongPayloadSchema = Joi.object({
  songId: Joi.string().required().min(3),
});

module.exports = { PlaylistPayloadSchema, SongPayloadSchema };
