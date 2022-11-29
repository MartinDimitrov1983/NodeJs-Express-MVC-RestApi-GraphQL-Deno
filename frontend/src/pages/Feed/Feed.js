import React, { Fragment, useState} from "react";
import { useQuery, useMutation, useLazyQuery, gql } from "@apollo/client";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import {
  CREATE_NEW_POST,
  UPDATE_USER_STATUS,
  UPDATE_EXISTING_POST,
  DELETE_EXISTING_POST,
} from "../../graphql/mutations";
import { FETCH_POSTS, USER_STATUS } from "../../graphql/queries";
import "./Feed.css";

const Feed = (props) => {
  const [state, setState] = useState({
    posts: [],
    totalPosts: 0,
    editPost: null,
  });
  const [status, setStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [postsLoading, setPostLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [err, setErr] = useState(null);

  const GET_USER_STATUS = gql`
    ${USER_STATUS}
  `;

  const FETCH_ALL_POSTS = gql`
    ${FETCH_POSTS}
  `;
  const USER_STATUS_MUTATION = gql`
    ${UPDATE_USER_STATUS}
  `;

  const DELETE_POST_MUTATION = gql`
    ${DELETE_EXISTING_POST}
  `;

  const UPDATE_POST = gql`
    ${UPDATE_EXISTING_POST}
  `;

  const CREATE_POST = gql`
    ${CREATE_NEW_POST}
  `;
  const userStatus = useQuery(GET_USER_STATUS, {
    onCompleted: (data) => {
      setStatus(data.user.status);
      loadPosts();
    },
    onError: (error) => {
      if (error?.graphQLErrors) {
        catchError(new Error("Fetching status failed!"));
      }
      catchError(error);
    },
  });

  const [fetchPosts] = useLazyQuery(FETCH_ALL_POSTS);

  const [updateUserStatus] = useMutation(USER_STATUS_MUTATION);

  const [deletePost] = useMutation(DELETE_POST_MUTATION);

  const [createPost] = useMutation(CREATE_POST);
  const [updatedPost] = useMutation(UPDATE_POST);

  const loadPosts = (direction) => {
    if (direction) {
      setState((prevState) => {
        return { ...prevState, posts: [] };
      });
      setPostLoading(true);
    }
    let page = postPage;
    if (direction === "next") {
      page++;
      setPostPage(page);
    }
    if (direction === "previous") {
      page--;
      setPostPage(page);
    }

    fetchPosts({
      variables: { page: page },
      fetchPolicy: "no-cache",
      onCompleted: (data) => {
        setState((prevState) => {
          return {
            ...prevState,
            posts: data.posts.posts.map((post) => {
              return {
                ...post,
                imagePath: post.imageUrl,
              };
            }),
            totalPosts: data.posts.totalPosts,
          };
        });
        setPostLoading(false);
      },
      onError: (error) => {
        if (error?.graphQLErrors) {
          catchError(new Error("Failed to fetch posts."));
        }
        catchError(error);
      },
    });
  };

  const statusUpdateHandler = (event) => {
    event.preventDefault();

    updateUserStatus({
      variables: { userStatus: status },
      onError: (error) => {
        if (error?.graphQLErrors) {
          catchError(new Error("Can't update status!"));
        }
        catchError(error);
      },
    });
  };

  const newPostHandler = () => {
    setIsEditing(true);
  };

  const startEditPostHandler = (postId) => {
    setState((prevState) => {
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };

      return {
        ...prevState,
        editPost: loadedPost,
      };
    });
    setIsEditing(true);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setState((prevState) => {
      return { ...prevState, editPost: null };
    });
  };

  const finishEditHandler = (postData) => {
    setEditLoading(true);
    const formData = new FormData();
    formData.append("image", postData.image);

    if (state.editPost) {
      formData.append("oldPath", state.editPost.imagePath);
    }

    fetch("http://localhost:8080/post-image", {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: "Bearer " + props.token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((filesResData) => {
        const imageUrl = filesResData.filePath || "undefined";

        const data = state.editPost
          ? updatedPost({
              variables: {
                postId: state.editPost._id,
                title: postData.title,
                content: postData.content,
                imageUrl: imageUrl,
              }, 
            }, 
            )
          : createPost({
              variables: {
                title: postData.title,
                content: postData.content,
                imageUrl: imageUrl,
              },
            });

        return data;
      })
      .then((resData) => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }
        if (resData.errors) {
          throw new Error("Update post failed!");
        }
        let resDataField = "createPost";
        if (state.editPost) {
          resDataField = "updatePost";
        }
        const post = {
          _id: resData.data[resDataField]._id,
          title: resData.data[resDataField].title,
          content: resData.data[resDataField].content,
          creator: resData.data[resDataField].creator,
          createdAt: resData.data[resDataField].createdAt,
          imagePath: resData.data[resDataField].imageUrl,
        };
        setState((prevState) => {
          let updatedPosts = [...prevState.posts];
          let updatedTotalPosts = prevState.totalPosts;
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              (p) => p._id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else {
            updatedTotalPosts++;
            if (prevState.posts.length >= 2) {
              updatedPosts.pop();
            }
            updatedPosts.unshift(post);
          }
          return {
            posts: updatedPosts,
            editPost: null,
            totalPosts: updatedTotalPosts,
          };
        });
        setEditLoading(false);
        setIsEditing(false);
      })
      .catch((err) => {
        console.log(err);
        setState((prevState) => {
          return {
            ...prevState,
            editPost: null,
          };
        });
        setIsEditing(false);
        setEditLoading(false);
        setErr(err);
      });
  };

  const statusInputChangeHandler = (input, value) => {
    setStatus(value);
  };

  const deletePostHandler = (postId) => {
    setPostLoading(true);
    deletePost({
      variables: { postId: postId },
      onCompleted: (data) => {
        if (data.errors) {
          throw new Error("Deleting the post failed!");
        }
        loadPosts();
      },
      onError: (error) => {
        console.log(error);
        setErr(error);
        setPostLoading(false);
      },
    });
  };

  const errorHandler = () => {
    setErr(null);
  };

  const catchError = (error) => {
    setErr(error);
  };

  return (
    <Fragment>
      <ErrorHandler error={err} onHandle={errorHandler} />
      <FeedEdit
        editing={isEditing}
        selectedPost={state.editPost}
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
      />
      <section className="feed__status">
        <form onSubmit={statusUpdateHandler}>
          <Input
            type="text"
            placeholder="Your status"
            control="input"
            onChange={statusInputChangeHandler}
            value={status}
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>
      <section className="feed__control">
        <Button mode="raised" design="accent" onClick={newPostHandler}>
          New Post
        </Button>
      </section>
      <section className="feed">
        {postsLoading && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Loader />
          </div>
        )}
        {state.posts.length <= 0 && !postsLoading ? (
          <p style={{ textAlign: "center" }}>No posts found.</p>
        ) : null}
        {!postsLoading && (
          <Paginator
            onPrevious={(e) => loadPosts("previous")}
            onNext={(e) => loadPosts("next")}
            lastPage={Math.ceil(state.totalPosts / 2)}
            currentPage={postPage}
          >
            {state.posts.map((post) => (
              <Post
                key={post._id}
                id={post._id}
                author={post.creator.name}
                date={new Date(post.createdAt).toLocaleDateString("en-US")}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                onStartEdit={(e) => startEditPostHandler(post._id)}
                onDelete={(e) => deletePostHandler(post._id)}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
};

export default Feed;
