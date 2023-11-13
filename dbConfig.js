const config = {
    user: process.env.DB_USER || 'k-karbasi',
    password: process.env.DB_PASSWORD || 'K@rB@$i',
    server: process.env.DB_SERVER || '192.168.21.4',
    database: process.env.DB_DATABASE || 'PMDB',
    options: {
        trustServerCertificate: true,
        trustedConnection: true,
    }
}

module.exports = config;