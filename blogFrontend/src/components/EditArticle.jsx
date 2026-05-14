import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";



import {
  formCard,
  formTitle,
  formGroup,
  labelClass,
  inputClass,
  submitBtn,
  errorClass,
} from "../styles/common";

function EditArticle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const article = location.state;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // prefill form
  useEffect(() => {
    if (!article) return;

    setValue("title", article.title);
    setValue("category", article.category);
    setValue("content", article.content);
  }, [article, setValue]);

  const updateArticle = async (modifiedArticle) => {
    if (!article?._id) {
      setError("Article data missing. Open edit from your article list again.");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Include articleId because backend route expects it.
      const payload = { ...modifiedArticle, articleId: article._id };
      const res = await axios.put("https://blogapp-1-eebs.onrender.com/author-api/articles", payload, {
        withCredentials: true,
      });

      if (res.status === 200) {
        navigate(`/article/${article._id}`, { state: res.data.payload });
      }
    } catch (err) {
      console.log("ERROR:", err.response);

      const msg = err.response?.data?.message;

      setError(msg || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${formCard} mt-10`}>
      <h2 className={formTitle}>Edit Article</h2>

      {error && <p className={errorClass}>{error}</p>}

      <form onSubmit={handleSubmit(updateArticle)}>
        {/* Title */}
        <div className={formGroup}>
          <label className={labelClass}>Title</label>

          <input className={inputClass} {...register("title", { required: "Title required" })} />

          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div className={formGroup}>
          <label className={labelClass}>Category</label>

          <select className={inputClass} {...register("category", { required: "Category required" })}>
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

          <textarea rows="14" className={inputClass} {...register("content", { required: "Content required" })} />

          {errors.content && <p className={errorClass}>{errors.content.message}</p>}
        </div>

        <button type="submit" className={submitBtn} disabled={loading}>
          {loading ? "Updating..." : "Update Article"}
        </button>
      </form>
    </div>
  );
}

export default EditArticle;