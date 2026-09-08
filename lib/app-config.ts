import config from "../app.config.json"

export const APP_CONFIG = config
export const IS_MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true"
