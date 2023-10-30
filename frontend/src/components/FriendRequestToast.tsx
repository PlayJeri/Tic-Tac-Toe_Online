import { Button, Toast } from 'react-bootstrap'
import { useAuthContext } from '../contextProviders/AuthenticationContextProvider';

const FriendRequestToast = () => {
    const authContext = useAuthContext();

    
  return (
    <div style={{position: 'fixed', top: '70px', right: '10px', zIndex: 1}}>
            {authContext?.requests?.map((request, index: number) => (
                <Toast className='mb-4' key={index} show={authContext.showRequests[index]} onClose={() => authContext.closeRequest(index)}>
                    <Toast.Header closeButton={true}>
                        <strong className="me-auto">Friend request!</strong>
                    </Toast.Header>
                    <Toast.Body className='d-flex justify-content-between'>
                        Add {request.username} as a friend.
                        <Button variant='outline-success' className='btn-sm' onClick={() => authContext.acceptFriend(index, request.id)}>Accept</Button>
                    </Toast.Body>
                </Toast>
            ))}
</div>
  )
}

export default FriendRequestToast