const CREATE_USER = `mutation CreateUser($email: String!, $name: String!, $password: String!) {
          createUser(userInput: {email: $email, name: $name, password: $password}) {
            _id
            email
          }
        }
      `;



const UPDATE_USER_STATUS = `
mutation UpdateUserStatus($userStatus: String!) {
  updateStatus(status: $userStatus) {
    status
  }
}
`;

const CREATE_NEW_POST = `mutation CreateNewPost($title: String!, $content: String!, $imageUrl: String!) {
    createPost(postInput: {title: $title, content:$content, imageUrl: $imageUrl}){
      _id
      title
      content
      imageUrl
      creator{
        name
      }
      createdAt
    }
  }
  `;

const UPDATE_EXISTING_POST = `mutation UpdateExistingPost($postId: ID!, $title: String!, $content: String!, $imageUrl: String!) {
  updatePost(id: $postId, postInput: {title: $title, content:$content, imageUrl: $imageUrl}){
    _id
    title
    content
    imageUrl
    creator{
      name
    }
    createdAt
  }
}
`;

const DELETE_EXISTING_POST = `mutation DeleteExistingPost($postId: ID!){
  deletePost(id: $postId)
}
`;

export {
  CREATE_USER,
  UPDATE_USER_STATUS,
  CREATE_NEW_POST,
  UPDATE_EXISTING_POST,
  DELETE_EXISTING_POST,
};
