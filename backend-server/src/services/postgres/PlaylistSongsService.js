const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;

    const query = {
      text: `
        INSERT INTO playlistsongs VALUES ($1, $2, $3)
      `,
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    await this._cacheService.delete(`songs:${playlistId}`);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getAllSongsFromPlaylist(playlistId) {
    try {
      const results = await this._cacheService.get(`songs:${playlistId}`);
      return JSON.parse(results);
    } catch (error) {
      const query = {
        text: `
          SELECT songs.id, songs.title, songs.performer
          FROM playlistsongs
          JOIN songs ON songs.id = playlistsongs.song_id
          WHERE playlist_id = $1
          GROUP BY songs.id
      `,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`songs:${playlistId}`, JSON.stringify(result.rows));

      return result.rows;
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: `
        DELETE FROM playlistsongs 
        WHERE song_id = $1 AND playlist_id = $2
      `,
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);

    await this._cacheService.delete(`songs:${playlistId}`);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus, id tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;
