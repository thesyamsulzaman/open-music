exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations.playlist_id--playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  );

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations.user_id--users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'collaborations',
    'fk_collaborations.playlist_id--playlists.id'
  );
  pgm.dropConstraint('collaborations', 'fk_collaborations.user_id--users.id');
  pgm.dropTable('collaborations');
};
