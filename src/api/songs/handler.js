/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { title, year, performer, genre, duration } = request.payload;

      const songId = await this._service.addSong({
        title,
        year,
        performer,
        genre,
        duration,
      });

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan',
        data: {
          songId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Server kami error',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongsHandler(request, h) {
    const songs = await this._service.getSongs();

    return {
      status: 'success',
      data: { songs },
    };
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);

      const response = h.response({
        status: 'success',
        data: {
          song,
        },
      });

      return response;
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });

      response.code(404);
      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      this._validator.validateSongPayload(request.payload);
      await this._service.editSongById(id, request.payload);

      const response = h.response({
        status: 'success',
        message: 'lagu berhasil diperbarui',
      });

      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);

      const response = h.response({
        status: 'success',
        message: 'Menghapus lagu sukses',
      });

      response.code(200);
      return response;
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode);
      return response;
    }
  }
}

module.exports = SongsHandler;
