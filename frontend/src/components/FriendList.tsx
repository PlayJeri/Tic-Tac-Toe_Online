import React, { useEffect, useState } from 'react'
import { Card, Dropdown, ListGroup } from 'react-bootstrap'
import { FriendListData } from '../utils/types'


interface FriendListProps {
    friendList: FriendListData[],
    pendingFriendList: FriendListData[],
}

const FriendList: React.FC<FriendListProps> = ({ friendList, pendingFriendList }) => {

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
            <div className="fw-bold">{friend.username}</div>
            {friend.status}
            </div>
            <Dropdown>
                  <Dropdown.Toggle variant='light'>
                    <Dropdown.Menu>
                      <Dropdown.Item>Send message</Dropdown.Item>
                      <Dropdown.Item>Delete friend</Dropdown.Item>
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
        {pendingFriendList.map((friend) => (
        <ListGroup.Item
            key={friend.id}
            as="li"
            className="d-flex justify-content-between align-items-start"
        >
            <div className="ms-2 me-auto">
            <div className="fw-bold">{friend.username}</div>
            {friend.status ? friend.status : "Pending"}
            </div>
            <Dropdown>
                  <Dropdown.Toggle variant='light'>
                    <Dropdown.Menu>
                      <Dropdown.Item>Accept friend</Dropdown.Item>
                      <Dropdown.Item>Decline request</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Toggle>
                </Dropdown>
        </ListGroup.Item>
        ))}
        </ListGroup>
    </Card>
    </>
  )
}

export default FriendList