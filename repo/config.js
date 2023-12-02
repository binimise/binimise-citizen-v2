import firebase from "./../repo/firebase";

let remoteConfig = firebase().remoteConfig();

const getConfigs = (key) => {
    return remoteConfig.getValue(key).asString();
}

const setConfig = async () => {

    await remoteConfig.setConfigSettings({
        minimumFetchIntervalMillis: 0,
    });

    remoteConfig
    .setDefaults({
        key1: 'value1',
    })
    .then(() => remoteConfig.fetchAndActivate())
    .then(fetchedRemotely => {
        if (fetchedRemotely) {
            //console.log('Configs were retrieved from the backend and activated.');
        } else {
            //console.log('No configs were fetched from the backend, and the local configs were already activated');
        }
    });
}

export { getConfigs, setConfig }