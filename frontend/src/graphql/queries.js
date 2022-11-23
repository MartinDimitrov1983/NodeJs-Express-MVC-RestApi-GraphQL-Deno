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

const USER_STATUS = `query UserStatus {
  user {
    status
  }
}
`;
export { FETCH_POSTS, USER_STATUS };
