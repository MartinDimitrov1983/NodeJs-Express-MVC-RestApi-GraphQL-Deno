import React, { Fragment, useEffect, useState } from "react";

import Backdrop from "../../Backdrop/Backdrop";
import Modal from "../../Modal/Modal";
import Input from "../../Form/Input/Input";
import FilePicker from "../../Form/Input/FilePicker";
import Image from "../../Image/Image";
import { required, length } from "../../../util/validators";
import { generateBase64FromImage } from "../../../util/image";

const POST_FORM = {
  title: {
    value: "",
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
  image: {
    value: "",
    valid: false,
    touched: false,
    validators: [required],
  },
  content: {
    value: "",
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
};

const FeedEdit = ({ editing, selectedPost, ...props }) => {
  const [state, setState] = useState({
    postForm: POST_FORM,
    formIsValid: false,
    imagePreview: null,
  });

  useEffect(() => {
    if (editing && selectedPost) {
      const postForm = {
        title: {
          ...state.postForm.title,
          value: selectedPost.title,
          valid: true,
        },
        image: {
          ...state.postForm.image,
          value: selectedPost.imagePath,
          valid: true,
        },
        content: {
          ...state.postForm.content,
          value: selectedPost.content,
          valid: true,
        },
      };
      setState((prevState) => {
        return { ...prevState, postForm: postForm, formIsValid: true };
      });
    }
  }, [editing, selectedPost]);

  const postInputChangeHandler = (input, value, files) => {
    console.log(input, value, files)
    if (files) {
      generateBase64FromImage(files[0])
      .then(b64 => {
        setState((prevState)=> { return {...prevState, imagePreview: b64} });
      })
      .catch(e => {
        console.log(e)
        setState((prevState)=> { return {...prevState, imagePreview: null} });
      });
    }
    setState((prevState) => {
      let isValid = true;
      for (const validator of prevState.postForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.postForm,
        [input]: {
          ...prevState.postForm[input],
          valid: isValid,
          value: files ? files[0] : value,
        },
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
      return {
        ...prevState,
        postForm: updatedForm,
        formIsValid: formIsValid,
      };
    });
  };

  const inputBlurHandler = (input) => {
    setState((prevState) => {
      return {
        ...prevState,
        postForm: {
          ...prevState.postForm,
          [input]: {
            ...prevState.postForm[input],
            touched: true,
          },
        },
      };
    });
  };

  const cancelPostChangeHandler = () => {
    setState((prevState) => {
      return {
        ...prevState,
        postForm: POST_FORM,
        formIsValid: false,
      };
    });
    props.onCancelEdit();
  };

  const acceptPostChangeHandler = () => {
    const post = {
      title: state.postForm.title.value,
      image: state.postForm.image.value,
      content: state.postForm.content.value,
    };
    props.onFinishEdit(post);
    setState({
      postForm: POST_FORM,
      formIsValid: false,
      imagePreview: null,
    });
  };

  return editing ? (
    <Fragment>
      <Backdrop onClick={cancelPostChangeHandler} />
      <Modal
        title="New Post"
        acceptEnabled={state.formIsValid}
        onCancelModal={cancelPostChangeHandler}
        onAcceptModal={acceptPostChangeHandler}
        isLoading={props.loading}
      >
        <form>
          <Input
            id="title"
            label="Title"
            control="input"
            onChange={postInputChangeHandler}
            onBlur={(e) => inputBlurHandler("title")}
            valid={state.postForm["title"].valid}
            touched={state.postForm["title"].touched}
            value={state.postForm["title"].value}
          />
          <FilePicker
            id="image"
            label="Image"
            control="input"
            onChange={postInputChangeHandler}
            onBlur={(e) => inputBlurHandler("image")}
            valid={state.postForm["image"].valid}
            touched={state.postForm["image"].touched}
          />
          <div className="new-post__preview-image">
            {!state.imagePreview && <p>Please choose an image.</p>}
            {state.imagePreview && (
              <Image imageUrl={state.imagePreview} contain left />
            )}
          </div>
          <Input
            id="content"
            label="Content"
            control="textarea"
            rows="5"
            onChange={postInputChangeHandler}
            onBlur={(e) => inputBlurHandler("content")}
            valid={state.postForm["content"].valid}
            touched={state.postForm["content"].touched}
            value={state.postForm["content"].value}
          />
        </form>
      </Modal>
    </Fragment>
  ) : null;
};

export default FeedEdit;
