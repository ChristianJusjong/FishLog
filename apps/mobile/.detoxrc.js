/** @type {Detox.DetoxConfig} */
module.exports = {
    testRunner: {
        args: {
            '$0': 'jest',
            config: 'e2e/jest.config.js'
        },
        jest: {
            setupTimeout: 120000
        }
    },
    apps: {
        'android.debug': {
            type: 'android.apk',
            build: 'cd android && gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
            binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
            reversePorts: [
                8081
            ]
        }
    },
    devices: {
        simulator: {
            type: 'ios.simulator',
            device: {
                type: 'iPhone 15'
            }
        },
        attached: {
            type: 'android.attached',
            device: {
                adbName: '.*'
            }
        },
        emulator: {
            type: 'android.emulator',
            device: {
                avdName: 'Medium_Phone_API_36.1'
            }
        }
    },
    configurations: {
        'ios.sim.debug': {
            device: 'simulator',
            app: 'ios.debug'
        },
        'android.att.debug': {
            device: 'attached',
            app: 'android.debug'
        },
        'android.emu.debug': {
            device: 'emulator',
            app: 'android.debug'
        }
    }
};
