import React, { useState, useEffect } from "react";

import Image from "../../../components/Image/Image";
import { FETCH_SINGLE_POST } from "../../../graphql/queries";
import { fetchData } from "../../../util/fetchData";
import "./SinglePost.css";

const SinglePost = (props) => {
  const [post, setPost] = useState({
    title: "",
    author: "",
    date: "",
    image: "",
    content: "",
  });

  useEffect(() => {
    const postId = props.match.params.postId;
    const graphqlQuery = {
      query: FETCH_SINGLE_POST,
      variables: {
        postId: postId,
      },
    };

    fetchData(props.token, graphqlQuery)
      .then((resData) => {
        console.log(resData);
        if (resData.errors) {
          throw new Error("Fetching post failed!");
        }
        setPost({
          title: resData.data.post.title,
          author: resData.data.post.creator.name,
          image: "http://localhost:8080/" + resData.data.post.imageUrl,
          date: new Date(resData.data.post.createdAt).toLocaleDateString(
            "en-US"
          ),
          content: resData.data.post.content,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.match.params.postId, props.token]);

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
