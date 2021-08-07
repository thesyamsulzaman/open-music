class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, validator) {
    this._service = playlistSongsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getAllSongsFromPlaylistHandler = this.getAllSongsFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._service.addSongToPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });

    response.code(201);

    return response;
  }

  async getAllSongsFromPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    const songs = await this._service.getAllSongsFromPlaylist(playlistId);

    const response = h.response({
      status: 'success',
      data: { songs },
    });

    response.code(200);

    return response;
  }

  async deleteSongFromPlaylistHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    });

    response.code(200);
    return response;
  }
}

module.exports = PlaylistSongsHandler;
