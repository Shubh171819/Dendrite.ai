import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, onValue, update, child } from "firebase/database";
import randomize from "randomatic";
import { getUsername, getName } from "./KeycloakUtil";

const firebaseConfig = {
    apiKey: "AIzaSyCcqymwFQpqp34RmbV22cAXogONRNn6iAw",
    authDomain: "whiteboard-48ae6.firebaseapp.com",
    projectId: "whiteboard-48ae6",
    storageBucket: "whiteboard-48ae6.appspot.com",
    messagingSenderId: "1047552900828",
    appId: "1:1047552900828:web:e84bdd3ca53512f4b4fe19",
    databaseURL: "https://whiteboard-48ae6-default-rtdb.firebaseio.com/",
};

const IS_INVITING_ENABLED = false;

export default class StorageUtils {
    static whiteboardId = '';
    static owner = '';
    static username = '';
    static users = {};

    static init = async () => {
        await initializeApp(firebaseConfig);

        this.saveUser(getUsername(), await getName());
    }

    static saveUser = (username, name) => {
        if (!username) {
            return;
        }
        const db = getDatabase();
        const dbRef = ref(db);
        get(child(dbRef, `users/${username}`)).then((snapshot) => {
            if (snapshot.exists()) {
                // Already Exists: no need to create
                this.username = username
            } else {
                // New User
                set(ref(db, `users/${username}`), {
                    username,
                    name,
                }).then(() => this.username = username)
            }
        }).catch((error) => {
            alert("an error occured :" + error);
        });
    }

    static updatePointer = (x, y) => {
        if (!this.whiteboardId || !this.username) {
            return;
        }
        const updates = {};
        updates[`whiteboards/${this.whiteboardId}/users/${this.username}/x`] = x;
        updates[`whiteboards/${this.whiteboardId}/users/${this.username}/y`] = y;
        const db = getDatabase();
        update(ref(db), updates);
    }

    static updateLines = (lines) => {
        if (!this.whiteboardId) {
            return;
        }
        const updates = {};
        updates[`whiteboards/${this.whiteboardId}/lines`] = lines.length === 0 ? null : lines;
        const db = getDatabase();
        update(ref(db), updates);
    }

    static checkAndCreateWhiteboard(onSuccess) {
        const randomId = randomize('0A', 6);
        const db = getDatabase();
        const dbRef = ref(db);
        get(child(dbRef, `whiteboards/${randomId}`)).then((snapshot) => {
            if (snapshot.exists()) {
                // Already Exists: try again with another ID
                this.checkAndCreateWhiteboard(onSuccess);
            } else {
                // Available
                const owner = getUsername();
                set(ref(db, `whiteboards/${randomId}`), {
                    owner,
                    whiteboardId: randomId,
                    lines: [],
                    users: {
                        [owner]: { x: 100, y: 200 }
                    },
                }).then(() => {
                    this.owner = owner;
                    this.whiteboardId = randomId;
                    onSuccess();
                });
            }
        }).catch((error) => {
            alert("an error occured :" + error);
        });
    }

    static checkAndJoinWhiteboard(id, onSuccess) {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `whiteboards/${id}`)).then((snapshot) => {
            if (snapshot.exists()) {
                // Room Exists
                const room = snapshot.val();
                const users = room.users;

                if (this.canJoin()) {

                    const updates = {};
                    updates[`whiteboards/${id}/users/${this.username}/x`] = 0;
                    updates[`whiteboards/${id}/users/${this.username}/y`] = 0;
                    const db = getDatabase();
                    update(ref(db), updates);

                    this.whiteboardId = id;
                    this.owner = room.owner;

                    onSuccess();
                } else {
                    alert('You do not have access to join this room')
                }
            } else {
                alert("Invalid code")
            }
        }).catch((error) => {
            alert("an error occured :" + error);
        });
    }

    static setListeners(onLineUpdate, onUserUpdate) {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            get(child(ref(db), `whiteboards/${this.whiteboardId}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    // Room Exists
                    const room = snapshot.val();
                    const linesRef = ref(db, `whiteboards/${this.whiteboardId}/lines`);
                    const usersRef = ref(db, `whiteboards/${this.whiteboardId}/users`);
                    const allUsersRef = ref(db, `users/`);

                    const unSubLines = onValue(linesRef, (lineSnap) => {
                        onLineUpdate(lineSnap.val() ?? room.lines ?? [])
                    })
                    const unSubUsers = onValue(usersRef, (userSnap) => {
                        onUserUpdate(userSnap.val() ?? room.users ?? {})
                    })
                    onValue(allUsersRef, (userSnap) => {
                        this.users = userSnap.val() ?? {};
                    })

                    resolve(() => {
                        unSubLines();
                        unSubUsers();
                    })
                } else {
                    alert("Invalid code")
                }
            }).catch((error) => {
                alert("an error occured :" + error);
            });
        })
    }

    static removeUser(username) {
        const updates = {};
        updates[`whiteboards/${this.whiteboardId}/users/${username}`] = null;
        const db = getDatabase();
        update(ref(db), updates);
    }

    static async invite(username) {
        const db = getDatabase();
        return set(ref(db, `whiteboards/${this.whiteboardId}/users/${username}`), { x: 100, y: 200 });
    }

    static canJoin(users) {
        if (IS_INVITING_ENABLED) {
            return !!users[this.username]
        } else {
            return true;
        }
    }
}