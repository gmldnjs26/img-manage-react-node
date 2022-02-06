import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ImageContext } from "../context/ImageContext";
import axios from "axios";
import { toast } from "react-toastify";

const ImagePage = () => {
  const navigate = useNavigate();
  const { imageId } = useParams();
  const { images, myImages, setImages, setMyImages } = useContext(ImageContext);
  const [me] = useContext(AuthContext);
  const [hasLiked, setHasLiked] = useState(false);

  const image =
    images.find((image) => image._id === imageId) ||
    myImages.find((image) => image._id === imageId);
  useEffect(() => {
    if (me && image && image.likes.includes(me.userId)) setHasLiked(true);
  }, [me, image]);

  const updateImages = (images, image) => {
    return [...images.filter((image) => image._id !== imageId), image].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };

  const onSubmit = async () => {
    const result = await axios.patch(
      `http://localhost:5555/images/${imageId}/${hasLiked ? "unlike" : "like"}`
    );
    if (result.data.public) {
      setImages(updateImages(images, result.data));
    } else {
      setMyImages(updateImages(myImages, result.data));
    }
    setHasLiked(!hasLiked);
  };

  const deleteHandler = async () => {
    try {
      if (!window.confirm("삭제하시겠습니까?")) return;
      const result = await axios.delete(
        `http://localhost:5555/images/${imageId}`
      );
      toast.success(result.data.message);
      setImages(images.filter((image) => image._id !== imageId));
      setMyImages(myImages.filter((image) => image._id !== imageId));
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!image) return <h3>Loading..</h3>;
  return (
    <div>
      <h3>Image Page - {imageId}</h3>
      <img alt={imageId} src={`http://localhost:5555/uploads/${image.key}`} />
      <span>좋아요 {image.likes.length}</span>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        {me && image.user._id === me.userId && (
          <button
            style={{ float: "right", width: "80px" }}
            onClick={deleteHandler}
          >
            삭제
          </button>
        )}
        <button onClick={onSubmit} style={{ float: "right", width: "80px" }}>
          {hasLiked ? "좋아요 취소" : "좋아요"}
        </button>
      </div>
    </div>
  );
};

export default ImagePage;