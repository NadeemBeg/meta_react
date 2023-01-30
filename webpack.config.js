module.exports = {

    resolve: {
        fallback: {
            "fs": false,
            "tls": false,
            "net": false,
            "path": false,
            "zlib": false,
            "http": false,
            "https": false,
            "stream": false,
            "crypto": false,
            "url": false,
            "constants": require.resolve("constants-browserify"),
            "os": false,
            "path-browserify": false,
            "path": require.resolve("path-browserify"),
            "https-browserify": false,
            "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
        }
    },
}