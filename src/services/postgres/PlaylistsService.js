/* eslint-disable no-useless-catch */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(CollaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = new CollaborationsService();
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal dibuat');
    }

    return result.rows[0].id;
  }

  async getPlaylists(ownerId) {
    const query = {
      text: `
        SELECT playlists.id, playlists.name, users.username 
        FROM playlists 
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        LEFT JOIN users ON users.id = playlists.owner
        WHERE playlists.owner = $1 OR collaborations.user_id = $1 
     `,
      values: [ownerId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError(
        'Playlist gagal dihapus, id playlist tidak ditemukan'
      );
    }
  }

  async verifyPlaylistOwner(playlistId, ownerId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const { owner: playlistOwnerId } = result.rows[0];

    if (playlistOwnerId !== ownerId) {
      throw new AuthorizationError(
        'Anda tidak berhak untuk mengakses resource ini'
      );
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId
        );
      } catch (error) {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
