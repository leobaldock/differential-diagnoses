/**
 * The EnvService is a little helper that just provides the clientID for
 * authenticating the app to the EHR based on the current environment.
 */
const EnvService = {

    /**
     * The configured environment. (don't use this one. see env)
     */
    configEnv: () => {
        // This is populated by the build file based on the selected build configuration
        // The $ signs are very important as the regex looks for them!
        return "$Debug$";
    },

    /**
     * The current environment. Either 'Debug' or 'Release'.
     */
    env: () => {
        // Clean off the $ symbols
        return EnvService.configEnv().replace(/\$/g, "");
    },

    /**
     * Gets the Client ID based on the current environment.
     */
    getClientId: () => {
        const targetEnv = EnvService.env();

        console.log(`Current env is ${targetEnv}`);

        if (targetEnv === "Release") {
            return "ac6e16b5-1e7d-4488-9aa2-f3b1ccc7a881";
        }

        return "3a71fccc-f4b1-4e5a-a8ed-a54c3d8a36b8";
    },

    getRedirectUri: () => {
        const targetEnv = EnvService.env();

        console.log(`Current env is ${targetEnv}`);

        if (targetEnv === "Release") {
            return "https://diagnosys.uqcloud.net";
        }

        return "http://localhost:3000"; 
    }
}

export default EnvService;