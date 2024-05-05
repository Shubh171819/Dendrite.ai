import Keycloak from 'keycloak-js';

const keycloakConfig = {
    realm: 'whiteboard',
    url: 'http://localhost:8080/',
    clientId: 'whiteboard',
};

const keycloak = new Keycloak(keycloakConfig);


export const logout = () => {
    keycloak.logout();
}

export const getUser = () => {
    return keycloak.tokenParsed || {};
}

export const getName = async () => {
    return (await keycloak.loadUserInfo())?.firstName || '';
}

export const getUsername = () => {
    return getUser()['preferred_username'];
}

export default keycloak;