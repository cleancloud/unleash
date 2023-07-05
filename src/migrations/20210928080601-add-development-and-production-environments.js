'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            INSERT INTO environments(name, type, enabled, sort_order)
            VALUES ('development', 'development', true, 100),
                   ('staging', 'staging', true, 200),
                   ('production', 'production', true, 300);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE
        FROM environments
        WHERE name IN ('development', 'staging', 'production');
    `,
        cb,
    );
};
