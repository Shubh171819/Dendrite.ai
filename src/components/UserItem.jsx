import { getUsername } from "../utils/KeycloakUtil";
import StorageUtils from "../utils/StorageUtils";
import {Button} from 'react-bootstrap';
import {ImCross} from 'react-icons/im';
import './UserItem.css';

const UserItem = ({ user, color }) => {
    const removeUser = (e) => {
        if (window.confirm('Are you sure you want to remove this user')) {
            StorageUtils.removeUser(user?.username);
        }
    }

    const canRemove = StorageUtils.owner !== user?.username && user?.username !== getUsername();

    return (
        <div className="userItem">
            <span style={{color}}>{user?.name || user?.username}</span>
            {
                user?.username === StorageUtils.username && <span>(You)</span>
            }
            {
                user?.username === StorageUtils.owner && <span>(Admin)</span>
            }
            {
                canRemove && <ImCross onClick={removeUser} />
            }
        </div>
    )
}

export default UserItem;