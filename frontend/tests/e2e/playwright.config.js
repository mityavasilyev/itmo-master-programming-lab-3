module.exports = {

    retries: 2,

    use: {
        browserName: 'chromium',

        viewport: { width: 1280, height: 720 },
    },

    webServer: {
        command: 'npm start',
        port: 3000,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
    },
};
