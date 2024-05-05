import { logout } from '../utils/KeycloakUtil';
import StorageUtils from '../utils/StorageUtils';
import UserItem from './UserItem';
import './Sidebar.css';
import { Form, Button } from 'react-bootstrap';
import {BsBoxArrowRight} from 'react-icons/bs';
import Colors from '../constants/Colors';
import { useState } from 'react';

const Sidebar = ({ users = [], exitRoom }) => {
    const [username, setUsername] = useState('');

    const inviteUser = async () => {
        await StorageUtils.invite(username).then(() => alert('User invited: '+ username)).catch((e) => alert(e));
    }

    return (
        <div className="sidebarContainer">
            <div className='invite'><h1>{StorageUtils.whiteboardId}</h1><BsBoxArrowRight onClick={exitRoom}/></div>
            <div className='usersContainer'>
            <h3>Users</h3>
            {
                users.map((user, index) => <UserItem key={user} user={StorageUtils.users[user]} color={Colors[index]}/>)
            }
            </div>
            <div className="invite">
                <Form.Control
                    placeholder='...'
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                />
                <Button onClick={inviteUser}>Invite</Button>
            </div>
            <Button variant="danger" onClick={logout}>LOG OUT</Button>
        </div>
    )
}

export default Sidebar;