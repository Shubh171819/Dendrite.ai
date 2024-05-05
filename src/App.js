import { useEffect, useState } from 'react';
import './App.css';
import KonvaWhiteboard from './components/KonvaWhiteboard';
import Sidebar from './components/Sidebar';
import StorageUtils from './utils/StorageUtils';
import { Button, Form } from 'react-bootstrap';

const App = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [id, setId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lines, setLines] = useState([]);
  const [users, setUsers] = useState({});

  useEffect(() => {
    StorageUtils.init();
  }, [])

  useEffect(() => {
    loadData()
  }, [isJoined])

  const loadData = async () => {
    if (isJoined) {
      await StorageUtils.setListeners(setLines, setUsers);
      setIsLoading(false);
    }
  }

  const join = (e) => {
    e.preventDefault();
    StorageUtils.checkAndJoinWhiteboard(id, () => setIsJoined(true));
  }

  const create = () => {
    StorageUtils.checkAndCreateWhiteboard(() => setIsJoined(true));
  }

  return isJoined
    ? (
      <div className="playzone">
        <Sidebar users={Object.keys(users)} exitRoom={() => setIsJoined(false)} />
        {isLoading ? null : <KonvaWhiteboard lines={lines} setLines={setLines} users={users}/>}
      </div>
    ) : (
      <form className="container" onSubmit={join}>
        <Form.Label htmlFor="basic-url">Enter a 6 - digit room Id</Form.Label>
        <div className="buttons">
          <Form.Control
            type="text"
            enterKeyHint='username'
            className="roomId"
            placeholder="123456"
            aria-label='room Id'
            onChange={(e) => setId(e.target.value.toLocaleUpperCase())}
            value={id}
          />
          <Button className="join" variant="primary" onClick={join}>Join</Button>
        </div>
        OR
        <Button className="create" variant="success" onClick={create}>Create a new room</Button>
      </form>
    );
}

export default App;