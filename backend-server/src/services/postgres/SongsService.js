const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {
  convertSongToConciseModel,
  converSongToPreciseModel,
} = require('../../utils');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({
    title, year, performer, genre, duration
  }) {
    const id = `song-${nanoid(18)}`;
    const insertedAt = new Date().toISOString();

    const query = {
      text: `
        INSERT INTO songs 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id
      `,
      values: [
        id,
        title,
        year,
        performer,
        genre,
        duration,
        insertedAt,
        insertedAt,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    await this._cacheService.delete('songs');

    return result.rows[0].id;
  }

  async getSongs() {
    try {
      const results = await this._cacheService.get('songs');
      return JSON.parse(results);
    } catch (error) {
      const results = await this._pool.query(
        'SELECT id, title, performer FROM songs'
      );

      const mappedResult = results.rows.map(convertSongToConciseModel);
      await this._cacheService.set('songs', JSON.stringify(mappedResult));

      return mappedResult;
    }
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id=$1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Lagu dengan id ${id} tidak ditemukan`);
    }

    return result.rows.map(converSongToPreciseModel)[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: `
        UPDATE songs 
        SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, updated_at=$6 
        WHERE id=$7 RETURNING id
      `,
      values: [title, year, performer, genre, duration, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    await this._cacheService.delete('songs');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id=$1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus, id tidak ditemukan');
    }

    await this._cacheService.delete('songs');
  }
}

module.exports = SongsService;
