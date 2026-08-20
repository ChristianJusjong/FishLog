const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withCustomPackagingOptions(config) {
    return withAppBuildGradle(config, async (config) => {
        const buildGradle = config.modResults.contents;

        if (buildGradle.includes('packagingOptions')) {
            const pickFirsts = `
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
        pickFirst 'lib/x86/libfbjni.so'
        pickFirst 'lib/x86_64/libfbjni.so'
        pickFirst 'lib/armeabi-v7a/libfbjni.so'
        pickFirst 'lib/arm64-v8a/libfbjni.so'
`;
            // Insert right after packagingOptions {
            config.modResults.contents = buildGradle.replace(
                /packagingOptions\s*\{/,
                `packagingOptions {${pickFirsts}`
            );
        }

        return config;
    });
};
