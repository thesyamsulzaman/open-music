class PlaylistsHandler {
  constructor(playlistsService, validator) {
    this._service = playlistsService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: ownerId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist(name, ownerId);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(userId);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });

    response.code(200);
    return response;
  }

  async deletePlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, ownerId);
    await this._service.deletePlaylist(playlistId);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasi dihapus',
    });

    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
