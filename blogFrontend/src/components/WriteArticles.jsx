import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router";

import {
  formCard,
  formTitle,
  formGroup,
  labelClass,
  inputClass,
  submitBtn,
  errorClass,
  loadingClass,
} from "../styles/common";
import { useAuth } from "../store/authStore";
import toast from "react-hot-toast";

function WriteArticles() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const currentUser = useAuth((state) => state.currentUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  //save article
  const submitArticle = async (articleObj) => {
    try {
      setLoading(true);

      // add author id to articleObj; check-auth returns `id`, login returns `_id`
      const authorId = currentUser?.id || currentUser?._id;
      const payload = { ...articleObj, author: authorId };

      const res = await axios.post("https://blogapp-2-shu3.onrender.com/author-api/article", payload, {
        withCredentials: true,
      });

      if (res.status === 201) {
        toast.success("Article published successfully");
        reset();
        navigate("/author-profile/articles");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to publish article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={formCard}>
      <h2 className={formTitle}>Write New Article</h2>

      <form onSubmit={handleSubmit(submitArticle)}>
        {/* Title */}
        <div className={formGroup}>
          <label className={labelClass}>Title</label>

          <input
            type="text"
            className={inputClass}
            placeholder="Enter article title"
            {...register("title", {
              required: "Title is required",
              minLength: {
                value: 5,
                message: "Title must be at least 5 characters",
              },
            })}
          />

          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div className={formGroup}>
          <label className={labelClass}>Category</label>

          <select
            className={inputClass}
            {...register("category", {
              required: "Category is required",
            })}
          >
            <option value="">Select category</option>
            <option value="technology">Technology</option>
            <option value="programming">Programming</option>
            <option value="ai">AI</option>
            <option value="web-development">Web Development</option>
          </select>

          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </div>

        {/* Content */}
        <div className={formGroup}>
          <label className={labelClass}>Content</label>

          <textarea
            rows="8"
            className={inputClass}
            placeholder="Write your article content..."
            {...register("content", {
              required: "Content is required",
              minLength: {
                value: 50,
                message: "Content must be at least 50 characters",
              },
            })}
          />

          {errors.content && <p className={errorClass}>{errors.content.message}</p>}
        </div>

        {/* Submit */}
        <button className={submitBtn} type="submit" disabled={loading}>
          {loading ? "Publishing..." : "Publish Article"}
        </button>
      </form>
    </div>
  );
}

export default WriteArticles;