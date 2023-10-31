import { Card, Dropdown, ListGroup } from 'react-bootstrap'
import { FriendListData } from '../utils/types'
import { acceptFriendRequest, deleteFriendship } from '../helpers/apiCommunicator';


interface FriendListProps {
    friendList: FriendListData[];
    pendingFriendList: FriendListData[];
    setPendingFriendList: (newList: FriendListData[]) => void;
    setFriendList: (newList: FriendListData[]) => void;
}

const FriendList: React.FC<FriendListProps> = ({ friendList, pendingFriendList, setPendingFriendList, setFriendList }) => {

    const handleAcceptFriendRequestClick = async (friendId: number) => {
        const acceptFriendResponse = await acceptFriendRequest(friendId);
        if (acceptFriendResponse) {
            const updatedPendingFriends = pendingFriendList.filter(friend => friend.id !== friendId);
            setPendingFriendList(updatedPendingFriends);
        } else {
            console.error("Accept friend request failed");
        }
    };

    const handleDeclineFriendRequestClick = async (friendId: number) => {
        const declineFriendResponse = await deleteFriendship(friendId);
        if (declineFriendResponse) {
            const updatedPendingFriends = pendingFriendList.filter(friend => friend.id !== friendId);
            setPendingFriendList(updatedPendingFriends);
        } else {
            console.error("Decline friend request error");
        }
    }

    const handleRemoveFriendRequestClick = async (friendId: number) => {
        const deleteFriendResponse = await deleteFriendship(friendId);
        if (deleteFriendResponse) {
            const updatedFriends = friendList.filter(friend => friend.id !== friendId);
            setFriendList(updatedFriends);
        } else {
            console.error("Delete friendship failed");
        }
    };

    return (
    <>
    <Card>
        <Card.Header className='text-center'>
            Friends
        </Card.Header>
        <ListGroup as="ul" style={{overflowY: "auto", maxHeight: "230px"}}>
            {friendList.map((friend) => (
            <ListGroup.Item
                key={friend.id}
                as="li"
                className="d-flex justify-content-between align-items-start"
            >
                <div className="ms-2 me-auto">
                    <div className="fw-bold">
                        {friend.username}
                    </div>
                    {friend.status}
                </div>
                <Dropdown>
                        <Dropdown.Toggle variant='light'>
                        <Dropdown.Menu>
                            <Dropdown.Item>Send message</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleRemoveFriendRequestClick(friend.id)}>
                                Delete friend
                            </Dropdown.Item>
                            <Dropdown.Item>Invite to game</Dropdown.Item>
                        </Dropdown.Menu>
                        </Dropdown.Toggle>
                    </Dropdown>
            </ListGroup.Item>
            ))}
        </ListGroup>
    </Card>
    <Card className='mt-2'>
        <Card.Header className='text-center'>
            Pending friend requests
        </Card.Header>
    <ListGroup as="ul" style={{overflowY: "auto", maxHeight: "135px"}}>
        {pendingFriendList ? pendingFriendList.map((friend) => (
        <ListGroup.Item
            key={friend.id}
            as="li"
            className="d-flex justify-content-between align-items-start"
        >
            <div className="ms-2 me-auto">
                <div className="fw-bold">
                    {friend.username}
                </div>
                {friend.status ? friend.status : "Pending"}
            </div>
            <Dropdown>
                    <Dropdown.Toggle variant='light'>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleAcceptFriendRequestClick(friend.id)}>
                            Accept friend
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleDeclineFriendRequestClick(friend.id)}>
                            Decline request
                        </Dropdown.Item>
                    </Dropdown.Menu>
                    </Dropdown.Toggle>
                </Dropdown>
        </ListGroup.Item>
        )):
        <p>No pending requests</p>
        }
        </ListGroup>
    </Card>
    </>
    )
}

export default FriendList