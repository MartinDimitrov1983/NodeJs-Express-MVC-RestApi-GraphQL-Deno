import React from "react";
import { useQuery, gql } from "@apollo/client";

import Image from "../../../components/Image/Image";
import Loader from "../../../components/Loader/Loader";
import { FETCH_SINGLE_POST } from "../../../graphql/queries";
import "./SinglePost.css";

const SinglePost = (props) => {
  const GET_SINGLE_POST = gql`
    ${FETCH_SINGLE_POST}
  `;
  const postId = props.match.params.postId;
  const { loading, error, data } = useQuery(GET_SINGLE_POST, {
    variables: { postId: postId },
    fetchPolicy:'no-cache',
  });

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Loader />
      </div>
    );
  }

  if (error) {
    throw new Error("Fetching post failed!");
  }

  const post = {
    title: data?.post?.title,
    author: data?.post?.creator?.name,
    image: "http://localhost:8080/" + data?.post?.imageUrl,
    date: new Date(data?.post?.createdAt).toLocaleDateString("en-US"),
    content: data?.post?.content,
  };

  return (
    <section className="single-post">
      <h1>{post.title}</h1>
      <h2>
        Created by {post.author} on {post.date}
      </h2>
      <div className="single-post__image">
        <Image contain imageUrl={post.image} />
      </div>
      <p>{post.content}</p>
    </section>
  );
};

export default SinglePost;
