export const HOST = import.meta.env.VITE_SERVER_URL;
export const AUTH_ROUTES = "api/auth";
export const SIGNUP_ROUTES = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTES = `${AUTH_ROUTES}/login`;
export const GET_USER_INFO = `${AUTH_ROUTES}/user-info`;
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/update-profile`;
export const DELETE_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/delete-profile-image`;
export const UPDATE_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/update-profile-image`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;

export const CONTACTS_ROUTE = "api/contacts";
export const SEARCH_CONTACTS_ROUTES = `${CONTACTS_ROUTE}/search`;
export const GET_CONTACTS_FOR_DM_ROUTES = `${CONTACTS_ROUTE}/get-contacts-for-dm`;
export const GET_ALL_CONTACTS_ROUTES = `${CONTACTS_ROUTE}/get-all-contacts`;

export const MESSAGES_ROUTES = "api/messages";
export const GET_MESSAGES_ROUTES = `${MESSAGES_ROUTES}/get-messages`;
export const FILE_UPLOAD_ROUTE = `${MESSAGES_ROUTES}/upload-file`;

export const CHANNEL_ROUTES = "api/channel";
export const CREATE_CHANNELS_ROUTES = `${CHANNEL_ROUTES}/create-channel`;
export const GET_CHANNELS_ROUTES = `${CHANNEL_ROUTES}/get-channels`;
export const GET_CHANNEL_MESSAGES_ROUTES = `${CHANNEL_ROUTES}/get-channel-messages`;
