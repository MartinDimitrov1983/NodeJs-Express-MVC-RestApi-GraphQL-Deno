const FETCH_POSTS = `query FetchPosts($page: Int) {
    posts(page: $page) {
      posts {
        _id
        title
        content
        imageUrl
        creator {
          name
        }
        createdAt
      }
      totalPosts
    }
  }
`;

const USER_LOGIN = `query UserLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      userId
    }
  }
  `;

const USER_STATUS = `query UserStatus {
  user {
    status
  }
}
`;

const FETCH_SINGLE_POST = `query FetchSinglePost($postId: ID!) {
  post(id: $postId) {
    title
    content
    imageUrl
    creator {
      name
    }
    createdAt
  }
}
`;
export { FETCH_POSTS, USER_STATUS, FETCH_SINGLE_POST, USER_LOGIN };
