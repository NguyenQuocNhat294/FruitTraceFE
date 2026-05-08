    import { useState, useCallback } from "react";
    import { api } from "../services/api";
    import { useToast } from "./useToast";

    export function useApi() {
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const { error: showError } = useToast();

      const request = useCallback(
        async (method, url, config = {}) => {
          setLoading(true);
          setError(null);
          try {
            const response = await api.request({ method, url, ...config });
            return response.data;
          } catch (err) {
            const message =
              err?.response?.data?.message ||
              err?.message ||
              "Đã có lỗi xảy ra, vui lòng thử lại.";
            setError(message);
            showError(message);
            throw err;
          } finally {
            setLoading(false);
          }
        },
        [showError]
      );

      const get = useCallback(
        (url, config) => request("get", url, config),
        [request]
      );

      const post = useCallback(
        (url, data, config) => request("post", url, { data, ...config }),
        [request]
      );

      const put = useCallback(
        (url, data, config) => request("put", url, { data, ...config }),
        [request]
      );

      const del = useCallback(
        (url, config) => request("delete", url, config),
        [request]
      );

      return {
        loading,
        error,
        request,
        get,
        post,
        put,
        del,
      };
    }

