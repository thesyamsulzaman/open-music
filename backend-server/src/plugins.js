const path = require('path');

// Songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const { TokenManager } = require('./lib');
const AuthenticationsValidator = require('./validator/authentications');

// Playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// Playlists
const playlistsongs = require('./api/playlistsongs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');

// Collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// Uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// Cache
const CacheService = require('./services/redis/CacheService');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// ---------------------------------------------------
//                Initialize Services
// ---------------------------------------------------
const cacheService = new CacheService();

const songsService = new SongsService(cacheService);
const usersService = new UsersService();
const authenticationsService = new AuthenticationsService();
const playlistsService = new PlaylistsService(CollaborationsService, cacheService);
const playlistSongsService = new PlaylistSongsService(cacheService);
const collaborationsService = new CollaborationsService();
const storageService = new StorageService(
  path.resolve(__dirname, 'api/uploads/file/pictures'),
);

module.exports = [
  {
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  },
  {
    plugin: users,
    options: {
      service: usersService,
      validator: UsersValidator,
    },
  },

  {
    plugin: authentications,
    options: {
      authenticationsService,
      usersService,
      tokenManager: TokenManager,
      validator: AuthenticationsValidator,
    },
  },

  {
    plugin: playlists,
    options: {
      service: playlistsService,
      validator: PlaylistsValidator,
    },
  },

  {
    plugin: playlistsongs,
    options: {
      playlistSongsService,
      playlistsService,
      validator: PlaylistsValidator,
    },
  },

  {
    plugin: collaborations,
    options: {
      collaborationsService,
      playlistsService,
      validator: CollaborationsValidator,
    },
  },

  {
    plugin: uploads,
    options: {
      service: storageService,
      validator: UploadsValidator,
    },
  },

  {
    plugin: _exports,
    options: {
      playlistsService,
      ProducerService,
      validator: ExportsValidator,
    },
  },

];
